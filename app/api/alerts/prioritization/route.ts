import { NextResponse } from "next/server";

interface Alert {
  id: string;
  type: 'performance' | 'competitor' | 'opportunity' | 'threat' | 'system';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: {
    revenue: number;
    customers: number;
    reputation: number;
  };
  urgency: 'immediate' | 'urgent' | 'important' | 'normal';
  confidence: number;
  source: string;
  timestamp: string;
  actions: string[];
  estimatedResolution: string;
  priority: number;
  category: string;
}

interface AlertContext {
  dealerId: string;
  currentMetrics: any;
  businessHours: string[];
  timezone: string;
  userPreferences: any;
  historicalData: any;
}

function calculateAlertPriority(alert: Alert, context: AlertContext): number {
  let priority = 0;
  
  // Base priority from severity
  const severityWeights = {
    'critical': 100,
    'high': 75,
    'medium': 50,
    'low': 25
  };
  priority += severityWeights[alert.severity];
  
  // Urgency multiplier
  const urgencyMultipliers = {
    'immediate': 1.5,
    'urgent': 1.3,
    'important': 1.1,
    'normal': 1.0
  };
  priority *= urgencyMultipliers[alert.urgency];
  
  // Impact scoring
  const totalImpact = alert.impact.revenue + alert.impact.customers + alert.impact.reputation;
  priority += totalImpact * 0.1;
  
  // Confidence adjustment
  priority *= alert.confidence;
  
  // Business hours adjustment
  const now = new Date();
  const isBusinessHours = isWithinBusinessHours(now, context.businessHours, context.timezone);
  if (!isBusinessHours && alert.severity !== 'critical') {
    priority *= 0.8; // Reduce priority outside business hours
  }
  
  // Historical context
  if (context.historicalData) {
    const similarAlerts = context.historicalData.filter((h: any) => h.type === alert.type);
    if (similarAlerts.length > 0) {
      const avgResolutionTime = similarAlerts.reduce((sum: number, h: any) => sum + h.resolutionTime, 0) / similarAlerts.length;
      if (avgResolutionTime > 24) {
        priority *= 1.2; // Increase priority for historically slow-to-resolve issues
      }
    }
  }
  
  return Math.round(priority);
}

function isWithinBusinessHours(date: Date, businessHours: string[], timezone: string): boolean {
  // Simplified business hours check
  console.log('Checking business hours:', businessHours, 'in timezone:', timezone);
  const hour = date.getHours();
  return hour >= 9 && hour <= 17; // 9 AM to 5 PM
}

function generateSmartAlerts(context: AlertContext): Alert[] {
  const alerts: Alert[] = [];
  
  // Performance alerts
  if (context.currentMetrics.dtri < 70) {
    alerts.push({
      id: 'dtri-critical',
      type: 'performance',
      severity: 'critical',
      title: 'DTRI Score Critical',
      description: 'Your DTRI score has dropped below 70, indicating serious trust signal issues that could impact revenue.',
      impact: {
        revenue: 15000,
        customers: 25,
        reputation: 8
      },
      urgency: 'immediate',
      confidence: 0.92,
      source: 'DTRI Analytics',
      timestamp: new Date().toISOString(),
      actions: [
        'Review and update schema markup',
        'Respond to pending reviews',
        'Update business directory listings',
        'Implement trust badges'
      ],
      estimatedResolution: '2-4 hours',
      priority: 0, // Will be calculated
      category: 'Trust & Authority'
    });
  }
  
  if (context.currentMetrics.vai < 75) {
    alerts.push({
      id: 'vai-declining',
      type: 'performance',
      severity: 'high',
      title: 'VAI Score Declining',
      description: 'Your AI Visibility Index is below optimal levels, potentially missing AI-driven traffic opportunities.',
      impact: {
        revenue: 8500,
        customers: 15,
        reputation: 6
      },
      urgency: 'urgent',
      confidence: 0.87,
      source: 'VAI Analytics',
      timestamp: new Date().toISOString(),
      actions: [
        'Optimize content for AI Overviews',
        'Implement structured data',
        'Create FAQ sections',
        'Improve local SEO signals'
      ],
      estimatedResolution: '1-2 days',
      priority: 0,
      category: 'AI Visibility'
    });
  }
  
  // Competitor alerts
  alerts.push({
    id: 'competitor-threat',
    type: 'competitor',
    severity: 'medium',
    title: 'Competitor Gaining Ground',
    description: 'AutoMax Dealership has increased their market share by 3.2% in the last 30 days.',
    impact: {
      revenue: 5000,
      customers: 12,
      reputation: 4
    },
    urgency: 'important',
    confidence: 0.78,
    source: 'Competitor Intelligence',
    timestamp: new Date().toISOString(),
    actions: [
      'Analyze competitor strategies',
      'Identify market gaps',
      'Adjust pricing strategy',
      'Enhance unique value propositions'
    ],
    estimatedResolution: '1 week',
    priority: 0,
    category: 'Competitive Intelligence'
  });
  
  // Opportunity alerts
  alerts.push({
    id: 'ai-opportunity',
    type: 'opportunity',
    severity: 'medium',
    title: 'AI Integration Opportunity',
    description: 'Market analysis shows 65% of competitors lack AI-powered features. This represents a significant competitive advantage opportunity.',
    impact: {
      revenue: 12000,
      customers: 30,
      reputation: 7
    },
    urgency: 'important',
    confidence: 0.85,
    source: 'Market Intelligence',
    timestamp: new Date().toISOString(),
    actions: [
      'Implement AI chatbot',
      'Set up automated lead qualification',
      'Deploy predictive analytics',
      'Create AI-powered recommendations'
    ],
    estimatedResolution: '2-3 weeks',
    priority: 0,
    category: 'Innovation'
  });
  
  // System alerts
  alerts.push({
    id: 'api-performance',
    type: 'system',
    severity: 'low',
    title: 'API Response Time Elevated',
    description: 'API response times are 15% slower than normal, which may impact user experience.',
    impact: {
      revenue: 500,
      customers: 2,
      reputation: 2
    },
    urgency: 'normal',
    confidence: 0.95,
    source: 'System Monitoring',
    timestamp: new Date().toISOString(),
    actions: [
      'Check server performance',
      'Review API optimization',
      'Monitor error rates',
      'Scale resources if needed'
    ],
    estimatedResolution: '4-6 hours',
    priority: 0,
    category: 'System Performance'
  });
  
  // Calculate priorities
  alerts.forEach(alert => {
    alert.priority = calculateAlertPriority(alert, context);
  });
  
  return alerts.sort((a, b) => b.priority - a.priority);
}

