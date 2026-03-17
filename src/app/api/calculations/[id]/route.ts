import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { calculateAccurateRate, type DetailedBreakdown } from '@/lib/accurateRateCalculation';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const calculation = await prisma.calculation.findUnique({
      where: { id: params.id },
    });

    if (!calculation) {
      return NextResponse.json({ error: 'Calculation not found' }, { status: 404 });
    }

    if (calculation.userId !== appUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const fallbackCalculated = calculateAccurateRate({
      platform: calculation.platform,
      followerCount: calculation.followerCount,
      engagementRate: calculation.engagementRate,
      niche: calculation.niche,
      contentType: calculation.contentType,
      deliverables: calculation.deliverables,
      usageRights: calculation.usageRights,
      exclusivity: calculation.exclusivity,
    });

    const breakdown = (calculation.breakdown as DetailedBreakdown | null) ?? fallbackCalculated.breakdown;
    const marketContext =
      (calculation.marketContext as typeof fallbackCalculated.marketContext | null) ??
      fallbackCalculated.marketContext;
    const negotiationGuidance =
      (calculation.negotiationGuidance as typeof fallbackCalculated.negotiationGuidance | null) ??
      fallbackCalculated.negotiationGuidance;

    return NextResponse.json({
      success: true,
      calculation: {
        id: calculation.id,
        platform: calculation.platform,
        username: calculation.username,
        followerCount: calculation.followerCount,
        engagementRate: calculation.engagementRate,
        contentType: calculation.contentType,
        niche: calculation.niche,
        audienceLocation: calculation.audienceLocation,
        deliverables: calculation.deliverables,
        usageRights: calculation.usageRights,
        exclusivity: calculation.exclusivity,
        minRate: calculation.minRate,
        maxRate: calculation.maxRate,
        recommendedRate: calculation.recommendedRate,
        baseRate: calculation.baseRate,
        nicheMultiplier: calculation.nicheMultiplier,
        usageRightsPremium: calculation.usageRightsPremium,
        exclusivityPremium: calculation.exclusivityPremium,
        confidenceScore: calculation.confidenceScore,
        dataPoints: calculation.dataPoints,
        breakdown,
        marketContext,
        negotiationGuidance,
        warning: calculation.warning ?? undefined,
        createdAt: calculation.createdAt,
      },
    });
  } catch (error) {
    console.error('Fetch calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calculation' },
      { status: 500 }
    );
  }
}
