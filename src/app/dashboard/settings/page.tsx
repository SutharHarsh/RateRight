'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubscription } from '@/hooks/useSubscription';

const ALLOWED_TABS = ['profile', 'billing', 'account'] as const;

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const initialName = useMemo(() => user?.fullName || '', [user]);
  const initialEmail = useMemo(() => user?.primaryEmailAddress?.emailAddress || '', [user]);
  

  const [displayName, setDisplayName] = useState(initialName);
  const [email] = useState(initialEmail);
  const { isPremium } = useSubscription();
  const subscriptionStatus = user?.publicMetadata?.subscriptionStatus as string | undefined;
  const currentPeriodEnd = user?.publicMetadata?.currentPeriodEnd as number | undefined;
  const cancelAtPeriodEnd = user?.publicMetadata?.cancelAtPeriodEnd as boolean | undefined;
  const requestedTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'account'>('profile');

  useEffect(() => {
    if (requestedTab && ALLOWED_TABS.includes(requestedTab as any)) {
      setActiveTab(requestedTab as 'profile' | 'billing' | 'account');
    }
  }, [requestedTab]);

  useEffect(() => {
    setDisplayName(initialName);
  }, [initialName]);

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    setStatusMessage('');

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile settings.');
      }

      await user?.reload();
      setStatusMessage('Profile settings updated successfully.');
    } catch {
      setStatusMessage('Could not save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
    });

    const payload = (await response.json()) as { url?: string; error?: string };

    if (!response.ok || !payload.url) {
      setStatusMessage(payload.error || 'Unable to open billing portal.');
      return;
    }

    window.location.href = payload.url;
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    setStatusMessage('');

    try {
      const response = await fetch('/api/user/delete', { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete account.');
      }

      window.location.href = '/';
    } catch {
      setStatusMessage('Failed to delete account. Please contact support.');
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return <div className="text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {statusMessage && (
        <div className="mb-6 rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-slate-300">
          {statusMessage}
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value as 'profile' | 'billing' | 'account');
          router.replace(`/dashboard/settings?tab=${value}`);
        }}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} disabled className="bg-slate-900" />
                <p className="text-sm text-slate-500 mt-1">
                  Email is managed by Clerk and cannot be changed here.
                </p>
              </div>
              <Button onClick={handleUpdateProfile} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Billing & Subscription</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div>
                  <p className="font-semibold">Current Plan</p>
                  <p className="text-sm text-slate-400">{isPremium ? 'Premium' : 'Free'}</p>
                  {subscriptionStatus ? (
                    <p className="text-xs text-slate-500 mt-1">Status: {subscriptionStatus}</p>
                  ) : null}
                  {isPremium && currentPeriodEnd ? (
                    <p className="text-xs text-slate-500 mt-1">
                      {cancelAtPeriodEnd ? 'Access until' : 'Next billing date'}:{' '}
                      {new Date(currentPeriodEnd * 1000).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  ) : null}
                </div>
                {isPremium ? (
                  <Button onClick={handleManageBilling}>Manage Subscription</Button>
                ) : (
                  <Button onClick={() => (window.location.href = '/pricing')}>Upgrade to Premium</Button>
                )}
              </div>
              <p className="text-sm text-slate-500">
                {isPremium
                  ? 'Manage payment method, invoices, and subscription status from Stripe portal.'
                  : 'Upgrade to Premium for unlimited calculations and advanced features.'}
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Account Management</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-red-500 mb-2">Danger Zone</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Once deleted, all account data and saved calculations are permanently removed.
                </p>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading}>
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
