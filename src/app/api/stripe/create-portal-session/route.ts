import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { createCustomerPortalSession } from '@/lib/stripe';

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
  }

  const session = await createCustomerPortalSession({
    customerId: user.stripeCustomerId,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing`,
  });

  return NextResponse.json({ url: session.url });
}
