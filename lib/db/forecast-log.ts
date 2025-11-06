/**
 * Forecast Log Database Operations
 * 
 * Helper functions for storing and retrieving forecast predictions
 */

import { db } from "@/lib/db";

export interface ForecastLogData {
  timestamp: string;
  dealers: string[];
  forecast: Record<string, number>;
  ci?: string;
  leadsForecast?: number;
  revenueForecast?: number;
}

/**
 * Store a forecast prediction in the database
 */
export async function createForecastLog(data: ForecastLogData) {
  try {
    // Check if using Prisma (check if db.forecastLog exists)
    if ('forecastLog' in db && typeof (db as any).forecastLog?.create === 'function') {
      return await (db as any).forecastLog.create({
        data: {
          timestamp: new Date(data.timestamp),
          // SQLite stores arrays/JSON as strings, PostgreSQL uses native types
          dealers: Array.isArray(data.dealers) 
            ? JSON.stringify(data.dealers) 
            : data.dealers,
          forecast: typeof data.forecast === 'object'
            ? JSON.stringify(data.forecast)
            : data.forecast,
          ci: data.ci,
          leadsForecast: data.leadsForecast,
          revenueForecast: data.revenueForecast,
        },
      });
    }
    
    // Fallback: If Prisma model doesn't exist, return success
    // The actual storage will happen when the Prisma schema is updated
    console.log('Forecast log (Prisma model not yet configured):', data);
    return { id: 'temp', ...data };
  } catch (error: any) {
    // If table doesn't exist, log and continue
    if (error.message?.includes('does not exist') || error.message?.includes('Unknown arg')) {
      console.log('Forecast logs table not yet created, skipping database write');
      return null;
    }
    throw error;
  }
}

/**
 * Retrieve forecast history from database
 */
export async function getForecastHistory(limit: number = 100) {
  try {
    if ('forecastLog' in db && typeof (db as any).forecastLog?.findMany === 'function') {
      const forecasts = await (db as any).forecastLog.findMany({
        orderBy: {
          timestamp: 'desc',
        },
        take: limit,
      });

      return forecasts.map((f: any) => {
        // Parse JSON strings back to objects/arrays for SQLite compatibility
        let dealers = f.dealers;
        let forecast = f.forecast;
        
        try {
          dealers = typeof dealers === 'string' ? JSON.parse(dealers) : dealers;
        } catch (e) {
          // If parsing fails, keep as is
        }
        
        try {
          forecast = typeof forecast === 'string' ? JSON.parse(forecast) : forecast;
        } catch (e) {
          // If parsing fails, keep as is
        }
        
        // Parse actual scores if they exist
        let actualScores = null;
        try {
          actualScores = f.actualScores 
            ? (typeof f.actualScores === 'string' ? JSON.parse(f.actualScores) : f.actualScores)
            : null;
        } catch (e) {
          // Keep as null if parsing fails
        }
        
        return {
          timestamp: f.timestamp.toISOString(),
          dealers,
          forecast,
          ci: f.ci,
          leadsForecast: f.leadsForecast,
          revenueForecast: f.revenueForecast,
          actualScores,
          actualLeads: f.actualLeads,
          actualRevenue: f.actualRevenue,
          accuracy: f.accuracy,
        };
      });
    }
    
    // Table doesn't exist yet
    return [];
  } catch (error: any) {
    if (error.message?.includes('does not exist') || error.message?.includes('Unknown arg')) {
      return [];
    }
    throw error;
  }
}

