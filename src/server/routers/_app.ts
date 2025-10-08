import { createTRPCRouter } from '../trpc-server';
import { dealershipRouter } from './dealership';
import { analyticsRouter } from './analytics';
import { auditRouter } from './audit';
import { competitorRouter } from './competitor';
import { recommendationRouter } from './recommendation';
import { marketRouter } from './market';
import { appraisalRouter } from './appraisal';
import { sourcesRouter } from './sources';
import { aoerRouter } from './aoer';
// import { algorithmicVisibilityRouter } from './algorithmic-visibility'; // Disabled - causes Vercel build errors with drizzle-orm

/**
 * Main tRPC router
 * All routers are merged here
 */
export const appRouter = createTRPCRouter({
  dealership: dealershipRouter,
  analytics: analyticsRouter,
  audit: auditRouter,
  competitor: competitorRouter,
  recommendation: recommendationRouter,
  market: marketRouter,
  appraisal: appraisalRouter,
  sources: sourcesRouter,
  aoer: aoerRouter,
  // algorithmicVisibility: algorithmicVisibilityRouter, // Disabled - causes Vercel build errors with drizzle-orm
});

// Export type definition of API
export type AppRouter = typeof appRouter;
