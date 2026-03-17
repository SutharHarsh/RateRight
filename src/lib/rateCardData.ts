export type PlatformTemplate = 'Instagram' | 'YouTube' | 'TikTok';

export interface RateItem {
  name: string;
  price: number;
}

export interface GenderSplit {
  male: number;
  female: number;
}

export interface TemplateData {
  creatorName: string;
  handle: string;
  platform: PlatformTemplate;
  niche: string;
  followers: number;
  avgEngagementRate: number;
  avgViews?: number;
  avgWatchTime?: string;
  avgReach?: number;
  avgStoryViews?: number;
  primaryAgeRange: string;
  genderSplit: GenderSplit;
  topLocations: string[];
  singlePostRate: number;
  storySeriesRate?: number;
  reelRate?: number;
  dedicatedVideoRate?: number;
  integrationRate?: number;
  shortsRate?: number;
  usageRights30Day: number;
  usageRights90Day: number;
  exclusivity30Day: number;
  exclusivity90Day: number;
  profilePhoto?: string;
  websiteUrl?: string;
  contactEmail?: string;
  terms?: string;
}

interface StructuredRates {
  items: RateItem[];
  templateData?: TemplateData;
}

function isRateItem(value: unknown): value is RateItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as { name?: unknown; price?: unknown };
  return typeof item.name === 'string' && typeof item.price === 'number' && !Number.isNaN(item.price);
}

export function extractRateItems(rates: unknown): RateItem[] {
  if (Array.isArray(rates)) {
    return rates.filter(isRateItem);
  }

  if (rates && typeof rates === 'object' && Array.isArray((rates as StructuredRates).items)) {
    return (rates as StructuredRates).items.filter(isRateItem);
  }

  return [];
}

export function extractTemplateData(rates: unknown): TemplateData | null {
  if (!rates || typeof rates !== 'object') {
    return null;
  }

  const maybeTemplateData = (rates as StructuredRates).templateData;
  if (!maybeTemplateData || typeof maybeTemplateData !== 'object') {
    return null;
  }

  return maybeTemplateData;
}

export function buildStoredRates(items: RateItem[], templateData?: TemplateData): StructuredRates {
  return {
    items,
    templateData,
  };
}
