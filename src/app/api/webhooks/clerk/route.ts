import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { userId, email, firstName, lastName, imageUrl } = await req.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name: firstName && lastName ? `${firstName} ${lastName}` : firstName || null,
        imageUrl: imageUrl || null,
        plan: 'FREE',
        calculationsLimit: 3,
        calculationsUsed: 0,
      },
    });

    // Send welcome email
    await sendWelcomeEmail(email, user.name || 'there');

    // Track analytics
    await prisma.analytics.create({
      data: {
        eventType: 'user_signup',
        userId: user.id,
        metadata: { source: 'clerk' },
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
