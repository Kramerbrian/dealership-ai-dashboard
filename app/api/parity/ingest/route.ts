import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { snapshots } = await req.json();
    
    if (!snapshots || !Array.isArray(snapshots)) {
      return NextResponse.json(
        { error: 'Snapshots array is required' },
        { status: 400 }
      );
    }
    
    const results = [];
    
    for (const snapshot of snapshots) {
      const { vin, sourceOfTruth, price, availability, dealerId } = snapshot;
      
      // Validate required fields
      if (!vin || !sourceOfTruth || !dealerId) {
        results.push({
          vin,
          error: 'Missing required fields: vin, sourceOfTruth, dealerId'
        });
        continue;
      }
      
      // Create parity snapshot
      const paritySnapshot = await (prisma as any).paritySnapshot.create({
        data: {
          vin,
          sourceOfTruth,
          price: price || null,
          availability: availability !== undefined ? availability : true,
          dealerId
        }
      });
      
      // Update inventory item if it exists
      const inventoryItem = await (prisma as any).inventoryItem.findUnique({
        where: { vin }
      });
      
      if (inventoryItem) {
        // Calculate new parity match rate
        const allSnapshots = await (prisma as any).paritySnapshot.findMany({
          where: { vin },
          orderBy: { capturedAt: 'desc' },
          take: 10
        });
        
        const matchRate = calculateParityMatchRate(allSnapshots);
        
        // Update inventory item
        await (prisma as any).inventoryItem.update({
          where: { vin },
          data: {
            parityMatchRate: matchRate,
            updatedAt: new Date()
          }
        });
        
        // Create score snapshot
        await (prisma as any).scoreSnapshot.create({
          data: {
            vin,
            scoreType: 'parity_match',
            scoreValue: matchRate,
            modelVersion: 'v1.0'
          }
        });
      }
      
      results.push({
        vin,
        success: true,
        snapshotId: paritySnapshot.id
      });
    }
    
    return NextResponse.json({
      success: true,
      results,
      totalProcessed: snapshots.length,
      successful: results.filter(r => r.success).length
    });
    
  } catch (error) {
    console.error('Parity ingest error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateParityMatchRate(snapshots: any[]): number {
  if (snapshots.length < 2) return 100;
  
  let totalMatches = 0;
  let totalComparisons = 0;
  
  // Compare each snapshot with the most recent one
  const latestSnapshot = snapshots[0];
  
  for (let i = 1; i < snapshots.length; i++) {
    const snapshot = snapshots[i];
    
    // Compare price if both have prices
    if (latestSnapshot.price && snapshot.price) {
      const priceDiff = Math.abs(latestSnapshot.price - snapshot.price);
      const priceMatch = priceDiff < 100; // Within $100
      totalMatches += priceMatch ? 1 : 0;
      totalComparisons++;
    }
    
    // Compare availability
    if (latestSnapshot.availability === snapshot.availability) {
      totalMatches += 1;
      totalComparisons++;
    }
  }
  
  return totalComparisons > 0 ? (totalMatches / totalComparisons) * 100 : 100;
}
