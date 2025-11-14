import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { PulseOverview } from '@/components/dashboard/PulseOverview';
import { getAuthUser } from '@/lib/auth-wrapper';

async function fetchClarity(domain?: string) {
  const qs = new URLSearchParams();
  if (domain) qs.set('domain', domain);
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const url = base
    ? `${base}/api/clarity/stack?${qs.toString()}`
    : `/api/clarity/stack?${qs.toString()}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to load clarity stack');
  }
  return res.json();
}

export default async function DashPage({ searchParams }: { searchParams?: { domain?: string; __clerk_handshake?: string } }) {
  // Check if this is a Clerk handshake - allow it to complete
  const isClerkHandshake = searchParams && '__clerk_handshake' in searchParams;
  
  // Use universal auth wrapper (works with or without Clerk)
  const auth = await getAuthUser();
  
  // Only redirect to sign-in if Clerk is configured and user is not authenticated
  // BUT: Don't redirect during Clerk handshake - let it complete
  const isClerkConfigured = !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
  );
  
  if (isClerkConfigured && !auth.isAuthenticated && !isClerkHandshake) {
    const qs = new URLSearchParams();
    if (searchParams?.domain) qs.set('redirect_domain', searchParams.domain);
    const redirectUrl = qs.toString() ? `/sign-in?${qs.toString()}` : '/sign-in';
    redirect(redirectUrl);
  }

  const domain = searchParams?.domain || 'exampledealer.com';
  const data = await fetchClarity(domain);

  return (
    <DashboardShell>
      <PulseOverview
        domain={data.domain}
        scores={data.scores}
        gbp={data.gbp}
        ugc={{
          score: data.ugc.score,
          recent_reviews_90d: data.ugc.recent_reviews_90d
        }}
        schema={{ score: data.schema.score }}
        competitive={{
          rank: data.competitive.rank,
          total: data.competitive.total
        }}
        revenueMonthly={data.revenue_at_risk.monthly}
      />
    </DashboardShell>
  );
}