/**
 * Automated Actual Scores Submission
 * 
 * This script automatically submits actual KPI scores for forecasts
 * that are 30+ days old and don't have actual scores yet.
 * 
 * Run via cron: 0 9 1 * * (first day of each month at 9 AM)
 * Or manually: npm run automate:actual-scores
 */

import { db } from "@/lib/db";
import { createForecastLog } from "@/lib/db/forecast-log";

interface ForecastToUpdate {
  id: string;
  timestamp: string;
  dealers: string[];
  forecast: Record<string, number>;
  daysSince: number;
}

/**
 * Get actual KPI scores from your data source
 * Replace this with your actual data source integration
 */
async function getActualKPIs(
  dealers: string[],
  date: Date
): Promise<Record<string, number> | null> {
  // TODO: Replace with your actual data source
  // Examples:
  
  // Option 1: From your API
  // const response = await fetch(`https://your-api.com/kpis?date=${date.toISOString()}`);
  // const data = await response.json();
  // return data.scores;
  
  // Option 2: From database
  // const scores = await db.scores.findMany({
  //   where: {
  //     dealerName: { in: dealers },
  //     date: date,
  //   },
  // });
  // return aggregateScores(scores);
  
  // Option 3: From Google Analytics / Search Console
  // const analytics = await getAnalyticsData(date);
  // return calculateKPIs(analytics);
  
  // For now, return null to skip (you'll implement your integration)
  console.log(`Would fetch KPIs for dealers: ${dealers.join(", ")} on ${date.toISOString()}`);
  return null;
}

/**
 * Get actual leads and revenue
 */
async function getActualRevenue(
  dealers: string[],
  date: Date
): Promise<{ leads: number; revenue: number } | null> {
  // TODO: Replace with your actual data source
  // Examples:
  // - From CRM system
  // - From Google Analytics
  // - From your database
  
  console.log(`Would fetch revenue for dealers: ${dealers.join(", ")} on ${date.toISOString()}`);
  return null;
}

/**
 * Submit actual scores for a forecast via API
 */
