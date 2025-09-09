import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaymeService {
  private readonly logger = new Logger(PaymeService.name);
  private readonly merchantId: string;
  private readonly secretKey: string;
  private readonly baseUrl = 'https://checkout.paycom.uz/api';

  constructor(private configService: ConfigService) {
    this.merchantId = this.configService.get<string>('PAYME_MERCHANT_ID');
    this.secretKey = this.configService.get<string>('PAYME_SECRET_KEY');
  }

  async createPayment(orderId: string, amount: number) {
    try {
      const params = {
        method: 'receipts.create',
        params: {
          amount: amount * 100, // Convert to tiyin
          account: {
            order_id: orderId,
          },
        },
      };

      const response = await axios.post(`${this.baseUrl}/receipts.create`, params, {
        headers: {
          'X-Auth': this.merchantId,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.result) {
        const receiptId = response.data.result.receipt._id;
        const paymentUrl = `https://checkout.paycom.uz/${receiptId}`;

        return {
          success: true,
          paymentUrl,
          transactionId: receiptId,
          message: 'Payment URL generated successfully',
        };
      } else {
        throw new Error(response.data.error?.message || 'Payment creation failed');
      }
    } catch (error) {
      this.logger.error(`Payme payment creation failed for order ${orderId}:`, error);
      return {
        success: false,
        message: error.message || 'Payment creation failed',
      };
    }
  }

  async verifyPayment(transactionId: string) {
    try {
      const params = {
        method: 'receipts.get',
        params: {
          id: transactionId,
        },
      };

      const response = await axios.post(`${this.baseUrl}/receipts.get`, params, {
        headers: {
          'X-Auth': this.merchantId,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.result) {
        const receipt = response.data.result.receipt;
        const isPaid = receipt.status === 2; // 2 means paid

        return {
          success: isPaid,
          transactionId,
          amount: receipt.amount / 100, // Convert from tiyin
          status: receipt.status,
          message: isPaid ? 'Payment verified successfully' : 'Payment not completed',
        };
      } else {
        throw new Error(response.data.error?.message || 'Payment verification failed');
      }
    } catch (error) {
      this.logger.error(`Payme payment verification failed for transaction ${transactionId}:`, error);
      return {
        success: false,
        message: error.message || 'Payment verification failed',
      };
    }
  }

  private generateChecksum(data: any): string {
    const dataString = JSON.stringify(data);
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(dataString)
      .digest('hex');
  }
}