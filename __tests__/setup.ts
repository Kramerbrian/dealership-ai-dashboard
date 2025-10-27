// Test setup and configuration
import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';

// Test database setup
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/dealershipai_test'
    }
  }
});

// Test Redis setup
const redis = new Redis({
  url: process.env.TEST_REDIS_URL || 'redis://localhost:6379',
  token: process.env.TEST_REDIS_TOKEN || 'test-token'
});

// Global test setup
beforeAll(async () => {
  // Clean test database
  await prisma.$executeRaw`TRUNCATE TABLE "AuditLog", "ApiKey", "AutomatedFix", "BusinessMetric", "Client", "Commission", "Dealership", "ErrorEvent", "GeoPool", "Partner", "PerformanceMetric", "Score", "Session", "Subscription", "User" RESTART IDENTITY CASCADE`;
  
  // Clean test Redis
  await redis.flushall();
  
  console.log('Test environment initialized');
});

afterAll(async () => {
  // Cleanup
  await prisma.$disconnect();
  await redis.flushall();
  
  console.log('Test environment cleaned up');
});

beforeEach(async () => {
  // Reset database state before each test
  await prisma.$executeRaw`TRUNCATE TABLE "AuditLog", "ApiKey", "AutomatedFix", "BusinessMetric", "Client", "Commission", "Dealership", "ErrorEvent", "GeoPool", "Partner", "PerformanceMetric", "Score", "Session", "Subscription", "User" RESTART IDENTITY CASCADE`;
});

afterEach(async () => {
  // Clean Redis after each test
  await redis.flushall();
});

// Export test utilities
export { prisma, redis };

// Mock external services
export const mockExternalServices = {
  stripe: {
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn()
    },
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn()
    },
    checkout: {
      sessions: {
        create: jest.fn()
      }
    },
    webhooks: {
      constructEvent: jest.fn()
    }
  },
  
  clerk: {
    users: {
      getUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn()
    },
    sessions: {
      getSession: jest.fn(),
      revokeSession: jest.fn()
    }
  },
  
  google: {
    mybusiness: {
      accounts: {
        list: jest.fn(),
        get: jest.fn()
      }
    },
    places: {
      details: jest.fn()
    }
  },
  
  openai: {
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }
};

// Test data factories
export const testData = {
  user: {
    clerkId: 'test_user_123',
    email: 'test@dealershipai.com',
    firstName: 'Test',
    lastName: 'User',
    plan: 'FREE' as const
  },
  
  dealership: {
    name: 'Test Dealership',
    domain: 'testdealership.com',
    city: 'Test City',
    state: 'FL',
    zipCode: '12345',
    phone: '(555) 123-4567'
  },
  
  score: {
    overallScore: 75.5,
    aiVisibility: 80,
    zeroClickShield: 70,
    ugcHealth: 85,
    geoTrust: 75,
    sgpIntegrity: 65
  }
};

// Helper functions
export const createTestUser = async (overrides = {}) => {
  return await prisma.user.create({
    data: {
      ...testData.user,
      ...overrides
    }
  });
};

export const createTestDealership = async (userId: string, overrides = {}) => {
  return await prisma.dealership.create({
    data: {
      ...testData.dealership,
      userId,
      ...overrides
    }
  });
};

export const createTestScore = async (dealershipId: string, overrides = {}) => {
  return await prisma.score.create({
    data: {
      ...testData.score,
      dealershipId,
      ...overrides
    }
  });
};

// API test helpers
export const createTestRequest = (body: any, headers: Record<string, string> = {}) => {
  return {
    json: async () => body,
    headers: {
      'content-type': 'application/json',
      'user-agent': 'test-agent',
      ...headers
    }
  } as Request;
};

export const createTestResponse = (data: any, status = 200) => {
  return {
    json: async () => data,
    status,
    headers: new Headers()
  };
};

// Performance testing utilities
export const measurePerformance = async (fn: () => Promise<any>) => {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  
  return {
    result,
    duration,
    performance: duration < 1000 ? 'good' : duration < 3000 ? 'acceptable' : 'poor'
  };
};

// Load testing utilities
export const loadTest = async (fn: () => Promise<any>, concurrency = 10, iterations = 100) => {
  const results = [];
  const errors = [];
  
  const promises = Array(concurrency).fill(null).map(async () => {
    for (let i = 0; i < iterations / concurrency; i++) {
      try {
        const result = await fn();
        results.push(result);
      } catch (error) {
        errors.push(error);
      }
    }
  });
  
  await Promise.all(promises);
  
  return {
    success: results.length,
    errors: errors.length,
    successRate: (results.length / (results.length + errors.length)) * 100
  };
};
