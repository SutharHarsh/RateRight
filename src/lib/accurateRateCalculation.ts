export type SupportedPlatform =
  | 'Instagram'
  | 'TikTok'
  | 'YouTube'
  | 'Twitter/X'
  | 'LinkedIn'
  | 'Twitch';

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type CreatorPosition = 'below_average' | 'average' | 'above_average' | 'top_tier';

export interface CalculationInput {
  platform: string;
  followerCount: number;
  engagementRate: number;
  niche: string;
  contentType: string;
  deliverables?: string;
  usageRights: string;
  exclusivity: string;
}

export interface DetailedBreakdown {
  baseRate: number;
  followerTier: string;
  tierMinRate: number;
  tierMaxRate: number;
  avgEngagement: number;
  engagementAdjustment: number;
  nicheMultiplier: number;
  nicheAdjustment: number;
  contentTypeMultiplier: number;
  contentTypeAdjustment: number;
  usageRightsPremium: number;
  exclusivityPremium: number;
  subtotal: number;
  total: number;
  confidence: ConfidenceLevel;
  steps: string[];
}

export interface RateResult {
  minRate: number;
  maxRate: number;
  recommendedRate: number;
  baseRate: number;
  nicheMultiplier: number;
  usageRightsPremium: number;
  exclusivityPremium: number;
  confidenceScore: number;
  dataPoints: number;
  breakdown: DetailedBreakdown;
  marketContext: {
    typicalRange: string;
    topTenPercent: string;
    yourPosition: CreatorPosition;
  };
  negotiationGuidance: {
    startingAsk: number;
    walkAwayMinimum: number;
    idealRange: { min: number; max: number };
    tips: string[];
  };
}

export interface SeedRateRow {
  platform: string;
  followerRange: string;
  engagementRange: string;
  niche: string;
  contentType: string;
  usageRights: 'organic';
  exclusivity: 'none';
  minRate: number;
  maxRate: number;
  averageRate: number;
  dataPoints: number;
  isVerified: true;
}

interface BaseRateTier {
  min: number;
  max: number;
  tier: string;
  followerRange: string;
  upperBound: number | null;
}

const INDUSTRY_AVERAGE_ENGAGEMENT: Record<SupportedPlatform, number> = {
  Instagram: 3.5,
  TikTok: 5.0,
  YouTube: 3.0,
  'Twitter/X': 2.0,
  LinkedIn: 2.5,
  Twitch: 3.5,
};

const PLATFORM_SAMPLE_SIZES: Record<SupportedPlatform, number> = {
  Instagram: 312,
  TikTok: 268,
  YouTube: 214,
  'Twitter/X': 138,
  LinkedIn: 96,
  Twitch: 82,
};

const FORM_NICHES = [
  'Beauty & Skincare',
  'Fashion & Style',
  'Health & Fitness',
  'Food & Cooking',
  'Travel & Adventure',
  'Tech & Gaming',
  'Finance & Business',
  'Lifestyle',
  'Parenting & Family',
  'Home & DIY',
  'Pets & Animals',
  'Art & Photography',
  'Music & Entertainment',
  'Sports',
  'Education',
] as const;

const SEED_CONTENT_TYPES: Record<string, string[]> = {
  Instagram: ['Feed Post', 'Story/Reel'],
  TikTok: ['Video (1-3 min)', 'Multiple Posts (3)'],
  YouTube: ['Video (3-10 min)', 'Long-form Video (10+ min)'],
  Twitter: ['Feed Post', 'Multiple Posts (3)'],
  LinkedIn: ['Feed Post', 'Video (1-3 min)'],
  Twitch: ['Live Stream', 'Video (3-10 min)'],
};

