import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { chromium, Browser, Page } from 'playwright';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ErsagService {
  private readonly logger = new Logger(ErsagService.name);
  private browser: Browser | null = null;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async initializeBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async processOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { product: true },
        },
        user: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    try {
      const browser = await this.initializeBrowser();
      const page = await browser.newPage();

      // Navigate to Ersag website
      await page.goto(this.configService.get<string>('ERSAG_BASE_URL'));

      // Check if user needs registration
      let ersagUser = await this.findOrCreateUser(order.user);

      // Login to Ersag
      await this.loginToErsag(page, ersagUser);

      // Add products to cart
      await this.addProductsToCart(page, order.orderItems);

      // Proceed to checkout
      await this.proceedToCheckout(page, order);

      // Handle captcha if needed
      const captchaResult = await this.handleCaptcha(page, orderId);
      if (captchaResult.requiresCaptcha) {
        return {
          success: false,
          requiresCaptcha: true,
          captchaData: captchaResult.captchaData,
        };
      }

      // Complete order
      const receiptUrl = await this.completeOrder(page);

      // Update order with Ersag details
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          ersagOrderId: receiptUrl,
          ersagReceiptUrl: receiptUrl,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      return {
        success: true,
        receiptUrl,
      };
    } catch (error) {
      this.logger.error(`Error processing order ${orderId}:`, error);
      
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'FAILED' },
      });

      throw error;
    }
  }

  private async findOrCreateUser(user: any) {
    if (user.ersagId && user.ersagLogin && user.ersagPassword) {
      return {
        ersagId: user.ersagId,
        ersagLogin: user.ersagLogin,
        ersagPassword: user.ersagPassword,
      };
    }

    // Generate random credentials
    const ersagLogin = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const ersagPassword = uuidv4().substring(0, 12);
    const ersagId = `ERS_${Date.now()}`;

    // Generate random passport data
    const passportSeries = Math.random().toString(36).substring(2, 4).toUpperCase();
    const passportNumber = Math.floor(Math.random() * 9999999).toString().padStart(7, '0');

    // Update user with Ersag credentials
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        ersagId,
        ersagLogin,
        ersagPassword,
      },
    });

    return {
      ersagId,
      ersagLogin,
      ersagPassword,
      passportSeries,
      passportNumber,
    };
  }

  private async loginToErsag(page: Page, ersagUser: any) {
    // Navigate to login page
    await page.goto(`${this.configService.get<string>('ERSAG_BASE_URL')}/login`);

    // Fill login form
    await page.fill('input[name="login"]', ersagUser.ersagLogin);
    await page.fill('input[name="password"]', ersagUser.ersagPassword);

    // Submit login form
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForLoadState('networkidle');
  }

  private async addProductsToCart(page: Page, orderItems: any[]) {
    for (const item of orderItems) {
      if (item.product.ersagId) {
        // Navigate to product page
        await page.goto(`${this.configService.get<string>('ERSAG_BASE_URL')}/product/${item.product.ersagId}`);
        
        // Add to cart
        await page.click('button[data-testid="add-to-cart"]');
        
        // Set quantity if needed
        if (item.quantity > 1) {
          await page.fill('input[data-testid="quantity"]', item.quantity.toString());
        }
      }
    }
  }

  private async proceedToCheckout(page: Page, order: any) {
    // Navigate to cart
    await page.goto(`${this.configService.get<string>('ERSAG_BASE_URL')}/cart`);

    // Proceed to checkout
    await page.click('button[data-testid="checkout"]');

    // Fill shipping information
    await page.fill('input[name="address"]', order.customerAddress);
    await page.fill('input[name="region"]', order.customerRegion);
    await page.fill('input[name="district"]', order.customerDistrict);
    await page.fill('input[name="phone"]', order.customerPhone);
    await page.fill('input[name="name"]', order.customerName);

    // Proceed to payment
    await page.click('button[data-testid="proceed-to-payment"]');
  }

  private async handleCaptcha(page: Page, orderId: string) {
    // Check if captcha is present
    const captchaElement = await page.$('[data-testid="captcha"]');
    
    if (captchaElement) {
      // Get captcha image or iframe
      const captchaImage = await page.$('img[data-testid="captcha-image"]');
      const captchaIframe = await page.$('iframe[data-testid="captcha-iframe"]');

      let captchaData: any = {};

      if (captchaImage) {
        const imageUrl = await captchaImage.getAttribute('src');
        captchaData.imageUrl = imageUrl;
      }

      if (captchaIframe) {
        const iframeUrl = await captchaIframe.getAttribute('src');
        captchaData.iframeUrl = iframeUrl;
      }

      // Store captcha session
      await this.prisma.captchaSession.create({
        data: {
          orderId,
          imageUrl: captchaData.imageUrl,
          iframeUrl: captchaData.iframeUrl,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      });

      return {
        requiresCaptcha: true,
        captchaData,
      };
    }

    return { requiresCaptcha: false };
  }

  async solveCaptcha(orderId: string, solution: string) {
    const captchaSession = await this.prisma.captchaSession.findUnique({
      where: { orderId },
    });

    if (!captchaSession) {
      throw new Error('Captcha session not found');
    }

    if (captchaSession.expiresAt < new Date()) {
      throw new Error('Captcha session expired');
    }

    try {
      const browser = await this.initializeBrowser();
      const page = await browser.newPage();

      // Navigate to the page with captcha
      await page.goto(this.configService.get<string>('ERSAG_BASE_URL'));

      // Find and fill captcha solution
      const captchaInput = await page.$('input[data-testid="captcha-input"]');
      if (captchaInput) {
        await captchaInput.fill(solution);
        await page.click('button[data-testid="submit-captcha"]');
      }

      // Update captcha session
      await this.prisma.captchaSession.update({
        where: { orderId },
        data: {
          solution,
          isSolved: true,
        },
      });

      // Continue with order processing
      return this.processOrder(orderId);
    } catch (error) {
      this.logger.error(`Error solving captcha for order ${orderId}:`, error);
      throw error;
    }
  }

  private async completeOrder(page: Page) {
    // Submit final order
    await page.click('button[data-testid="place-order"]');

    // Wait for order confirmation
    await page.waitForSelector('[data-testid="order-confirmation"]', { timeout: 30000 });

    // Get receipt URL
    const receiptElement = await page.$('[data-testid="receipt-url"]');
    const receiptUrl = receiptElement ? await receiptElement.textContent() : null;

    return receiptUrl;
  }
}