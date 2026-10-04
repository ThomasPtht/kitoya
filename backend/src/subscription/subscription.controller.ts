import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { SubscriptionService } from './subscription.service';

@Controller('webhooks/revenuecat')
export class SubscriptionWebhookController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: any,
  ) {
    this.verifyAuthorization(authorization);
    return await this.subscriptionService.handleRevenueCatWebhook(body);
  }

  // RevenueCat sends the "Authorization header value" configured in its dashboard on every delivery
  private verifyAuthorization(authorization: string | undefined) {
    const secret = process.env.REVENUECAT_WEBHOOK_SECRET;

    if (!secret || !authorization) {
      throw new UnauthorizedException('Invalid webhook authorization');
    }

    const expected = Buffer.from(`Bearer ${secret}`);
    const received = Buffer.from(authorization);

    // constant-time comparison to avoid leaking the secret through response timing
    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      throw new UnauthorizedException('Invalid webhook authorization');
    }
  }
}