const BASE_RATE_TABLES: Record<SupportedPlatform, BaseRateTier[]> = {
  Instagram: [
    { min: 25, max: 75, tier: 'Nano (< 1K)', followerRange: '<1k', upperBound: 1000 },
    { min: 50, max: 150, tier: 'Nano (1K-5K)', followerRange: '1k-5k', upperBound: 5000 },
    { min: 100, max: 250, tier: 'Nano (5K-10K)', followerRange: '5k-10k', upperBound: 10000 },
    { min: 200, max: 500, tier: 'Micro (10K-25K)', followerRange: '10k-25k', upperBound: 25000 },
    { min: 400, max: 800, tier: 'Micro (25K-50K)', followerRange: '25k-50k', upperBound: 50000 },
    { min: 800, max: 1500, tier: 'Mid-Tier (50K-100K)', followerRange: '50k-100k', upperBound: 100000 },
    { min: 1500, max: 3000, tier: 'Macro (100K-250K)', followerRange: '100k-250k', upperBound: 250000 },
    { min: 2500, max: 5000, tier: 'Macro (250K-500K)', followerRange: '250k-500k', upperBound: 500000 },
    { min: 5000, max: 10000, tier: 'Mega (500K-1M)', followerRange: '500k-1M', upperBound: 1000000 },
    { min: 10000, max: 25000, tier: 'Celebrity (1M+)', followerRange: '1M+', upperBound: null },
  ],
  YouTube: [
    { min: 50, max: 150, tier: 'Nano (< 1K)', followerRange: '<1k', upperBound: 1000 },
    { min: 100, max: 300, tier: 'Nano (1K-5K)', followerRange: '1k-5k', upperBound: 5000 },
    { min: 200, max: 500, tier: 'Nano (5K-10K)', followerRange: '5k-10k', upperBound: 10000 },
    { min: 500, max: 1200, tier: 'Micro (10K-25K)', followerRange: '10k-25k', upperBound: 25000 },
    { min: 1000, max: 2500, tier: 'Micro (25K-50K)', followerRange: '25k-50k', upperBound: 50000 },
    { min: 2000, max: 4000, tier: 'Mid-Tier (50K-100K)', followerRange: '50k-100k', upperBound: 100000 },
    { min: 4000, max: 8000, tier: 'Macro (100K-250K)', followerRange: '100k-250k', upperBound: 250000 },
    { min: 7000, max: 15000, tier: 'Macro (250K-500K)', followerRange: '250k-500k', upperBound: 500000 },
    { min: 12000, max: 25000, tier: 'Mega (500K-1M)', followerRange: '500k-1M', upperBound: 1000000 },
    { min: 20000, max: 50000, tier: 'Celebrity (1M+)', followerRange: '1M+', upperBound: null },
  ],
  TikTok: [
    { min: 20, max: 60, tier: 'Nano (< 1K)', followerRange: '<1k', upperBound: 1000 },
    { min: 40, max: 120, tier: 'Nano (1K-5K)', followerRange: '1k-5k', upperBound: 5000 },
    { min: 80, max: 200, tier: 'Nano (5K-10K)', followerRange: '5k-10k', upperBound: 10000 },
    { min: 150, max: 400, tier: 'Micro (10K-25K)', followerRange: '10k-25k', upperBound: 25000 },
    { min: 300, max: 650, tier: 'Micro (25K-50K)', followerRange: '25k-50k', upperBound: 50000 },
    { min: 600, max: 1200, tier: 'Mid-Tier (50K-100K)', followerRange: '50k-100k', upperBound: 100000 },
    { min: 1200, max: 2500, tier: 'Macro (100K-250K)', followerRange: '100k-250k', upperBound: 250000 },
    { min: 2000, max: 4000, tier: 'Macro (250K-500K)', followerRange: '250k-500k', upperBound: 500000 },
    { min: 4000, max: 8000, tier: 'Mega (500K-1M)', followerRange: '500k-1M', upperBound: 1000000 },
    { min: 8000, max: 20000, tier: 'Celebrity (1M+)', followerRange: '1M+', upperBound: null },
  ],
  'Twitter/X': [
    { min: 30, max: 100, tier: 'Nano (< 5K)', followerRange: '1k-5k', upperBound: 5000 },
    { min: 60, max: 180, tier: 'Nano (5K-10K)', followerRange: '5k-10k', upperBound: 10000 },
    { min: 120, max: 350, tier: 'Micro (10K-25K)', followerRange: '10k-25k', upperBound: 25000 },
    { min: 250, max: 600, tier: 'Micro (25K-50K)', followerRange: '25k-50k', upperBound: 50000 },
    { min: 500, max: 1100, tier: 'Mid-Tier (50K-100K)', followerRange: '50k-100k', upperBound: 100000 },
    { min: 1000, max: 2200, tier: 'Macro (100K-250K)', followerRange: '100k-250k', upperBound: 250000 },
    { min: 2000, max: 5000, tier: 'Macro (250K+)', followerRange: '250k+', upperBound: null },
  ],
  LinkedIn: [
    { min: 50, max: 150, tier: 'Nano (< 5K)', followerRange: '1k-5k', upperBound: 5000 },
    { min: 100, max: 250, tier: 'Nano (5K-10K)', followerRange: '5k-10k', upperBound: 10000 },
    { min: 250, max: 600, tier: 'Micro (10K-25K)', followerRange: '10k-25k', upperBound: 25000 },
    { min: 500, max: 1200, tier: 'Micro (25K-50K)', followerRange: '25k-50k', upperBound: 50000 },
    { min: 1000, max: 2500, tier: 'Mid-Tier (50K-100K)', followerRange: '50k-100k', upperBound: 100000 },
    { min: 2000, max: 5000, tier: 'Macro (100K-250K)', followerRange: '100k-250k', upperBound: 250000 },
    { min: 4000, max: 9000, tier: 'Macro (250K+)', followerRange: '250k+', upperBound: null },
  ],
  Twitch: [
    { min: 75, max: 200, tier: 'Nano (< 5K)', followerRange: '1k-5k', upperBound: 5000 },
    { min: 150, max: 350, tier: 'Nano (5K-10K)', followerRange: '5k-10k', upperBound: 10000 },
    { min: 300, max: 750, tier: 'Micro (10K-25K)', followerRange: '10k-25k', upperBound: 25000 },
    { min: 600, max: 1500, tier: 'Micro (25K-50K)', followerRange: '25k-50k', upperBound: 50000 },
    { min: 1200, max: 2500, tier: 'Mid-Tier (50K-100K)', followerRange: '50k-100k', upperBound: 100000 },
    { min: 2500, max: 5000, tier: 'Macro (100K-250K)', followerRange: '100k-250k', upperBound: 250000 },
    { min: 4500, max: 9000, tier: 'Macro (250K-500K)', followerRange: '250k-500k', upperBound: 500000 },
    { min: 8000, max: 18000, tier: 'Mega (500K+)', followerRange: '500k+', upperBound: null },
  ],
};

