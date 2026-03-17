import { getOptionalAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RateCardActions } from '@/components/dashboard/RateCardActions';
import { extractRateItems } from '@/lib/rateCardData';

interface PageProps {
  params: { id: string };
}

export default async function RateCardDetailPage({ params }: PageProps) {
  const { userId } = await getOptionalAuth();

  if (!userId) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) {
    redirect('/login');
  }

  const card = await prisma.rateCard.findUnique({
    where: { id: params.id },
  });

  if (!card || card.userId !== user.id) {
    redirect('/dashboard/rate-cards');
  }

  const rates = extractRateItems(card.rates);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard/rate-cards" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" />
        Back to Rate Cards
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{card.creatorName}</CardTitle>
          <CardDescription>
            {card.platform} • {card.niche} • {new Date(card.createdAt).toLocaleDateString('en-US')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-500">Handle</p>
              <p className="font-medium">{card.creatorHandle || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Followers</p>
              <p className="font-medium">{card.followerCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Engagement</p>
              <p className="font-medium">{card.engagementRate}%</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Rates</h3>
            <div className="space-y-2">
              {rates.map((rate, idx) => (
                <div key={`${rate.name}-${idx}`} className="flex items-center justify-between rounded-lg border border-slate-800 px-4 py-3">
                  <span className="text-slate-300">{rate.name}</span>
                  <span className="font-semibold">${Number(rate.price).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 p-4">
            <p className="text-sm text-slate-500 mb-1">Terms</p>
            <p className="text-sm text-slate-300">{card.terms || 'No terms added.'}</p>
          </div>

          <RateCardActions
            card={{
              id: card.id,
              creatorName: card.creatorName,
              platform: card.platform,
              followerCount: card.followerCount,
              engagementRate: card.engagementRate,
              niche: card.niche,
              creatorHandle: card.creatorHandle,
              contactEmail: card.contactEmail,
              photoUrl: card.photoUrl,
              terms: card.terms,
              templateId: card.templateId,
              rates: card.rates,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
