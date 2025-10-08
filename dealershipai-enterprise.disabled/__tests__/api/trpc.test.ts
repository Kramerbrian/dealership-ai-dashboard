import { createTRPCMsw } from 'msw-trpc'
import { appRouter } from '@/server/routers/_app'
import { createTRPCContext } from '@/lib/trpc'

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findMany: jest.fn(() => Promise.resolve([
        {
          id: 'test-user-1',
          email: 'test@dealershipai.com',
          full_name: 'Test User',
          role: 'dealership_admin',
          tenant_id: 'test-tenant-1',
        },
      ])),
    },
    tenant: {
      findUnique: jest.fn(() => Promise.resolve({
        id: 'test-tenant-1',
        name: 'Test Dealership',
        type: 'dealership',
        subscription_tier: 'tier_1',
        subscription_status: 'active',
        mrr: 499,
      })),
    },
    dealershipData: {
      findMany: jest.fn(() => Promise.resolve([
        {
          id: '1',
          name: 'Test Dealership',
          domain: 'test.com',
          city: 'Test City',
          state: 'TC',
          tier: 1,
          established_date: new Date('2020-01-01'),
        },
      ])),
    },
  },
}))

describe('tRPC API', () => {
  const trpcMsw = createTRPCMsw(appRouter)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('test.hello', () => {
    it('returns hello message', async () => {
      const caller = appRouter.createCaller(await createTRPCContext({} as any))
      const result = await caller.test.hello()
      
      expect(result).toEqual({
        message: 'Hello from tRPC!',
      })
    })
  })

  describe('dealership.getAll', () => {
    it('returns all dealerships', async () => {
      const caller = appRouter.createCaller(await createTRPCContext({} as any))
      const result = await caller.dealership.getAll()
      
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: '1',
        name: 'Test Dealership',
        domain: 'test.com',
        city: 'Test City',
        state: 'TC',
        tier: 1,
      })
    })
  })

  describe('dealership.create', () => {
    it('creates a new dealership', async () => {
      const caller = appRouter.createCaller(await createTRPCContext({} as any))
      const newDealership = {
        name: 'New Dealership',
        domain: 'newdealership.com',
        city: 'New City',
        state: 'NC',
        tier: 2,
      }
      
      const result = await caller.dealership.create(newDealership)
      
      expect(result).toMatchObject({
        name: 'New Dealership',
        domain: 'newdealership.com',
        city: 'New City',
        state: 'NC',
        tier: 2,
      })
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('established_date')
    })
  })
})
