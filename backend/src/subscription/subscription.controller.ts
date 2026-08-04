import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Controller('webhooks/revenuecat')
export class SubscriptionWebhookController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    return await this.subscriptionService.handleRevenueCatWebhook(body);
  }
}
