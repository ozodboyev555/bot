import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class UzcardService {
  private readonly logger = new Logger(UzcardService.name);
  private readonly merchantId: string;
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.uzcard.uz/api/v1';

  constructor(private configService: ConfigService) {
    this.merchantId = this.configService.get<string>('UZCARD_MERCHANT_ID');
    this.secretKey = this.configService.get<string>('UZCARD_SECRET_KEY');
  }

  async createPayment(orderId: string, amount: number) {
    try {
      const params = {
        merchant_id: this.merchantId,
        amount: amount,
        order_id: orderId,
        currency: 'UZS',
        description: `Order payment for ${orderId}`,
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      };

      // Generate signature
      const signString = `${params.merchant_id}${params.amount}${params.order_id}${this.secretKey}`;
      const signature = crypto.createHash('sha256').update(signString).digest('hex');

      const response = await axios.post(`${this.baseUrl}/payment/create`, {
        ...params,
        signature,
      });

      if (response.data.success) {
        return {
          success: true,
          paymentUrl: response.data.payment_url,
          transactionId: response.data.transaction_id,
          message: 'Payment URL generated successfully',
        };
      } else {
        throw new Error(response.data.message || 'Payment creation failed');
      }
    } catch (error) {
      this.logger.error(`Uzcard payment creation failed for order ${orderId}:`, error);
      return {
        success: false,
        message: error.message || 'Payment creation failed',
      };
    }
  }

  async verifyPayment(transactionId: string) {
    try {
      const params = {
        merchant_id: this.merchantId,
        transaction_id: transactionId,
      };

      // Generate signature
      const signString = `${params.merchant_id}${params.transaction_id}${this.secretKey}`;
      const signature = crypto.createHash('sha256').update(signString).digest('hex');

      const response = await axios.post(`${this.baseUrl}/payment/status`, {
        ...params,
        signature,
      });

      if (response.data.success) {
        const isPaid = response.data.status === 'completed';
        return {
          success: isPaid,
          transactionId,
          amount: response.data.amount,
          status: response.data.status,
          message: isPaid ? 'Payment verified successfully' : 'Payment not completed',
        };
      } else {
        throw new Error(response.data.message || 'Payment verification failed');
      }
    } catch (error) {
      this.logger.error(`Uzcard payment verification failed for transaction ${transactionId}:`, error);
      return {
        success: false,
        message: error.message || 'Payment verification failed',
      };
    }
  }
}