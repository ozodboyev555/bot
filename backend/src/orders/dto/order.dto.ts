import { IsString, IsNumber, IsOptional, IsEmail, IsPhoneNumber, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  customerName: string;

  @ApiProperty()
  @IsString()
  @IsPhoneNumber('UZ')
  customerPhone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  customerAddress: string;

  @ApiProperty()
  @IsString()
  customerRegion: string;

  @ApiProperty()
  @IsString()
  customerDistrict: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerNotes?: string;

  @ApiProperty()
  @IsString()
  paymentMethod: string;
}

export class AddToCartDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty({ default: 1 })
  @IsNumber()
  quantity: number;
}

export class UpdateCartItemDto {
  @ApiProperty()
  @IsNumber()
  quantity: number;
}