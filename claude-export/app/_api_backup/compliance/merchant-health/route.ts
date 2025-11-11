import { NextRequest, NextResponse } from 'next/server';
import { MerchantCenterMonitor } from '@/lib/compliance/merchant-monitor';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Mock Merchant Center configuration
    const config = {
      merchantId: 'demo_merchant_123',
      apiKey: 'demo_api_key',
      baseUrl: 'https://merchantcenter.googleapis.com',
      checkIntervals: {
        diagnostics: 24, // hours
        warnings: 6, // hours
        performance: 12, // hours
      },
    };

    const monitor = new MerchantCenterMonitor(config);
    const report = await monitor.generateHealthReport();

    return NextResponse.json({
      success: true,
      report,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Merchant health check error:', error);
    return NextResponse.json(
      { error: 'Internal server error during health check' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();
    
    if (action === 'start_monitoring') {
      // Start monitoring (mock implementation)
      return NextResponse.json({
        success: true,
        message: 'Monitoring started successfully',
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'stop_monitoring') {
      // Stop monitoring (mock implementation)
      return NextResponse.json({
        success: true,
        message: 'Monitoring stopped successfully',
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'run_diagnostics') {
      // Run immediate diagnostics
      const config = {
        merchantId: 'demo_merchant_123',
        apiKey: 'demo_api_key',
        baseUrl: 'https://merchantcenter.googleapis.com',
        checkIntervals: {
          diagnostics: 24,
          warnings: 6,
          performance: 12,
        },
      };

      const monitor = new MerchantCenterMonitor(config);
      const diagnostics = await monitor.runDiagnostics();
      const warnings = await monitor.getWarnings();

      return NextResponse.json({
        success: true,
        diagnostics,
        warnings,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Expected: start_monitoring, stop_monitoring, or run_diagnostics' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Merchant health action error:', error);
    return NextResponse.json(
      { error: 'Internal server error during action' },
      { status: 500 }
    );
  }
}
