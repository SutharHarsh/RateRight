import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!appUser) {
      return NextResponse.json({ calculations: [] });
    }

    const { searchParams } = new URL(req.url);
    const parsedLimit = Number(searchParams.get('limit') || '10');
    const limit = Number.isFinite(parsedLimit)
      ? Math.max(1, Math.min(parsedLimit, 50))
      : 10;

    const calculations = await prisma.calculation.findMany({
      where: { userId: appUser.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        platform: true,
        followerCount: true,
        niche: true,
        recommendedRate: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ calculations });
  } catch (error) {
    console.error('Fetch recent calculations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calculations' },
      { status: 500 }
    );
  }
}
