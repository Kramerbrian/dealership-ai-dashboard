import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Simple API test working!",
    timestamp: new Date().toISOString(),
    confidence_intervals: {
      ai_visibility: {
        scores: [78, 82, 75, 85, 79, 81, 77, 83, 80, 76],
        mean: 79.6,
        confidence_interval: "77.6-81.6"
      },
      conversion_rate: {
        conversions: 45,
        total: 1000,
        rate: "4.5%",
        confidence_interval: "3.2%-5.8%"
      },
      revenue: {
        revenues: [15000, 18000, 16500, 22000, 19500],
        mean: 18200,
        confidence_interval: "$15,828-$20,572"
      }
    }
  })
}
