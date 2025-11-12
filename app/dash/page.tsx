import { Suspense } from 'react';
import { PulseOverview } from '@/components/dashboard/PulseOverview';

interface ClarityStackData {
  scores: {
    seo: number;
    aeo: number;
    geo: number;
    avi: number;
  };
  location?: {
    lat: number;
    lng: number;
    city?: string;
    state?: string;
  };
  gbp: {
    score: number;
    rating: number;
    review_count: number;
    issues?: string[];
  };
  ugc: {
    score: number;
    velocity?: number;
    response_rate?: number;
    issues?: string[];
  };
  schema: {
    coverage: number;
    issues?: string[];
  };
  competitive: {
    rank: number;
    total: number;
    leaders?: Array<{ name: string; score: number }>;
    gap?: number;
  };
  revenue_at_risk: {
    monthly: number;
    annual: number;
    assumptions?: Record<string, any>;
  };
  ai_intro_current?: string;
  ai_intro_improved?: string;
  confidence?: 'LOW' | 'MEDIUM' | 'HIGH';
}

async function getClarityStack(domain: string): Promise<ClarityStackData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/clarity/stack?domain=${encodeURIComponent(domain)}`;
    
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('Failed to fetch clarity stack:', res.status, res.statusText);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching clarity stack:', error);
    return null;
  }
}

function PulseOverviewSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-8 bg-white/5 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function DashPage({
  searchParams,
}: {
  searchParams: { domain?: string };
}) {
  const domain = searchParams.domain || 'demo-dealership.com';
  const data = await getClarityStack(domain);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Suspense fallback={<PulseOverviewSkeleton />}>
        {data ? (
          <PulseOverview data={data} domain={domain} />
        ) : (
          <div className="max-w-7xl mx-auto p-6">
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
              <h2 className="text-xl font-semibold mb-2">Unable to load data</h2>
              <p className="text-white/60">
                Failed to fetch clarity stack data for <code className="text-white/80">{domain}</code>.
                Please check the domain and try again.
              </p>
            </div>
          </div>
        )}
      </Suspense>
    </main>
  );
}