function dollarsToCents(value: number): number {
  return Math.round(value * 100);
}

function centsToDisplay(value: number): string {
  return `$${Math.round(value / 100).toLocaleString()}`;
}

function normalizePlatform(platform: string): SupportedPlatform {
  if (platform === 'Twitter') {
    return 'Twitter/X';
  }

  if (platform in BASE_RATE_TABLES) {
    return platform as SupportedPlatform;
  }

  return 'Instagram';
}

function getBaseRateByFollowerTier(platform: SupportedPlatform, followers: number): BaseRateTier {
  const tiers = BASE_RATE_TABLES[platform];

  for (const tier of tiers) {
    if (tier.upperBound === null || followers < tier.upperBound) {
      return tier;
    }
  }

  return tiers[tiers.length - 1];
}

function calculateEngagementAdjustment(
  platform: SupportedPlatform,
  engagementRate: number,
  baseRate: number
): { adjustment: number; avgEngagement: number } {
  const avgEngagement = INDUSTRY_AVERAGE_ENGAGEMENT[platform];
  const difference = engagementRate - avgEngagement;

  if (difference > 0) {
    return {
      adjustment: baseRate * (difference * 0.05),
      avgEngagement,
    };
  }

  return {
    adjustment: baseRate * (difference * 0.03),
    avgEngagement,
  };
}

function getNicheMultiplier(niche: string): number {
  const nicheMultipliers: Record<string, number> = {
    Finance: 1.35,
    'Finance & Business': 1.35,
    Tech: 1.3,
    'Tech & Gaming': 1.2,
    Gaming: 1.08,
    Beauty: 1.2,
    'Beauty & Skincare': 1.2,
    Fashion: 1.15,
    'Fashion & Style': 1.15,
    Fitness: 1.12,
    'Health & Fitness': 1.12,
    Parenting: 1.1,
    'Parenting & Family': 1.1,
    Travel: 1.05,
    'Travel & Adventure': 1.05,
    Food: 1.0,
    'Food & Cooking': 1.0,
    Lifestyle: 1.0,
    'Home & DIY': 0.97,
    'Pets & Animals': 0.95,
    'Art & Photography': 0.95,
    'Music & Entertainment': 0.95,
    Sports: 1.05,
    Education: 0.95,
  };

  return nicheMultipliers[niche] ?? 1.0;
}

