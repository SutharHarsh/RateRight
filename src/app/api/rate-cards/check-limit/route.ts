import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { canCreateRateCard } from '@/lib/rateCardLimits';
import { normalizePlan } from '@/lib/subscription';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const appUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, plan: true },
  });

  if (!appUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const isPremium = normalizePlan(appUser.plan) === 'PREMIUM';
  const result = await canCreateRateCard(appUser.id, isPremium);

  return NextResponse.json(result);
}
