import { createTRPCRouter } from '@/lib/trpc'
import { testRouter } from './test'

export const appRouter = createTRPCRouter({
  test: testRouter,
})

export type AppRouter = typeof appRouter
