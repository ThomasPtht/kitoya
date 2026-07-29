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
import type { Request, Response } from 'express'; // Ajout de 'type' pour éviter les confusions de valeurs
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-subscription')
  @UseGuards(JwtAuthGuard)
  async createSubscription(
    @Req() req: any,
    @Body() body: { plan: string; interval?: 'month' | 'year' },
  ) {
    const userId = req.user.id || req.user.userId;

    let priceId = '';
    if (body.plan === 'ELITE') {
      const interval = body.interval || 'month'; // 'month' by default if not provided
      priceId =
        interval === 'year'
          ? process.env.STRIPE_PRICE_YEARLY!
          : process.env.STRIPE_PRICE_MONTHLY!;
    }

    console.log('PRICE ID UTILISE :', priceId);

    return this.stripeService.createSubscription(userId, priceId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @NestHeaders('stripe-signature') signature: string,
    @Req() req: Request & { rawBody?: Buffer }, // Add 'rawBody' property to the Request type
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
