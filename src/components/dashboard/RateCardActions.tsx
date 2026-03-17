'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Eye, Lock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { generateRateCard } from '@/lib/generateRateCard';
import { generateSimpleRateCard } from '@/lib/simpleRateCardGenerator';
import { extractRateItems, extractTemplateData, type TemplateData } from '@/lib/rateCardData';
import { useSubscription } from '@/hooks/useSubscription';

type TemplateType = 'classic' | 'creative' | 'premium';

interface RateCardActionsProps {
  card: {
    id: string;
    creatorName: string;
    creatorHandle?: string;
    platform: string;
    followerCount: number;
    engagementRate: number;
    niche: string;
    contactEmail?: string | null;
    photoUrl?: string | null;
    terms?: string | null;
    templateId?: string;
    rates: unknown;
  };
}

const INSTAGRAM_CHOICES: Array<{ id: TemplateType; label: string; description: string }> = [
  { id: 'classic', label: 'Classic Layout', description: 'Clean, minimal, business-focused layout' },
  { id: 'creative', label: 'Creative Layout', description: 'Colorful, lifestyle-focused, visual-heavy design' },
  { id: 'premium', label: 'Premium Layout', description: 'Elegant, luxury brand-friendly, sophisticated' },
];

const YOUTUBE_CHOICES: Array<{ id: TemplateType; label: string; description: string }> = [
  { id: 'classic', label: 'Classic Layout', description: 'Professional, analytics-heavy, corporate style' },
  { id: 'creative', label: 'Creative Layout', description: 'Personality-driven, visual, approachable format' },
  { id: 'premium', label: 'Premium Layout', description: 'Comprehensive media kit style with full analytics' },
];

export function RateCardActions({ card }: RateCardActionsProps) {
  const router = useRouter();
  const { isPremium } = useSubscription();
  const [isChooserOpen, setIsChooserOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const rates = useMemo(() => extractRateItems(card.rates), [card.rates]);
  const templateData = useMemo(() => extractTemplateData(card.rates), [card.rates]);

  const buildPdfPayload = (selectedTemplate: TemplateType) => {
    const singlePost = rates.find((r) => r.name.toLowerCase().includes('single'))?.price ?? 0;
    const storySeries = rates.find((r) => r.name.toLowerCase().includes('story'))?.price ?? 0;
    const videoIntegration = rates.find((r) => r.name.toLowerCase().includes('video'))?.price ?? 0;
    const multiplePosts = rates.find((r) => r.name.toLowerCase().includes('multiple'))?.price ?? 0;

    const fallbackTemplateData: TemplateData = {
      creatorName: card.creatorName,
      handle: card.creatorHandle || `@${card.creatorName.toLowerCase().replace(/\s+/g, '')}`,
      platform: card.platform === 'YouTube' ? 'YouTube' : 'Instagram',
      niche: card.niche,
      followers: card.followerCount,
      avgEngagementRate: card.engagementRate,
      avgViews: 85000,
      avgWatchTime: '8:45',
      avgReach: 52000,
      avgStoryViews: 18000,
      primaryAgeRange: card.platform === 'YouTube' ? '18-34' : '25-34',
      genderSplit: card.platform === 'YouTube' ? { male: 55, female: 45 } : { male: 35, female: 65 },
      topLocations:
        card.platform === 'YouTube' ? ['USA (50%)', 'India (15%)', 'UK (10%)'] : ['USA (60%)', 'UK (15%)', 'Canada (10%)'],
      singlePostRate: singlePost,
      storySeriesRate: storySeries,
      reelRate: videoIntegration,
      dedicatedVideoRate: singlePost,
      integrationRate: videoIntegration,
      shortsRate: storySeries,
      usageRights30Day: 800,
      usageRights90Day: 1500,
      exclusivity30Day: 500,
      exclusivity90Day: 1200,
      profilePhoto: card.photoUrl || undefined,
      websiteUrl: undefined,
      contactEmail: card.contactEmail || undefined,
      terms: card.terms || undefined,
    };

    generateRateCard(
      {
        creatorName: card.creatorName,
        platform: card.platform,
        followers: card.followerCount,
        engagementRate: card.engagementRate,
        niche: card.niche,
        templateId: card.templateId,
        templateData: templateData || fallbackTemplateData,
        rates: {
          singlePost,
          storyText: `$${storySeries.toLocaleString()}`,
          videoIntegration,
          multiplePosts,
        },
      },
      selectedTemplate
    );
  };

  const handleDelete = async () => {
    setDeleting(true);
    const confirmed = window.confirm(
      'Delete this rate card? On Free plan, deleting your first rate card does not restore your free creation quota.'
    );
    if (!confirmed) {
      setDeleting(false);
      return;
    }

    const response = await fetch(`/api/rate-cards/${card.id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      router.refresh();
    }

    setDeleting(false);
  };

  const isInstagram = (card.platform || '').toLowerCase().includes('instagram');
  const choices = isInstagram ? INSTAGRAM_CHOICES : YOUTUBE_CHOICES;
  const chooserTitle = isInstagram
    ? 'Choose your Instagram rate card template'
    : 'Choose your YouTube rate card template';

  const isSimpleCard = card.templateId === 'simple';

  const handleSimpleDownload = () => {
    const singleRate = rates[0]?.price || 0;
    generateSimpleRateCard({
      creatorName: card.creatorName,
      handle: card.creatorHandle,
      platform: card.platform,
      followers: card.followerCount,
      engagementRate: card.engagementRate,
      niche: card.niche,
      singlePostRate: singleRate,
    });
  };

  return (
    <>
      <div className="flex gap-2">
        <Link href={`/dashboard/rate-cards/${card.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => {
            if (isSimpleCard || !isPremium) {
              handleSimpleDownload();
              return;
            }

            setIsChooserOpen(true);
          }}
        >
          <Download className="w-3 h-3 mr-1" />
          PDF
        </Button>
        <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      <Dialog open={isChooserOpen && !isSimpleCard && isPremium} onOpenChange={setIsChooserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{chooserTitle}</DialogTitle>
            <DialogDescription>
              Select the layout style before generating your PDF.
              {!isPremium && (
                <span className="block mt-2 text-amber-600 font-semibold">
                  Free plan: 1 rate card ever. Deleting it does not restore free quota. Classic and Creative are available;
                  Premium requires upgrade.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {choices.map((choice) => {
              const isLocked = choice.id === 'premium' && !isPremium;

              return (
                <Button
                  key={choice.id}
                  type="button"
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                  onClick={() => {
                    if (isLocked) {
                      router.push('/pricing');
                      return;
                    }

                    buildPdfPayload(choice.id);
                    setIsChooserOpen(false);
                  }}
                >
                  <span className="text-left flex items-start justify-between w-full gap-2">
                    <span>
                      <span className="block font-medium">{choice.label}</span>
                      <span className="block text-xs text-muted-foreground">{choice.description}</span>
                    </span>
                    {isLocked && <Lock className="w-4 h-4 shrink-0 text-amber-600" />}
                  </span>
                </Button>
              );
            })}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsChooserOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
