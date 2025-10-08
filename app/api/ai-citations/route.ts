import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { businessName, location, domain } = await request.json();

    if (!businessName || !location) {
      return NextResponse.json(
        { error: 'Business name and location are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Test queries for different AI platforms
    const queries = [
      `best car dealership in ${location}`,
      `where to buy a car in ${location}`,
      `${businessName} reviews`,
      `reliable car dealer near ${location}`,
      `new car dealership ${location}`
    ];

    const results = await Promise.all(
      queries.map(async (query) => {
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Using cheaper model for cost optimization
            messages: [
              {
                role: 'user',
                content: query
              }
            ],
            max_tokens: 500,
            temperature: 0.7,
          });

          const response = completion.choices[0]?.message?.content || '';
          const mentionsBusiness = response.toLowerCase().includes(businessName.toLowerCase());
          const mentionsDomain = domain ? response.toLowerCase().includes(domain.toLowerCase()) : false;

          return {
            query,
            response: response.substring(0, 200) + '...', // Truncate for response
            mentionsBusiness,
            mentionsDomain,
            score: mentionsBusiness ? 100 : 0
          };
        } catch (error) {
          console.error(`Query failed for "${query}":`, error);
          return {
            query,
            response: 'Error processing query',
            mentionsBusiness: false,
            mentionsDomain: false,
            score: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const averageScore = totalScore / results.length;
    const mentionsCount = results.filter(r => r.mentionsBusiness).length;

    const analysis = {
      businessName,
      location,
      domain,
      overallScore: Math.round(averageScore),
      mentionsCount,
      totalQueries: queries.length,
      results,
      recommendations: generateRecommendations(averageScore, mentionsCount),
      analyzedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: analysis,
      metadata: {
        businessName,
        location,
        domain,
        analyzedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Citations API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze AI citations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateRecommendations(score: number, mentionsCount: number): string[] {
  const recommendations: string[] = [];

  if (score < 20) {
    recommendations.push('Improve local SEO optimization');
    recommendations.push('Add more location-specific content');
    recommendations.push('Optimize for voice search queries');
  } else if (score < 50) {
    recommendations.push('Focus on long-tail keyword optimization');
    recommendations.push('Create FAQ content for common questions');
    recommendations.push('Improve Google My Business profile');
  } else if (score < 80) {
    recommendations.push('Maintain current optimization efforts');
    recommendations.push('Monitor competitor AI visibility');
    recommendations.push('Expand content marketing strategy');
  } else {
    recommendations.push('Excellent AI visibility - maintain current strategy');
    recommendations.push('Consider expanding to additional AI platforms');
  }

  if (mentionsCount < 2) {
    recommendations.push('Increase brand mention frequency in content');
  }

  return recommendations;
}

// Mock data for testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessName = searchParams.get('businessName') || 'Mock Dealership';
  const location = searchParams.get('location') || 'Anytown, CA';

  return NextResponse.json({
    success: true,
    data: {
      businessName,
      location,
      domain: 'mockdealership.com',
      overallScore: 73,
      mentionsCount: 3,
      totalQueries: 5,
      results: [
        {
          query: `best car dealership in ${location}`,
          response: `${businessName} is one of the top-rated dealerships in ${location}...`,
          mentionsBusiness: true,
          mentionsDomain: true,
          score: 100
        },
        {
          query: `where to buy a car in ${location}`,
          response: 'There are several options in the area...',
          mentionsBusiness: false,
          mentionsDomain: false,
          score: 0
        }
      ],
      recommendations: [
        'Improve local SEO optimization',
        'Add more location-specific content',
        'Focus on long-tail keyword optimization'
      ],
      analyzedAt: new Date().toISOString()
    },
    metadata: {
      businessName,
      location,
      analyzedAt: new Date().toISOString()
    }
  });
}