function getContentTypeMultiplier(input: {
  platform: SupportedPlatform;
  contentType: string;
  deliverables?: string;
}): number {
  const { platform, contentType, deliverables } = input;

  if (platform === 'Instagram') {
    const multipliers: Record<string, number> = {
      'Feed Post': 1.0,
      'Story/Reel': deliverables === 'Story Series (3-5)' ? 0.6 : 0.9,
      'Video (1-3 min)': 1.2,
      'Video (3-10 min)': 1.3,
      'Long-form Video (10+ min)': 1.35,
      'Live Stream': 1.25,
      'Multiple Posts (3)': 1.15,
    };

    return multipliers[contentType] ?? 1.0;
  }

  if (platform === 'YouTube') {
    if (deliverables === 'Video Integration') {
      return 0.4;
    }

    const multipliers: Record<string, number> = {
      'Feed Post': 0.4,
      'Story/Reel': 0.6,
      'Video (1-3 min)': 0.6,
      'Video (3-10 min)': 1.0,
      'Long-form Video (10+ min)': 1.15,
      'Live Stream': 1.2,
      'Multiple Posts (3)': 1.8,
    };

    return multipliers[contentType] ?? 1.0;
  }

  if (platform === 'TikTok') {
    const multipliers: Record<string, number> = {
      'Video (1-3 min)': 1.0,
      'Video (3-10 min)': 1.05,
      'Long-form Video (10+ min)': 1.1,
      'Live Stream': 1.15,
      'Multiple Posts (3)': 1.15,
      'Feed Post': 1.0,
      'Story/Reel': 1.0,
    };

    return multipliers[contentType] ?? 1.0;
  }

  if (platform === 'Twitter/X') {
    const multipliers: Record<string, number> = {
      'Feed Post': 1.0,
      'Story/Reel': 1.0,
      'Video (1-3 min)': 1.05,
      'Video (3-10 min)': 1.1,
      'Long-form Video (10+ min)': 1.15,
      'Live Stream': 1.2,
      'Multiple Posts (3)': 1.15,
    };

    return multipliers[contentType] ?? 1.0;
  }

  if (platform === 'LinkedIn') {
    const multipliers: Record<string, number> = {
      'Feed Post': 1.0,
      'Video (1-3 min)': 1.1,
      'Video (3-10 min)': 1.15,
      'Long-form Video (10+ min)': 1.2,
      'Live Stream': 1.25,
      'Multiple Posts (3)': 1.15,
      'Story/Reel': 1.0,
    };

    return multipliers[contentType] ?? 1.0;
  }

  const multipliers: Record<string, number> = {
    'Live Stream': 1.0,
    'Video (3-10 min)': 0.95,
    'Long-form Video (10+ min)': 1.1,
    'Multiple Posts (3)': 1.2,
  };

  return multipliers[contentType] ?? 1.0;
}

function getUsageRightsPremium(baseRate: number, usageRights: string): number {
  const premiums: Record<string, number> = {
    organic: 0,
    '30day': baseRate * 0.2,
    '90day': baseRate * 0.4,
    unlimited: baseRate * 0.7,
  };

  return premiums[usageRights] ?? 0;
}

function getExclusivityPremium(baseRate: number, exclusivity: string): number {
  const premiums: Record<string, number> = {
    none: 0,
    category30: baseRate * 0.15,
    category90: baseRate * 0.3,
    full: baseRate * 0.5,
  };

  return premiums[exclusivity] ?? 0;
}

function getConfidenceLevel(followers: number): ConfidenceLevel {
  if (followers >= 10000 && followers <= 500000) {
    return 'high';
  }

  if (followers >= 5000 && followers <= 1000000) {
    return 'medium';
  }

  return 'low';
}

