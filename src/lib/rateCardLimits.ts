import { prisma } from '@/lib/db';

export async function canCreateRateCard(userId: string, isPremium: boolean): Promise<{
  canCreate: boolean;
  reason?: string;
  rateCardsCreated: number;
  rateCardsDeleted: number;
}> {
  if (isPremium) {
    return {
      canCreate: true,
      rateCardsCreated: 0,
      rateCardsDeleted: 0,
    };
  }

  const rateCardsCreated = await prisma.analytics.count({
    where: {
      userId,
      eventType: 'rate_card_created',
    },
  });

  const rateCardsDeleted = await prisma.analytics.count({
    where: {
      userId,
      eventType: 'rate_card_deleted',
    },
  });

  if (rateCardsCreated >= 1) {
    return {
      canCreate: false,
      reason:
        rateCardsDeleted > 0
          ? 'You already used your free rate card (including deleted cards). Upgrade to Premium to create unlimited rate cards.'
          : 'You have reached your free plan limit of 1 rate card. Upgrade to Premium to create unlimited rate cards.',
      rateCardsCreated,
      rateCardsDeleted,
    };
  }

  return {
    canCreate: true,
    rateCardsCreated,
    rateCardsDeleted,
  };
}
