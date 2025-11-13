import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Mock AI response - in production, this would call Claude API
    const responses = {
      'seo': 'Your SEO score is currently 87.3%, which is excellent! This puts you in the top 15% of dealerships. To improve further, consider adding more local business schema markup.',
      'aeo': 'Your AEO (AI Engine Optimization) score is 73.8%. This measures how well your content is optimized for AI search engines. Try adding more FAQ content and structured data.',
      'geo': 'Your GEO (Google Engine Optimization) score is 65.2%. Focus on improving your Google Business Profile and local citations to boost this score.',
      'competitor': 'Your main competitors are AutoMax Dealership (92.1), Premier Motors (88.7), and Elite Auto Group (85.4). You\'re currently ranking 2nd in your market.',
      'opportunities': 'I found 3 high-impact opportunities: FAQ Schema (+15% visibility), Local Business Schema (+8% local traffic), and Review Response (+5% reputation).',
      'trends': 'Your metrics are trending upward! SEO is up 12%, AEO is up 8%, and GEO is up 3% over the last month.',
      'help': 'I can help you with: SEO analysis, competitor insights, opportunity recommendations, trend analysis, and general questions about your dealership\'s AI visibility.',
      'default': 'I understand you\'re asking about "' + message + '". Based on your current dashboard data, I can see your SEO score is 87.3%, AEO is 73.8%, and GEO is 65.2%. Would you like me to analyze any specific aspect of your performance?'
    };

    // Simple keyword matching for demo purposes
    const lowerMessage = message.toLowerCase();
    let response = responses.default;

    if (lowerMessage.includes('seo')) {
      response = responses.seo;
    } else if (lowerMessage.includes('aeo')) {
      response = responses.aeo;
    } else if (lowerMessage.includes('geo')) {
      response = responses.geo;
    } else if (lowerMessage.includes('competitor')) {
      response = responses.competitor;
    } else if (lowerMessage.includes('opportunit')) {
      response = responses.opportunities;
    } else if (lowerMessage.includes('trend') || lowerMessage.includes('change')) {
      response = responses.trends;
    } else if (lowerMessage.includes('help') || lowerMessage.includes('what can you')) {
      response = responses.help;
    }

    // Add some context awareness
    if (context === 'dashboard') {
      response += ' You can also try asking about specific metrics, competitors, or opportunities.';
    }

    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString(),
      context: context
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
