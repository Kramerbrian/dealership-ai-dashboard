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
 * Submit actual scores for a forecast
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
    return false;
  }
}

/**
 * Main automation function
 */
async function automateActualScores() {
  console.log("🚀 Starting automated actual scores submission...");

  try {
    // Get list of forecasts without actual scores
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/forecast-actual/list`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch forecast list");
    }

    const data = await response.json();
    const forecasts: ForecastToUpdate[] = data.forecasts || [];

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
      
      // Submit actual scores
      const success = await submitActualScores(
        forecast.id,
        actualScores,
        revenueData?.leads,
        revenueData?.revenue
      );

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

