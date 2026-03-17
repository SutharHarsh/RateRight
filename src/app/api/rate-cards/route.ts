import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { normalizePlan } from '@/lib/subscription';
import { buildStoredRates } from '@/lib/rateCardData';
import { canCreateRateCard } from '@/lib/rateCardLimits';

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const appUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, plan: true, email: true, name: true },
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
    creatorName: string;
    creatorHandle: string;
    platform: string;
    followerCount: number;
    engagementRate: number;
    niche: string;
    terms?: string;
    contactEmail?: string;
    templateId?: string;
    rates:
      | Array<{ name: string; price: number }>
      | {
          items: Array<{ name: string; price: number }>;
          templateData?: unknown;
        };
  };

  const allowedTemplates = new Set(['modern', 'instagram', 'youtube', 'simple']);
  const templateId = allowedTemplates.has(body.templateId || '') ? (body.templateId as string) : 'modern';

  if (!isPremium && templateId !== 'simple') {
    return NextResponse.json({ error: 'Advanced templates are Premium-only' }, { status: 403 });
  }

  const normalizedRates = Array.isArray(body.rates) ? body.rates : body.rates?.items;

  if (!body.creatorName || !body.platform || !body.niche || !Array.isArray(normalizedRates) || normalizedRates.length === 0) {
    return NextResponse.json({ error: 'Invalid rate card payload' }, { status: 400 });
  }

  const card = await prisma.$transaction(async (tx) => {
    const createdCard = await tx.rateCard.create({
      data: {
        userId: appUser.id,
        creatorName: body.creatorName,
        creatorHandle: body.creatorHandle || '',
        platform: body.platform,
        followerCount: body.followerCount,
        engagementRate: body.engagementRate,
        niche: body.niche,
        terms: body.terms || null,
        contactEmail: body.contactEmail || appUser.email,
        rates: buildStoredRates(normalizedRates) as unknown as Prisma.InputJsonValue,
        templateId,
      },
    });

    await tx.analytics.create({
      data: {
        eventType: 'rate_card_created',
        userId: appUser.id,
        metadata: {
          rateCardId: createdCard.id,
          templateId,
          platform: body.platform,
        },
      },
    });

    return createdCard;
  });

  return NextResponse.json({ success: true, id: card.id });
}
