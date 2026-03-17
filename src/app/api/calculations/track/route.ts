import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { checkRateLimit, rateLimiters } from '@/lib/rateLimit';
import { prisma } from '@/lib/db';
import { normalizePlan, metadataIsPremium } from '@/lib/subscription';

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rate = await checkRateLimit(userId, rateLimiters.calculator);
  if (!rate.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.', remaining: 0 },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'Retry-After': '3600',
        },
      }
    );
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const appUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { plan: true },
  });

  const metadata = user.publicMetadata ?? {};
  const currentCount = typeof metadata.calculationsThisMonth === 'number' ? metadata.calculationsThisMonth : 0;
  const isPremium =
    normalizePlan(appUser?.plan) === 'PREMIUM' ||
    metadataIsPremium(
      (metadata as Record<string, unknown>).subscriptionStatus,
      (metadata as Record<string, unknown>).plan
    );

  if (!isPremium && currentCount >= 3) {
    return NextResponse.json(
      {
        error: 'Limit reached',
        message:
          'You have used all 3 free calculations this month. Upgrade to Premium for unlimited calculations.',
      },
      { status: 403 }
    );
  }

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      calculationsThisMonth: currentCount + 1,
    },
  });

  return NextResponse.json({
    success: true,
    remaining: isPremium ? 'unlimited' : Math.max(0, 2 - currentCount),
  });
}
