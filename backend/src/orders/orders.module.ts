import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CartService } from './cart.service';
import { OrderProcessor } from './processors/order.processor';
import { ErsagModule } from '../ersag/ersag.module';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'order-processing',
    }),
    ErsagModule,
    SmsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, CartService, OrderProcessor],
  exports: [OrdersService, CartService],
})
export class OrdersModule {}