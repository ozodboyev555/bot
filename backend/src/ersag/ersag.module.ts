import { Module } from '@nestjs/common';
import { ErsagService } from './ersag.service';
import { ErsagController } from './ersag.controller';

@Module({
  controllers: [ErsagController],
  providers: [ErsagService],
  exports: [ErsagService],
})
export class ErsagModule {}