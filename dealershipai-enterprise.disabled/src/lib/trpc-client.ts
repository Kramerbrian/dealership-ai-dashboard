import { createTRPCReact } from '@trpc/react-query'

// Define a minimal AppRouter type for the client
type AppRouter = {
  test: {
    hello: {
      query: () => Promise<string>
    }
  }
}

export const api = createTRPCReact<AppRouter>()

// Export the client for use in components
export { api as trpc }