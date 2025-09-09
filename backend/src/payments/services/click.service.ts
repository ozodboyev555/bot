import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class ClickService {
  private readonly logger = new Logger(ClickService.name);
  private readonly merchantId: string;
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.click.uz/v2/merchant';

  constructor(private configService: ConfigService) {
    this.merchantId = this.configService.get<string>('CLICK_MERCHANT_ID');
    this.secretKey = this.configService.get<string>('CLICK_SECRET_KEY');
  }

  async createPayment(orderId: string, amount: number) {
    try {
      const params = {
        service_id: this.merchantId,
        merchant_id: this.merchantId,
        amount: amount,
        transaction_param: orderId,
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      };

      // Generate signature
      const signString = `${params.service_id}${params.merchant_id}${params.amount}${params.transaction_param}${this.secretKey}`;
      const signature = crypto.createHash('md5').update(signString).digest('hex');

      const response = await axios.post(`${this.baseUrl}/invoice/create`, {
        ...params,
        sign_time: Date.now(),
        sign_string: signature,
      });

      if (response.data.error_code === 0) {
        return {
          success: true,
          paymentUrl: response.data.pay_url,
          transactionId: response.data.click_trans_id,
          message: 'Payment URL generated successfully',
        };
      } else {
        throw new Error(response.data.error_note || 'Payment creation failed');
      }
    } catch (error) {
      this.logger.error(`Click payment creation failed for order ${orderId}:`, error);
      return {
        success: false,
        message: error.message || 'Payment creation failed',
      };
    }
  }

  async verifyPayment(transactionId: string) {
    try {
      const params = {
        service_id: this.merchantId,
        click_trans_id: transactionId,
        merchant_trans_id: transactionId,
        amount: 0, // Will be filled by response
        action: 1, // Check transaction
        sign_time: Date.now(),
      };

      // Generate signature
      const signString = `${params.service_id}${params.click_trans_id}${params.merchant_trans_id}${params.amount}${params.action}${params.sign_time}${this.secretKey}`;
      const signature = crypto.createHash('md5').update(signString).digest('hex');

      const response = await axios.post(`${this.baseUrl}/invoice/status`, {
        ...params,
        sign_string: signature,
      });

      if (response.data.error_code === 0) {
        const isPaid = response.data.status === 'confirmed';
        return {
          success: isPaid,
          transactionId,
          amount: response.data.amount,
          status: response.data.status,
          message: isPaid ? 'Payment verified successfully' : 'Payment not completed',
        };
      } else {
        throw new Error(response.data.error_note || 'Payment verification failed');
      }
    } catch (error) {
      this.logger.error(`Click payment verification failed for transaction ${transactionId}:`, error);
      return {
        success: false,
        message: error.message || 'Payment verification failed',
      };
    }
  }
}