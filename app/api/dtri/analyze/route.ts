import { NextRequest, NextResponse } from 'next/server';
import { AuthManager } from '@/lib/auth';
import { TierManager } from '@/lib/tier-manager';
import { DTRIEngine } from '@/lib/dtri-engine';
import { QAICalculator } from '@/lib/qai-calculator';
import { EEATCalculator } from '@/lib/eeat-calculator';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Input validation schema for DTRI analysis
const DTRIAnalyzeSchema = z.object({
  // CFO Inputs
  currentMonthlyUnits: z.number().min(0),
  averageGrossProfitPerUnit: z.number().min(0),
  currentBlendedCAC: z.number().min(0),
  organicClosingRate: z.number().min(0).max(1),
  serviceClosingRate: z.number().min(0).max(1),
  estimatedTotalAdSpend: z.number().min(0),
  ftfrToMarginValueBetaDollars: z.number().min(0),
  
  // External Context
  interestRate: z.number().min(0).max(1),
  consumerConfidenceDrop: z.number().min(0).max(1),
  competitiveDelta: z.number().min(-1).max(1),
  
  // Optional metadata
  dealerId: z.string().optional(),
  analysisDate: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const authResult = await AuthManager.getUserFromToken(token);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { userId, plan: currentTier } = authResult.user;

    // 2. Check if user has Enterprise access for DTRI
    const featureAccess = await TierManager.hasFeatureAccess(userId, 'dtri-analysis');
    if (!featureAccess.hasAccess) {
      return NextResponse.json(
        {
          error: 'DTRI analysis requires Enterprise tier',
          requiredTier: featureAccess.requiredTier,
          currentTier: featureAccess.currentTier,
          upgradeRequired: true
        },
        { status: 403 }
      );
    }

    // 3. Check session limit
    const canMakeRequest = await TierManager.canMakeRequest(userId);
    if (!canMakeRequest) {
      const sessionInfo = await TierManager.checkSessionLimit(userId);
      return NextResponse.json(
        {
          error: 'Session limit reached',
          sessionsUsed: sessionInfo.sessionsUsed,
          sessionsLimit: sessionInfo.sessionsLimit,
          tier: currentTier
        },
        { status: 429 }
      );
    }

    // 4. Increment session count
    await TierManager.incrementSession(userId);

    // 5. Parse and validate request body
    const body = await request.json();
    const validatedData = DTRIAnalyzeSchema.parse(body);

    // 6. Generate sample QAI and E-E-A-T data (in production, this would come from real data sources)
    const qaiData = QAICalculator.generateSampleData();
    const eeatData = EEATCalculator.generateSampleData();

    // 7. Calculate QAI and E-E-A-T scores
    const qaiAnalysis = QAICalculator.calculateQAIComplete(qaiData);
    const eeatAnalysis = EEATCalculator.calculateEEATComplete(eeatData);

    // 8. Prepare QAI components for DTRI calculation
    const qaiComponents = qaiAnalysis.components.map(comp => ({
      id: comp.id,
      weight: comp.weight,
      lagMeasureId: comp.lagMeasureId,
      financialLink: comp.financialLink,
      score: comp.score
    }));

    // 9. Prepare E-E-A-T components for DTRI calculation
    const eeatComponents = {
      trustworthiness: {
        w: eeatAnalysis.components.trustworthiness.w,
        inputMetrics: eeatAnalysis.components.trustworthiness.inputMetrics,
        score: eeatAnalysis.components.trustworthiness.score
      },
      experience: {
        w: eeatAnalysis.components.experience.w,
        inputMetrics: eeatAnalysis.components.experience.inputMetrics,
        score: eeatAnalysis.components.experience.score
      },
      expertise: {
        w: eeatAnalysis.components.expertise.w,
        inputMetrics: eeatAnalysis.components.expertise.inputMetrics,
        score: eeatAnalysis.components.expertise.score
      },
      authoritativeness: {
        w: eeatAnalysis.components.authoritativeness.w,
        inputMetrics: eeatAnalysis.components.authoritativeness.inputMetrics,
        score: eeatAnalysis.components.authoritativeness.score
      }
    };

    // 10. Prepare CFO inputs
    const cfoInputs = {
      currentMonthlyUnits: validatedData.currentMonthlyUnits,
      averageGrossProfitPerUnit: validatedData.averageGrossProfitPerUnit,
      currentBlendedCAC: validatedData.currentBlendedCAC,
      organicClosingRate: validatedData.organicClosingRate,
      serviceClosingRate: validatedData.serviceClosingRate,
      estimatedTotalAdSpend: validatedData.estimatedTotalAdSpend,
      ftfrToMarginValueBetaDollars: validatedData.ftfrToMarginValueBetaDollars
    };

    // 11. Prepare external data
    const externalData = {
      interestRate: validatedData.interestRate,
      consumerConfidenceDrop: validatedData.consumerConfidenceDrop,
      competitiveDelta: validatedData.competitiveDelta
    };

    // 12. Calculate complete DTRI analysis
    const dtriResult = DTRIEngine.calculateDTRIComplete(
      qaiComponents,
      eeatComponents,
      cfoInputs,
      externalData
    );

    // 13. Log the analysis for monitoring
    console.log(`DTRI analysis completed`, {
      dtriScore: dtriResult.dtriScore,
      qaiScore: dtriResult.qaiScore,
      eeatScore: dtriResult.eeatScore,
      financialImpact: dtriResult.financialImpact,
      autonomousActions: dtriResult.autonomousActions.length,
      tenantId: userId,
      dealerId: validatedData.dealerId,
    });

    // 14. Get updated session info
    const sessionInfo = await TierManager.checkSessionLimit(userId);

    // 15. Return comprehensive DTRI analysis
    return NextResponse.json({
      success: true,
      data: {
        // Engine specification
        engine: DTRIEngine.getEngineSpec(),
        
        // Core DTRI results
        dtri: {
          score: dtriResult.dtriScore,
          qaiScore: dtriResult.qaiScore,
          eeatScore: dtriResult.eeatScore,
          formula: "(QAI_Score * 0.50) + (EEAT_Score * 0.50)"
        },
        
        // Financial impact analysis
        financialImpact: {
          decayTaxCost: dtriResult.financialImpact.decayTaxCost,
          aroiScore: dtriResult.financialImpact.aroiScore,
          strategicWindowValue: dtriResult.financialImpact.strategicWindowValue,
          totalValue: Object.values(dtriResult.financialImpact).reduce((sum, val) => sum + val, 0)
        },
        
        // QAI detailed analysis
        qai: {
          overallScore: qaiAnalysis.overallScore,
          components: qaiAnalysis.components,
          financialImpact: qaiAnalysis.financialImpact,
          lagMeasures: qaiAnalysis.lagMeasures,
          recommendations: qaiAnalysis.recommendations
        },
        
        // E-E-A-T detailed analysis
        eeat: {
          overallScore: eeatAnalysis.overallScore,
          components: eeatAnalysis.components,
          financialImpact: eeatAnalysis.financialImpact,
          trustSignals: eeatAnalysis.trustSignals,
          recommendations: eeatAnalysis.recommendations
        },
        
        // Autonomous actions and content generation
        autonomous: {
          actions: dtriResult.autonomousActions,
          contentBlueprints: dtriResult.contentBlueprints,
          triggers: DTRIEngine.getAutonomousTriggers()
        },
        
        // Prescriptive recommendations
        recommendations: dtriResult.recommendations,
        
        // External context
        externalContext: {
          tsm: DTRIEngine.calculateTSM(validatedData.interestRate, validatedData.consumerConfidenceDrop),
          seasonality: DTRIEngine.getExternalContext().seasonalityAdjustment,
          competitivePosition: validatedData.competitiveDelta > 0.1 ? 'behind' : 
                              validatedData.competitiveDelta < -0.1 ? 'ahead' : 'competitive'
        },
        
        // Metadata
        metadata: {
          analyzedAt: new Date().toISOString(),
          tenantId: userId,
          dealerId: validatedData.dealerId,
          analysisDate: validatedData.analysisDate || new Date().toISOString().split('T')[0],
          tier: currentTier,
          sessionsUsed: sessionInfo.sessionsUsed,
          sessionsLimit: sessionInfo.sessionsLimit
        }
      }
    });
    
  } catch (error) {
    console.error('DTRI analysis error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to complete DTRI analysis'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const authResult = await AuthManager.getUserFromToken(token);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Return DTRI API documentation
    return NextResponse.json({
      endpoint: '/api/dtri/analyze',
      method: 'POST',
      description: 'Digital Trust Revenue Index (DTRI) Autonomous Engine Analysis',
      engine: DTRIEngine.getEngineSpec(),
      features: [
        'QAI Internal Execution Analysis',
        'E-E-A-T External Perception Analysis',
        'Predictive Financial Modeling',
        'Autonomous Action Triggers',
        'Content Generation Blueprints',
        'Competitive Position Assessment',
        'Trust Sensitivity Multiplier (TSM)',
        'Strategic Window Value Calculation'
      ],
      requiredFields: [
        'currentMonthlyUnits (number)',
        'averageGrossProfitPerUnit (number)',
        'currentBlendedCAC (number)',
        'organicClosingRate (0-1)',
        'serviceClosingRate (0-1)',
        'estimatedTotalAdSpend (number)',
        'ftfrToMarginValueBetaDollars (number)',
        'interestRate (0-1)',
        'consumerConfidenceDrop (0-1)',
        'competitiveDelta (-1 to 1)'
      ],
      optionalFields: [
        'dealerId',
        'analysisDate'
      ],
      output: {
        dtri: {
          score: 'number (0-1)',
          qaiScore: 'number (0-1)',
          eeatScore: 'number (0-1)'
        },
        financialImpact: {
          decayTaxCost: 'number',
          aroiScore: 'number',
          strategicWindowValue: 'number',
          totalValue: 'number'
        },
        qai: {
          overallScore: 'number',
          components: 'QAIComponent[]',
          financialImpact: 'object',
          lagMeasures: 'LagMeasure[]',
          recommendations: 'string[]'
        },
        eeat: {
          overallScore: 'number',
          components: 'EEATComponent',
          financialImpact: 'object',
          trustSignals: 'TrustSignal[]',
          recommendations: 'string[]'
        },
        autonomous: {
          actions: 'string[]',
          contentBlueprints: 'ContentBlueprint[]',
          triggers: 'AutonomousTrigger[]'
        }
      },
      example: {
        currentMonthlyUnits: 150,
        averageGrossProfitPerUnit: 2500,
        currentBlendedCAC: 450,
        organicClosingRate: 0.20,
        serviceClosingRate: 0.65,
        estimatedTotalAdSpend: 67500,
        ftfrToMarginValueBetaDollars: 12000,
        interestRate: 0.05,
        consumerConfidenceDrop: 0.1,
        competitiveDelta: 0.05,
        dealerId: 'dealer_123',
        analysisDate: '2024-01-15'
      }
    });

  } catch (error) {
    console.error('DTRI API documentation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to retrieve DTRI documentation'
      },
      { status: 500 }
    );
  }
}