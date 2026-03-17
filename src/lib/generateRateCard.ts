import { generateRateCardTemplate, type RateCardTemplateData, type TemplateType } from '@/lib/rateCardTemplates';
import { type TemplateData } from '@/lib/rateCardData';

type LegacyLayout = 'classic' | 'creative' | 'premium' | 'professional' | 'creator' | 'media-kit';

interface RateCardData {
  creatorName: string;
  platform: string;
  followers: number;
  engagementRate: number;
  niche: string;
  templateId?: string;
  layoutVariant?: LegacyLayout;
  templateData?: TemplateData;
  priceBreakdown?: {
    lines: Array<{
      label: string;
      amount: number;
      details?: string[];
    }>;
    finalRate: number;
    steps: string[];
  };
  rates: {
    singlePost: number;
    storyText: string;
    videoIntegration?: number;
    multiplePosts?: number;
  };
}

function normalizeTemplate(layoutVariant?: LegacyLayout): TemplateType {
  if (layoutVariant === 'creative' || layoutVariant === 'creator') {
    return 'creative';
  }

  if (layoutVariant === 'premium' || layoutVariant === 'media-kit') {
    return 'premium';
  }

  return 'classic';
}

function normalizePlatform(value: string): 'Instagram' | 'YouTube' | 'TikTok' {
  const lower = value.toLowerCase();
  if (lower.includes('youtube')) {
    return 'YouTube';
  }

  if (lower.includes('tiktok')) {
    return 'TikTok';
  }

  return 'Instagram';
}

export function generateRateCard(data: RateCardData, explicitTemplate?: TemplateType): void {
  const template = explicitTemplate || normalizeTemplate(data.layoutVariant);
  const platform = normalizePlatform(data.platform);

  const templateData: RateCardTemplateData = {
    creatorName: data.creatorName,
    handle: data.templateData?.handle || `@${data.creatorName.toLowerCase().replace(/\s+/g, '')}`,
    platform,
    niche: data.niche,
    followers: data.followers,
    engagementRate: data.engagementRate,
    avgViews: data.templateData?.avgViews,
    avgWatchTime: data.templateData?.avgWatchTime,
    avgReach: data.templateData?.avgReach,
    avgStoryViews: data.templateData?.avgStoryViews,
    primaryAgeRange: data.templateData?.primaryAgeRange,
    genderSplit: data.templateData?.genderSplit,
    topLocations: data.templateData?.topLocations,
    usageRights30Day: data.templateData?.usageRights30Day,
    usageRights90Day: data.templateData?.usageRights90Day,
    exclusivity30Day: data.templateData?.exclusivity30Day,
    exclusivity90Day: data.templateData?.exclusivity90Day,
    profilePhoto: data.templateData?.profilePhoto,
    websiteUrl: data.templateData?.websiteUrl,
    contactEmail: data.templateData?.contactEmail,
    priceBreakdown: data.priceBreakdown,
    rates: {
      singlePost: data.templateData?.singlePostRate || data.rates.singlePost,
      storyText: `$${(data.templateData?.storySeriesRate || Number(data.rates.storyText.replace(/[^0-9]/g, '')) || 0).toLocaleString()}`,
      reelRate: data.templateData?.reelRate || data.rates.videoIntegration || 0,
      videoRate: data.templateData?.dedicatedVideoRate || data.rates.videoIntegration || data.rates.singlePost,
      integrationRate: data.templateData?.integrationRate || data.rates.videoIntegration || 0,
    },
  };

  generateRateCardTemplate(templateData, template);
}
