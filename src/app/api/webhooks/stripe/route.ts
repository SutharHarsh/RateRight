import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import {
  sendUpgradeConfirmationEmail,
  sendPaymentFailedEmail,
} from '@/lib/email';
import { checkRateLimit, rateLimiters } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const headerList = headers();
  const forwardedFor = headerList.get('x-forwarded-for') ?? 'stripe-webhook';
  const rate = await checkRateLimit(forwardedFor, rateLimiters.webhook);

  if (!rate.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await req.text();
  const signature = headerList.get('stripe-signature') ?? headerList.get('Stripe-Signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId ?? session.client_reference_id;

        if (!userId) {
          console.error('No userId in session metadata');
          break;
        }

        // Get the subscription
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const plan: 'PREMIUM' = 'PREMIUM';
        const priceId = subscription.items.data[0].price.id;

        // Update user
        const user = await prisma.user.update({
          where: { id: userId },
          data: {
            plan,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: 'ACTIVE',
            calculationsLimit: 999999,
            periodStart: new Date(subscription.current_period_start * 1000),
            periodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        if (user.clerkId) {
          const client = await clerkClient();
          await client.users.updateUserMetadata(user.clerkId, {
            publicMetadata: {
              subscriptionStatus: 'active',
              plan: 'premium',
              stripeCustomerId: session.customer,
              stripeSubscriptionId: subscription.id,
              currentPeriodEnd: subscription.current_period_end,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
          });
        }

        // Send confirmation email
        await sendUpgradeConfirmationEmail(user.email, user.name || 'there', plan);

        // Track analytics
        await prisma.analytics.create({
          data: {
            eventType: 'upgrade_completed',
            userId,
            metadata: { plan, priceId },
          },
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await prisma.user.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        const fallbackUser =
          user ||
          (subscription.customer
            ? await prisma.user.findUnique({
                where: { stripeCustomerId: String(subscription.customer) },
              })
            : null);

        if (!fallbackUser) {
          console.error('User not found for subscription:', subscription.id);
          break;
        }

        // Determine plan from price ID (two-plan model)
        let plan: 'FREE' | 'PREMIUM' = 'FREE';
        const priceId = subscription.items.data[0]?.price.id;

        if (priceId) {
          if (
            priceId === process.env.STRIPE_PRICE_ID ||
            priceId === process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID ||
            priceId === process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID
          ) {
            plan = 'PREMIUM';
          }
        }

        const status = subscription.status.toUpperCase() as any;

        await prisma.user.update({
          where: { id: fallbackUser.id },
          data: {
            plan: subscription.cancel_at_period_end ? 'FREE' : plan,
            subscriptionStatus: status,
            periodStart: new Date(subscription.current_period_start * 1000),
            periodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        if (fallbackUser.clerkId) {
          const client = await clerkClient();
          await client.users.updateUserMetadata(fallbackUser.clerkId, {
            publicMetadata: {
              subscriptionStatus: status.toLowerCase(),
              plan: subscription.cancel_at_period_end ? 'free' : plan.toLowerCase(),
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer,
              currentPeriodEnd: subscription.current_period_end,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
          });
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await prisma.user.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!user) {
          console.error('User not found for subscription:', subscription.id);
          break;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: 'FREE',
            subscriptionStatus: 'CANCELED',
            calculationsLimit: 3,
            stripeSubscriptionId: null,
          },
        });

        if (user.clerkId) {
          const client = await clerkClient();
          await client.users.updateUserMetadata(user.clerkId, {
            publicMetadata: {
              subscriptionStatus: 'cancelled',
              plan: 'free',
              stripeSubscriptionId: null,
              currentPeriodEnd: null,
              cancelAtPeriodEnd: false,
            },
          });
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: invoice.customer as string },
        });

        if (!user) {
          console.error('User not found for customer:', invoice.customer);
          break;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'PAST_DUE',
          },
        });

        await sendPaymentFailedEmail(user.email, user.name || 'there');

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: invoice.customer as string },
        });

        if (user?.clerkId) {
          const client = await clerkClient();
          await client.users.updateUserMetadata(user.clerkId, {
            publicMetadata: {
              subscriptionStatus: 'active',
              plan: 'premium',
            },
          });
        }

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
