import { NextResponse } from "next/server";

// Enhanced mock data generators with more realistic patterns
function generateEnhancedScores() {
  const metrics = ['DTRI', 'VAI', 'PIQR', 'QAI', 'HRP', 'SEO', 'AEO', 'GEO'];
  const verticals = ['Trust', 'Visibility', 'Authority', 'Engagement', 'Conversion', 'Local', 'Social', 'Content'];
  const scores = [];
  
  // Generate more realistic time-series data
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const timestamp = new Date(now.getTime() - i * 2 * 60 * 60 * 1000); // Every 2 hours
    metrics.forEach(metric => {
      verticals.forEach(vertical => {
        // Add some realistic patterns and correlations
        const baseScore = 50 + Math.random() * 40;
        const trend = Math.sin(i / 5) * 10; // Cyclical pattern
        const noise = (Math.random() - 0.5) * 5;
        
        scores.push({
          vertical,
          metric,
          score: Math.max(0, Math.min(100, baseScore + trend + noise)),
          timestamp: timestamp.toISOString(),
          confidence: 0.7 + Math.random() * 0.3
        });
      });
    });
  }
  
  return scores;
}

function generateEnhancedRevenue() {
  const verticals = ['Trust', 'Visibility', 'Authority', 'Engagement', 'Conversion'];
  const revenue = [];
  
  for (let i = 0; i < 15; i++) {
    const baseRevenue = 20000 + Math.random() * 80000;
    const growth = Math.random() * 0.2 - 0.1; // -10% to +10% growth
    
    revenue.push({
      vertical: verticals[Math.floor(Math.random() * verticals.length)],
      predicted_revenue: Math.round(baseRevenue * (1 + growth)),
      feature_weights: {
        trust: 0.3 + Math.random() * 0.4,
        visibility: 0.2 + Math.random() * 0.3,
        risk: 0.1 + Math.random() * 0.2,
        engagement: 0.1 + Math.random() * 0.2
      },
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      confidence: 0.8 + Math.random() * 0.2
    });
  }
  
  return revenue;
}

function generateEnhancedBeta() {
  const betaNames = ['trust_decay', 'visibility_boost', 'risk_factor', 'conversion_rate', 'engagement_multiplier'];
  const beta = [];
  
  for (let i = 0; i < 12; i++) {
    beta.push({
      timestamp: new Date(Date.now() - i * 6 * 60 * 60 * 1000).toISOString(),
      beta_name: betaNames[Math.floor(Math.random() * betaNames.length)],
      new_value: (Math.random() - 0.5) * 2,
      impact: Math.random() * 100,
      confidence: 0.75 + Math.random() * 0.25
    });
  }
  
  return beta;
}

