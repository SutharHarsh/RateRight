import { calculateAccurateRate, runTestCases } from '@/lib/accurateRateCalculation';

function centsToDollars(value: number): string {
  return `$${Math.round(value / 100).toLocaleString()}`;
}

runTestCases();

const organicExample = calculateAccurateRate({
  platform: 'YouTube',
  followerCount: 4999,
  engagementRate: 4.5,
  niche: 'Parenting & Family',
  contentType: 'Video (3-10 min)',
  deliverables: 'Single Post',
  usageRights: 'organic',
  exclusivity: 'none',
});

const loadedExample = calculateAccurateRate({
  platform: 'YouTube',
  followerCount: 4999,
  engagementRate: 4.5,
  niche: 'Parenting & Family',
  contentType: 'Video (3-10 min)',
  deliverables: 'Single Post',
  usageRights: '90day',
  exclusivity: 'category30',
});

console.log('=== YOUTUBE 5K VALIDATION ===');
console.log('Organic recommended:', centsToDollars(organicExample.recommendedRate));
console.log('Organic range:', centsToDollars(organicExample.minRate), '-', centsToDollars(organicExample.maxRate));
console.log('Loaded-deal recommended:', centsToDollars(loadedExample.recommendedRate));
console.log('Loaded-deal range:', centsToDollars(loadedExample.minRate), '-', centsToDollars(loadedExample.maxRate));
console.log('Organic benchmark subtotal:', centsToDollars(loadedExample.breakdown.subtotal));