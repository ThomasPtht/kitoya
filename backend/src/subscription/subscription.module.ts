import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionWebhookController } from './subscription.controller';

@Module({
  providers: [SubscriptionService],
  controllers: [SubscriptionWebhookController],
})
export class SubscriptionModule {}
