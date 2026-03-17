import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { normalizePlan } from '@/lib/subscription';

export function isClerkConfigured() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;

  return (
    typeof publishableKey === 'string' &&
    publishableKey.startsWith('pk_') &&
    !publishableKey.includes('your_key_here') &&
    !publishableKey.includes('...') &&
    typeof secretKey === 'string' &&
    secretKey.startsWith('sk_') &&
    !secretKey.includes('your_key_here') &&
    !secretKey.includes('...')
  );
}

export async function getOptionalAuth() {
  if (!isClerkConfigured()) {
    return { userId: null as string | null, authHealthy: false };
  }

  try {
    const { userId } = await auth();
    return { userId, authHealthy: true };
  } catch {
    return { userId: null as string | null, authHealthy: false };
  }
}

export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  return userId;
}

export async function requirePremium() {
  const userId = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { plan: true },
  });

  if (!user || normalizePlan(user.plan) !== 'PREMIUM') {
    redirect('/pricing');
  }

  return userId;
}

export async function requireAdmin() {
  const userId = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return userId;
}
