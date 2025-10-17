import { describe, it, expect } from 'vitest'
import { thompsonAllocate } from '@/lib/seo/variant'

describe('allocation', () => {
  it('allocates traffic', () => {
    const res = thompsonAllocate([
      { variantId: 'v1', a: 12, b: 8 },
      { variantId: 'v2', a: 8, b: 12 },
    ], 200)
    expect(res.reduce((s,r)=>s+r.allocated,0)).toBe(200)
  })
})
