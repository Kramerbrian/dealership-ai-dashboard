import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { vin, offerData } = await req.json();
    
    if (!vin || !offerData) {
      return NextResponse.json(
        { error: 'VIN and offer data are required' },
        { status: 400 }
      );
    }
    
    // Validate VIN format
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      return NextResponse.json(
        { error: 'Invalid VIN format' },
        { status: 400 }
      );
    }
    
    // Get inventory item
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { vin },
      include: {
        paritySnapshots: {
          orderBy: { capturedAt: 'desc' },
          take: 1
        }
      }
    });
    
    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'VIN not found in inventory' },
        { status: 404 }
      );
    }
    
    // Calculate validation score
    const validationScore = await calculateValidationScore(inventoryItem, offerData);
    
    // Check if offer is valid
    const isValid = validationScore >= 0.8;
    const confidence = validationScore;
    
    // Log validation event
    await prisma.intelTaskEvent.create({
      data: {
        taskId: null,
        eventType: 'offer_validation',
        eventData: {
          vin,
          offerData,
          validationScore,
          isValid,
          timestamp: new Date().toISOString()
        }
      }
    });
    
    return NextResponse.json({
      validation: {
        isValid,
        confidence,
        score: validationScore,
        reasons: getValidationReasons(validationScore),
        inventoryData: {
          freshnessScore: inventoryItem.freshnessScore,
          retailReadyScore: inventoryItem.retailReadyScore,
          lastPriceChange: inventoryItem.lastPriceChange,
          lastPhotoRefresh: inventoryItem.lastPhotoRefresh
        }
      }
    });
    
  } catch (error) {
    console.error('Offer validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function calculateValidationScore(inventoryItem: any, offerData: any): Promise<number> {
  let score = 0;
  let factors = 0;
  
  // Freshness factor (30% weight)
  const freshnessWeight = 0.3;
  const freshnessScore = inventoryItem.freshnessScore / 100;
  score += freshnessScore * freshnessWeight;
  factors += freshnessWeight;
  
  // Price consistency factor (40% weight)
  const priceWeight = 0.4;
  const latestPrice = inventoryItem.paritySnapshots[0]?.price;
  if (latestPrice) {
    const priceDiff = Math.abs(offerData.price - latestPrice) / latestPrice;
    const priceConsistency = Math.max(0, 1 - priceDiff);
    score += priceConsistency * priceWeight;
  }
  factors += priceWeight;
  
  // Retail readiness factor (30% weight)
  const retailWeight = 0.3;
  const retailScore = inventoryItem.retailReadyScore / 100;
  score += retailScore * retailWeight;
  factors += retailWeight;
  
  return factors > 0 ? score / factors : 0;
}

function getValidationReasons(score: number): string[] {
  const reasons: string[] = [];
  
  if (score >= 0.9) {
    reasons.push('Excellent data freshness and consistency');
  } else if (score >= 0.8) {
    reasons.push('Good data quality with minor inconsistencies');
  } else if (score >= 0.7) {
    reasons.push('Acceptable data quality with some concerns');
  } else if (score >= 0.6) {
    reasons.push('Poor data quality - manual review recommended');
  } else {
    reasons.push('Very poor data quality - offer not recommended');
  }
  
  return reasons;
}
