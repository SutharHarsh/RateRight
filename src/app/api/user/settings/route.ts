import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { sanitizeInput } from '@/lib/validation';

export async function PATCH(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as {
    displayName?: string;
    defaultPlatform?: string;
    defaultNiche?: string;
  };

  const displayName = sanitizeInput(body.displayName?.trim() ?? '');
  const firstName = displayName.split(' ')[0] || '';
  const lastName = displayName.split(' ').slice(1).join(' ');

  const client = await clerkClient();

  await client.users.updateUser(userId, {
    firstName,
    lastName,
    unsafeMetadata: {
      defaultPlatform: body.defaultPlatform || 'Instagram',
      defaultNiche: body.defaultNiche || '',
    },
  });

  return NextResponse.json({ success: true });
}
