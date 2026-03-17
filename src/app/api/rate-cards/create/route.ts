import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { normalizePlan } from '@/lib/subscription';
import { canCreateRateCard } from '@/lib/rateCardLimits';
import { buildStoredRates } from '@/lib/rateCardData';
import { sanitizeInput, validateRateCard } from '@/lib/validation';

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const appUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, plan: true, email: true },
  });

  if (!appUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const isPremium = normalizePlan(appUser.plan) === 'PREMIUM';
  const limitCheck = await canCreateRateCard(appUser.id, isPremium);

  if (!limitCheck.canCreate) {
    return NextResponse.json({ error: limitCheck.reason || 'Rate card limit reached' }, { status: 403 });
  }

  const body = (await req.json()) as {
    template?: string;
    calculationData?: {
      creatorName?: string;
      handle?: string;
      platform?: string;
      followers?: number;
      engagementRate?: number;
      niche?: string;
      singlePostRate?: number;
    };
  };

  const calculationData = body.calculationData;

  if (!calculationData?.creatorName || !calculationData.platform || !calculationData.niche || !calculationData.followers || !calculationData.singlePostRate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const validation = validateRateCard({
    creatorName: calculationData.creatorName,
    handle: calculationData.handle,
    platform: calculationData.platform,
    followers: Number(calculationData.followers),
    engagementRate: Number(calculationData.engagementRate || 0),
    niche: calculationData.niche,
    singlePostRate: Number(calculationData.singlePostRate),
  });

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
  }

  const parsed = validation.data;

  const card = await prisma.$transaction(async (tx) => {
    const createdCard = await tx.rateCard.create({
      data: {
        userId: appUser.id,
        creatorName: sanitizeInput(parsed.creatorName),
        creatorHandle: sanitizeInput(parsed.handle || ''),
        platform: parsed.platform,
        followerCount: Number(parsed.followers),
        engagementRate: Number(parsed.engagementRate || 0),
        niche: sanitizeInput(parsed.niche),
        terms: 'Simple free-tier rate card',
        contactEmail: appUser.email,
        templateId: 'simple',
        rates: buildStoredRates([{ name: 'Single Post', price: Number(parsed.singlePostRate) }]) as unknown as Prisma.InputJsonValue,
      },
    });

    await tx.analytics.create({
      data: {
        eventType: 'rate_card_created',
        userId: appUser.id,
        metadata: {
          rateCardId: createdCard.id,
          templateId: 'simple',
          platform: parsed.platform,
        },
      },
    });

    return createdCard;
  });

  return NextResponse.json({ success: true, rateCardId: card.id });
}
