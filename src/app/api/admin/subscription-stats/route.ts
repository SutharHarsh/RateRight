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

    const activeSubscriptions = await prisma.user.count({
      where: {
        subscriptionStatus: 'ACTIVE',
      },
    });

    const canceledSubscriptions = await prisma.user.count({
      where: {
        subscriptionStatus: 'CANCELED',
      },
    });

    const totalTracked = activeSubscriptions + canceledSubscriptions;
    const churnRate = totalTracked > 0 ? (canceledSubscriptions / totalTracked) * 100 : 0;

    const mrr = activeSubscriptions * 19;

    return NextResponse.json({
      mrr,
      activeSubscriptions,
      churnRate,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
