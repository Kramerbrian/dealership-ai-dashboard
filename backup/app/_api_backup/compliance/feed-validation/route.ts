import { NextRequest, NextResponse } from 'next/server';
import { FeedValidator } from '@/lib/compliance/feed-validator';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { records } = await req.json();
    
    if (!records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'Invalid request. Expected records array.' },
        { status: 400 }
      );
    }

    const validator = new FeedValidator();
    const results = await validator.validateBatch(records);
    const report = validator.generateHealthReport(results);

    return NextResponse.json({
      success: true,
      results,
      report,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Feed validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during validation' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Return mock validation results for demo
    const mockResults = [
      {
        recordId: 'feed_001',
        isValid: true,
        score: 92,
        issues: [],
        warnings: [
          {
            field: 'vin',
            message: 'Optional field \'vin\' is missing',
            suggestion: 'Consider adding vin for better listing quality',
          }
        ],
        recommendations: [
          'Consider adding vin for better listing quality',
        ],
      },
      {
        recordId: 'feed_002',
        isValid: false,
        score: 65,
        issues: [
          {
            field: 'price',
            type: 'invalid',
            severity: 'high',
            message: 'Price field \'price\' is not a valid number',
            actual: 'not_a_number',
            fix: 'Ensure price fields contain only numeric values',
          },
          {
            field: 'condition',
            type: 'format_error',
            severity: 'high',
            message: 'Invalid condition value',
            actual: 'refurbished',
            expected: 'new, used, or certified',
            fix: 'Use valid condition: new, used, or certified',
          }
        ],
        warnings: [],
        recommendations: [
          'Ensure price fields contain only numeric values',
          'Use valid condition: new, used, or certified',
        ],
      },
      {
        recordId: 'feed_003',
        isValid: true,
        score: 88,
        issues: [
          {
            field: 'year',
            type: 'format_error',
            severity: 'medium',
            message: 'Invalid year format',
            actual: 2026,
            expected: '1900-2025',
            fix: 'Use valid 4-digit year',
          }
        ],
        warnings: [
          {
            field: 'mileage',
            message: 'Optional field \'mileage\' is missing',
            suggestion: 'Consider adding mileage for better listing quality',
          }
        ],
        recommendations: [
          'Use valid 4-digit year',
          'Consider adding mileage for better listing quality',
        ],
      }
    ];

    const mockReport = {
      summary: {
        totalRecords: 3,
        validRecords: 2,
        invalidRecords: 1,
        averageScore: 81.7,
        healthScore: 66.7,
        criticalIssues: 0,
        lastValidated: new Date().toISOString(),
      },
      issueBreakdown: {
        'invalid_high': 1,
        'format_error_high': 1,
        'format_error_medium': 1,
      },
      topIssues: [
        'price: Price field \'price\' is not a valid number',
        'condition: Invalid condition value',
        'year: Invalid year format',
      ],
      recommendations: [
        'Ensure price fields contain only numeric values',
        'Use valid condition: new, used, or certified',
        'Use valid 4-digit year',
        'Consider adding vin for better listing quality',
        'Consider adding mileage for better listing quality',
      ],
      nextValidationDue: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json({
      success: true,
      results: mockResults,
      report: mockReport,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Feed validation GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
