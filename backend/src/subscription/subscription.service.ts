import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Handle incoming RevenueCat webhooks to sync subscription status
   */
  async handleRevenueCatWebhook(eventData: any) {
    // RevenueCat envoie un objet "event" dans le corps de la requête
    const event = eventData.event;
    if (!event) {
      throw new BadRequestException('Invalid RevenueCat webhook payload');
    }

    const userId = event.app_user_id; // C'est l'ID de ton utilisateur (que tu as loggé via Purchases.logIn(user.id))
    const entitlementId = event.entitlement_id; // "kitoya_elite"
    const eventType = event.type; // INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, etc.

    // On s'assure que l'événement concerne bien l'abonnement ELITE
    if (entitlementId !== 'kitoya_elite') {
      return { received: true };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found`);
    }

    // Détermination du type de plan selon le produit acheté
    const productId = event.product_id;
    const planType =
      productId?.includes('year') || productId?.includes('annual')
        ? 'ELITE_YEARLY'
        : 'ELITE_MONTHLY';

    // Détermination du statut en fonction de l'événement RevenueCat
    let status = 'active';
    if (['CANCELLATION', 'EXPIRATION'].includes(eventType)) {
      status = 'canceled';
    } else if (eventType === 'BILLING_ISSUE') {
      status = 'past_due';
    }

    // Gestion des dates de début et de fin de période
    const periodStart = event.purchased_at_ms
      ? new Date(event.purchased_at_ms)
      : new Date();
    const periodEnd = event.expiration_at_ms
      ? new Date(event.expiration_at_ms)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Mise à jour ou création de l'abonnement en BDD
    await this.prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        status,
        planType,
        revenueCatId: event.original_transaction_id || event.transaction_id,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
      create: {
        userId: user.id,
        status,
        planType,
        revenueCatId: event.original_transaction_id || event.transaction_id,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
    });

    return { received: true };
  }
}
