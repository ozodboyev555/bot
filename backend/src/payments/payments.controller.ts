import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create payment for order' })
  @ApiResponse({ status: 200, description: 'Payment created successfully' })
  async createPayment(
    @Body('orderId') orderId: string,
    @Body('paymentMethod') paymentMethod: string,
    @Body('amount') amount: number,
  ) {
    return this.paymentsService.createPayment(orderId, paymentMethod, amount);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify payment transaction' })
  @ApiResponse({ status: 200, description: 'Payment verification completed' })
  async verifyPayment(
    @Body('transactionId') transactionId: string,
    @Body('paymentMethod') paymentMethod: string,
  ) {
    return this.paymentsService.verifyPayment(transactionId, paymentMethod);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get payment logs' })
  @ApiResponse({ status: 200, description: 'Payment logs retrieved successfully' })
  async getPaymentLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('orderId') orderId?: string,
  ) {
    return this.paymentsService.getPaymentLogs(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      orderId,
    );
  }
}