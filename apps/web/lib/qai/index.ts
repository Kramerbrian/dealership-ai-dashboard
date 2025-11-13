// Master QAI Calculation Engine
// Combines all components into final QAI score

import { QAICalculationInput, QAIScore } from './types'
import { calculatePIQR, fetchPIQRData } from './piqr'
import { calculateHRP, fetchHRPData } from './hrp'
import { calculateVAI, fetchVAIData } from './vai'
import { calculateOCI, fetchOCIData } from './oci'
import { geoPoolingEngine } from '../geo-pooling'
import { getCached, cacheKeys } from '../redis'

export async function calculateQAI(input: QAICalculationInput): Promise<QAIScore> {
  try {
    // Check cache first
    const cacheKey = cacheKeys.qaiScore(input.domain)
    const cached = await getCached(cacheKey, 3600, async () => {
      return await performQAICalculation(input)
    })

    return cached
  } catch (error) {
    console.error('QAI calculation error:', error)
    throw new Error('Failed to calculate QAI score')
  }
}

async function performQAICalculation(input: QAICalculationInput): Promise<QAIScore> {
  // Use geographic pooling for free tier users
  if (input.useGeographicPooling) {
    const pooledData = await geoPoolingEngine.generatePooledData(
      input.domain,
      input.location,
      input.dealershipName
    )
    
    return {
      qai_star_score: pooledData.qai_score,
      piqr_score: pooledData.piqr_score,
      hrp_score: pooledData.hrp_score,
      vai_score: pooledData.vai_score,
      oci_score: pooledData.oci_score,
      breakdown: pooledData.breakdown,
      geographic_pooling_applied: true,
      timestamp: new Date()
    }
  }

  // Fetch all component data
  const [piqrData, hrpData, vaiData, ociData] = await Promise.all([
    fetchPIQRData(input.domain),
    fetchHRPData(input.domain),
    fetchVAIData(input.domain),
    fetchOCIData(input.domain)
  ])

  // Calculate individual scores
  const piqr_score = calculatePIQR(piqrData)
  const hrp_score = calculateHRP(hrpData)
  const vai_score = calculateVAI(vaiData)
  const oci_score = calculateOCI(ociData)

  // Calculate weighted QAI score
  const weights = {
    piqr: 0.30,
    hrp: 0.25,
    vai: 0.25,
    oci: 0.20
  }

  const qai_star_score = Math.round(
    (piqr_score * weights.piqr) +
    (hrp_score * weights.hrp) +
    (vai_score * weights.vai) +
    (oci_score * weights.oci)
  )

  // Calculate breakdown
  const breakdown = {
    aiVisibility: Math.floor(qai_star_score * 0.4),
    zeroClickShield: Math.floor(qai_star_score * 0.2),
    ugcHealth: Math.floor(qai_star_score * 0.2),
    geoTrust: Math.floor(qai_star_score * 0.15),
    sgpIntegrity: Math.floor(qai_star_score * 0.05)
  }

  return {
    qai_star_score,
    piqr_score,
    hrp_score,
    vai_score,
    oci_score,
    breakdown,
    geographic_pooling_applied: false,
    timestamp: new Date()
  }
}

export async function calculateQAIWithGeographicPooling(
  input: QAICalculationInput
): Promise<QAIScore> {
  return await calculateQAI({
    ...input,
    useGeographicPooling: true
  })
}