import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async sendSms(phone: string, message: string, orderId?: string) {
    try {
      const email = this.configService.get<string>('ESKIZ_EMAIL');
      const password = this.configService.get<string>('ESKIZ_PASSWORD');

      if (!email || !password) {
        throw new Error('SMS credentials not configured');
      }

      // Login to get token
      const loginResponse = await axios.post('https://notify.eskiz.uz/api/auth/login', {
        email,
        password,
      });

      const token = loginResponse.data.data.token;

      // Send SMS
      const smsResponse = await axios.post(
        'https://notify.eskiz.uz/api/message/sms/send',
        {
          mobile_phone: phone.replace(/\D/g, ''), // Remove non-digits
          message,
          from: 'ERSAG',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Log SMS
      await this.prisma.smsLog.create({
        data: {
          orderId,
          phone,
          message,
          status: smsResponse.data.status === 'success' ? 'SENT' : 'FAILED',
          response: JSON.stringify(smsResponse.data),
        },
      });

      return {
        success: smsResponse.data.status === 'success',
        messageId: smsResponse.data.id,
        response: smsResponse.data,
      };
    } catch (error) {
      this.logger.error(`Error sending SMS to ${phone}:`, error);

      // Log failed SMS
      await this.prisma.smsLog.create({
        data: {
          orderId,
          phone,
          message,
          status: 'FAILED',
          response: error.message,
        },
      });

      throw error;
    }
  }

  async sendOrderConfirmation(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order || !order.customerPhone) {
      throw new Error('Order or phone number not found');
    }

    const message = `Sizning buyurtmangiz qabul qilindi! Buyurtma raqami: ${order.orderNumber}. Chek: ${order.ersagReceiptUrl || 'Tayyorlanmoqda...'}`;

    return this.sendSms(order.customerPhone, message, orderId);
  }

  async sendOrderUpdate(orderId: string, status: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || !order.customerPhone) {
      throw new Error('Order or phone number not found');
    }

    let message = '';
    switch (status) {
      case 'PROCESSING':
        message = `Buyurtmangiz ${order.orderNumber} qayta ishlanmoqda.`;
        break;
      case 'COMPLETED':
        message = `Buyurtmangiz ${order.orderNumber} muvaffaqiyatli yakunlandi! Chek: ${order.ersagReceiptUrl}`;
        break;
      case 'CANCELLED':
        message = `Buyurtmangiz ${order.orderNumber} bekor qilindi.`;
        break;
      default:
        message = `Buyurtmangiz ${order.orderNumber} holati o'zgartirildi: ${status}`;
    }

    return this.sendSms(order.customerPhone, message, orderId);
  }

  async getSmsLogs(page = 1, limit = 10, orderId?: string) {
    const skip = (page - 1) * limit;
    
    const where = orderId ? { orderId } : {};

    const [logs, total] = await Promise.all([
      this.prisma.smsLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.smsLog.count({ where }),
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