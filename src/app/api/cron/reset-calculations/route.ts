import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const client = await clerkClient();
  const users = await client.users.getUserList({ limit: 500 });

  for (const user of users.data) {
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        calculationsThisMonth: 0,
      },
    });
  }

  return NextResponse.json({ success: true, resetCount: users.data.length });
}
