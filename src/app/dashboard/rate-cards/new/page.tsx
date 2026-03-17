'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { buildStoredRates, type TemplateData } from '@/lib/rateCardData';
import { useSubscription } from '@/hooks/useSubscription';

type TemplateId = 'modern' | 'instagram' | 'youtube';

interface RateCardFormState {
  templateId: TemplateId;
  creatorName: string;
  creatorHandle: string;
  platform: 'Instagram' | 'YouTube';
  niche: string;
  followerCount: number;
  engagementRate: number;
  avgViews: number;
  avgWatchTime: string;
  avgReach: number;
  avgStoryViews: number;
  primaryAgeRange: string;
  malePercent: number;
  femalePercent: number;
  topLocations: string;
  contactEmail: string;
  websiteUrl: string;
  profilePhoto: string;
  usageRights30Day: number;
  usageRights90Day: number;
  exclusivity30Day: number;
  exclusivity90Day: number;
  singlePostRate: number;
  storySeriesRate: number;
  reelRate: number;
  dedicatedVideoRate: number;
  integrationRate: number;
  shortsRate: number;
  terms: string;
}

function getDefaultInstagramState(): RateCardFormState {
  return {
    templateId: 'instagram',
    creatorName: '',
    creatorHandle: '',
    platform: 'Instagram',
    niche: 'Beauty & Skincare',
    followerCount: 125000,
    engagementRate: 4.2,
    avgViews: 0,
    avgWatchTime: '',
    avgReach: 52000,
    avgStoryViews: 18000,
    primaryAgeRange: '25-34',
    malePercent: 35,
    femalePercent: 65,
    topLocations: 'USA (60%), UK (15%), Canada (10%)',
    contactEmail: '',
    websiteUrl: 'www.creatorwebsite.com',
    profilePhoto: '',
    usageRights30Day: 800,
    usageRights90Day: 1500,
    exclusivity30Day: 500,
    exclusivity90Day: 1200,
    singlePostRate: 1200,
    storySeriesRate: 600,
    reelRate: 2000,
    dedicatedVideoRate: 0,
    integrationRate: 0,
    shortsRate: 0,
    terms:
      'Usage Rights: 30-day organic posting on brand-owned channels. Payment Terms: 50% upfront, 50% upon content delivery. Timeline: 7-10 business days from brief.',
  };
}

function getDefaultYouTubeState(): RateCardFormState {
  return {
    templateId: 'youtube',
    creatorName: '',
    creatorHandle: '',
    platform: 'YouTube',
    niche: 'Tech Reviews & Tutorials',
    followerCount: 450000,
    engagementRate: 5.8,
    avgViews: 85000,
    avgWatchTime: '8:45',
    avgReach: 0,
    avgStoryViews: 0,
    primaryAgeRange: '18-34',
    malePercent: 55,
    femalePercent: 45,
    topLocations: 'USA (50%), India (15%), UK (10%)',
    contactEmail: '',
    websiteUrl: 'www.channelname.com/mediakit',
    profilePhoto: '',
    usageRights30Day: 3000,
    usageRights90Day: 6000,
    exclusivity30Day: 2000,
    exclusivity90Day: 4500,
    singlePostRate: 0,
    storySeriesRate: 0,
    reelRate: 0,
    dedicatedVideoRate: 8000,
    integrationRate: 4000,
    shortsRate: 1800,
    terms:
      'Usage Rights: 60-day organic posting on brand-owned channels. Payment Terms: 50% upfront on signing, 50% on publication. Production Timeline: 14-21 days.',
  };
}

function getTemplateFromQuery(value: string | null): TemplateId {
  if (value === 'instagram' || value === 'youtube') {
    return value;
  }
  return 'modern';
}

