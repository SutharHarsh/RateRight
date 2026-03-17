import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const userRouter = createTRPCRouter({
  getCurrent: protectedProcedure.query(async ({ ctx }: { ctx: any }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
    });

    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    return user;
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: input,
      });

      return user;
    }),

  delete: protectedProcedure.mutation(async ({ ctx }: { ctx: any }) => {
    await ctx.prisma.user.delete({
      where: { id: ctx.userId },
    });

    return { success: true };
  }),

  getUsage: protectedProcedure.query(async ({ ctx }: { ctx: any }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
    });

    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    return {
      plan: user.plan,
      calculationsUsed: user.calculationsUsed,
      calculationsLimit: user.calculationsLimit,
      periodStart: user.periodStart,
      periodEnd: user.periodEnd,
    };
  }),
});
