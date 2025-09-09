import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SmsService } from './sms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('SMS')
@Controller('sms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send SMS manually' })
  @ApiResponse({ status: 200, description: 'SMS sent successfully' })
  async sendSms(
    @Body('phone') phone: string,
    @Body('message') message: string,
    @Body('orderId') orderId?: string,
  ) {
    return this.smsService.sendSms(phone, message, orderId);
  }

  @Post('order-confirmation/:orderId')
  @ApiOperation({ summary: 'Send order confirmation SMS' })
  @ApiResponse({ status: 200, description: 'Order confirmation SMS sent successfully' })
  async sendOrderConfirmation(@Body('orderId') orderId: string) {
    return this.smsService.sendOrderConfirmation(orderId);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get SMS logs' })
  @ApiResponse({ status: 200, description: 'SMS logs retrieved successfully' })
  async getSmsLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('orderId') orderId?: string,
  ) {
    return this.smsService.getSmsLogs(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      orderId,
    );
  }
}