function getConfidenceScore(confidence: ConfidenceLevel): number {
  if (confidence === 'high') {
    return 90;
  }

  if (confidence === 'medium') {
    return 76;
  }

  return 62;
}

function getBenchmarkSampleSize(platform: SupportedPlatform, confidence: ConfidenceLevel): number {
  const base = PLATFORM_SAMPLE_SIZES[platform];

  if (confidence === 'high') {
    return base;
  }

  if (confidence === 'medium') {
    return Math.round(base * 0.78);
  }

  return Math.round(base * 0.58);
}

function formatRateRange(minRate: number, maxRate: number): string {
  return `${centsToDisplay(minRate)} - ${centsToDisplay(maxRate)}`;
}

function getCreatorPosition(
  organicSubtotalCents: number,
  tierMinCents: number,
  tierMaxCents: number
): CreatorPosition {
  if (organicSubtotalCents >= Math.round(tierMaxCents * 1.15)) {
    return 'top_tier';
  }

  if (organicSubtotalCents > tierMaxCents) {
    return 'above_average';
  }

  if (organicSubtotalCents < tierMinCents) {
    return 'below_average';
  }

  return 'average';
}

export function calculateAccurateRate(input: CalculationInput): RateResult {
  const platform = normalizePlatform(input.platform);
  const baseRateRange = getBaseRateByFollowerTier(platform, input.followerCount);
  const baseRate = (baseRateRange.min + baseRateRange.max) / 2;

  const { adjustment: engagementAdjustment, avgEngagement } = calculateEngagementAdjustment(
    platform,
    input.engagementRate,
    baseRate
  );

  const nicheMultiplier = getNicheMultiplier(input.niche);
  const nicheAdjustment = (baseRate + engagementAdjustment) * (nicheMultiplier - 1);

  const contentTypeMultiplier = getContentTypeMultiplier({
    platform,
    contentType: input.contentType,
    deliverables: input.deliverables,
  });

  const contentAdjustedBase = baseRate + engagementAdjustment + nicheAdjustment;
  const subtotal = contentAdjustedBase * contentTypeMultiplier;
  const contentTypeAdjustment = subtotal - contentAdjustedBase;

  const usageRightsPremium = getUsageRightsPremium(subtotal, input.usageRights);
  const exclusivityPremium = getExclusivityPremium(subtotal, input.exclusivity);

  const finalRateDollars = Math.round(subtotal + usageRightsPremium + exclusivityPremium);
  const minRateDollars = Math.round(finalRateDollars * 0.85);
  const maxRateDollars = Math.round(finalRateDollars * 1.15);
  const confidence = getConfidenceLevel(input.followerCount);

  const baseRateCents = dollarsToCents(baseRate);
  const tierMinRateCents = dollarsToCents(baseRateRange.min);
  const tierMaxRateCents = dollarsToCents(baseRateRange.max);
  const engagementAdjustmentCents = dollarsToCents(engagementAdjustment);
  const nicheAdjustmentCents = dollarsToCents(nicheAdjustment);
  const contentTypeAdjustmentCents = dollarsToCents(contentTypeAdjustment);
  const subtotalCents = dollarsToCents(subtotal);
  const usageRightsPremiumCents = dollarsToCents(usageRightsPremium);
  const exclusivityPremiumCents = dollarsToCents(exclusivityPremium);
  const finalRateCents = dollarsToCents(finalRateDollars);
  const minRateCents = dollarsToCents(minRateDollars);
  const maxRateCents = dollarsToCents(maxRateDollars);

  const breakdown: DetailedBreakdown = {
    baseRate: baseRateCents,
    followerTier: baseRateRange.tier,
    tierMinRate: tierMinRateCents,
    tierMaxRate: tierMaxRateCents,
    avgEngagement,
    engagementAdjustment: engagementAdjustmentCents,
    nicheMultiplier,
    nicheAdjustment: nicheAdjustmentCents,
    contentTypeMultiplier,
    contentTypeAdjustment: contentTypeAdjustmentCents,
    usageRightsPremium: usageRightsPremiumCents,
    exclusivityPremium: exclusivityPremiumCents,
    subtotal: subtotalCents,
    total: finalRateCents,
    confidence,
    steps: [
      `Base tier benchmark: ${centsToDisplay(baseRateCents)}`,
      `Engagement adjustment: ${engagementAdjustmentCents >= 0 ? '+' : '-'}${centsToDisplay(Math.abs(engagementAdjustmentCents))}`,
      `Niche adjustment (${Math.round((nicheMultiplier - 1) * 100)}%): ${nicheAdjustmentCents >= 0 ? '+' : '-'}${centsToDisplay(Math.abs(nicheAdjustmentCents))}`,
      `Content type adjustment (${contentTypeMultiplier.toFixed(2)}x): ${contentTypeAdjustmentCents >= 0 ? '+' : '-'}${centsToDisplay(Math.abs(contentTypeAdjustmentCents))}`,
      `Organic benchmark subtotal: ${centsToDisplay(subtotalCents)}`,
      `Usage rights premium: ${usageRightsPremiumCents > 0 ? '+' : ''}${centsToDisplay(usageRightsPremiumCents)}`,
      `Exclusivity premium: ${exclusivityPremiumCents > 0 ? '+' : ''}${centsToDisplay(exclusivityPremiumCents)}`,
      `Final recommended rate: ${centsToDisplay(finalRateCents)}`,
    ],
  };

  const yourPosition = getCreatorPosition(subtotalCents, tierMinRateCents, tierMaxRateCents);
  const topTenPercent = Math.round(maxRateCents * 1.2);

  return {
    minRate: minRateCents,
    maxRate: maxRateCents,
    recommendedRate: finalRateCents,
    baseRate: baseRateCents,
    nicheMultiplier,
    usageRightsPremium: usageRightsPremiumCents,
    exclusivityPremium: exclusivityPremiumCents,
    confidenceScore: getConfidenceScore(confidence),
    dataPoints: getBenchmarkSampleSize(platform, confidence),
    breakdown,
    marketContext: {
      typicalRange: formatRateRange(tierMinRateCents, tierMaxRateCents),
      topTenPercent: `${centsToDisplay(topTenPercent)}+`,
      yourPosition,
    },
    negotiationGuidance: {
      startingAsk: maxRateCents,
      walkAwayMinimum: minRateCents,
      idealRange: {
        min: finalRateCents,
        max: maxRateCents,
      },
      tips: [
        'Anchor your pitch in your follower tier benchmark before discussing add-ons.',
        input.usageRights === 'organic'
          ? 'Charge usage as a separate line item instead of burying it inside the base post rate.'
          : 'Keep usage rights separate so the brand sees why the deal costs more than an organic post.',
        input.exclusivity === 'none'
          ? 'Offer short category exclusivity only if the brand pays a clear premium.'
          : 'Tie exclusivity to a fixed time window so you are paid for the opportunity cost.',
        `Use your ${input.engagementRate.toFixed(1)}% engagement rate to justify any premium above the base tier midpoint.`,
      ],
    },
  };
}

