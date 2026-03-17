import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createCustomerPortalSession } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const auth = getAuth(req as any);

    if (!auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
    });

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 400 }
      );
    }

    const portalSession = await createCustomerPortalSession({
      customerId: user.stripeCustomerId,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
