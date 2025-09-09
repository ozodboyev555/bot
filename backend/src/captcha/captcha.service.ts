import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CaptchaService {
  constructor(private prisma: PrismaService) {}

  async getCaptchaForOrder(orderId: string) {
    const captchaSession = await this.prisma.captchaSession.findUnique({
      where: { orderId },
    });

    if (!captchaSession) {
      throw new NotFoundException('Captcha session not found');
    }

    if (captchaSession.expiresAt < new Date()) {
      throw new BadRequestException('Captcha session expired');
    }

    if (captchaSession.isSolved) {
      throw new BadRequestException('Captcha already solved');
    }

    return {
      orderId: captchaSession.orderId,
      imageUrl: captchaSession.imageUrl,
      iframeUrl: captchaSession.iframeUrl,
      expiresAt: captchaSession.expiresAt,
    };
  }

  async submitCaptchaSolution(orderId: string, solution: string) {
    const captchaSession = await this.prisma.captchaSession.findUnique({
      where: { orderId },
    });

    if (!captchaSession) {
      throw new NotFoundException('Captcha session not found');
    }

    if (captchaSession.expiresAt < new Date()) {
      throw new BadRequestException('Captcha session expired');
    }

    if (captchaSession.isSolved) {
      throw new BadRequestException('Captcha already solved');
    }

    // Update captcha session with solution
    const updatedSession = await this.prisma.captchaSession.update({
      where: { orderId },
      data: {
        solution,
        isSolved: true,
      },
    });

    return {
      success: true,
      message: 'Captcha solution submitted successfully',
      orderId: updatedSession.orderId,
    };
  }

  async createCaptchaSession(orderId: string, captchaData: any) {
    return this.prisma.captchaSession.create({
      data: {
        orderId,
        imageUrl: captchaData.imageUrl,
        iframeUrl: captchaData.iframeUrl,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });
  }

  async deleteCaptchaSession(orderId: string) {
    return this.prisma.captchaSession.delete({
      where: { orderId },
    });
  }
}