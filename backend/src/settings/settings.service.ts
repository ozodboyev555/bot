import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSettingDto, UpdateSettingDto } from './dto/setting.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async create(createSettingDto: CreateSettingDto) {
    return this.prisma.setting.create({
      data: createSettingDto,
    });
  }

  async findAll() {
    return this.prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async findByKey(key: string) {
    const setting = await this.prisma.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException('Setting not found');
    }

    return setting;
  }

  async update(key: string, updateSettingDto: UpdateSettingDto) {
    const setting = await this.prisma.setting.update({
      where: { key },
      data: updateSettingDto,
    });

    return setting;
  }

  async upsert(key: string, value: string, type = 'string', isSecret = false) {
    return this.prisma.setting.upsert({
      where: { key },
      update: { value, type, isSecret },
      create: { key, value, type, isSecret },
    });
  }

  async remove(key: string) {
    return this.prisma.setting.delete({
      where: { key },
    });
  }

  async getPublicSettings() {
    return this.prisma.setting.findMany({
      where: { isSecret: false },
      select: {
        key: true,
        value: true,
        type: true,
      },
      orderBy: { key: 'asc' },
    });
  }

  async getSecretSettings() {
    return this.prisma.setting.findMany({
      where: { isSecret: true },
      orderBy: { key: 'asc' },
    });
  }

  // Helper methods for specific settings
  async getErsagSettings() {
    const settings = await this.prisma.setting.findMany({
      where: {
        key: {
          in: [
            'ERSAG_BASE_URL',
            'ERSAG_REFERRAL_ID',
            'ERSAG_API_KEY',
          ],
        },
      },
    });

    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
  }

  async getPaymentSettings() {
    const settings = await this.prisma.setting.findMany({
      where: {
        key: {
          in: [
            'PAYME_MERCHANT_ID',
            'PAYME_SECRET_KEY',
            'CLICK_MERCHANT_ID',
            'CLICK_SECRET_KEY',
            'UZCARD_MERCHANT_ID',
            'UZCARD_SECRET_KEY',
          ],
        },
      },
    });

    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
  }

  async getSmsSettings() {
    const settings = await this.prisma.setting.findMany({
      where: {
        key: {
          in: [
            'ESKIZ_EMAIL',
            'ESKIZ_PASSWORD',
            'SMS_FROM_NAME',
          ],
        },
      },
    });

    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
  }
}