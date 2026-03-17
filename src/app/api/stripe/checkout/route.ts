import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createCheckoutSession, createCustomerPortalSession } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const auth = getAuth(req as any);

    if (!auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing price ID' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If user already has a customer ID and active subscription, redirect to portal
    if (user.stripeCustomerId && user.subscriptionStatus === 'ACTIVE') {
      const portalSession = await createCustomerPortalSession({
        customerId: user.stripeCustomerId,
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      });

      return NextResponse.json({ url: portalSession.url });
    }

    // Create checkout session
    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      priceId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    });

    // Track analytics
    await prisma.analytics.create({
      data: {
        eventType: 'upgrade_initiated',
        userId: user.id,
        metadata: { priceId },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
