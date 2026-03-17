import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { createCheckoutSession, getPriceId } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as { interval?: 'month' | 'year' };
    const interval = body.interval ?? 'month';

    if (interval !== 'month') {
      return NextResponse.json({ error: 'Only monthly billing is currently available' }, { status: 400 });
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY ?? '';
    if (!stripeSecret.startsWith('sk_') || stripeSecret.includes('your_key_here') || stripeSecret.includes('xxxxx')) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Set a real STRIPE_SECRET_KEY in .env/.env.local.' },
        { status: 500 }
      );
    }

    const priceId = getPriceId(interval);

    if (!priceId || !priceId.startsWith('price_') || priceId.includes('your_') || priceId.includes('xxxxx')) {
      return NextResponse.json(
        { error: 'Stripe monthly price is not configured. Set STRIPE_PREMIUM_MONTHLY_PRICE_ID.' },
        { status: 500 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      customerId: user.stripeCustomerId ?? undefined,
      priceId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    });

    await prisma.analytics.create({
      data: {
        eventType: 'upgrade_initiated',
        userId: user.id,
        metadata: { interval, priceId },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session. Check Stripe keys and price ID.' }, { status: 500 });
  }
}
