import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface ReviewData {
  platform: string;
  rating: number;
  count: number;
  recentReviews: Array<{
    author: string;
    rating: number;
    text: string;
    date: string;
    platform: string;
  }>;
}

interface SentimentAnalysis {
  overall: number;
  positive: number;
  neutral: number;
  negative: number;
  trends: Array<{
    date: string;
    sentiment: number;
  }>;
}

interface CompetitorComparison {
  competitor: string;
  rating: number;
  reviewCount: number;
  marketShare: number;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') || 'dealershipai.com';
    
    // Simulate real review aggregation
    const [reviews, sentiment, competitors] = await Promise.all([
      getReviewData(domain),
      getSentimentAnalysis(domain),
      getCompetitorComparison(domain)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        sentiment,
        competitors,
        lastUpdated: new Date().toISOString(),
        domain
      }
    });

  } catch (error) {
    console.error('Reviews API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch review data' },
      { status: 500 }
    );
  }
}

async function getReviewData(domain: string): Promise<ReviewData[]> {
  // Simulate real review aggregation from multiple platforms
  return [
    {
      platform: 'Google',
      rating: 4.7,
      count: 342,
      recentReviews: [
        {
          author: 'Sarah Johnson',
          rating: 5,
          text: 'Excellent service! The team was professional and got my car fixed quickly.',
          date: '2024-10-15',
          platform: 'Google'
        },
        {
          author: 'Mike Chen',
          rating: 4,
          text: 'Good experience overall. Staff was friendly and knowledgeable.',
          date: '2024-10-14',
          platform: 'Google'
        }
      ]
    },
    {
      platform: 'Yelp',
      rating: 4.5,
      count: 128,
      recentReviews: [
        {
          author: 'Jennifer Davis',
          rating: 5,
          text: 'Amazing customer service! Highly recommend this dealership.',
          date: '2024-10-13',
          platform: 'Yelp'
        }
      ]
    },
    {
      platform: 'Facebook',
      rating: 4.8,
      count: 89,
      recentReviews: [
        {
          author: 'Robert Wilson',
          rating: 5,
          text: 'Best dealership in town! Fair prices and honest service.',
          date: '2024-10-12',
          platform: 'Facebook'
        }
      ]
    }
  ];
}

async function getSentimentAnalysis(domain: string): Promise<SentimentAnalysis> {
  // Simulate real sentiment analysis
  return {
    overall: 0.82, // 82% positive sentiment
    positive: 0.75,
    neutral: 0.15,
    negative: 0.10,
    trends: [
      { date: '2024-10-01', sentiment: 0.78 },
      { date: '2024-10-02', sentiment: 0.80 },
      { date: '2024-10-03', sentiment: 0.82 },
      { date: '2024-10-04', sentiment: 0.85 },
      { date: '2024-10-05', sentiment: 0.83 },
      { date: '2024-10-06', sentiment: 0.81 },
      { date: '2024-10-07', sentiment: 0.84 }
    ]
  };
}

async function getCompetitorComparison(domain: string): Promise<CompetitorComparison[]> {
  // Simulate real competitor analysis
  return [
    {
      competitor: 'AutoMax Dealership',
      rating: 4.3,
      reviewCount: 245,
      marketShare: 0.35
    },
    {
      competitor: 'Premier Motors',
      rating: 4.6,
      reviewCount: 189,
      marketShare: 0.28
    },
    {
      competitor: 'City Auto Center',
      rating: 4.1,
      reviewCount: 156,
      marketShare: 0.22
    }
  ];
}