export default function NewRateCardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isPremium } = useSubscription();

  const [form, setForm] = useState<RateCardFormState>(getDefaultInstagramState());

  useEffect(() => {
    const template = getTemplateFromQuery(searchParams.get('template'));
    if (template === 'youtube') {
      setForm(getDefaultYouTubeState());
      return;
    }

    setForm(getDefaultInstagramState());
  }, [searchParams]);

  const isInstagram = form.platform === 'Instagram';
  const isYouTube = form.platform === 'YouTube';

  const previewRates = useMemo(() => {
    if (isInstagram) {
      return [
        { name: 'Single Feed Post', price: Number(form.singlePostRate) },
        { name: 'Story Series (24-hour stories)', price: Number(form.storySeriesRate) },
        { name: 'Single Reel (15-90 seconds)', price: Number(form.reelRate) },
      ];
    }

    return [
      { name: 'Full Dedicated Video (10-15 minutes)', price: Number(form.dedicatedVideoRate) },
      { name: 'Mid-Roll Integration (90-120 seconds)', price: Number(form.integrationRate) },
      { name: 'Single YouTube Short (60 seconds)', price: Number(form.shortsRate) },
    ];
  }, [form, isInstagram]);

  const handleTemplateSwitch = (nextTemplate: 'instagram' | 'youtube') => {
    setForm(nextTemplate === 'instagram' ? getDefaultInstagramState() : getDefaultYouTubeState());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const templateData: TemplateData = {
      creatorName: form.creatorName,
      handle: form.creatorHandle,
      platform: form.platform,
      niche: form.niche,
      followers: Number(form.followerCount),
      avgEngagementRate: Number(form.engagementRate),
      avgViews: Number(form.avgViews),
      avgWatchTime: form.avgWatchTime,
      avgReach: Number(form.avgReach),
      avgStoryViews: Number(form.avgStoryViews),
      primaryAgeRange: form.primaryAgeRange,
      genderSplit: {
        male: Number(form.malePercent),
        female: Number(form.femalePercent),
      },
      topLocations: form.topLocations
        .split(',')
        .map((location) => location.trim())
        .filter(Boolean),
      singlePostRate: Number(form.singlePostRate),
      storySeriesRate: Number(form.storySeriesRate),
      reelRate: Number(form.reelRate),
      dedicatedVideoRate: Number(form.dedicatedVideoRate),
      integrationRate: Number(form.integrationRate),
      shortsRate: Number(form.shortsRate),
      usageRights30Day: Number(form.usageRights30Day),
      usageRights90Day: Number(form.usageRights90Day),
      exclusivity30Day: Number(form.exclusivity30Day),
      exclusivity90Day: Number(form.exclusivity90Day),
      profilePhoto: form.profilePhoto,
      websiteUrl: form.websiteUrl,
      contactEmail: form.contactEmail,
    };

    const payload = {
      templateId: form.templateId,
      creatorName: form.creatorName,
      creatorHandle: form.creatorHandle,
      platform: form.platform,
      followerCount: Number(form.followerCount),
      engagementRate: Number(form.engagementRate),
      niche: form.niche,
      contactEmail: form.contactEmail,
      terms: form.terms,
      rates: buildStoredRates(previewRates, templateData),
    };

    const response = await fetch('/api/rate-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
    <div className="max-w-5xl mx-auto">
      {!isPremium && (
        <Card className="mb-6 border-amber-300 bg-amber-50">
          <CardContent className="pt-6">
            <p className="text-amber-800 mb-3">Instagram and YouTube advanced templates are Premium-only.</p>
            <Link href="/dashboard/rate-cards/create">
              <Button variant="outline">Use Simple Free Rate Card Form</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="mb-6">
        <Link href="/dashboard/rate-cards" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Back to Rate Cards
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Rate Card</CardTitle>
          <CardDescription>Fill profile, audience, and pricing data to generate an Instagram or YouTube template PDF.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant={isInstagram ? 'default' : 'outline'} onClick={() => handleTemplateSwitch('instagram')}>
                Instagram Template
              </Button>
              <Button type="button" variant={isYouTube ? 'default' : 'outline'} onClick={() => handleTemplateSwitch('youtube')}>
                YouTube Template
              </Button>
            </div>

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
                  placeholder={isInstagram ? '@username' : '@channelname'}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="niche">Content Niche</Label>
                <Input id="niche" value={form.niche} onChange={(e) => setForm((prev) => ({ ...prev, niche: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="followerCount">{isInstagram ? 'Total Followers' : 'Total Subscribers'}</Label>
                <Input
                  id="followerCount"
                  type="number"
                  value={form.followerCount}
                  onChange={(e) => setForm((prev) => ({ ...prev, followerCount: Number(e.target.value) }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="engagementRate">Average Engagement Rate (%)</Label>
                <Input
                  id="engagementRate"
                  type="number"
                  step="0.1"
                  value={form.engagementRate}
                  onChange={(e) => setForm((prev) => ({ ...prev, engagementRate: Number(e.target.value) }))}
                />
              </div>
              {isInstagram ? (
                <>
                  <div>
                    <Label htmlFor="avgReach">Average Reach per Post</Label>
                    <Input id="avgReach" type="number" value={form.avgReach} onChange={(e) => setForm((prev) => ({ ...prev, avgReach: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <Label htmlFor="avgStoryViews">Average Story Views</Label>
                    <Input id="avgStoryViews" type="number" value={form.avgStoryViews} onChange={(e) => setForm((prev) => ({ ...prev, avgStoryViews: Number(e.target.value) }))} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="avgViews">Average Views per Video</Label>
                    <Input id="avgViews" type="number" value={form.avgViews} onChange={(e) => setForm((prev) => ({ ...prev, avgViews: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <Label htmlFor="avgWatchTime">Average Watch Time (mm:ss)</Label>
                    <Input id="avgWatchTime" value={form.avgWatchTime} onChange={(e) => setForm((prev) => ({ ...prev, avgWatchTime: e.target.value }))} />
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="primaryAgeRange">Primary Age Range</Label>
                <Input id="primaryAgeRange" value={form.primaryAgeRange} onChange={(e) => setForm((prev) => ({ ...prev, primaryAgeRange: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="femalePercent">Female (%)</Label>
                <Input id="femalePercent" type="number" value={form.femalePercent} onChange={(e) => setForm((prev) => ({ ...prev, femalePercent: Number(e.target.value) }))} />
              </div>
              <div>
                <Label htmlFor="malePercent">Male (%)</Label>
                <Input id="malePercent" type="number" value={form.malePercent} onChange={(e) => setForm((prev) => ({ ...prev, malePercent: Number(e.target.value) }))} />
              </div>
              <div>
                <Label htmlFor="topLocations">Top Locations</Label>
                <Input
                  id="topLocations"
                  value={form.topLocations}
                  onChange={(e) => setForm((prev) => ({ ...prev, topLocations: e.target.value }))}
                  placeholder="USA (60%), UK (15%), Canada (10%)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isInstagram ? (
                <>
                  <div>
                    <Label htmlFor="singlePostRate">Single Feed Post Rate ($)</Label>
                    <Input id="singlePostRate" type="number" value={form.singlePostRate} onChange={(e) => setForm((prev) => ({ ...prev, singlePostRate: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <Label htmlFor="storySeriesRate">Story Series Rate ($)</Label>
                    <Input id="storySeriesRate" type="number" value={form.storySeriesRate} onChange={(e) => setForm((prev) => ({ ...prev, storySeriesRate: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <Label htmlFor="reelRate">Single Reel Rate ($)</Label>
                    <Input id="reelRate" type="number" value={form.reelRate} onChange={(e) => setForm((prev) => ({ ...prev, reelRate: Number(e.target.value) }))} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="dedicatedVideoRate">Dedicated Video Rate ($)</Label>
                    <Input id="dedicatedVideoRate" type="number" value={form.dedicatedVideoRate} onChange={(e) => setForm((prev) => ({ ...prev, dedicatedVideoRate: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <Label htmlFor="integrationRate">Integration Rate ($)</Label>
                    <Input id="integrationRate" type="number" value={form.integrationRate} onChange={(e) => setForm((prev) => ({ ...prev, integrationRate: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <Label htmlFor="shortsRate">YouTube Shorts Rate ($)</Label>
                    <Input id="shortsRate" type="number" value={form.shortsRate} onChange={(e) => setForm((prev) => ({ ...prev, shortsRate: Number(e.target.value) }))} />
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="usageRights30Day">Paid Ad Rights 30 Days ($)</Label>
                <Input id="usageRights30Day" type="number" value={form.usageRights30Day} onChange={(e) => setForm((prev) => ({ ...prev, usageRights30Day: Number(e.target.value) }))} />
              </div>
              <div>
                <Label htmlFor="usageRights90Day">Paid Ad Rights 90 Days ($)</Label>
                <Input id="usageRights90Day" type="number" value={form.usageRights90Day} onChange={(e) => setForm((prev) => ({ ...prev, usageRights90Day: Number(e.target.value) }))} />
              </div>
              <div>
                <Label htmlFor="exclusivity30Day">Exclusivity 30 Days ($)</Label>
                <Input id="exclusivity30Day" type="number" value={form.exclusivity30Day} onChange={(e) => setForm((prev) => ({ ...prev, exclusivity30Day: Number(e.target.value) }))} />
              </div>
              <div>
                <Label htmlFor="exclusivity90Day">Exclusivity 90 Days ($)</Label>
                <Input id="exclusivity90Day" type="number" value={form.exclusivity90Day} onChange={(e) => setForm((prev) => ({ ...prev, exclusivity90Day: Number(e.target.value) }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input id="contactEmail" type="email" value={form.contactEmail} onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="websiteUrl">Website</Label>
                <Input id="websiteUrl" value={form.websiteUrl} onChange={(e) => setForm((prev) => ({ ...prev, websiteUrl: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="profilePhoto">Profile Photo URL</Label>
                <Input id="profilePhoto" value={form.profilePhoto} onChange={(e) => setForm((prev) => ({ ...prev, profilePhoto: e.target.value }))} />
              </div>
            </div>

            <div>
              <Label htmlFor="terms">Terms & Conditions Summary</Label>
              <textarea
                id="terms"
                value={form.terms}
                onChange={(e) => setForm((prev) => ({ ...prev, terms: e.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading || !isPremium}>{loading ? 'Creating...' : 'Create Rate Card'}</Button>
              <Link href="/dashboard/rate-cards">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
