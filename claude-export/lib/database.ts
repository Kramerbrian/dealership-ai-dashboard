/**
 * Database connection and utilities
 */

// Mock Prisma client for build when database is not available
export const prisma = {
  user: {
    findUnique: async () => null,
    create: async () => ({ id: 'mock-user-id' }),
    update: async () => ({ id: 'mock-user-id' }),
    delete: async () => ({ id: 'mock-user-id' })
  },
  subscription: {
    findUnique: async () => null,
    create: async () => ({ id: 'mock-subscription-id' }),
    update: async () => ({ id: 'mock-subscription-id' }),
    delete: async () => ({ id: 'mock-subscription-id' })
  },
  dealership: {
    findUnique: async () => null,
    create: async () => ({ id: 'mock-dealership-id' }),
    update: async () => ({ id: 'mock-dealership-id' }),
    delete: async () => ({ id: 'mock-dealership-id' })
  },
  qaiScore: {
    findUnique: async () => null,
    create: async () => ({ id: 'mock-qai-score-id' }),
    update: async () => ({ id: 'mock-qai-score-id' }),
    delete: async () => ({ id: 'mock-qai-score-id' })
  }
};

export default prisma;
