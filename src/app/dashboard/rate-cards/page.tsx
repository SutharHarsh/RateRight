import { getOptionalAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { normalizePlan } from '@/lib/subscription';
import { RateCardActions } from '@/components/dashboard/RateCardActions';
import { extractRateItems } from '@/lib/rateCardData';
import { canCreateRateCard } from '@/lib/rateCardLimits';
import { 
  Plus,
  FileText,
  Lock,
  Sparkles,
  Instagram,
  Youtube,
  Layers
} from 'lucide-react';

type CardVisualConfig = {
  cardClass: string;
  badgeClass: string;
  templateLabel: string;
  Icon: typeof Sparkles;
};

function getCardVisualConfig(card: { templateId?: string }): CardVisualConfig {
  const templateId = (card.templateId || '').toLowerCase();

  if (templateId === 'instagram') {
    return {
      cardClass: 'border-pink-500/40 bg-gradient-to-br from-pink-950/30 to-purple-950/20',
      badgeClass: 'bg-pink-500/20 text-pink-200 border border-pink-500/30',
      templateLabel: 'Instagram Template',
      Icon: Instagram,
    };
  }

  if (templateId === 'youtube') {
    return {
      cardClass: 'border-red-500/40 bg-gradient-to-br from-red-950/30 to-slate-950/20',
      badgeClass: 'bg-red-500/20 text-red-200 border border-red-500/30',
      templateLabel: 'YouTube Template',
      Icon: Youtube,
    };
  }

  return {
    cardClass: 'border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 to-slate-950/20',
    badgeClass: 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30',
    templateLabel: 'Custom Card',
    Icon: Layers,
  };
}

export default async function RateCardsPage() {
  const { userId } = await getOptionalAuth();
  
  if (!userId) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      rateCards: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  const rateCards = user.rateCards;
  const normalizedPlan = normalizePlan(user.plan);
  const isPremium = normalizedPlan !== 'FREE';
  const limit = await canCreateRateCard(user.id, isPremium);
  const canCreate = isPremium || limit.canCreate;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Rate Cards</h1>
          <p className="text-muted-foreground mt-1">
            Professional PDF rate cards to share with brands
          </p>
        </div>
        {canCreate ? (
          <Link href={isPremium ? '/dashboard/rate-cards/premium-create' : '/dashboard/rate-cards/create'}>
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Create Rate Card
            </Button>
          </Link>
        ) : (
          <Link href="/pricing">
            <Button size="lg">
              <Lock className="w-4 h-4 mr-2" />
              Upgrade to Create
            </Button>
          </Link>
        )}
      </div>

      {/* Free Plan Limit Notice */}
      {!isPremium && (
        <Card className="mb-6 border-primary">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  Free Plan Rate Card Limit
                </h3>
                <p className="text-muted-foreground text-sm">
                  {canCreate
                    ? 'You can create 1 rate card on the free plan. If you delete it, you still cannot create another without upgrading.'
                    : limit.reason}
                </p>
              </div>
              <Link href="/pricing">
                <Button>Upgrade to Premium</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rate Cards List */}
      {rateCards.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isPremium ? 'No rate cards yet' : 'Create your free rate card'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {isPremium
                  ? 'Create your first rate card to share professional pricing with brands'
                  : canCreate
                  ? 'You can create 1 free rate card. After that, upgrade to Premium for unlimited cards.'
                  : 'Free plan limit reached. Upgrade to Premium to create unlimited cards.'}
              </p>
              {canCreate ? (
                <Link href={isPremium ? '/dashboard/rate-cards/premium-create' : '/dashboard/rate-cards/create'}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Rate Card
                  </Button>
                </Link>
              ) : (
                <Link href="/pricing">
                  <Button>
                    Upgrade to Premium
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rateCards.map((card: any) => {
            const visual = getCardVisualConfig(card);
            const Icon = visual.Icon;

            return (
            <Card key={card.id} className={`hover:shadow-md transition-shadow ${visual.cardClass}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{card.creatorName || 'Untitled Rate Card'}</CardTitle>
                    <CardDescription className="mt-1">
                      {new Date(card.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </CardDescription>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{visual.templateLabel}</span>
                    </div>
                  </div>
                  <Badge className={visual.badgeClass}>Published</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Preview - Show first few rates */}
                <div className="space-y-2 mb-4">
                  {extractRateItems(card.rates).slice(0, 3).map((rate, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{rate.name}</span>
                      <span className="font-semibold">${rate.price}</span>
                    </div>
                  ))}
                  {extractRateItems(card.rates).length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{extractRateItems(card.rates).length - 3} more rates
                    </p>
                  )}
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
          );
          })}
        </div>
      )}

      {/* Templates Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Rate Card Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              id: 'instagram',
              name: 'Instagram Creator',
              description: 'Perfect for Instagram-focused creators with feed posts, reels, and stories',
              isPremium: true,
            },
            {
              id: 'youtube',
              name: 'YouTube Creator',
              description: 'Designed for YouTubers with video packages and integrations',
              isPremium: true,
            },
          ].map((template, idx) => (
            <Card key={idx} className={template.isPremium ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  {template.isPremium && (
                    <Badge variant="default">Premium</Badge>
                  )}
                </div>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPremium && canCreate && (!template.isPremium || normalizedPlan === 'PREMIUM') ? (
                  <Link href={`/dashboard/rate-cards/new?template=${template.id}`}>
                    <Button variant="outline" className="w-full" size="sm">
                      Use Template
                    </Button>
                  </Link>
                ) : (
                  <Link href="/pricing">
                    <Button variant="outline" className="w-full" size="sm">
                      <Lock className="w-3 h-3 mr-1" />
                      Upgrade to Access
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
