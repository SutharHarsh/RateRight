import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const STRIPE_PRICES = {
  PREMIUM_MONTHLY: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID ?? '',
  PREMIUM_YEARLY: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID ?? '',
} as const;

export function getPriceId(interval: 'month' | 'year'): string {
  return interval === 'month' ? STRIPE_PRICES.PREMIUM_MONTHLY : STRIPE_PRICES.PREMIUM_YEARLY;
}

export const STRIPE_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    calculationsLimit: 3,
    features: [
      '3 rate calculations per month',
      'Basic rate ranges',
      'Market comparisons',
    ],
  },
  PRO: {
    name: 'Pro',
    monthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    yearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
    monthlyPrice: 1900, // $19 in cents
    yearlyPrice: 19000, // $190 in cents
    calculationsLimit: 999999,
    features: [
      'Unlimited rate calculations',
      'Detailed rate breakdowns',
      'Professional rate card templates',
      'Historical rate trends',
      'Negotiation guidance',
      'Email support',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    monthlyPriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
    yearlyPriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!,
    monthlyPrice: 4900, // $49 in cents
    yearlyPrice: 49000, // $490 in cents
    calculationsLimit: 999999,
    features: [
      'Everything in Pro',
      'Negotiation email templates',
      'Contract templates library',
      'Priority support',
      'Early access to new features',
      'API access (coming soon)',
    ],
  },
} as const;

export async function createCheckoutSession({
  userId,
  userEmail,
  priceId,
  customerId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  userEmail: string;
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_email: customerId ? undefined : userEmail,
    client_reference_id: userId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
  });

  return session;
}

export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return subscription;
}

export async function reactivateSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  return subscription;
}
