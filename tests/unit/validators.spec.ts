import { describe, it, expect } from 'vitest'
import { densityScore, readabilityScore } from '@/lib/seo/validators'

describe('validators', () => {
  it('density ok', () => {
    const r = densityScore('word '.repeat(100))
    expect(typeof r.density).toBe('number')
  })
  it('readability ok', () => {
    const r = readabilityScore('This is a sentence. This is another one.')
    expect(r.flesch).toBeTypeOf('number')
  })
})
