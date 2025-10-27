// Mock Prisma client for development
export const prisma = {
  user: {
    findUnique: async (args: any) => ({
      id: 'mock-user-id',
      clerk_id: 'mock-clerk-id',
      tier: 'FREE'
    }),
    create: async (args: any) => ({ id: 'mock-user-id' }),
    update: async (args: any) => ({ id: 'mock-user-id' })
  },
  session: {
    create: async (args: any) => ({ id: 'mock-session-id' }),
    findMany: async (args: any) => []
  },
  dealership: {
    findUnique: async (args: any) => ({
      id: 'mock-dealership-id',
      name: 'Mock Dealership'
    })
  }
};