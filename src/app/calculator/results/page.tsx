'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import {
  Calculator as CalculatorIcon,
  Download,
  Lock,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
import { type DetailedBreakdown } from '@/lib/accurateRateCalculation';
import { generateRateCard } from '@/lib/generateRateCard';
import { formatCurrency } from '@/lib/utils';

type RateCalculationInput = {
  platform: string;
  username?: string;
  followerCount: number;
  engagementRate: number;
  contentType: string;
  niche: string;
  audienceLocation: string;
  deliverables: string;
  usageRights: string;
  exclusivity: string;
};

type RateCalculationResponse = RateCalculationInput & {
  id?: string;
  createdAt?: string;
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
    yourPosition: 'below_average' | 'average' | 'above_average' | 'top_tier';
  };
  negotiationGuidance: {
    startingAsk: number;
    walkAwayMinimum: number;
    idealRange: { min: number; max: number };
    tips: string[];
  };
  warning?: string;
};

function getPositionLabel(
  position: 'below_average' | 'average' | 'above_average' | 'top_tier'
): string {
  switch (position) {
    case 'below_average':
      return 'Below Average';
    case 'average':
      return 'Average Range';
    case 'above_average':
      return 'Above Average';
    case 'top_tier':
      return 'Top Tier';
  }
}

function getPositionColor(
  position: 'below_average' | 'average' | 'above_average' | 'top_tier'
): string {
  switch (position) {
    case 'below_average':
      return 'text-red-400';
    case 'average':
      return 'text-blue-400';
    case 'above_average':
      return 'text-emerald-400';
    case 'top_tier':
      return 'text-violet-400';
  }
}

