import { Module } from '@nestjs/common';
import { GoogleStrategyService } from './google-strategy.service';

@Module({
  providers: [GoogleStrategyService],
  exports: [GoogleStrategyService],
})
export class GoogleStrategyModule {}
