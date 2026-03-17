import { randomBytes, timingSafeEqual } from 'crypto';

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  const a = Buffer.from(token);
  const b = Buffer.from(storedToken);

  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(a, b);
}
