import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-06-24.dahlia' as any,
    });
  }

  async createSubscription(userid: string, priceId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userid },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { userId: userid },
    });
    if (existingSubscription?.status === 'active') {
      throw new BadRequestException('User already has an active subscription');
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userid,
        },
      });
      customerId = customer.id;

      await this.prisma.user.update({
        where: { id: userid },
        data: { stripeCustomerId: customerId },
      });
    }

    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
      customerId: customerId,
    };
  }

  async handleWebhookEvent(signature: string, rawBody: Buffer) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err: any) {
      throw new BadRequestException(
        `Webhook signature verification failed: ${err.message}`,
      );
    }

    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const subscriptionId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id;

        if (subscriptionId) {
          const subscriptionObj = (await this.stripe.subscriptions.retrieve(
            subscriptionId,
          )) as unknown as Stripe.Subscription;
          const customerId = subscriptionObj.customer as string;

          const user = await this.prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
          });

          if (user) {
            const priceItem = subscriptionObj.items.data[0];
            const planType =
              priceItem.price.recurring?.interval === 'year'
                ? 'ELITE_YEARLY'
                : 'ELITE_MONTHLY';

            const subAny = subscriptionObj as any;

            await this.prisma.subscription.upsert({
              where: { userId: user.id },
              update: {
                status: subscriptionObj.status,
                planType: planType,
                currentPeriodStart: new Date(
                  subAny.current_period_start * 1000,
                ),
                currentPeriodEnd: new Date(subAny.current_period_end * 1000),
              },
              create: {
                userId: user.id,
                status: subscriptionObj.status,
                planType: planType,
                currentPeriodStart: new Date(
                  subAny.current_period_start * 1000,
                ),
                currentPeriodEnd: new Date(subAny.current_period_end * 1000),
              },
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id;

        const user = await this.prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await this.prisma.subscription.update({
            where: { userId: user.id },
            data: { status: 'past_due' },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscriptionObj = event.data.object as Stripe.Subscription;
        const customerId = subscriptionObj.customer as string;

        const user = await this.prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await this.prisma.subscription.update({
            where: { userId: user.id },
            data: { status: subscriptionObj.status },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscriptionObj = event.data.object as Stripe.Subscription;
        const customerId = subscriptionObj.customer as string;

        const user = await this.prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await this.prisma.subscription.update({
            where: { userId: user.id },
            data: { status: 'canceled' },
          });
        }
        break;
      }
    }

    return { received: true };
  }
}