async function submitActualScores(
  forecastId: string,
  actualScores: Record<string, number>,
  actualLeads?: number,
  actualRevenue?: number
): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/forecast-actual`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        forecastId,
        actualScores,
        actualLeads,
        actualRevenue,
      }),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`Failed to submit actual scores for ${forecastId}:`, error);
      return false;
    }

    const result = await response.json();
    console.log(`✅ Submitted actual scores for ${forecastId}, accuracy: ${result.accuracy}`);
    return true;
  } catch (error) {
    console.error(`Error submitting actual scores for ${forecastId}:`, error);
    throw error; // Re-throw to trigger fallback
  }
}

/**
 * Update forecast directly in database (fallback when API unavailable)
 */
async function updateForecastDirectly(
  forecastId: string,
  actualScores: Record<string, number>,
  actualLeads?: number,
  actualRevenue?: number
): Promise<void> {
  if (!('forecastLog' in db) || typeof (db as any).forecastLog?.findUnique !== 'function') {
    throw new Error("Database not configured");
  }

  // Get forecast to calculate accuracy
  const forecast = await (db as any).forecastLog.findUnique({
    where: { id: forecastId },
  });

  if (!forecast) {
    throw new Error("Forecast not found");
  }

  // Parse forecast and calculate accuracy
  const forecastData = typeof forecast.forecast === 'string' 
    ? JSON.parse(forecast.forecast) 
    : forecast.forecast;

  // Calculate MAPE
  const kpis = ['AIV', 'ATI', 'CVI', 'ORI', 'GRI', 'DPI'];
  let totalError = 0;
  let validKPIs = 0;

  for (const kpi of kpis) {
    const predicted = forecastData[kpi];
    const actual = actualScores[kpi];

    if (predicted !== undefined && actual !== undefined && actual > 0) {
      const error = Math.abs((actual - predicted) / actual) * 100;
      totalError += error;
      validKPIs++;
    }
  }

  const accuracy = validKPIs > 0 ? 100 - (totalError / validKPIs) : null;

  // Update forecast
  await (db as any).forecastLog.update({
    where: { id: forecastId },
    data: {
      actualScores: JSON.stringify(actualScores),
      actualLeads,
      actualRevenue,
      accuracy,
    },
  });

  console.log(`✅ Updated forecast ${forecastId} directly, accuracy: ${accuracy?.toFixed(2)}%`);
}

/**
 * Main automation function
 */
async function automateActualScores() {
  console.log("🚀 Starting automated actual scores submission...");

  try {
    // Try to get forecasts from API first, fallback to database
    let forecasts: ForecastToUpdate[] = [];
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/forecast-actual/list`, {
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        forecasts = data.forecasts || [];
      } else {
        console.log("⚠️  API not available, trying database directly...");
        throw new Error("API not available");
      }
    } catch (apiError) {
      // Fallback: Query database directly
      console.log("📊 Querying database directly...");
      
      try {
        if ('forecastLog' in db && typeof (db as any).forecastLog?.findMany === 'function') {
          const dbForecasts = await (db as any).forecastLog.findMany({
            where: {
              actualScores: null,
            },
            orderBy: { timestamp: 'desc' },
            take: 50,
          });

          forecasts = dbForecasts.map((f: any) => {
            let forecast = null;
            let dealers = null;
            
            try {
              forecast = typeof f.forecast === 'string' ? JSON.parse(f.forecast) : f.forecast;
              dealers = typeof f.dealers === 'string' ? JSON.parse(f.dealers) : f.dealers;
            } catch (e) {
              // Keep as null if parsing fails
            }
            
            const daysSince = Math.floor(
              (Date.now() - new Date(f.timestamp).getTime()) / (1000 * 60 * 60 * 24)
            );
            
            return {
              id: f.id,
              timestamp: f.timestamp.toISOString(),
              dealers: dealers || [],
              forecast: forecast || {},
              daysSince,
            };
          });
        } else {
          throw new Error("Database model not available");
        }
      } catch (dbError: any) {
        // Suppress Prisma initialization errors - they're expected when running standalone
        const isPrismaError = dbError.message?.includes('datasource') || 
                              dbError.message?.includes('protocol') ||
                              dbError.name === 'PrismaClientInitializationError';
        
        if (isPrismaError) {
          console.log("ℹ️  Database not configured for standalone script execution");
          console.log("💡 This is normal when running outside the Next.js server");
          console.log("💡 The automation will work when:");
          console.log("   - Running via Vercel Cron (automatic)");
          console.log("   - Running with dev server: npm run dev (then use API)");
          console.log("   - DATABASE_URL is configured in environment");
        } else {
          console.log("⚠️  Database error:", dbError.message);
        }
        
        return {
          success: true,
          successCount: 0,
          skippedCount: 0,
          errorCount: 0,
          message: "No database/API available - automation will run automatically via Vercel Cron or when server is running.",
        };
      }
    }

    console.log(`Found ${forecasts.length} forecasts without actual scores`);

    // Filter to forecasts that are 30+ days old
    const readyForecasts = forecasts.filter((f) => f.daysSince >= 30);
    console.log(`${readyForecasts.length} forecasts are ready for actual score submission`);

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const forecast of readyForecasts) {
      const forecastDate = new Date(forecast.timestamp);
      const actualDate = new Date(forecastDate);
      actualDate.setDate(actualDate.getDate() + 30); // Date when actuals should be measured

      console.log(`\n📊 Processing forecast ${forecast.id} from ${forecastDate.toLocaleDateString()}`);

      // Get actual KPIs
      const actualScores = await getActualKPIs(forecast.dealers, actualDate);
      
      if (!actualScores) {
        console.log(`⏭️  Skipping ${forecast.id} - no actual scores available`);
        skippedCount++;
        continue;
      }

      // Get actual revenue (optional)
      const revenueData = await getActualRevenue(forecast.dealers, actualDate);
      
      // Submit actual scores (try API first, fallback to direct DB update)
      let success = false;
      
      try {
        success = await submitActualScores(
          forecast.id,
          actualScores,
          revenueData?.leads,
          revenueData?.revenue
        );
      } catch (apiError) {
        // Fallback: Update database directly
        console.log(`📝 Updating database directly for ${forecast.id}...`);
        try {
          await updateForecastDirectly(
            forecast.id,
            actualScores,
            revenueData?.leads,
            revenueData?.revenue
          );
          success = true;
        } catch (dbError: any) {
          console.error(`❌ Database update failed:`, dbError.message);
          console.log("💡 Tip: Ensure DATABASE_URL is configured or start the dev server");
          success = false;
        }
      }

      if (success) {
        successCount++;
      } else {
        errorCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("\n✅ Automation complete!");
    console.log(`   Success: ${successCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Errors: ${errorCount}`);

    return {
      success: errorCount === 0,
      successCount,
      skippedCount,
      errorCount,
    };
  } catch (error) {
    console.error("❌ Automation failed:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  automateActualScores()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { automateActualScores };

