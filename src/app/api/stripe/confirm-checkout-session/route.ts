import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as { sessionId?: string };
    const sessionId = body.sessionId;

    if (!sessionId || !sessionId.startsWith('cs_')) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    const appUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, clerkId: true, email: true },
    });

    if (!appUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (!session) {
      return NextResponse.json({ error: 'Checkout session not found' }, { status: 404 });
    }

    const mappedUserId = session.metadata?.userId || session.client_reference_id;

    if (mappedUserId !== appUser.id) {
      return NextResponse.json({ error: 'Session does not belong to current user' }, { status: 403 });
    }

    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    if (!subscriptionId) {
      return NextResponse.json({ error: 'No subscription found for this session' }, { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    await prisma.user.update({
      where: { id: appUser.id },
      data: {
        plan: 'PREMIUM',
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status.toUpperCase() as any,
        calculationsLimit: 999999,
        periodStart: new Date(subscription.current_period_start * 1000),
        periodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    const client = await clerkClient();
    await client.users.updateUserMetadata(appUser.clerkId, {
      publicMetadata: {
        subscriptionStatus: 'active',
        plan: 'premium',
        stripeCustomerId: session.customer,
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });

    return NextResponse.json({ upgraded: true });
  } catch (error) {
    console.error('Checkout confirmation error:', error);
    return NextResponse.json(
      { error: 'Unable to confirm checkout session. Please retry in a few seconds.' },
      { status: 500 }
    );
  }
}
