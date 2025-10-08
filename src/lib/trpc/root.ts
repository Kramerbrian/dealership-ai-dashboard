import { router } from '../../lib/trpc';
import { dealershipRouter } from './routers/dealership';
import { analyticsRouter } from './routers/analytics';
import { optimizerRouter } from './routers/optimizer';

export const appRouter = router({
  dealership: dealershipRouter,
  analytics: analyticsRouter,
  optimizer: optimizerRouter,
});

export type AppRouter = typeof appRouter;
