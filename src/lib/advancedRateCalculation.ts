export interface DetailedBreakdown {
  baseRate: {
    amount: number;
    explanation: string;
    formula: string;
  };
  followerMultiplier: {
    amount: number;
    explanation: string;
    tier: string;
  };
  engagementBonus: {
    amount: number;
    explanation: string;
    calculation: string;
  };
  nicheMultiplier: {
    amount: number;
    percentage: number;
    explanation: string;
    reasoning: string;
  };
  platformAdjustment: {
    amount: number;
    explanation: string;
  };
  usageRightsPremium: {
    amount: number;
    explanation: string;
    breakdown: string;
  };
  exclusivityPremium: {
    amount: number;
    explanation: string;
  };
  contentTypeAdjustment: {
    amount: number;
    explanation: string;
  };
  audienceQualityBonus: {
    amount: number;
    explanation: string;
  };
  totalCalculation: {
    subtotal: number;
    finalRate: number;
    steps: string[];
  };
}

function toCents(dollars: number) {
  return Math.round(dollars * 100);
}

function fromCents(cents: number) {
  return cents / 100;
}

export function calculateDetailedBreakdown(data: {
  platform: string;
  followers: number;
  engagementRate: number;
  niche: string;
  contentType: string;
  usageRights: string;
  exclusivity: string;
}): DetailedBreakdown {
  const baseCPM = 5;
  const estimatedReach = data.followers * (data.engagementRate / 100) * 10;
  const baseRateDollars = (estimatedReach / 1000) * baseCPM;

  let followerTier = '';
  let followerMultiplier = 1;

  if (data.followers < 10000) {
    followerTier = 'Nano (< 10K)';
    followerMultiplier = 0.8;
  } else if (data.followers < 50000) {
    followerTier = 'Micro (10K-50K)';
    followerMultiplier = 1.0;
  } else if (data.followers < 100000) {
    followerTier = 'Mid-Tier (50K-100K)';
    followerMultiplier = 1.3;
  } else if (data.followers < 500000) {
    followerTier = 'Macro (100K-500K)';
    followerMultiplier = 1.8;
  } else {
    followerTier = 'Mega (500K+)';
    followerMultiplier = 2.5;
  }

  const followerAdjustedRate = baseRateDollars * followerMultiplier;

  const industryAvgEngagement = 3.5;
  const engagementDifference = data.engagementRate - industryAvgEngagement;
  const engagementBonusPercent = Math.max(0, engagementDifference * 5);
  const engagementBonus = followerAdjustedRate * (engagementBonusPercent / 100);

  const nicheMultipliers: Record<string, { multiplier: number; reasoning: string }> = {
    Tech: { multiplier: 1.4, reasoning: 'High-value audience, B2B opportunities, expensive products' },
    'Tech & Gaming': { multiplier: 1.35, reasoning: 'High-value audience, software and hardware sponsorship demand' },
    Finance: { multiplier: 1.5, reasoning: 'Highest CPM niche, affluent audience, premium advertisers' },
    'Finance & Business': { multiplier: 1.5, reasoning: 'High advertiser demand from fintech and SaaS brands' },
    Beauty: { multiplier: 1.25, reasoning: 'Strong commercial intent and high product turnover' },
    'Beauty & Skincare': { multiplier: 1.25, reasoning: 'Strong commercial intent and repeat purchase behavior' },
    Fashion: { multiplier: 1.2, reasoning: 'Premium brands and seasonal campaigns' },
    'Fashion & Style': { multiplier: 1.2, reasoning: 'Premium brands and strong conversion rates' },
    Fitness: { multiplier: 1.15, reasoning: 'Growing market and recurring product demand' },
    'Health & Fitness': { multiplier: 1.15, reasoning: 'Recurring supplement and wellness spend' },
    Gaming: { multiplier: 1.1, reasoning: 'Engaged audience and sponsorship opportunities' },
    Food: { multiplier: 1.0, reasoning: 'Moderate advertiser demand and local opportunities' },
    Travel: { multiplier: 1.1, reasoning: 'Tourism and hospitality campaign budgets' },
    Lifestyle: { multiplier: 1.0, reasoning: 'Broad appeal baseline commercial value' },
    Parenting: { multiplier: 1.15, reasoning: 'High purchasing power and trusted recommendations' },
  };

  const nicheData = nicheMultipliers[data.niche] || { multiplier: 1.0, reasoning: 'Standard market rate' };
  const nicheBonus = (followerAdjustedRate + engagementBonus) * (nicheData.multiplier - 1);

  const platformMultipliers: Record<string, number> = {
    Instagram: 1.0,
    YouTube: 1.3,
    TikTok: 0.9,
    'Twitter/X': 0.8,
    Twitter: 0.8,
    LinkedIn: 1.2,
  };

  const platformMultiplier = platformMultipliers[data.platform] || 1.0;
  const platformAdjustment = (followerAdjustedRate + engagementBonus + nicheBonus) * (platformMultiplier - 1);

  const usageRightsMultipliers: Record<string, { multiplier: number; description: string }> = {
    organic: { multiplier: 0, description: 'No additional fee - organic posting only' },
    '30day': { multiplier: 0.25, description: '25% premium for 30-day paid amplification rights' },
    '90day': { multiplier: 0.5, description: '50% premium for 90-day paid amplification rights' },
    unlimited: { multiplier: 0.8, description: '80% premium for unlimited usage and amplification' },
  };

  const usageRightsData = usageRightsMultipliers[data.usageRights] || usageRightsMultipliers.organic;
  const currentTotal = followerAdjustedRate + engagementBonus + nicheBonus + platformAdjustment;
  const usageRightsPremium = currentTotal * usageRightsData.multiplier;

  const exclusivityMultipliers: Record<string, number> = {
    none: 0,
    category30: 0.2,
    category90: 0.35,
    full: 0.6,
  };

  const exclusivityMultiplier = exclusivityMultipliers[data.exclusivity] || 0;
  const exclusivityPremium = currentTotal * exclusivityMultiplier;

  const contentTypeMultipliers: Record<string, number> = {
    post: 1.0,
    'Feed Post': 1.0,
    story: 0.6,
    'Story/Reel': 0.7,
    reel: 1.5,
    video: 1.8,
    'Video (1-3 min)': 1.3,
    'Video (3-10 min)': 1.8,
    'Long-form Video (10+ min)': 2.5,
    carousel: 1.2,
  };

  const contentMultiplier = contentTypeMultipliers[data.contentType] || 1.0;
  const contentTypeAdjustment = currentTotal * (contentMultiplier - 1);

  let audienceQualityBonus = 0;
  if (data.engagementRate > 6) {
    audienceQualityBonus = currentTotal * 0.15;
  } else if (data.engagementRate > 4.5) {
    audienceQualityBonus = currentTotal * 0.08;
  }

  const subtotalDollars =
    baseRateDollars +
    (followerAdjustedRate - baseRateDollars) +
    engagementBonus +
    nicheBonus +
    platformAdjustment +
    usageRightsPremium +
    exclusivityPremium +
    contentTypeAdjustment +
    audienceQualityBonus;

  const finalRateDollars = Math.round(subtotalDollars);

  const baseRateCents = toCents(baseRateDollars);
  const followerAdjCents = toCents(followerAdjustedRate - baseRateDollars);
  const engagementBonusCents = toCents(engagementBonus);
  const nicheBonusCents = toCents(nicheBonus);
  const platformAdjCents = toCents(platformAdjustment);
  const usageRightsCents = toCents(usageRightsPremium);
  const exclusivityCents = toCents(exclusivityPremium);
  const contentTypeCents = toCents(contentTypeAdjustment);
  const audienceQualityCents = toCents(audienceQualityBonus);
  const finalRateCents = toCents(finalRateDollars);

  return {
    baseRate: {
      amount: baseRateCents,
      explanation: 'Starting rate based on estimated reach and industry CPM (Cost Per Thousand views).',
      formula: `(${Math.round(estimatedReach).toLocaleString()} reach / 1,000) x $${baseCPM} CPM = $${Math.round(baseRateDollars)}`,
    },
    followerMultiplier: {
      amount: followerAdjCents,
      explanation: 'Adjustment based on your follower count tier and market positioning.',
      tier: `${followerTier} tier applies ${followerMultiplier}x multiplier`,
    },
    engagementBonus: {
      amount: engagementBonusCents,
      explanation: `Bonus for engagement rate ${data.engagementRate > industryAvgEngagement ? 'above' : 'at'} industry average.`,
      calculation: `Your ${data.engagementRate}% vs ${industryAvgEngagement}% average = ${engagementDifference.toFixed(1)} points -> ${engagementBonusPercent.toFixed(1)}% bonus`,
    },
    nicheMultiplier: {
      amount: nicheBonusCents,
      percentage: Math.round((nicheData.multiplier - 1) * 100),
      explanation: `${data.niche} niche premium based on advertiser demand and audience value.`,
      reasoning: nicheData.reasoning,
    },
    platformAdjustment: {
      amount: platformAdjCents,
      explanation: `${data.platform} platform adjustment (${platformMultiplier}x) based on format value and shelf life.`,
    },
    usageRightsPremium: {
      amount: usageRightsCents,
      explanation: 'Fee for granting usage rights beyond organic posting.',
      breakdown: usageRightsData.description,
    },
    exclusivityPremium: {
      amount: exclusivityCents,
      explanation: `Premium for exclusivity agreement (${Math.round(exclusivityMultiplier * 100)}% of pre-rights subtotal).`,
    },
    contentTypeAdjustment: {
      amount: contentTypeCents,
      explanation: `Adjustment for ${data.contentType} content type (${contentMultiplier}x) reflecting effort and value.`,
    },
    audienceQualityBonus: {
      amount: audienceQualityCents,
      explanation:
        data.engagementRate > 6
          ? `Premium bonus for exceptionally high engagement (${data.engagementRate}%).`
          : data.engagementRate > 4.5
          ? 'Bonus for above-average audience engagement and interaction rates.'
          : 'No bonus applied (engagement below premium threshold).',
    },
    totalCalculation: {
      subtotal: toCents(subtotalDollars),
      finalRate: finalRateCents,
      steps: [
        `Base Rate: $${fromCents(baseRateCents).toLocaleString()}`,
        `+ Follower Tier Adjustment: $${fromCents(followerAdjCents).toLocaleString()}`,
        `+ Engagement Bonus: $${fromCents(engagementBonusCents).toLocaleString()}`,
        `+ Niche Premium: $${fromCents(nicheBonusCents).toLocaleString()}`,
        `+ Platform Adjustment: $${fromCents(platformAdjCents).toLocaleString()}`,
        `+ Usage Rights: $${fromCents(usageRightsCents).toLocaleString()}`,
        `+ Exclusivity: $${fromCents(exclusivityCents).toLocaleString()}`,
        `+ Content Type: $${fromCents(contentTypeCents).toLocaleString()}`,
        `+ Audience Quality: $${fromCents(audienceQualityCents).toLocaleString()}`,
        `= Final Rate: $${fromCents(finalRateCents).toLocaleString()}`,
      ],
    },
  };
}

