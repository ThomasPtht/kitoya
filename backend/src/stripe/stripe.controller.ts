import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Headers as NestHeaders,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express'; // Ajout de 'type' pour éviter les confusions de valeurs
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-subscription')
  async createSubscription(@Body() body: { userId: string; priceId: string }) {
    return this.stripeService.createSubscription(body.userId, body.priceId);
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
