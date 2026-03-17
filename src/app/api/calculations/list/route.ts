import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET() {
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

  const calculations = await prisma.calculation.findMany({
    where: { userId: appUser.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ calculations });
}