function generateEnhancedSentinel() {
  const eventTypes = ['DTRI_DROP', 'VAI_SPIKE', 'RISK_ALERT', 'CONVERSION_DIP', 'TRUST_DECAY', 'AUTHORITY_LOSS'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const sentinel = [];
  
  for (let i = 0; i < 8; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    sentinel.push({
      event_type: eventType,
      metric_value: Math.random() * 100,
      severity,
      timestamp: new Date(Date.now() - i * 3 * 60 * 60 * 1000).toISOString(),
      dealer_id: `dealer_${Math.floor(Math.random() * 100)}`,
      description: `Detected ${eventType.toLowerCase().replace(/_/g, ' ')} with ${severity} severity`,
      recommended_action: getRecommendedAction(eventType, severity)
    });
  }
  
  return sentinel;
}

function getRecommendedAction(eventType: string, severity: string): string {
  const actions = {
    'DTRI_DROP': 'Review trust signals and update schema markup',
    'VAI_SPIKE': 'Investigate visibility boost sources',
    'RISK_ALERT': 'Immediate review of risk factors',
    'CONVERSION_DIP': 'Analyze conversion funnel and optimize',
    'TRUST_DECAY': 'Update trust indicators and reviews',
    'AUTHORITY_LOSS': 'Strengthen authority signals and content'
  };
  return actions[eventType as keyof typeof actions] || 'Review and optimize';
}

function enhancedIntent(prompt: string) {
  const p = prompt.toLowerCase();
  
  // More sophisticated intent detection
  if (p.startsWith("/help")) return "help";
  if (p.startsWith("/drivers") || p.includes("what drove") || p.includes("performance drivers")) return "drivers";
  if (p.startsWith("/risk") || p.includes("risk") || p.includes("danger") || p.includes("threat")) return "risk";
  if (p.startsWith("/actions") || p.includes("action") || p.includes("next") || p.includes("recommend")) return "actions";
  if (p.startsWith("/forecast") || p.includes("forecast") || p.includes("predict") || p.includes("future")) return "forecast";
  if (p.startsWith("/competitors") || p.includes("competitor") || p.includes("competition")) return "competitors";
  if (p.startsWith("/optimize") || p.includes("optimize") || p.includes("improve") || p.includes("better")) return "optimize";
  if (p.startsWith("/export") || p.includes("export") || p.includes("download") || p.includes("report")) return "export";
  
  // Natural language patterns
  if (p.includes("drop") || p.includes("decrease") || p.includes("down") || p.includes("decline")) return "drivers";
  if (p.includes("increase") || p.includes("up") || p.includes("rise") || p.includes("grow")) return "drivers";
  if (p.includes("revenue") || p.includes("money") || p.includes("profit") || p.includes("income")) return "forecast";
  if (p.includes("competitor") || p.includes("rival") || p.includes("competition")) return "competitors";
  
  return "drivers"; // Default to drivers analysis
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Generate enhanced mock data
    const scores = generateEnhancedScores();
    const revenue = generateEnhancedRevenue();
    const beta = generateEnhancedBeta();
    const sentinel = generateEnhancedSentinel();

    const intent = enhancedIntent(prompt);

    // Enhanced analyzers with more sophisticated logic
    const byMetric = (arr: any[], key: string) => Object.values(arr.reduce((a: any, x: any) => {
      const k = x[key];
      a[k] = a[k] || [];
      a[k].push(x);
      return a;
    }, {}));

    const enhancedTopDrivers = () => {
      const deltas: { k: string; v: number; confidence: number }[] = [];
      
      (byMetric(scores, "metric") as any[]).forEach((group: any[]) => {
        const k = group[0].metric;
        const sorted = group.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        
        if (sorted.length > 1) {
          const latest = sorted[0];
          const previous = sorted[Math.min(5, sorted.length - 1)]; // Compare with 5 periods ago
          const delta = Number(latest.score) - Number(previous.score);
          const confidence = (latest.confidence + previous.confidence) / 2;
          
          deltas.push({ k, v: delta, confidence });
        }
      });
      
      deltas.sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
      const top = deltas.slice(0, 5).map(d => 
        `${d.k}: ${d.v > 0 ? "+" : ""}${d.v.toFixed(2)} (${Math.round(d.confidence * 100)}% confidence)`
      );
      
      const criticalAlerts = sentinel.filter(s => s.severity === 'critical' || s.severity === 'high');
      const alertSummary = criticalAlerts.slice(0, 3).map((e: any) => 
        `${e.event_type} (${e.severity})`
      );
      
      return `📊 **Performance Drivers Analysis (48h):**\n${top.join(", ")}\n\n🚨 **Critical Alerts:** ${alertSummary.join("; ")}\n\n💡 **Key Insight:** ${getInsight(deltas[0])}`;
    }

    const getInsight = (topDriver: any): string => {
      if (!topDriver) return "Continue monitoring current trends.";
      
      const insights = {
        'DTRI': 'Trust signals are the primary driver. Focus on schema markup and review management.',
        'VAI': 'Visibility optimization is key. Consider content strategy and technical SEO.',
        'PIQR': 'Performance indicators show strong correlation with user engagement.',
        'QAI': 'Quality metrics are driving results. Maintain high content standards.',
        'HRP': 'Risk management is critical. Monitor compliance and accuracy.'
      };
      
      return insights[topDriver.k as keyof typeof insights] || 'Focus on the primary metric for maximum impact.';
    }

    const enhancedRisk = () => {
      const tsm = 1.0 + Math.max(0, (Math.sin(Date.now() / 8.64e7) * 0.15));
      const dtriScore = scores.filter(x => x.metric === "DTRI").slice(0, 1)[0]?.score ?? 0;
      const riskScore = Math.max(0, Math.round((100 - dtriScore) * 2500 * (tsm > 1.2 ? 1.2 : 1)));
      
      const highRiskAlerts = sentinel.filter(s => s.severity === 'high' || s.severity === 'critical');
      const riskTrend = dtriScore < 70 ? 'increasing' : dtriScore > 85 ? 'decreasing' : 'stable';
      
      return `⚠️ **Risk Assessment:**\n• TSM: ${tsm.toFixed(2)} (${tsm > 1.1 ? 'Elevated' : 'Normal'})\n• Decay Tax: $${riskScore.toLocaleString()}\n• Risk Trend: ${riskTrend}\n• Active Alerts: ${highRiskAlerts.length}\n\n🎯 **Priority:** ${riskScore > 50000 ? 'Immediate action required' : 'Monitor closely'}`;
    }

    const enhancedActions = () => {
      const alerts = sentinel.slice(0, 5);
      const actionCategories = {
        'immediate': alerts.filter(a => a.severity === 'critical'),
        'short_term': alerts.filter(a => a.severity === 'high'),
        'medium_term': alerts.filter(a => a.severity === 'medium')
      };
      
      const recommendations = [
        "🔧 Update schema markup for better trust signals",
        "📊 Optimize conversion funnel based on recent data",
        "🎯 Implement A/B testing for high-impact changes",
        "📈 Review and update content strategy",
        "⚡ Set up automated monitoring for key metrics"
      ];
      
      return `🎯 **Recommended Actions:**\n\n**Immediate (${actionCategories.immediate.length}):** ${actionCategories.immediate.map(a => a.recommended_action).join(", ")}\n\n**Short-term (${actionCategories.short_term.length}):** ${actionCategories.short_term.map(a => a.recommended_action).join(", ")}\n\n**Strategic:** ${recommendations.slice(0, 3).join("; ")}`;
    }

    const enhancedForecast = () => {
      const latest = Object.fromEntries(revenue.map((r: any) => [r.vertical, Math.round(r.predicted_revenue || 0)]));
      const total = Object.values(latest).reduce((a: number, b: number) => a + b, 0);
      const avgConfidence = revenue.reduce((sum, r) => sum + r.confidence, 0) / revenue.length;
      
      const growth = total > 200000 ? 'Strong growth expected' : total > 100000 ? 'Moderate growth' : 'Conservative outlook';
      
      return `🔮 **90-Day Revenue Forecast:**\n${Object.entries(latest).map(([v, x]) => `• ${v}: $${x.toLocaleString()}`).join("\n")}\n\n💰 **Total Projected:** $${total.toLocaleString()}\n📈 **Outlook:** ${growth}\n🎯 **Confidence:** ${Math.round(avgConfidence * 100)}%`;
    }

    const enhancedCompetitors = () => {
      const competitorData = [
        { name: "AutoMax Dealership", score: 92.1, trend: "+2.3%", threat: "high" },
        { name: "Premier Motors", score: 88.7, trend: "-1.1%", threat: "medium" },
        { name: "Elite Auto Group", score: 85.4, trend: "+0.8%", threat: "low" }
      ];
      
      return `🏆 **Competitor Analysis:**\n${competitorData.map(c => 
        `• ${c.name}: ${c.score} (${c.trend}) - ${c.threat} threat`
      ).join("\n")}\n\n💡 **Strategy:** Focus on ${competitorData[0].name}'s strengths while capitalizing on ${competitorData[1].name}'s decline.`;
    }

    const enhancedOptimize = () => {
      const optimizationAreas = [
        { area: "Trust Signals", impact: "High", effort: "Medium", roi: "3.2x" },
        { area: "Content Quality", impact: "High", effort: "High", roi: "2.8x" },
        { area: "Technical SEO", impact: "Medium", effort: "Low", roi: "4.1x" },
        { area: "User Experience", impact: "High", effort: "Medium", roi: "2.9x" }
      ];
      
      return `⚡ **Optimization Opportunities:**\n${optimizationAreas.map(o => 
        `• ${o.area}: ${o.impact} impact, ${o.effort} effort, ${o.roi} ROI`
      ).join("\n")}\n\n🎯 **Recommendation:** Start with Technical SEO for quick wins, then focus on Trust Signals.`;
    }

    const answers = {
      help: "🤖 **Available Commands:**\n• `/drivers` - Analyze performance drivers\n• `/risk` - Risk assessment and alerts\n• `/actions` - Recommended actions\n• `/forecast` - Revenue forecasting\n• `/competitors` - Competitor analysis\n• `/optimize` - Optimization suggestions\n• `/export` - Export data and reports\n\n💡 **Natural Language:** Ask questions like 'what drove yesterday's drop?' or 'show me revenue trends'",
      drivers: enhancedTopDrivers(),
      risk: enhancedRisk(),
      actions: enhancedActions(),
      forecast: enhancedForecast(),
      competitors: enhancedCompetitors(),
      optimize: enhancedOptimize(),
      export: "📤 **Export Options:**\n• PDF Report: Comprehensive analysis\n• CSV Data: Raw metrics and trends\n• JSON API: Programmatic access\n• Dashboard Link: Real-time monitoring\n\n🎯 **Available:** All data can be exported with custom date ranges and filters."
    };

    const answer = answers[intent as keyof typeof answers] || enhancedTopDrivers();

    return NextResponse.json({ 
      answer,
      intent,
      confidence: 0.85 + Math.random() * 0.15,
      sources: ["DTRI Analytics", "Market Data", "Performance Metrics", "Competitor Intelligence"],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Console query error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}