'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSubscription } from '@/hooks/useSubscription';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateSimpleRateCard } from '@/lib/simpleRateCardGenerator';
import { Loader2, Lock } from 'lucide-react';

export function CreateRateCardForm() {
  const { user } = useUser();
  const { isPremium } = useSubscription();

  const [formData, setFormData] = useState({
    creatorName: user?.fullName || '',
    handle: '',
    platform: '',
    followers: '',
    engagementRate: '',
    niche: '',
    singlePostRate: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [canCreate, setCanCreate] = useState(true);
  const [limitMessage, setLimitMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusError, setStatusError] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, creatorName: user?.fullName || prev.creatorName }));
  }, [user?.fullName]);

  useEffect(() => {
    checkRateCardLimit();
  }, []);

  const checkRateCardLimit = async () => {
    const response = await fetch('/api/rate-cards/check-limit');
    const data = (await response.json()) as { canCreate: boolean; reason?: string };

    setCanCreate(data.canCreate);
    if (!data.canCreate && data.reason) {
      setLimitMessage(data.reason);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMessage('');
    setStatusError(false);

    if (!formData.creatorName || !formData.platform || !formData.followers || !formData.engagementRate || !formData.niche || !formData.singlePostRate) {
      setStatusError(true);
      setStatusMessage('Please fill in all required fields.');
      return;
    }

    if (!isPremium && !canCreate) {
      setStatusError(true);
      setStatusMessage(limitMessage || 'Rate card limit reached.');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/rate-cards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: 'simple',
          calculationData: {
            ...formData,
            followers: parseInt(formData.followers, 10),
            engagementRate: parseFloat(formData.engagementRate),
            singlePostRate: parseFloat(formData.singlePostRate),
          },
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error || 'Failed to create rate card');
      }

      generateSimpleRateCard({
        creatorName: formData.creatorName,
        handle: formData.handle,
        platform: formData.platform,
        followers: parseInt(formData.followers, 10),
        engagementRate: parseFloat(formData.engagementRate),
        niche: formData.niche,
        singlePostRate: parseFloat(formData.singlePostRate),
      });

      setStatusError(false);
      setStatusMessage('Rate card created and downloaded successfully.');

      await checkRateCardLimit();

      setFormData({
        creatorName: user?.fullName || '',
        handle: '',
        platform: '',
        followers: '',
        engagementRate: '',
        niche: '',
        singlePostRate: '',
      });
    } catch (error) {
      setStatusError(true);
      setStatusMessage(error instanceof Error ? error.message : 'Failed to create rate card');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Create Rate Card</h2>
          <p className="text-gray-600">
            {isPremium
              ? 'Premium plan detected. Use the advanced template builder for Instagram and YouTube layouts.'
              : 'Create a simple rate card (Free Plan - 1 card limit)'}
          </p>

          {!isPremium && !canCreate && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-semibold">{limitMessage}</p>
              <Button className="mt-3" onClick={() => (window.location.href = '/pricing')}>
                Upgrade to Premium
              </Button>
            </div>
          )}

          {statusMessage && (
            <div className={`mt-4 rounded-md p-3 text-sm ${statusError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              {statusMessage}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="creatorName">Creator Name *</Label>
            <Input
              id="creatorName"
              value={formData.creatorName}
              onChange={(e) => handleInputChange('creatorName', e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="handle">Social Media Handle</Label>
            <Input
              id="handle"
              value={formData.handle}
              onChange={(e) => handleInputChange('handle', e.target.value)}
              placeholder="@yourhandle"
            />
          </div>

          <div>
            <Label htmlFor="platform">Platform *</Label>
            <Select value={formData.platform} onValueChange={(value) => handleInputChange('platform', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="YouTube">YouTube</SelectItem>
                <SelectItem value="Twitter/X">Twitter/X</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="followers">Followers *</Label>
            <Input
              id="followers"
              type="number"
              value={formData.followers}
              onChange={(e) => handleInputChange('followers', e.target.value)}
              placeholder="50000"
              required
            />
          </div>

          <div>
            <Label htmlFor="engagementRate">Engagement Rate (%) *</Label>
            <Input
              id="engagementRate"
              type="number"
              step="0.1"
              value={formData.engagementRate}
              onChange={(e) => handleInputChange('engagementRate', e.target.value)}
              placeholder="4.5"
              required
            />
          </div>

          <div>
            <Label htmlFor="niche">Content Niche *</Label>
            <Select value={formData.niche} onValueChange={(value) => handleInputChange('niche', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select niche" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beauty">Beauty</SelectItem>
                <SelectItem value="Fashion">Fashion</SelectItem>
                <SelectItem value="Fitness">Fitness</SelectItem>
                <SelectItem value="Tech">Tech</SelectItem>
                <SelectItem value="Gaming">Gaming</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Travel">Travel</SelectItem>
                <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Parenting">Parenting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="singlePostRate">Your Rate (Single Post) *</Label>
            <Input
              id="singlePostRate"
              type="number"
              value={formData.singlePostRate}
              onChange={(e) => handleInputChange('singlePostRate', e.target.value)}
              placeholder="1200"
              required
            />
            <p className="text-sm text-gray-500 mt-1">Use our calculator to determine fair rates</p>
          </div>

          {!isPremium && (
            <Card className="p-4 bg-indigo-50 border-indigo-200">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-indigo-900 mb-1">Unlock Premium Templates</h4>
                  <p className="text-sm text-indigo-700 mb-3">
                    Upgrade to access Instagram and YouTube specific templates with advanced layouts.
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={() => (window.location.href = '/pricing')}>
                    View Premium Features
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isGenerating || (!isPremium && !canCreate)}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Rate Card...
              </>
            ) : (
              'Create and Download Rate Card'
            )}
          </Button>
        </form>
      </Card>

      {isPremium && (
        <Card className="p-6 mt-6 bg-gradient-to-br from-indigo-50 to-purple-50">
          <h3 className="font-semibold text-lg mb-3">Premium Templates Available</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold mb-1">Instagram Templates</h4>
              <p className="text-sm text-gray-600">3 unique designs for Instagram creators</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold mb-1">YouTube Templates</h4>
              <p className="text-sm text-gray-600">3 professional layouts for YouTubers</p>
            </div>
          </div>
          <Button className="w-full mt-4" variant="outline" onClick={() => (window.location.href = '/dashboard/rate-cards/new')}>
            Open Premium Template Builder
          </Button>
        </Card>
      )}
    </div>
  );
}
