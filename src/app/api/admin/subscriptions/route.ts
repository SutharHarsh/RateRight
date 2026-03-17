import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptions = await prisma.user.findMany({
      where: {
        stripeSubscriptionId: { not: null },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        stripeSubscriptionId: true,
        email: true,
        subscriptionStatus: true,
        periodEnd: true,
        plan: true,
      },
      take: 500,
    });

    return NextResponse.json({
      subscriptions: subscriptions.map((sub) => ({
        id: sub.stripeSubscriptionId,
        userEmail: sub.email,
        status: sub.subscriptionStatus?.toLowerCase() ?? 'unknown',
        currentPeriodEnd: sub.periodEnd ? Math.floor(sub.periodEnd.getTime() / 1000) : null,
        cancelAtPeriodEnd: sub.subscriptionStatus === 'CANCELED',
        plan: sub.plan,
      })),
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}
