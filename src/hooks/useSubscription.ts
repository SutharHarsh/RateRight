'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { metadataIsPremium } from '@/lib/subscription';

export function useSubscription() {
  const { user } = useUser();
  const [remote, setRemote] = useState<{
    loaded: boolean;
    isPremium: boolean;
    calculationsUsed: number;
    calculationsLimit: number;
  }>({
    loaded: false,
    isPremium: false,
    calculationsUsed: 0,
    calculationsLimit: 3,
  });

  useEffect(() => {
    let mounted = true;

    async function loadRemoteSubscription() {
      try {
        const response = await fetch('/api/subscription/status', { cache: 'no-store' });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          isPremium: boolean;
          calculationsUsed: number;
          calculationsLimit: number;
        };

        if (!mounted) {
          return;
        }

        setRemote({
          loaded: true,
          isPremium: payload.isPremium,
          calculationsUsed: payload.calculationsUsed,
          calculationsLimit: payload.calculationsLimit,
        });

        if (process.env.NODE_ENV === 'development') {
          console.log('[subscription] remote payload', payload);
        }
      } catch {
        // Keep local fallback.
      }
    }

    loadRemoteSubscription();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return useMemo(() => {
    const status = user?.publicMetadata?.subscriptionStatus;
    const plan = user?.publicMetadata?.plan;
    const rawCount = user?.publicMetadata?.calculationsThisMonth;
    const count = typeof rawCount === 'number' ? rawCount : 0;
    const localPremium = metadataIsPremium(status, plan);
    const isPremium = remote.loaded ? remote.isPremium : localPremium;
    const calculationsUsed = remote.loaded ? remote.calculationsUsed : count;
    const calculationsLimit = isPremium ? 999999 : remote.loaded ? remote.calculationsLimit : 3;

    if (process.env.NODE_ENV === 'development') {
      console.log('[subscription] metadata', user?.publicMetadata);
      console.log('[subscription] resolved', {
        loaded: remote.loaded,
        localPremium,
        isPremium,
        calculationsUsed,
        calculationsLimit,
      });
    }

    return {
      isPremium,
      isFree: !isPremium,
      isLoading: !remote.loaded,
      canCalculate: isPremium || calculationsUsed < calculationsLimit,
      calculationsRemaining: isPremium ? 'Unlimited' : Math.max(0, calculationsLimit - calculationsUsed),
      calculationsUsed,
    };
  }, [remote, user]);
}