export function validateRate(
  input: CalculationInput,
  calculatedRateCents: number
): {
  isRealistic: boolean;
  warning?: string;
} {
  const platform = normalizePlatform(input.platform);
  const calculatedRate = calculatedRateCents / 100;

  const tier = getBaseRateByFollowerTier(platform, input.followerCount);
  const maxBaseRate = tier.max;
  const engagementAdjustment = Math.max(
    calculateEngagementAdjustment(platform, input.engagementRate, maxBaseRate).adjustment,
    0
  );
  const nicheMultiplier = Math.max(getNicheMultiplier(input.niche), 1);
  const nicheAdjustment = (maxBaseRate + engagementAdjustment) * (nicheMultiplier - 1);
  const contentTypeMultiplier = Math.max(
    getContentTypeMultiplier({
      platform,
      contentType: input.contentType,
      deliverables: input.deliverables,
    }),
    1
  );
  const subtotalCeiling = (maxBaseRate + engagementAdjustment + nicheAdjustment) * contentTypeMultiplier;
  const maxRate =
    subtotalCeiling +
    getUsageRightsPremium(subtotalCeiling, input.usageRights) +
    getExclusivityPremium(subtotalCeiling, input.exclusivity);

  if (calculatedRate > maxRate * 1.2) {
    return {
      isRealistic: false,
      warning: `Calculated rate ($${Math.round(calculatedRate)}) seems too high for ${input.followerCount.toLocaleString()} followers. Max realistic: $${Math.round(maxRate)}`,
    };
  }

  return { isRealistic: true };
}

