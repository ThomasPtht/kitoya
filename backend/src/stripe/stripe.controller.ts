import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Headers as NestHeaders,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  /**
   * Create a new subscription (handles monthly or yearly interval with trial support)
   */
  @Post('create-subscription')
  @UseGuards(JwtAuthGuard)
  async createSubscription(
    @Req() req: any,
    @Body() body: { plan: string; interval?: 'month' | 'year' },
  ) {
    const userId = req.user.id || req.user.userId;
    const interval = body.interval || 'month'; // Default to month if not provided

    console.log(
      `Creating subscription for user ${userId} with interval: ${interval}`,
    );

    return this.stripeService.createSubscription(userId, interval);
  }

  /**
   * Cancel an active user subscription at the end of the current period
   */
  @Post('cancel-subscription')
  @UseGuards(JwtAuthGuard)
  async cancelSubscription(@Req() req: any) {
    const userId = req.user.id || req.user.userId;

    console.log(`Canceling subscription for user ${userId}`);

    return this.stripeService.cancelSubscription(userId);
  }

  /**
   * Handle incoming Stripe webhook events
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @NestHeaders('stripe-signature') signature: string,
    @Req() req: Request & { rawBody?: Buffer },
    @Res() res: Response,
  ) {
    console.log('Received Stripe webhook event');
    const rawBody = req.rawBody;

    try {
      await this.stripeService.handleWebhookEvent(signature, rawBody!);
      return res.json({ received: true });
    } catch (err: any) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(`Webhook Error: ${err.message}`);
    }
  }
}
