import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { PulseOverview } from '@/components/dashboard/PulseOverview';

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

export default async function DashPage({ searchParams }: { searchParams?: { domain?: string } }) {
  const { userId } = auth();

  if (!userId) {
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
        data={{
          scores: data.scores,
          gbp: data.gbp,
          ugc: {
            score: data.ugc?.score || 0,
            velocity: data.ugc?.velocity,
            response_rate: data.ugc?.response_rate,
            issues: data.ugc?.issues,
          },
          schema: {
            coverage: data.schema?.coverage || 0,
            issues: data.schema?.issues,
          },
          competitive: data.competitive,
          revenue_at_risk: data.revenue_at_risk,
          ai_intro_current: data.ai_intro_current,
          ai_intro_improved: data.ai_intro_improved,
          confidence: data.confidence,
        }}
        domain={domain}
      />
    </DashboardShell>
  );
}