export function alignDetailedBreakdownToFinalRate(
  breakdown: DetailedBreakdown,
  targetFinalRateCents: number
): DetailedBreakdown {
  const sourceFinal = breakdown.totalCalculation.finalRate;

  if (!Number.isFinite(sourceFinal) || sourceFinal === 0 || sourceFinal === targetFinalRateCents) {
    return {
      ...breakdown,
      totalCalculation: {
        ...breakdown.totalCalculation,
        subtotal: targetFinalRateCents,
        finalRate: targetFinalRateCents,
      },
    };
  }

  const scale = targetFinalRateCents / sourceFinal;

  const scaled = {
    baseRate: Math.round(breakdown.baseRate.amount * scale),
    followerMultiplier: Math.round(breakdown.followerMultiplier.amount * scale),
    engagementBonus: Math.round(breakdown.engagementBonus.amount * scale),
    nicheMultiplier: Math.round(breakdown.nicheMultiplier.amount * scale),
    platformAdjustment: Math.round(breakdown.platformAdjustment.amount * scale),
    usageRightsPremium: Math.round(breakdown.usageRightsPremium.amount * scale),
    exclusivityPremium: Math.round(breakdown.exclusivityPremium.amount * scale),
    contentTypeAdjustment: Math.round(breakdown.contentTypeAdjustment.amount * scale),
    audienceQualityBonus: Math.round(breakdown.audienceQualityBonus.amount * scale),
  };

  const recomputedTotal =
    scaled.baseRate +
    scaled.followerMultiplier +
    scaled.engagementBonus +
    scaled.nicheMultiplier +
    scaled.platformAdjustment +
    scaled.usageRightsPremium +
    scaled.exclusivityPremium +
    scaled.contentTypeAdjustment +
    scaled.audienceQualityBonus;

  const delta = targetFinalRateCents - recomputedTotal;
  if (delta !== 0) {
    scaled.audienceQualityBonus += delta;
  }

  const steps = [
    `Base Rate: $${(scaled.baseRate / 100).toLocaleString()}`,
    `+ Follower Tier Adjustment: $${(scaled.followerMultiplier / 100).toLocaleString()}`,
    `+ Engagement Bonus: $${(scaled.engagementBonus / 100).toLocaleString()}`,
    `+ Niche Premium: $${(scaled.nicheMultiplier / 100).toLocaleString()}`,
    `+ Platform Adjustment: $${(scaled.platformAdjustment / 100).toLocaleString()}`,
    `+ Usage Rights: $${(scaled.usageRightsPremium / 100).toLocaleString()}`,
    `+ Exclusivity: $${(scaled.exclusivityPremium / 100).toLocaleString()}`,
    `+ Content Type: $${(scaled.contentTypeAdjustment / 100).toLocaleString()}`,
    `+ Audience Quality: $${(scaled.audienceQualityBonus / 100).toLocaleString()}`,
    `= Final Rate: $${(targetFinalRateCents / 100).toLocaleString()}`,
  ];

  return {
    ...breakdown,
    baseRate: {
      ...breakdown.baseRate,
      amount: scaled.baseRate,
    },
    followerMultiplier: {
      ...breakdown.followerMultiplier,
      amount: scaled.followerMultiplier,
    },
    engagementBonus: {
      ...breakdown.engagementBonus,
      amount: scaled.engagementBonus,
    },
    nicheMultiplier: {
      ...breakdown.nicheMultiplier,
      amount: scaled.nicheMultiplier,
    },
    platformAdjustment: {
      ...breakdown.platformAdjustment,
      amount: scaled.platformAdjustment,
    },
    usageRightsPremium: {
      ...breakdown.usageRightsPremium,
      amount: scaled.usageRightsPremium,
    },
    exclusivityPremium: {
      ...breakdown.exclusivityPremium,
      amount: scaled.exclusivityPremium,
    },
    contentTypeAdjustment: {
      ...breakdown.contentTypeAdjustment,
      amount: scaled.contentTypeAdjustment,
    },
    audienceQualityBonus: {
      ...breakdown.audienceQualityBonus,
      amount: scaled.audienceQualityBonus,
    },
    totalCalculation: {
      subtotal: targetFinalRateCents,
      finalRate: targetFinalRateCents,
      steps,
    },
  };
}
