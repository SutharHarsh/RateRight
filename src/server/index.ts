import { createTRPCRouter } from './trpc';
import { calculationRouter } from './routers/calculation';
import { userRouter } from './routers/user';

export const appRouter = createTRPCRouter({
  calculation: calculationRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
