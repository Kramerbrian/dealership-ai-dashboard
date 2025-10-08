import { createTRPCRouter, publicProcedure } from '@/lib/trpc'

export const testRouter = createTRPCRouter({
  hello: publicProcedure
    .query(async () => {
      return { message: 'Hello from tRPC!' }
    }),
})
