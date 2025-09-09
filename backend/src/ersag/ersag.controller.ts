import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ErsagService } from './ersag.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Ersag')
@Controller('ersag')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ErsagController {
  constructor(private readonly ersagService: ErsagService) {}

  @Post('process-order')
  @ApiOperation({ summary: 'Process order on Ersag (Admin only)' })
  @ApiResponse({ status: 200, description: 'Order processed successfully' })
  async processOrder(@Body('orderId') orderId: string) {
    return this.ersagService.processOrder(orderId);
  }

  @Post('solve-captcha')
  @ApiOperation({ summary: 'Solve captcha for order' })
  @ApiResponse({ status: 200, description: 'Captcha solved successfully' })
  async solveCaptcha(
    @Body('orderId') orderId: string,
    @Body('solution') solution: string,
  ) {
    return this.ersagService.solveCaptcha(orderId, solution);
  }
}