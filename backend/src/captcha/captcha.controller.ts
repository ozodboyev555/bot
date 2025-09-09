import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CaptchaService } from './captcha.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Captcha')
@Controller('captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Get(':orderId')
  @ApiOperation({ summary: 'Get captcha for order' })
  @ApiResponse({ status: 200, description: 'Captcha data retrieved successfully' })
  async getCaptcha(@Param('orderId') orderId: string) {
    return this.captchaService.getCaptchaForOrder(orderId);
  }

  @Post(':orderId/solve')
  @ApiOperation({ summary: 'Submit captcha solution' })
  @ApiResponse({ status: 200, description: 'Captcha solution submitted successfully' })
  async solveCaptcha(
    @Param('orderId') orderId: string,
    @Body('solution') solution: string,
  ) {
    return this.captchaService.submitCaptchaSolution(orderId, solution);
  }
}