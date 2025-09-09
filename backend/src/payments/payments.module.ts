import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymeService } from './services/payme.service';
import { ClickService } from './services/click.service';
import { UzcardService } from './services/uzcard.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymeService, ClickService, UzcardService],
  exports: [PaymentsService],
})
export class PaymentsModule {}