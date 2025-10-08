/**
 * Diagnostics API Endpoint for DealershipAI
 * Advanced error analysis and troubleshooting
 */

import { NextRequest, NextResponse } from 'next/server';
import { VercelDiagnostics } from '@/lib/vercel-diagnostics';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const severity = url.searchParams.get('severity');
    const action = url.searchParams.get('action');

    switch (action) {
      case 'errors-by-category':
        if (!category) {
          return NextResponse.json({ error: 'category parameter required' }, { status: 400 });
        }
        const categoryErrors = VercelDiagnostics.getErrorsByCategory(category as any);
        return NextResponse.json({ category, errors: categoryErrors });

      case 'errors-by-severity':
        if (!severity) {
          return NextResponse.json({ error: 'severity parameter required' }, { status: 400 });
        }
        const severityErrors = VercelDiagnostics.getErrorsBySeverity(severity as any);
        return NextResponse.json({ severity, errors: severityErrors });

      case 'diagnose':
        const statusCode = parseInt(url.searchParams.get('statusCode') || '0');
        const errorMessage = url.searchParams.get('errorMessage');
        
        if (!statusCode) {
          return NextResponse.json({ error: 'statusCode parameter required' }, { status: 400 });
        }
        
        const diagnosis = VercelDiagnostics.diagnoseError(statusCode, errorMessage || undefined);
        return NextResponse.json({ 
          statusCode, 
          errorMessage, 
          diagnosis: diagnosis || { message: 'No specific diagnosis available' }
        });

      case 'full-report':
        const report = await VercelDiagnostics.generateDiagnosticReport();
        return NextResponse.json(report);

      default:
        return NextResponse.json({ 
          error: 'Unknown action',
          availableActions: [
            'errors-by-category',
            'errors-by-severity', 
            'diagnose',
            'full-report'
          ]
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Diagnostics API error:', error);
    return NextResponse.json({ 
      error: 'Diagnostics failed',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'simulate-error':
        const { errorType } = params;
        if (!errorType) {
          return NextResponse.json({ error: 'errorType required' }, { status: 400 });
        }
        
        try {
          // This would be your error simulation logic
          throw new Error(`Simulated ${errorType} error`);
        } catch (error) {
          return NextResponse.json({ 
            success: true, 
            simulatedError: error.message,
            errorType 
          });
        }

      case 'performance-test':
        const { operation, iterations = 1 } = params;
        if (!operation) {
          return NextResponse.json({ error: 'operation required' }, { status: 400 });
        }
        
        const results = [];
        for (let i = 0; i < iterations; i++) {
          const start = Date.now();
          // Simulate operation
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
          const duration = Date.now() - start;
          results.push({ iteration: i + 1, duration });
        }
        
        const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
        const maxDuration = Math.max(...results.map(r => r.duration));
        const minDuration = Math.min(...results.map(r => r.duration));
        
        return NextResponse.json({
          operation,
          iterations,
          results,
          statistics: {
            average: avgDuration,
            maximum: maxDuration,
            minimum: minDuration
          }
        });

      default:
        return NextResponse.json({ 
          error: 'Unknown action',
          availableActions: ['simulate-error', 'performance-test']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Diagnostics POST error:', error);
    return NextResponse.json({ 
      error: 'Diagnostics operation failed',
      details: error.message 
    }, { status: 500 });
  }
}
