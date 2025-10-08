import { initTRPC } from '@trpc/server'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { type NextRequest } from 'next/server'

// Create a minimal tRPC setup
const t = initTRPC.create()

const router = t.router({
  hello: t.procedure.query(() => {
    return { message: 'Hello from simple tRPC!' }
  }),
})

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc-simple',
    req,
    router,
    createContext: () => ({}),
  })

export { handler as GET, handler as POST }
