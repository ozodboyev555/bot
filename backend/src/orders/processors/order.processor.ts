import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ErsagService } from '../../ersag/ersag.service';
import { SmsService } from '../../sms/sms.service';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('order-processing')
export class OrderProcessor {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(
    private ersagService: ErsagService,
    private smsService: SmsService,
    private prisma: PrismaService,
  ) {}

  @Process('process-order')
  async handleOrderProcessing(job: Job<{ orderId: string; userId: string }>) {
    const { orderId, userId } = job.data;
    
    this.logger.log(`Processing order ${orderId} for user ${userId}`);

    try {
      // Update order status to processing
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'PROCESSING' },
      });

      // Process order on Ersag
      const ersagResult = await this.ersagService.processOrder(orderId);

      if (ersagResult.requiresCaptcha) {
        this.logger.log(`Order ${orderId} requires captcha solving`);
        // Captcha will be handled by the frontend
        return;
      }

      if (ersagResult.success) {
        // Send confirmation SMS
        await this.smsService.sendOrderConfirmation(orderId);
        
        this.logger.log(`Order ${orderId} processed successfully`);
      } else {
        throw new Error('Ersag order processing failed');
      }
    } catch (error) {
      this.logger.error(`Error processing order ${orderId}:`, error);
      
      // Update order status to failed
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'FAILED' },
      });

      // Send failure notification SMS
      try {
        const order = await this.prisma.order.findUnique({
          where: { id: orderId },
        });

        if (order && order.customerPhone) {
          await this.smsService.sendSms(
            order.customerPhone,
            `Buyurtmangiz ${order.orderNumber} qayta ishlanmadi. Iltimos, qayta urinib ko'ring.`,
            orderId,
          );
        }
      } catch (smsError) {
        this.logger.error(`Failed to send failure SMS for order ${orderId}:`, smsError);
      }

      throw error;
    }
  }

  @Process('solve-captcha')
  async handleCaptchaSolving(job: Job<{ orderId: string; solution: string }>) {
    const { orderId, solution } = job.data;
    
    this.logger.log(`Solving captcha for order ${orderId}`);

    try {
      const result = await this.ersagService.solveCaptcha(orderId, solution);

      if (result.success) {
        // Send confirmation SMS
        await this.smsService.sendOrderConfirmation(orderId);
        
        this.logger.log(`Captcha solved and order ${orderId} processed successfully`);
      } else {
        throw new Error('Captcha solving failed');
      }
    } catch (error) {
      this.logger.error(`Error solving captcha for order ${orderId}:`, error);
      throw error;
    }
  }
}