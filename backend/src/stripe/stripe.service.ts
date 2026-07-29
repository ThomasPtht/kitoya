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

  /**
   * Create a subscription (Monthly without trial or Annual with a 7-day trial)
   */
  async createSubscription(userid: string, interval: 'month' | 'year') {
    const user = await this.prisma.user.findUnique({
      where: { id: userid },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { userId: userid },
    });
    if (
      existingSubscription?.status === 'active' ||
      existingSubscription?.status === 'trialing'
    ) {
      throw new BadRequestException(
        'User already has an active or trialing subscription',
      );
    }

    // Retrieve the correct Price ID based on the selected interval
    const priceId =
      interval === 'year'
        ? process.env.STRIPE_ELITE_YEARLY_PRICE_ID!
        : process.env.STRIPE_ELITE_MONTHLY_PRICE_ID!;

    if (!priceId) {
      throw new BadRequestException(
        `Price ID for interval ${interval} is not configured.`,
      );
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

    // Apply a 7-day trial period exclusively for the annual subscription
    const trialDays = interval === 'year' ? 7 : 0;

    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      ...(trialDays > 0 && { trial_period_days: trialDays }),
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    let invoice = subscription.latest_invoice as any;

    if (typeof invoice === 'string') {
      invoice = await this.stripe.invoices.retrieve(invoice, {
        expand: ['payment_intent'],
      });
    }

    const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent;

    if (!paymentIntent || !paymentIntent.client_secret) {
      throw new BadRequestException(
        'Failed to generate payment intent for this subscription.',
      );
    }

    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
      customerId: customerId,
    };
  }

  /**
   * Cancel subscription at the end of the current billing period (retaining access until then)
   */
  async cancelSubscription(userid: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userid },
    });
    if (!user || !user.stripeCustomerId) {
      throw new NotFoundException('User or Stripe customer not found');
    }

    // Retrieve active or trialing subscriptions for the customer from Stripe
    const subscriptions = await this.stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'all',
      limit: 5,
    });

    const activeSub = subscriptions.data.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing',
    );

    if (!activeSub) {
      throw new NotFoundException('No active subscription found to cancel');
    }

    // Schedule cancellation at period end so the user keeps access until the period expires
    const updatedSub = await this.stripe.subscriptions.update(activeSub.id, {
      cancel_at_period_end: true,
    });

    // Optional: Update local status or handle via webhook when period actually ends
    const periodEndTimestamp = (updatedSub as any).current_period_end * 1000;

    return {
      success: true,
      message:
        'Subscription will be canceled at the end of the billing period.',
      cancelAt: new Date(periodEndTimestamp),
    };
  }

  /**
   * Handle incoming Stripe webhooks
   */
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
      case 'invoice.payment_succeeded':
      case 'customer.subscription.trial_will_end': {
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
