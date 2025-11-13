import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Replace with your external economic feed once wired
    // For now, using a realistic simulation based on market patterns
    const now = Date.now();
    const dayMs = 8.64e7; // milliseconds in a day
    
    // Simulate TSM with realistic market volatility
    const baseTsm = 1.0;
    const dailyCycle = Math.sin(now / dayMs) * 0.1; // Daily market cycle
    const weeklyCycle = Math.sin(now / (dayMs * 7)) * 0.05; // Weekly cycle
    const randomVolatility = (Math.random() - 0.5) * 0.02; // Random volatility
    
    const tsm = baseTsm + dailyCycle + weeklyCycle + randomVolatility;
    
    // Ensure TSM stays within realistic bounds (0.8 - 1.3)
    const clampedTsm = Math.max(0.8, Math.min(1.3, tsm));
    
    // Add some metadata for context
    const metadata = {
      lastUpdated: new Date().toISOString(),
      source: "simulated",
      confidence: 0.85,
      trend: tsm > 1.0 ? "up" : "down",
      volatility: Math.abs(randomVolatility) * 100
    };

    return NextResponse.json({ 
      tsm: Number(clampedTsm.toFixed(3)),
      ...metadata
    });
  } catch (error) {
    console.error("TSM endpoint error:", error);
    return NextResponse.json({ error: "Failed to fetch TSM data" }, { status: 500 });
  }
}
