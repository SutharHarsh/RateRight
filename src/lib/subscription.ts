import type { SubscriptionPlan } from '@prisma/client';

export function isPremiumPlan(plan?: SubscriptionPlan | null) {
  return plan === 'PREMIUM' || plan === 'PRO';
}

export function normalizePlan(plan?: SubscriptionPlan | null): 'FREE' | 'PREMIUM' {
  return isPremiumPlan(plan) ? 'PREMIUM' : 'FREE';
}

export function metadataIsPremium(status: unknown, plan?: unknown) {
  const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : '';
  const normalizedPlan = typeof plan === 'string' ? plan.toLowerCase() : '';

  return (
    normalizedStatus === 'active' ||
    normalizedStatus === 'trialing' ||
    normalizedPlan === 'premium' ||
    normalizedPlan === 'pro'
  );
}
