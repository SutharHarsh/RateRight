import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { createCheckoutSession, getPriceId } from '@/lib/stripe';

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const priceId = getPriceId('month');

  if (!priceId) {
    return NextResponse.json({ error: 'Stripe price ID is missing' }, { status: 500 });
  }

  const session = await createCheckoutSession({
    userId: user.id,
    userEmail: user.email,
    customerId: user.stripeCustomerId ?? undefined,
    priceId,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
