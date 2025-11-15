import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { scenario } = await req.json();
    
    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario data is required' },
        { status: 400 }
      );
    }
    
    const { 
      dealerId, 
      freshnessImprovement, 
      parityImprovement, 
      policyImprovement,
      stickerImprovement 
    } = scenario;
    
    // Get current inventory data
    const inventoryItems = await (prisma as any).inventoryItem.findMany({
      where: { dealerId },
      include: {
        paritySnapshots: {
          orderBy: { capturedAt: 'desc' },
          take: 1
        }
      }
    });
    
    if (inventoryItems.length === 0) {
      return NextResponse.json(
        { error: 'No inventory items found for dealer' },
        { status: 404 }
      );
    }
    
    // Simulate impact of improvements
    const simulationResults = await simulateImpact(
      inventoryItems,
      {
        freshnessImprovement: freshnessImprovement || 0,
        parityImprovement: parityImprovement || 0,
        policyImprovement: policyImprovement || 0,
        stickerImprovement: stickerImprovement || 0
      }
    );
    
    // Calculate revenue impact
    const revenueImpact = calculateRevenueImpact(simulationResults);
    
    // Generate recommendations
    const recommendations = generateRecommendations(simulationResults);
    
    return NextResponse.json({
      impact: {
        currentMetrics: simulationResults.current,
        projectedMetrics: simulationResults.projected,
        revenueImpact,
        recommendations,
        confidence: simulationResults.confidence
      }
    });
    
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function simulateImpact(inventoryItems: any[], improvements: any) {
  const current = {
    avgFreshness: 0,
    avgParity: 0,
    avgPolicy: 0,
    avgSticker: 0,
    avgRetailReady: 0,
    retailReadyCount: 0,
    totalItems: inventoryItems.length
  };
  
  const projected = {
    avgFreshness: 0,
    avgParity: 0,
    avgPolicy: 0,
    avgSticker: 0,
    avgRetailReady: 0,
    retailReadyCount: 0,
    totalItems: inventoryItems.length
  };
  
  let totalFreshness = 0;
  let totalParity = 0;
  let totalPolicy = 0;
  let totalSticker = 0;
  let totalRetailReady = 0;
  let retailReadyCount = 0;
  
  for (const item of inventoryItems) {
    totalFreshness += item.freshnessScore;
    totalParity += item.parityMatchRate;
    totalPolicy += item.policyComplianceScore;
    totalSticker += item.stickerParityScore;
    totalRetailReady += item.retailReadyScore;
    
    if (item.retailReadyScore >= 85) {
      retailReadyCount++;
    }
  }
  
  // Current metrics
  current.avgFreshness = totalFreshness / inventoryItems.length;
  current.avgParity = totalParity / inventoryItems.length;
  current.avgPolicy = totalPolicy / inventoryItems.length;
  current.avgSticker = totalSticker / inventoryItems.length;
  current.avgRetailReady = totalRetailReady / inventoryItems.length;
  current.retailReadyCount = retailReadyCount;
  
  // Projected metrics with improvements
  projected.avgFreshness = Math.min(100, current.avgFreshness + improvements.freshnessImprovement);
  projected.avgParity = Math.min(100, current.avgParity + improvements.parityImprovement);
  projected.avgPolicy = Math.min(100, current.avgPolicy + improvements.policyImprovement);
  projected.avgSticker = Math.min(100, current.avgSticker + improvements.stickerImprovement);
  
  // Recalculate retail readiness with projected metrics
  projected.avgRetailReady = (
    0.3 * projected.avgFreshness +
    0.35 * projected.avgParity +
    0.2 * projected.avgSticker +
    0.15 * projected.avgPolicy
  );
  
  // Count projected retail ready items
  projected.retailReadyCount = Math.round(
    (projected.avgRetailReady / 100) * inventoryItems.length
  );
  
  return {
    current,
    projected,
    confidence: calculateConfidence(improvements)
  };
}

function calculateRevenueImpact(results: any) {
  const retailReadyImprovement = results.projected.retailReadyCount - results.current.retailReadyCount;
  
  // Estimate revenue impact based on retail ready improvement
  const avgVehicleValue = 35000; // Average vehicle value
  const conversionRateImprovement = retailReadyImprovement * 0.15; // 15% conversion improvement per retail ready vehicle
  const monthlyRevenueImpact = conversionRateImprovement * avgVehicleValue;
  const annualRevenueImpact = monthlyRevenueImpact * 12;
  
  return {
    retailReadyImprovement,
    monthlyRevenueImpact,
    annualRevenueImpact,
    roi: annualRevenueImpact / 499 // ROI based on $499/month cost
  };
}

function generateRecommendations(results: any) {
  const recommendations = [];
  
  if (results.current.avgFreshness < 80) {
    recommendations.push({
      priority: 'high',
      category: 'freshness',
      title: 'Improve Data Freshness',
      description: 'Update prices, photos, and mileage more frequently',
      impact: 'High revenue impact',
      effort: 'Medium'
    });
  }
  
  if (results.current.avgParity < 85) {
    recommendations.push({
      priority: 'high',
      category: 'parity',
      title: 'Fix Data Parity Issues',
      description: 'Ensure consistency across all sales channels',
      impact: 'High revenue impact',
      effort: 'High'
    });
  }
  
  if (results.current.avgPolicy < 90) {
    recommendations.push({
      priority: 'medium',
      category: 'policy',
      title: 'Improve Policy Compliance',
      description: 'Review and update pricing policies for transparency',
      impact: 'Medium revenue impact',
      effort: 'Low'
    });
  }
  
  if (results.current.avgSticker < 95) {
    recommendations.push({
      priority: 'low',
      category: 'sticker',
      title: 'Enhance Sticker Parity',
      description: 'Improve window sticker data accuracy',
      impact: 'Low revenue impact',
      effort: 'Medium'
    });
  }
  
  return recommendations;
}

function calculateConfidence(improvements: any) {
  let confidence = 0.8; // Base confidence
  
  // Adjust confidence based on improvement magnitude
  const totalImprovement = Object.values(improvements).reduce((sum: number, val: any) => sum + val, 0);
  
  if (totalImprovement > 50) {
    confidence = 0.9; // High confidence for large improvements
  } else if (totalImprovement > 20) {
    confidence = 0.85; // Medium-high confidence
  } else if (totalImprovement < 5) {
    confidence = 0.7; // Lower confidence for small improvements
  }
  
  return confidence;
}
