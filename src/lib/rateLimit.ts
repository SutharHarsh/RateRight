import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

function hasUpstashEnv() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

const redis = hasUpstashEnv() ? Redis.fromEnv() : null;

function createLimiter(tokens: number, window: `${number} ${'s' | 'm' | 'h'}`) {
  if (!redis) {
    return null;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: true,
  });
}

export const rateLimiters = {
  api: createLimiter(100, '1 m'),
  auth: createLimiter(10, '1 m'),
  calculator: createLimiter(30, '1 h'),
  webhook: createLimiter(1000, '1 m'),
};

export async function checkRateLimit(identifier: string, limiter: Ratelimit | null) {
  if (!limiter) {
    return { success: true, remaining: Number.MAX_SAFE_INTEGER };
  }

  const { success, remaining } = await limiter.limit(identifier);
  return { success, remaining };
}
