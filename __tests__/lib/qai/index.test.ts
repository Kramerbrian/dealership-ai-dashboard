import { calculateQAI } from '@/lib/qai'

// Mock the individual calculation functions
jest.mock('@/lib/qai/piqr', () => ({
  calculatePIQR: jest.fn(() => 85),
}))

jest.mock('@/lib/qai/hrp', () => ({
  calculateHRP: jest.fn(() => 78),
}))

jest.mock('@/lib/qai/vai', () => ({
  calculateVAI: jest.fn(() => 92),
}))

jest.mock('@/lib/qai/oci', () => ({
  calculateOCI: jest.fn(() => 88),
}))

describe('QAI Calculation', () => {
  const mockInput = {
    domain: 'test-dealership.com',
    dealershipName: 'Test Dealership',
    location: 'Naples, FL',
    useGeographicPooling: false,
  }

  it('calculates QAI score correctly', async () => {
    const result = await calculateQAI(mockInput)

    expect(result).toHaveProperty('qai_star_score')
    expect(result).toHaveProperty('piqr_score')
    expect(result).toHaveProperty('hrp_score')
    expect(result).toHaveProperty('vai_score')
    expect(result).toHaveProperty('oci_score')
    expect(result).toHaveProperty('breakdown')
  })

  it('returns scores within valid range', async () => {
    const result = await calculateQAI(mockInput)

    expect(result.qai_star_score).toBeGreaterThanOrEqual(0)
    expect(result.qai_star_score).toBeLessThanOrEqual(100)
    expect(result.piqr_score).toBeGreaterThanOrEqual(0)
    expect(result.piqr_score).toBeLessThanOrEqual(100)
    expect(result.hrp_score).toBeGreaterThanOrEqual(0)
    expect(result.hrp_score).toBeLessThanOrEqual(100)
    expect(result.vai_score).toBeGreaterThanOrEqual(0)
    expect(result.vai_score).toBeLessThanOrEqual(100)
    expect(result.oci_score).toBeGreaterThanOrEqual(0)
    expect(result.oci_score).toBeLessThanOrEqual(100)
  })

  it('includes breakdown with all components', async () => {
    const result = await calculateQAI(mockInput)

    expect(result.breakdown).toHaveProperty('aiVisibility')
    expect(result.breakdown).toHaveProperty('zeroClickShield')
    expect(result.breakdown).toHaveProperty('ugcHealth')
    expect(result.breakdown).toHaveProperty('geoTrust')
    expect(result.breakdown).toHaveProperty('sgpIntegrity')
  })

  it('handles geographic pooling', async () => {
    const result = await calculateQAI({
      ...mockInput,
      useGeographicPooling: true,
    })

    expect(result).toHaveProperty('qai_star_score')
    expect(result).toHaveProperty('geographic_pooling_applied', true)
  })

  it('handles errors gracefully', async () => {
    // Mock a function to throw an error
    const { calculatePIQR } = require('@/lib/qai/piqr')
    calculatePIQR.mockRejectedValueOnce(new Error('API Error'))

    await expect(calculateQAI(mockInput)).rejects.toThrow('API Error')
  })
})
