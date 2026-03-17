import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { metadataIsPremium, normalizePlan } from '@/lib/subscription';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ isSignedIn: false, isPremium: false, plan: 'FREE' });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      clerkId: true,
      plan: true,
      calculationsUsed: true,
      calculationsLimit: true,
      subscriptionStatus: true,
    },
  });

  const plan = normalizePlan(user?.plan);
  const isPremiumFromDb = plan === 'PREMIUM';

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const metadata = clerkUser.publicMetadata ?? {};
  const isPremiumFromMetadata = metadataIsPremium(
    (metadata as Record<string, unknown>).subscriptionStatus,
    (metadata as Record<string, unknown>).plan
  );

  // Self-heal metadata drift so client-only checks remain consistent.
  if (isPremiumFromDb) {
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
        subscriptionStatus: 'active',
        plan: 'premium',
      },
    });
  } else if (isPremiumFromMetadata) {
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
        plan: 'free',
      },
    });
  }

  const isPremium = isPremiumFromDb || isPremiumFromMetadata;
  const calculationsUsed = typeof metadata.calculationsThisMonth === 'number' ? metadata.calculationsThisMonth : 0;
  const calculationsLimit = isPremium ? 999999 : 3;

  return NextResponse.json({
    isSignedIn: true,
    isPremium,
    plan: isPremium ? 'PREMIUM' : 'FREE',
    calculationsUsed,
    calculationsLimit,
  });
}