export function getSeedEngagementRange(platform: string): string {
  const normalizedPlatform = normalizePlatform(platform);

  if (normalizedPlatform === 'TikTok') {
    return '5-8%';
  }

  if (normalizedPlatform === 'Twitter/X' || normalizedPlatform === 'LinkedIn') {
    return '2-3%';
  }

  return '3-5%';
}

export function generateIndustryAccurateSeedData(): SeedRateRow[] {
  const rows: SeedRateRow[] = [];

  for (const platformKey of Object.keys(SEED_CONTENT_TYPES)) {
    const normalizedPlatform = normalizePlatform(platformKey);
    const tiers = BASE_RATE_TABLES[normalizedPlatform];
    const contentTypes = SEED_CONTENT_TYPES[platformKey];

    for (const tier of tiers) {
      for (const contentType of contentTypes) {
        const contentTypeMultiplier = getContentTypeMultiplier({
          platform: normalizedPlatform,
          contentType,
        });

        for (const niche of FORM_NICHES) {
          const nicheMultiplier = getNicheMultiplier(niche);
          const minRate = Math.round(tier.min * nicheMultiplier * contentTypeMultiplier * 100);
          const maxRate = Math.round(tier.max * nicheMultiplier * contentTypeMultiplier * 100);

          rows.push({
            platform: platformKey,
            followerRange: tier.followerRange,
            engagementRange: getSeedEngagementRange(platformKey),
            niche,
            contentType,
            usageRights: 'organic',
            exclusivity: 'none',
            minRate,
            maxRate,
            averageRate: Math.round((minRate + maxRate) / 2),
            dataPoints: getBenchmarkSampleSize(normalizedPlatform, getConfidenceLevel(tier.upperBound ?? 1000000)),
            isVerified: true,
          });
        }
      }
    }
  }

  return rows;
}

export function runTestCases(): void {
  const testCases = [
    {
      name: 'YouTube 5K organic benchmark',
      input: {
        platform: 'YouTube',
        followerCount: 4999,
        engagementRate: 4.5,
        niche: 'Parenting & Family',
        contentType: 'Video (3-10 min)',
        deliverables: 'Single Post',
        usageRights: 'organic',
        exclusivity: 'none',
      },
    },
    {
      name: 'YouTube 5K with 90-day usage and category exclusivity',
      input: {
        platform: 'YouTube',
        followerCount: 4999,
        engagementRate: 4.5,
        niche: 'Parenting & Family',
        contentType: 'Video (3-10 min)',
        deliverables: 'Single Post',
        usageRights: '90day',
        exclusivity: 'category30',
      },
    },
    {
      name: 'Instagram 50K followers',
      input: {
        platform: 'Instagram',
        followerCount: 50000,
        engagementRate: 4.0,
        niche: 'Beauty & Skincare',
        contentType: 'Feed Post',
        deliverables: 'Single Post',
        usageRights: 'organic',
        exclusivity: 'none',
      },
    },
  ] as const;

  console.log('=== ACCURATE RATE CALCULATION TEST CASES ===\n');

  for (const testCase of testCases) {
    const result = calculateAccurateRate(testCase.input);
    const validation = validateRate(testCase.input, result.recommendedRate);

    console.log(`Test: ${testCase.name}`);
    console.log(
      `Calculated Rate: ${centsToDisplay(result.recommendedRate)} (range ${centsToDisplay(result.minRate)} - ${centsToDisplay(result.maxRate)})`
    );
    console.log(`Organic subtotal: ${centsToDisplay(result.breakdown.subtotal)}`);
    console.log(`Follower tier: ${result.breakdown.followerTier}`);
    console.log(`Realistic: ${validation.isRealistic ? 'YES' : 'NO'}`);
    if (validation.warning) {
      console.log(`Warning: ${validation.warning}`);
    }
    console.log(`Confidence: ${result.breakdown.confidence}`);
    console.log('---');
  }
}