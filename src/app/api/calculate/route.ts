import { NextResponse } from 'next/server';
import { calculateRate } from '@/lib/calculations';
import { validateRate } from '@/lib/accurateRateCalculation';
import { getOptionalAuth } from '@/lib/auth';
import { currentUser } from '@clerk/nextjs/server';
import { validateCalculation } from '@/lib/validation';
import { checkRateLimit, rateLimiters } from '@/lib/rateLimit';
import { prisma } from '@/lib/db';
import { normalizePlan, metadataIsPremium } from '@/lib/subscription';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = validateCalculation(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid calculation request', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const input = validation.data;
    const result = await calculateRate(input);
  const rateValidation = validateRate(input, result.recommendedRate);

    const { userId } = await getOptionalAuth();

    const rate = await checkRateLimit(userId ?? 'anonymous-calculate', rateLimiters.api);
    if (!rate.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    if (userId) {
      const clerkUser = await currentUser();
      const appUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { plan: true },
      });

      if (clerkUser) {
        const rawCount = clerkUser.publicMetadata?.calculationsThisMonth;
        const calculationCount = typeof rawCount === 'number' ? rawCount : 0;
        const isPremium =
          normalizePlan(appUser?.plan) === 'PREMIUM' ||
          metadataIsPremium(
            (clerkUser.publicMetadata as Record<string, unknown> | undefined)?.subscriptionStatus,
            (clerkUser.publicMetadata as Record<string, unknown> | undefined)?.plan
          );

        if (!isPremium && calculationCount >= 3) {
          return NextResponse.json(
            {
              error: 'Limit reached',
              message:
                'You have used all 3 free calculations this month. Upgrade to Premium for unlimited calculations.',
            },
            { status: 403 }
          );
        }
      }
    }

    if (!rateValidation.isRealistic) {
      console.warn('Unrealistic rate detected:', rateValidation.warning);
    }

    return NextResponse.json({
      ...result,
      warning: rateValidation.warning,
    });
  } catch (error) {
    console.error('Calculation error:', error);
    return NextResponse.json({ error: 'Invalid calculation request' }, { status: 400 });
  }
}
