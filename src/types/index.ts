export const PLATFORMS = [
  'Instagram',
  'TikTok',
  'YouTube',
  'Twitter',
  'LinkedIn',
  'Twitch',
] as const;

export const CONTENT_TYPES = [
  'Feed Post',
  'Story/Reel',
  'Video (1-3 min)',
  'Video (3-10 min)',
  'Long-form Video (10+ min)',
  'Live Stream',
  'Multiple Posts (3)',
] as const;

export const NICHES = [
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

export const AUDIENCE_LOCATIONS = [
  'USA',
  'UK',
  'Canada',
  'Europe',
  'Global',
  'Other',
] as const;

export const DELIVERABLES = [
  'Single Post',
  'Multiple Posts (2-3)',
  'Story Series (3-5)',
  'Video Integration',
  'Mixed Content',
] as const;

export const USAGE_RIGHTS = [
  { value: 'organic', label: 'Organic Only' },
  { value: '30day', label: 'Paid Amplification (30 days)' },
  { value: '90day', label: 'Paid Amplification (90 days)' },
  { value: 'unlimited', label: 'Unlimited Usage' },
] as const;

export const EXCLUSIVITY = [
  { value: 'none', label: 'No Exclusivity' },
  { value: 'category30', label: 'Category Exclusivity (30 days)' },
  { value: 'category90', label: 'Category Exclusivity (90 days)' },
  { value: 'full', label: 'Full Exclusivity' },
] as const;

export type Platform = typeof PLATFORMS[number];
export type ContentType = typeof CONTENT_TYPES[number];
export type Niche = typeof NICHES[number];
export type AudienceLocation = typeof AUDIENCE_LOCATIONS[number];
export type Deliverable = typeof DELIVERABLES[number];
