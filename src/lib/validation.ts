import { z } from 'zod';

export const calculationSchema = z.object({
  platform: z.string().min(1).max(50),
  username: z.string().max(100).optional(),
  followerCount: z.number().int().min(100).max(100000000),
  engagementRate: z.number().min(0).max(100),
  contentType: z.string().min(1).max(50),
  niche: z.string().min(1).max(50),
  audienceLocation: z.string().min(1).max(100),
  deliverables: z.string().min(1).max(100),
  usageRights: z.string().min(1).max(50),
  exclusivity: z.string().min(1).max(50),
});

export const rateCardSchema = z.object({
  creatorName: z.string().min(1).max(100),
  handle: z.string().max(50).optional(),
  platform: z.string().min(1).max(50),
  followers: z.number().int().min(100).max(100000000),
  engagementRate: z.number().min(0).max(100),
  niche: z.string().min(1).max(50),
  singlePostRate: z.number().min(0).max(1000000),
});

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[<>]/g, '');
}

export function validateCalculation(data: unknown) {
  return calculationSchema.safeParse(data);
}

export function validateRateCard(data: unknown) {
  return rateCardSchema.safeParse(data);
}
