/**
 * Check Financing Function Handler
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CheckFinancingParams {
  vehicleId: string;
  creditScore?: number;
  downPayment?: number;
  loanTerm?: number;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params: CheckFinancingParams = await req.json();

    if (!params.vehicleId) {
      return NextResponse.json(
        { error: 'Missing required parameter: vehicleId' },
        { status: 400 }
      );
    }

    // Check financing (in production, integrate with financing partner API)
    const result = await checkFinancing(params);

    // Log interaction
    await logFunctionCall('checkFinancing', params, result, session.user?.id);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Check financing error:', error);
    return NextResponse.json(
      { error: 'Failed to check financing' },
      { status: 500 }
    );
  }
}

async function checkFinancing(params: CheckFinancingParams) {
  // In production, integrate with:
  // - Financing partner APIs (Capital One, Ally, etc.)
  // - Credit check services
  // - Rate calculation engines

  const { vehicleId, creditScore = 700, downPayment = 0, loanTerm = 60 } = params;

  // Mock financing calculation
  const vehiclePrice = 30000; // Would fetch from inventory
  const loanAmount = vehiclePrice - downPayment;
  const baseRate = 0.045; // 4.5% base APR
  const creditAdjustment = creditScore >= 750 ? -0.01 : creditScore >= 700 ? 0 : 0.02;
  const apr = baseRate + creditAdjustment;
  const monthlyRate = apr / 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1);

  return {
    preApproved: creditScore >= 650,
    apr: (apr * 100).toFixed(2),
    monthlyPayment: Math.round(monthlyPayment),
    loanAmount,
    loanTerm,
    totalInterest: Math.round((monthlyPayment * loanTerm) - loanAmount),
    message: creditScore >= 650
      ? `Pre-approved! Estimated monthly payment: $${Math.round(monthlyPayment)}/month at ${(apr * 100).toFixed(2)}% APR.`
      : 'Financing available. Please contact our finance department for details.'
  };
}

async function logFunctionCall(
  functionName: string,
  parameters: any,
  result: any,
  userId?: string
) {
  console.log('Function call logged:', {
    functionName,
    parameters,
    result,
    userId,
    timestamp: new Date().toISOString()
  });
}

