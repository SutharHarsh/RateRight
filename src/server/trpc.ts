import { initTRPC, TRPCError } from '@trpc/server';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { prisma } from '@/lib/db';
import { getOptionalAuth } from '@/lib/auth';

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  const { req } = opts;
  const authContext = await getOptionalAuth();

  return {
    prisma,
    auth: authContext,
    req,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }: { shape: any; error: any }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(async ({ ctx, next }: { ctx: any; next: any }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const user = await ctx.prisma.user.findUnique({
    where: { clerkId: ctx.auth.userId },
  });

  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      userId: user.id,
      user,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

const enforceUserIsAdmin = t.middleware(async ({ ctx, next }: { ctx: any; next: any }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const user = await ctx.prisma.user.findUnique({
    where: { clerkId: ctx.auth.userId },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }

  return next({
    ctx: {
      ...ctx,
      userId: user.id,
      user,
    },
  });
});

export const adminProcedure = t.procedure.use(enforceUserIsAdmin);
