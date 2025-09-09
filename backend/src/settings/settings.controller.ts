import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingDto, UpdateSettingDto } from './dto/setting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new setting (Admin only)' })
  @ApiResponse({ status: 201, description: 'Setting created successfully' })
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all settings (Admin only)' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  findAll() {
    return this.settingsService.findAll();
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public settings' })
  @ApiResponse({ status: 200, description: 'Public settings retrieved successfully' })
  getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Get('secret')
  @ApiOperation({ summary: 'Get secret settings (Admin only)' })
  @ApiResponse({ status: 200, description: 'Secret settings retrieved successfully' })
  getSecretSettings() {
    return this.settingsService.getSecretSettings();
  }

  @Get('ersag')
  @ApiOperation({ summary: 'Get Ersag settings (Admin only)' })
  @ApiResponse({ status: 200, description: 'Ersag settings retrieved successfully' })
  getErsagSettings() {
    return this.settingsService.getErsagSettings();
  }

  @Get('payment')
  @ApiOperation({ summary: 'Get payment settings (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment settings retrieved successfully' })
  getPaymentSettings() {
    return this.settingsService.getPaymentSettings();
  }

  @Get('sms')
  @ApiOperation({ summary: 'Get SMS settings (Admin only)' })
  @ApiResponse({ status: 200, description: 'SMS settings retrieved successfully' })
  getSmsSettings() {
    return this.settingsService.getSmsSettings();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get setting by key' })
  @ApiResponse({ status: 200, description: 'Setting retrieved successfully' })
  findByKey(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  @Patch(':key')
  @ApiOperation({ summary: 'Update setting by key (Admin only)' })
  @ApiResponse({ status: 200, description: 'Setting updated successfully' })
  update(@Param('key') key: string, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.update(key, updateSettingDto);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete setting by key (Admin only)' })
  @ApiResponse({ status: 200, description: 'Setting deleted successfully' })
  remove(@Param('key') key: string) {
    return this.settingsService.remove(key);
  }
}