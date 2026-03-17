import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

interface Params {
  params: { id: string };
}

export async function DELETE(_: Request, { params }: Params) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const card = await prisma.rateCard.findUnique({
    where: { id: params.id },
    select: { id: true, userId: true },
  });

  if (!card || card.userId !== user.id) {
    return NextResponse.json({ error: 'Rate card not found' }, { status: 404 });
  }

  await prisma.rateCard.delete({
    where: { id: params.id },
  });

  await prisma.analytics.create({
    data: {
      eventType: 'rate_card_deleted',
      userId: user.id,
      metadata: {
        rateCardId: card.id,
      },
    },
  });

  return NextResponse.json({ success: true });
}