function formatSignedCurrency(amountInCents: number): string {
  const prefix = amountInCents > 0 ? '+' : amountInCents < 0 ? '-' : '';
  return `${prefix}${formatCurrency(Math.abs(amountInCents))}`;
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const calculationId = searchParams.get('id');
  const { user, isSignedIn } = useUser();
  const { isPremium, calculationsRemaining, isLoading: isSubscriptionLoading } = useSubscription();
  const [results, setResults] = useState<RateCalculationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [saveTriggered, setSaveTriggered] = useState(false);

  useEffect(() => {
    async function loadResults() {
      if (calculationId) {
        const savedResponse = await fetch(`/api/calculations/${calculationId}`, {
          cache: 'no-store',
        });

        if (!savedResponse.ok) {
          if (savedResponse.status === 401) {
            router.push('/login');
            return;
          }

          router.push('/dashboard');
          return;
        }

        const savedData = (await savedResponse.json()) as {
          calculation: RateCalculationResponse;
        };

        setResults(savedData.calculation);
        setSaveTriggered(true);
        setLoading(false);
        return;
      }

      const input: RateCalculationInput = {
        platform: searchParams.get('platform') || '',
        username: searchParams.get('username') || undefined,
        followerCount: parseInt(searchParams.get('followerCount') || '0', 10),
        engagementRate: parseFloat(searchParams.get('engagementRate') || '0'),
        contentType: searchParams.get('contentType') || '',
        niche: searchParams.get('niche') || '',
        audienceLocation: searchParams.get('audienceLocation') || 'Global',
        deliverables: searchParams.get('deliverables') || 'Single Post',
        usageRights: searchParams.get('usageRights') || '',
        exclusivity: searchParams.get('exclusivity') || '',
      };

      if (!input.platform || !input.followerCount) {
        router.push('/calculator');
        return;
      }

      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        if (response.status === 403) {
          setShowUpgradeModal(true);
          setLoading(false);
          return;
        }

        router.push('/calculator');
        return;
      }

      const calculated = (await response.json()) as Omit<RateCalculationResponse, keyof RateCalculationInput>;
      setResults({ ...calculated, ...input });
      setLoading(false);
    }

    loadResults();
  }, [searchParams, router, calculationId]);

  useEffect(() => {
    async function saveCalculation() {
      if (!isSignedIn || !results || saveTriggered) {
        return;
      }

      if (!calculationId) {
        const saveResponse = await fetch('/api/calculations/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(results),
        });

        if (saveResponse.ok) {
          const saved = (await saveResponse.json()) as { calculationId?: string };
          if (saved.calculationId) {
            router.replace(`/calculator/results?id=${saved.calculationId}`);
          }
        }
      }

      setSaveTriggered(true);
    }

    saveCalculation();
  }, [isSignedIn, results, saveTriggered, calculationId, router]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    console.log('[results] User metadata:', user?.publicMetadata);
    console.log('[results] Premium flags:', { isPremium, isSubscriptionLoading });
  }, [user?.publicMetadata, isPremium, isSubscriptionLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#020617' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Calculating your rate...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#020617' }}>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Calculation unavailable</CardTitle>
            <CardDescription>Upgrade to Premium or run a new calculation.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/calculator">
              <Button className="w-full">Back to Calculator</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rateRange = `${formatCurrency(results.minRate)} - ${formatCurrency(results.maxRate)}`;
  const breakdown = results.breakdown;

  const handleDownload = () => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    generateRateCard({
      creatorName: user?.fullName || 'Creator',
      platform: results.platform,
      followers: results.followerCount,
      engagementRate: results.engagementRate,
      niche: results.niche,
      priceBreakdown: {
        lines: [
          {
            label: 'Base Rate (Follower Tier)',
            amount: breakdown.baseRate,
            details: [
              `${breakdown.followerTier} creators typically earn ${formatCurrency(breakdown.tierMinRate)}-${formatCurrency(breakdown.tierMaxRate)} organically.`,
              `Based on ${results.followerCount.toLocaleString()} followers on ${results.platform}.`,
            ],
          },
          {
            label: 'Engagement Rate Adjustment',
            amount: breakdown.engagementAdjustment,
            details: [`Your ${results.engagementRate}% engagement is benchmarked against a ${breakdown.avgEngagement}% platform average.`],
          },
          {
            label: `Niche Adjustment (${Math.round((breakdown.nicheMultiplier - 1) * 100)}%)`,
            amount: breakdown.nicheAdjustment,
            details: [`${results.niche} pricing reflects advertiser demand without compounding the entire quote.`],
          },
          ...(breakdown.contentTypeAdjustment !== 0
            ? [
                {
                  label: `Content Type Adjustment (${breakdown.contentTypeMultiplier.toFixed(2)}x)`,
                  amount: breakdown.contentTypeAdjustment,
                  details: [`${results.contentType} changes the benchmark modestly based on format and production effort.`],
                },
              ]
            : []),
          ...(breakdown.usageRightsPremium > 0
            ? [
                {
                  label: 'Usage Rights Premium',
                  amount: breakdown.usageRightsPremium,
                  details: ['Usage rights are added on top of the organic benchmark instead of being compounded through every prior step.'],
                },
              ]
            : []),
          ...(breakdown.exclusivityPremium > 0
            ? [
                {
                  label: 'Exclusivity Premium',
                  amount: breakdown.exclusivityPremium,
                  details: ['Exclusivity is priced as opportunity cost rather than another stacked multiplier.'],
                },
              ]
            : []),
        ],
        finalRate: breakdown.total,
        steps: breakdown.steps,
      },
      rates: {
        singlePost: results.recommendedRate,
        storyText: formatCurrency(Math.round(results.recommendedRate * 0.6)),
        videoIntegration: Math.round(results.recommendedRate * 1.5),
        multiplePosts: Math.round(results.recommendedRate * 2.5),
      },
    });
  };

  return (
    <div className="min-h-screen" style={{ background: '#020617' }}>
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-6 py-12 space-y-6">
        {calculationId && (
          <div>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        )}

        {calculationId && results && (
          <Card className="border-blue-500/40 bg-blue-500/10 p-4 text-blue-100">
            <p className="text-sm font-medium">Viewing saved calculation</p>
            <p className="text-xs text-blue-100/90 mt-1">
              Created: {new Date(results.createdAt || Date.now()).toLocaleString()}
            </p>
          </Card>
        )}

        <div className="rounded-xl border border-[rgba(124,58,237,0.25)] bg-[rgba(124,58,237,0.08)] px-4 py-3 text-sm text-slate-300">
          Plan: <span className="font-semibold">{isPremium ? 'Premium' : 'Free'}</span>
          <span className="mx-2">•</span>
          Remaining calculations: <span className="font-semibold">{calculationsRemaining}</span>
        </div>

        <Card className="p-8 text-center bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 border-0 shadow-2xl">
          <h1 className="text-3xl font-bold mb-2 text-white">Your Recommended Rate</h1>
          <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 my-4">{formatCurrency(results.recommendedRate)}</p>
          <p className="text-gray-300 text-lg">Typical negotiation range {rateRange}</p>
          <p className="text-sm text-gray-400 mt-3">Benchmarked against {results.dataPoints} 2024-2025 market data points</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-gray-300 text-sm">Calculated with tier-based benchmark pricing</span>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
          </div>
          <Progress value={results.confidenceScore} className="mt-4" />
        </Card>

        {results.warning && (
          <Card className="border-amber-500/40 bg-amber-500/10 p-4 text-amber-100">
            <p className="text-sm font-medium">Reality check</p>
            <p className="text-sm text-amber-50/90 mt-1">{results.warning}</p>
          </Card>
        )}

        <div className="relative">
          <Card className={`p-6 ${!isSubscriptionLoading && !isPremium ? 'blur-sm pointer-events-none' : ''}`}>
            <h2 className="text-2xl font-bold mb-6">Advanced Rate Breakdown</h2>
            <p className="text-slate-400 mb-6">
              Each factor adjusts the organic benchmark once, so the final quote stays realistic and defensible in negotiation.
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-indigo-500 pl-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">Base Rate (Follower Tier)</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {breakdown.followerTier} creators typically earn {formatCurrency(breakdown.tierMinRate)}-{formatCurrency(breakdown.tierMaxRate)} per organic post.
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Based on your {results.followerCount.toLocaleString()} followers on {results.platform}
                    </p>
                  </div>
                  <span className="text-xl font-bold text-indigo-400">{formatCurrency(breakdown.baseRate)}</span>
                </div>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">Engagement Rate Adjustment</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Your {results.engagementRate}% engagement is {results.engagementRate > breakdown.avgEngagement ? 'above' : results.engagementRate < breakdown.avgEngagement ? 'below' : 'at'} the platform average of {breakdown.avgEngagement}%.
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Engagement moves the benchmark modestly instead of multiplying the full deal.
                    </p>
                  </div>
                  <span className={`text-xl font-bold ${breakdown.engagementAdjustment >= 0 ? 'text-emerald-400' : 'text-amber-300'}`}>
                    {formatSignedCurrency(breakdown.engagementAdjustment)}
                  </span>
                </div>
              </div>

              <div className="border-l-4 border-amber-500 pl-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">Niche Adjustment</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {results.niche} carries a {Math.round((breakdown.nicheMultiplier - 1) * 100)}% adjustment based on advertiser demand and category budgets.
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      The category premium is applied once to the organic benchmark.
                    </p>
                  </div>
                  <span className={`text-xl font-bold ${breakdown.nicheAdjustment >= 0 ? 'text-emerald-400' : 'text-amber-300'}`}>
                    {formatSignedCurrency(breakdown.nicheAdjustment)}
                  </span>
                </div>
              </div>

              <div className="border-l-4 border-cyan-500 pl-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">Content Type Adjustment</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {results.contentType} uses a {breakdown.contentTypeMultiplier.toFixed(2)}x multiplier to reflect format effort and expected brand value.
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Organic benchmark subtotal: {formatCurrency(breakdown.subtotal)}
                    </p>
                  </div>
                  <span className={`text-xl font-bold ${breakdown.contentTypeAdjustment >= 0 ? 'text-emerald-400' : 'text-amber-300'}`}>
                    {formatSignedCurrency(breakdown.contentTypeAdjustment)}
                  </span>
                </div>
              </div>

              {breakdown.usageRightsPremium > 0 && (
                <div className="border-l-4 border-red-500 pl-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">Usage Rights Premium</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        Usage rights are added after the organic quote is set, which keeps the pricing transparent.
                      </p>
                      <p className="text-xs text-slate-500 mt-2">Selected rights: {results.usageRights}</p>
                    </div>
                    <span className="text-xl font-bold text-emerald-400">{formatSignedCurrency(breakdown.usageRightsPremium)}</span>
                  </div>
                </div>
              )}

              {breakdown.exclusivityPremium > 0 && (
                <div className="border-l-4 border-pink-500 pl-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">Exclusivity Premium</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        Exclusivity is treated as opportunity cost for the selected term rather than a stacked multiplier.
                      </p>
                      <p className="text-xs text-slate-500 mt-2">Selected exclusivity: {results.exclusivity}</p>
                    </div>
                    <span className="text-xl font-bold text-emerald-400">{formatSignedCurrency(breakdown.exclusivityPremium)}</span>
                  </div>
                </div>
              )}

              <div className="border-t-2 border-slate-700 pt-6 mt-6">
                <div className="bg-gradient-to-r from-indigo-950/50 to-purple-950/50 p-6 rounded-lg border border-indigo-500/20">
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <h3 className="text-2xl font-bold">Your Final Rate</h3>
                      <p className="text-sm text-slate-400 mt-1">Organic benchmark plus explicit deal add-ons</p>
                    </div>
                    <span className="text-4xl font-bold text-indigo-300">{formatCurrency(breakdown.total)}</span>
                  </div>

                  <details className="mt-4">
                    <summary className="text-sm text-slate-300 cursor-pointer hover:text-white">View calculation steps</summary>
                    <div className="mt-3 space-y-1 font-mono text-xs bg-slate-900 p-4 rounded border border-slate-700">
                      {breakdown.steps.map((step, index) => (
                        <div key={step} className={index === breakdown.steps.length - 1 ? 'font-bold text-indigo-300 pt-2 border-t border-slate-700' : ''}>
                          {step}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </Card>

          {!isSubscriptionLoading && !isPremium && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Card className="p-6 bg-slate-950 shadow-xl max-w-md mx-4 border-violet-500/40">
                <div className="text-center">
                  <Lock className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Unlock Detailed Breakdown</h3>
                  <p className="text-slate-400 mb-4">
                    Upgrade to Premium to see exactly how your rate is calculated and maximize your earnings.
                  </p>
                  <Button className="w-full" size="lg" onClick={() => setShowUpgradeModal(true)}>
                    Upgrade to Premium - $19/month
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Context
          </h2>
          <div className="space-y-3">
            <p>Creators in your tier typically charge: {results.marketContext.typicalRange}</p>
            <p>Top 10% of similar creators charge: {results.marketContext.topTenPercent}</p>
            <p>
              Position: <Badge className={getPositionColor(results.marketContext.yourPosition)}>{getPositionLabel(results.marketContext.yourPosition)}</Badge>
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Negotiation Guidance
          </h2>
          <div className="space-y-2">
            <p><strong>Starting ask:</strong> {formatCurrency(results.negotiationGuidance.startingAsk)}</p>
            <p><strong>Walk-away minimum:</strong> {formatCurrency(results.negotiationGuidance.walkAwayMinimum)}</p>
            <p>
              <strong>Ideal range:</strong> {formatCurrency(results.negotiationGuidance.idealRange.min)} - {formatCurrency(results.negotiationGuidance.idealRange.max)}
            </p>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-slate-300 list-disc list-inside">
            {results.negotiationGuidance.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>

          {isPremium && (
            <div className="mt-6 p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
              <h3 className="font-semibold mb-2">Premium Negotiation Scripts:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                <li>How to counter a lowball offer</li>
                <li>Justifying your rates to skeptical brands</li>
                <li>Upselling additional deliverables</li>
                <li>Negotiating usage rights extensions</li>
              </ul>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Professional Rate Card</h2>
          <p className="text-slate-400 mb-4">
            Download a PDF rate card to send brands during sponsorship negotiations.
          </p>
          <Button onClick={handleDownload} className="w-full" disabled={!isPremium}>
            <Download className="h-4 w-4 mr-2" />
            {isPremium ? 'Download Rate Card (PDF)' : 'Premium Feature - Download Rate Card'}
          </Button>
        </Card>

        {!isSignedIn && (
          <Card className="p-6 border-2 border-indigo-400/30 bg-indigo-500/10">
            <h3 className="text-xl font-bold mb-2">Save This Calculation</h3>
            <p className="text-slate-300 mb-4">
              Create a free account to save rate calculations and access them anytime.
            </p>
            <Link href="/signup">
              <Button>Create Free Account</Button>
            </Link>
          </Card>
        )}

        <div className="text-center">
          <Link href="/calculator">
            <Button variant="outline" size="lg">
              <CalculatorIcon className="mr-2 h-4 w-4" />
              Calculate Another Rate
            </Button>
          </Link>
        </div>
      </div>

      {!isSignedIn && <Footer />}

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md" style={{ background: 'rgba(13,18,35,0.97)', border: '1px solid rgba(124,58,237,0.3)', backdropFilter: 'blur(20px)' }}>
          <DialogHeader>
            <DialogTitle className="text-white">Upgrade to Premium</DialogTitle>
            <DialogDescription>
              Unlock unlimited calculations, detailed breakdowns, saved history, and downloads.
            </DialogDescription>
          </DialogHeader>
          <Link href="/pricing">
            <Button className="w-full">View Premium Plan</Button>
          </Link>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
