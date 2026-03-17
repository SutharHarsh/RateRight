import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function DELETE() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (user) {
    await prisma.analytics.deleteMany({ where: { userId: user.id } });
    await prisma.rateCard.deleteMany({ where: { userId: user.id } });
    await prisma.contributedRate.deleteMany({ where: { userId: user.id } });
    await prisma.calculation.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }

  const client = await clerkClient();
  await client.users.deleteUser(userId);

  return NextResponse.json({ success: true });
}
