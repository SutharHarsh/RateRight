'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';

function toSafeNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

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
        if (!response.ok || !mounted) {
          if (mounted) {
            setRemote((previous) => ({ ...previous, loaded: true }));
          }
          return;
        }

        const payload = (await response.json()) as Record<string, unknown>;
        const isPremium = payload.isPremium === true;
        const calculationsUsed = toSafeNumber(payload.calculationsUsed, 0);
        const calculationsLimit = isPremium
          ? 999999
          : Math.max(1, toSafeNumber(payload.calculationsLimit, 3));

        setRemote({
          loaded: true,
          isPremium,
          calculationsUsed,
          calculationsLimit,
        });

        if (process.env.NODE_ENV === 'development') {
          console.log('[subscription] remote payload', payload);
        }
      } catch {
        if (mounted) {
          setRemote((previous) => ({ ...previous, loaded: true }));
        }
      }
    }

    loadRemoteSubscription();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return useMemo(() => {
    const rawCount = user?.publicMetadata?.calculationsThisMonth;
    const count = typeof rawCount === 'number' && Number.isFinite(rawCount) ? rawCount : 0;
    const isPremium = remote.loaded ? remote.isPremium : false;
    const calculationsUsed = remote.loaded ? remote.calculationsUsed : count;
    const calculationsLimit = isPremium ? 999999 : remote.loaded ? remote.calculationsLimit : 3;

    if (process.env.NODE_ENV === 'development') {
      console.log('[subscription] metadata', user?.publicMetadata);
      console.log('[subscription] resolved', {
        loaded: remote.loaded,
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
