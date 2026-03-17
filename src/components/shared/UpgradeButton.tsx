'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export function UpgradeButton({
  className,
  interval = 'month',
}: {
  className?: string;
  interval?: 'month' | 'year';
}) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || 'Unable to start checkout.');
      }

      window.location.href = payload.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to start checkout.');
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleUpgrade} disabled={loading} size="lg" className={className}>
      {loading ? 'Redirecting...' : 'Upgrade to Premium ($19/month)'}
    </Button>
  );
}