function generateActionPlan(alerts: Alert[]): any {
  const immediateActions = alerts.filter(a => a.urgency === 'immediate');
  const urgentActions = alerts.filter(a => a.urgency === 'urgent');
  const importantActions = alerts.filter(a => a.urgency === 'important');
  
  return {
    immediate: {
      count: immediateActions.length,
      actions: immediateActions.map(a => ({
        title: a.title,
        priority: a.priority,
        estimatedTime: a.estimatedResolution,
        impact: a.impact
      }))
    },
    urgent: {
      count: urgentActions.length,
      actions: urgentActions.map(a => ({
        title: a.title,
        priority: a.priority,
        estimatedTime: a.estimatedResolution,
        impact: a.impact
      }))
    },
    important: {
      count: importantActions.length,
      actions: importantActions.map(a => ({
        title: a.title,
        priority: a.priority,
        estimatedTime: a.estimatedResolution,
        impact: a.impact
      }))
    },
    totalImpact: {
      revenue: alerts.reduce((sum, a) => sum + a.impact.revenue, 0),
      customers: alerts.reduce((sum, a) => sum + a.impact.customers, 0),
      reputation: alerts.reduce((sum, a) => sum + a.impact.reputation, 0)
    }
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId') || 'demo-dealer';
    const severity = searchParams.get('severity') || 'all';
    
    // Generate demo context
    const context: AlertContext = {
      dealerId,
      currentMetrics: {
        dtri: 68,
        vai: 72,
        piqr: 75,
        qai: 80,
        hrp: 0.15
      },
      businessHours: ['09:00', '17:00'],
      timezone: 'America/Los_Angeles',
      userPreferences: {
        alertFrequency: 'immediate',
        preferredChannels: ['email', 'dashboard'],
        quietHours: ['22:00', '08:00']
      },
      historicalData: []
    };
    
    const alerts = generateSmartAlerts(context);
    
    // Filter by severity if specified
    const filteredAlerts = severity === 'all' 
      ? alerts 
      : alerts.filter(a => a.severity === severity);
    
    const actionPlan = generateActionPlan(filteredAlerts);
    
    return NextResponse.json({
      alerts: filteredAlerts,
      actionPlan,
      summary: {
        total: filteredAlerts.length,
        critical: filteredAlerts.filter(a => a.severity === 'critical').length,
        high: filteredAlerts.filter(a => a.severity === 'high').length,
        medium: filteredAlerts.filter(a => a.severity === 'medium').length,
        low: filteredAlerts.filter(a => a.severity === 'low').length
      },
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Alert prioritization error:", error);
    return NextResponse.json({ error: "Failed to generate alert prioritization" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { context, customAlerts } = await req.json();
    
    if (!context) {
      return NextResponse.json({ error: "Context is required" }, { status: 400 });
    }
    
    const alerts = generateSmartAlerts(context);
    
    // Add custom alerts if provided
    if (customAlerts && Array.isArray(customAlerts)) {
      customAlerts.forEach((customAlert: any) => {
        const alert: Alert = {
          ...customAlert,
          priority: calculateAlertPriority(customAlert, context),
          timestamp: new Date().toISOString()
        };
        alerts.push(alert);
      });
    }
    
    const actionPlan = generateActionPlan(alerts);
    
    return NextResponse.json({
      alerts: alerts.sort((a, b) => b.priority - a.priority),
      actionPlan,
      recommendations: {
        immediateFocus: alerts.filter(a => a.urgency === 'immediate').slice(0, 3),
        weeklyGoals: alerts.filter(a => a.urgency === 'urgent').slice(0, 5),
        monthlyInitiatives: alerts.filter(a => a.urgency === 'important').slice(0, 3)
      },
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Alert prioritization POST error:", error);
    return NextResponse.json({ error: "Failed to process alert prioritization" }, { status: 500 });
  }
}
