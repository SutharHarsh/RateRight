import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import type { DetailedBreakdown } from '@/lib/accurateRateCalculation';

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = (await req.json()) as {
    platform: string;
    username?: string;
    followerCount: number;
    engagementRate: number;
    contentType: string;
    niche: string;
    audienceLocation: string;
    deliverables: string;
    usageRights: string;
    exclusivity: string;
    minRate: number;
    maxRate: number;
    recommendedRate: number;
    baseRate: number;
    nicheMultiplier: number;
    usageRightsPremium: number;
    exclusivityPremium: number;
    confidenceScore: number;
    dataPoints: number;
    breakdown?: DetailedBreakdown;
    marketContext?: {
      typicalRange: string;
      topTenPercent: string;
      yourPosition: 'below_average' | 'average' | 'above_average' | 'top_tier';
    };
    negotiationGuidance?: {
      startingAsk: number;
      walkAwayMinimum: number;
      idealRange: { min: number; max: number };
      tips: string[];
    };
    warning?: string;
  };

  const normalizedPayload = {
    platform: payload.platform.trim(),
    username: payload.username?.trim() || null,
    followerCount: payload.followerCount,
    engagementRate: payload.engagementRate,
    contentType: payload.contentType.trim(),
    niche: payload.niche.trim(),
    audienceLocation: payload.audienceLocation.trim(),
    deliverables: payload.deliverables.trim(),
    usageRights: payload.usageRights.trim(),
    exclusivity: payload.exclusivity.trim(),
  };

  const clerkUser = await currentUser();
  const primaryEmail =
    clerkUser?.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) {
    return NextResponse.json({ error: 'No email found for user' }, { status: 400 });
  }

  const displayName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || clerkUser?.username || null;

  const appUser = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      email: primaryEmail,
      name: displayName,
      imageUrl: clerkUser?.imageUrl,
    },
    create: {
      clerkId: userId,
      email: primaryEmail,
      name: displayName,
      imageUrl: clerkUser?.imageUrl,
    },
  });

  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const dedupeWhere = {
    userId: appUser.id,
    platform: normalizedPayload.platform,
    username: normalizedPayload.username,
    followerCount: normalizedPayload.followerCount,
    engagementRate: normalizedPayload.engagementRate,
    contentType: normalizedPayload.contentType,
    niche: normalizedPayload.niche,
    audienceLocation: normalizedPayload.audienceLocation,
    deliverables: normalizedPayload.deliverables,
    usageRights: normalizedPayload.usageRights,
    exclusivity: normalizedPayload.exclusivity,
  };

  const existingRecent = await prisma.calculation.findFirst({
    where: {
      ...dedupeWhere,
      createdAt: { gte: twoMinutesAgo },
    },
  });

  if (existingRecent) {
    return NextResponse.json({ success: true, calculationId: existingRecent.id, deduped: true });
  }

  const saved = await prisma.calculation.create({
    data: {
      userId: appUser.id,
      platform: normalizedPayload.platform,
      username: normalizedPayload.username,
      followerCount: normalizedPayload.followerCount,
      engagementRate: normalizedPayload.engagementRate,
      contentType: normalizedPayload.contentType,
      niche: normalizedPayload.niche,
      audienceLocation: normalizedPayload.audienceLocation,
      deliverables: normalizedPayload.deliverables,
      usageRights: normalizedPayload.usageRights,
      exclusivity: normalizedPayload.exclusivity,
      minRate: payload.minRate,
      maxRate: payload.maxRate,
      recommendedRate: payload.recommendedRate,
      baseRate: payload.baseRate,
      nicheMultiplier: payload.nicheMultiplier,
      usageRightsPremium: payload.usageRightsPremium,
      exclusivityPremium: payload.exclusivityPremium,
      confidenceScore: payload.confidenceScore,
      dataPoints: payload.dataPoints,
      breakdown: payload.breakdown as Prisma.InputJsonValue | undefined,
      marketContext: payload.marketContext as Prisma.InputJsonValue | undefined,
      negotiationGuidance: payload.negotiationGuidance as Prisma.InputJsonValue | undefined,
      warning: payload.warning,
    },
  });

  // Handle concurrent duplicate saves (e.g., Strict Mode double-effect) by keeping the oldest record.
  const potentialDuplicates = await prisma.calculation.findMany({
    where: {
      ...dedupeWhere,
      createdAt: { gte: tenMinutesAgo },
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  const canonicalId = potentialDuplicates[0]?.id ?? saved.id;
  const duplicateIds = potentialDuplicates.slice(1).map((item) => item.id);

  if (duplicateIds.length > 0) {
    await prisma.calculation.deleteMany({
      where: { id: { in: duplicateIds } },
    });
  }

  if (canonicalId !== saved.id) {
    return NextResponse.json({ success: true, calculationId: canonicalId, deduped: true });
  }

  await prisma.user.update({
    where: { id: appUser.id },
    data: {
      calculationsUsed: {
        increment: 1,
      },
    },
  });

  return NextResponse.json({ success: true, calculationId: canonicalId });
}
