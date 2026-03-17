'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PremiumRateCardFormState {
  creatorName: string;
  creatorHandle: string;
  platform: 'Instagram' | 'YouTube' | 'TikTok';
  niche: string;
  followerCount: number;
  engagementRate: number;
  contactEmail: string;
  terms: string;
  feedPostRate: number;
  shortVideoRate: number;
  storyPackageRate: number;
  monthlyRetainerRate: number;
  whitelistingRate: number;
}

const defaultForm: PremiumRateCardFormState = {
  creatorName: '',
  creatorHandle: '',
  platform: 'Instagram',
  niche: 'Lifestyle',
  followerCount: 50000,
  engagementRate: 4.5,
  contactEmail: '',
  terms:
    'Rates include one revision. 50% upfront to confirm booking and 50% on delivery. Usage rights and exclusivity billed separately.',
  feedPostRate: 0,
  shortVideoRate: 0,
  storyPackageRate: 0,
  monthlyRetainerRate: 0,
  whitelistingRate: 0,
};

export function PremiumCreateRateCardForm() {
  const router = useRouter();
  const { user } = useUser();
  const { isPremium } = useSubscription();

  const [form, setForm] = useState<PremiumRateCardFormState>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      creatorName: prev.creatorName || user?.fullName || '',
      contactEmail: prev.contactEmail || user?.primaryEmailAddress?.emailAddress || '',
    }));
  }, [user?.fullName, user?.primaryEmailAddress?.emailAddress]);

  const totalPackageValue = useMemo(
    () =>
      form.feedPostRate +
      form.shortVideoRate +
      form.storyPackageRate +
      form.monthlyRetainerRate +
      form.whitelistingRate,
    [
      form.feedPostRate,
      form.shortVideoRate,
      form.storyPackageRate,
      form.monthlyRetainerRate,
      form.whitelistingRate,
    ]
  );

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!isPremium) {
      setError('Premium subscription required.');
      return;
    }

    const rates = [
      { name: 'Feed Post', price: Number(form.feedPostRate) },
      { name: 'Short Video / Reel', price: Number(form.shortVideoRate) },
      { name: 'Story Package', price: Number(form.storyPackageRate) },
      { name: 'Monthly Retainer', price: Number(form.monthlyRetainerRate) },
      { name: 'Whitelisting / Paid Usage', price: Number(form.whitelistingRate) },
    ];

    if (
      !form.creatorName ||
      !form.creatorHandle ||
      !form.niche ||
      !form.contactEmail ||
      rates.some((r) => !Number.isFinite(r.price) || r.price < 0)
    ) {
      setError('Please complete all required fields with valid rates.');
      return;
    }

    setLoading(true);

    const response = await fetch('/api/rate-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: 'modern',
        creatorName: form.creatorName,
        creatorHandle: form.creatorHandle,
        platform: form.platform,
        followerCount: Number(form.followerCount),
        engagementRate: Number(form.engagementRate),
        niche: form.niche,
        contactEmail: form.contactEmail,
        terms: form.terms,
        rates,
      }),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error || 'Failed to create rate card');
      setLoading(false);
      return;
    }

    router.push('/dashboard/rate-cards');
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {!isPremium && (
        <Card className="mb-6 border-amber-300 bg-amber-50">
          <CardContent className="pt-6">
            <p className="text-amber-900 mb-3">This custom rate card builder is Premium-only.</p>
            <Link href="/pricing">
              <Button>Upgrade to Premium</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Premium Custom Rate Card Builder</CardTitle>
          <CardDescription>
            This builder is separate from the free form and from Instagram/YouTube templates. Use it to create a fully custom premium card.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={submit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="creatorName">Creator Name</Label>
                <Input
                  id="creatorName"
                  value={form.creatorName}
                  onChange={(e) => setForm((prev) => ({ ...prev, creatorName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="creatorHandle">Creator Handle</Label>
                <Input
                  id="creatorHandle"
                  value={form.creatorHandle}
                  onChange={(e) => setForm((prev) => ({ ...prev, creatorHandle: e.target.value }))}
                  placeholder="@yourhandle"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Platform</Label>
                <Select
                  value={form.platform}
                  onValueChange={(value: 'Instagram' | 'YouTube' | 'TikTok') =>
                    setForm((prev) => ({ ...prev, platform: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="followerCount">Follower Count</Label>
                <Input
                  id="followerCount"
                  type="number"
                  value={form.followerCount}
                  onChange={(e) => setForm((prev) => ({ ...prev, followerCount: Number(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="engagementRate">Engagement Rate (%)</Label>
                <Input
                  id="engagementRate"
                  type="number"
                  step="0.1"
                  value={form.engagementRate}
                  onChange={(e) => setForm((prev) => ({ ...prev, engagementRate: Number(e.target.value) }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="niche">Niche</Label>
                <Input
                  id="niche"
                  value={form.niche}
                  onChange={(e) => setForm((prev) => ({ ...prev, niche: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="feedPostRate">Feed Post Rate ($)</Label>
                <Input
                  id="feedPostRate"
                  type="number"
                  value={form.feedPostRate}
                  onChange={(e) => setForm((prev) => ({ ...prev, feedPostRate: Number(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="shortVideoRate">Short Video / Reel Rate ($)</Label>
                <Input
                  id="shortVideoRate"
                  type="number"
                  value={form.shortVideoRate}
                  onChange={(e) => setForm((prev) => ({ ...prev, shortVideoRate: Number(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="storyPackageRate">Story Package Rate ($)</Label>
                <Input
                  id="storyPackageRate"
                  type="number"
                  value={form.storyPackageRate}
                  onChange={(e) => setForm((prev) => ({ ...prev, storyPackageRate: Number(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="monthlyRetainerRate">Monthly Retainer ($)</Label>
                <Input
                  id="monthlyRetainerRate"
                  type="number"
                  value={form.monthlyRetainerRate}
                  onChange={(e) => setForm((prev) => ({ ...prev, monthlyRetainerRate: Number(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="whitelistingRate">Whitelisting / Usage ($)</Label>
                <Input
                  id="whitelistingRate"
                  type="number"
                  value={form.whitelistingRate}
                  onChange={(e) => setForm((prev) => ({ ...prev, whitelistingRate: Number(e.target.value) }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <textarea
                id="terms"
                rows={4}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.terms}
                onChange={(e) => setForm((prev) => ({ ...prev, terms: e.target.value }))}
              />
            </div>

            <div className="rounded-md border border-indigo-500/30 bg-indigo-500/10 p-3 text-sm">
              {totalPackageValue > 0 ? (
                <>
                  Estimated package total: <span className="font-semibold">${totalPackageValue.toLocaleString()}</span>
                </>
              ) : (
                <span className="text-slate-300">Estimated package total will appear once you enter your rates.</span>
              )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading || !isPremium}>
                {loading ? 'Creating...' : 'Create Premium Rate Card'}
              </Button>
              <Link href="/dashboard/rate-cards">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
