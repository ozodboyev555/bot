import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymeService } from './services/payme.service';
import { ClickService } from './services/click.service';
import { UzcardService } from './services/uzcard.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private paymeService: PaymeService,
    private clickService: ClickService,
    private uzcardService: UzcardService,
  ) {}

  async createPayment(orderId: string, paymentMethod: string, amount: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Create payment log
    const paymentLog = await this.prisma.paymentLog.create({
      data: {
        orderId,
        paymentMethod,
        amount,
        status: 'PENDING',
      },
    });

    try {
      let paymentResult: any;

      switch (paymentMethod.toLowerCase()) {
        case 'payme':
          paymentResult = await this.paymeService.createPayment(orderId, amount);
          break;
        case 'click':
          paymentResult = await this.clickService.createPayment(orderId, amount);
          break;
        case 'uzcard':
        case 'humo':
          paymentResult = await this.uzcardService.createPayment(orderId, amount);
          break;
        default:
          throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }

      // Update payment log
      await this.prisma.paymentLog.update({
        where: { id: paymentLog.id },
        data: {
          transactionId: paymentResult.transactionId,
          response: JSON.stringify(paymentResult),
          status: paymentResult.success ? 'COMPLETED' : 'FAILED',
        },
      });

      // Update order payment status
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: paymentResult.success ? 'COMPLETED' : 'FAILED',
        },
      });

      return {
        success: paymentResult.success,
        paymentUrl: paymentResult.paymentUrl,
        transactionId: paymentResult.transactionId,
        message: paymentResult.message,
      };
    } catch (error) {
      this.logger.error(`Payment creation failed for order ${orderId}:`, error);

      // Update payment log with error
      await this.prisma.paymentLog.update({
        where: { id: paymentLog.id },
        data: {
          status: 'FAILED',
          response: error.message,
        },
      });

      throw error;
    }
  }

  async verifyPayment(transactionId: string, paymentMethod: string) {
    try {
      let verificationResult: any;

      switch (paymentMethod.toLowerCase()) {
        case 'payme':
          verificationResult = await this.paymeService.verifyPayment(transactionId);
          break;
        case 'click':
          verificationResult = await this.clickService.verifyPayment(transactionId);
          break;
        case 'uzcard':
        case 'humo':
          verificationResult = await this.uzcardService.verifyPayment(transactionId);
          break;
        default:
          throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }

      // Update payment log
      const paymentLog = await this.prisma.paymentLog.findFirst({
        where: { transactionId },
      });

      if (paymentLog) {
        await this.prisma.paymentLog.update({
          where: { id: paymentLog.id },
          data: {
            status: verificationResult.success ? 'COMPLETED' : 'FAILED',
            response: JSON.stringify(verificationResult),
          },
        });

        // Update order status
        if (verificationResult.success) {
          await this.prisma.order.update({
            where: { id: paymentLog.orderId },
            data: {
              paymentStatus: 'COMPLETED',
              status: 'PROCESSING',
            },
          });
        }
      }

      return verificationResult;
    } catch (error) {
      this.logger.error(`Payment verification failed for transaction ${transactionId}:`, error);
      throw error;
    }
  }

  async getPaymentLogs(page = 1, limit = 10, orderId?: string) {
    const skip = (page - 1) * limit;
    
    const where = orderId ? { orderId } : {};

    const [logs, total] = await Promise.all([
      this.prisma.paymentLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.paymentLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}