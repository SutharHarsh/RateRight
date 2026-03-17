import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { calculateRate } from '@/lib/calculations';
import { TRPCError } from '@trpc/server';

export const calculationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        platform: z.string(),
        username: z.string().optional(),
        followerCount: z.number(),
        engagementRate: z.number(),
        contentType: z.string(),
        niche: z.string(),
        audienceLocation: z.string(),
        deliverables: z.string(),
        usageRights: z.string(),
        exclusivity: z.string(),
      })
    )
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      // Check usage limits
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.userId },
      });

      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Check if user has exceeded free tier limit
      if (user.plan === 'FREE' && user.calculationsUsed >= user.calculationsLimit) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You have reached your free calculation limit. Please upgrade to Premium.',
        });
      }

      // Calculate rate
      const result = await calculateRate({
        platform: input.platform,
        followerCount: input.followerCount,
        engagementRate: input.engagementRate,
        contentType: input.contentType,
        niche: input.niche,
        usageRights: input.usageRights,
        exclusivity: input.exclusivity,
      });

      // Save calculation
      const calculation = await ctx.prisma.calculation.create({
        data: {
          userId: ctx.userId,
          ...input,
          minRate: result.minRate,
          maxRate: result.maxRate,
          recommendedRate: result.recommendedRate,
          baseRate: result.baseRate,
          nicheMultiplier: result.nicheMultiplier,
          usageRightsPremium: result.usageRightsPremium,
          exclusivityPremium: result.exclusivityPremium,
          confidenceScore: result.confidenceScore,
          dataPoints: result.dataPoints,
        },
      });

      // Increment usage counter
      await ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: {
          calculationsUsed: user.calculationsUsed + 1,
        },
      });

      // Track analytics
      await ctx.prisma.analytics.create({
        data: {
          eventType: 'calculator_completed',
          userId: ctx.userId,
          metadata: {
            platform: input.platform,
            niche: input.niche,
            rateRange: `${result.minRate}-${result.maxRate}`,
          },
        },
      });

      return calculation;
    }),

  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }: { ctx: any; input: any }) => {
      const calculations = await ctx.prisma.calculation.findMany({
        where: { userId: ctx.userId },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      let nextCursor: string | undefined = undefined;
      if (calculations.length > input.limit) {
        const nextItem = calculations.pop();
        nextCursor = nextItem?.id;
      }

      return {
        calculations,
        nextCursor,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }: { ctx: any; input: any }) => {
      const calculation = await ctx.prisma.calculation.findUnique({
        where: { id: input.id },
      });

      if (!calculation || calculation.userId !== ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return calculation;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      const calculation = await ctx.prisma.calculation.findUnique({
        where: { id: input.id },
      });

      if (!calculation || calculation.userId !== ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      await ctx.prisma.calculation.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  getStats: protectedProcedure.query(async ({ ctx }: { ctx: any }) => {
    const calculations = await ctx.prisma.calculation.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: 'desc' },
    });

    const totalCalculations = calculations.length;
    const averageRate =
      totalCalculations > 0
        ? calculations.reduce((sum: number, calc: any) => sum + calc.recommendedRate, 0) / totalCalculations
        : 0;
    const highestRate =
      totalCalculations > 0
        ? Math.max(...calculations.map((calc: any) => calc.maxRate))
        : 0;
    const potentialEarnings = calculations.reduce(
      (sum: number, calc: any) => sum + calc.recommendedRate,
      0
    );

    return {
      totalCalculations,
      averageRate,
      highestRate,
      potentialEarnings,
    };
  }),
});
