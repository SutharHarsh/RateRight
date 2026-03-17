'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function CheckoutSessionSync({
  sessionId,
  success,
}: {
  sessionId?: string;
  success?: string;
}) {
  useEffect(() => {
    async function sync() {
      if (!sessionId || success !== 'true') {
        return;
      }

      try {
        const response = await fetch('/api/stripe/confirm-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const payload = (await response.json()) as { upgraded?: boolean; error?: string };

        if (!response.ok) {
          throw new Error(payload.error || 'Payment confirmation failed');
        }

        if (payload.upgraded) {
          toast.success('Premium activated successfully');
          const url = new URL(window.location.href);
          url.searchParams.delete('success');
          url.searchParams.delete('session_id');
          window.history.replaceState({}, '', url.toString());
          window.location.reload();
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not verify payment status');
      }
    }

    void sync();
  }, [sessionId, success]);

  return null;
}
