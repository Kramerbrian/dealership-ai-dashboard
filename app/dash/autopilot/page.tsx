import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { AutopilotPanel } from '@/components/dashboard/AutopilotPanel';

export default async function AutopilotPage({ searchParams }: { searchParams?: { domain?: string; dealer?: string } }) {
  const { userId } = auth();
  if (!userId) {
    const qs = new URLSearchParams();
    const domainParam = searchParams?.domain || searchParams?.dealer;
    if (domainParam) qs.set('redirect_domain', domainParam);
    const redirectUrl = qs.toString() ? `/sign-in?${qs.toString()}` : '/sign-in';
    redirect(redirectUrl);
  }

  // Support both 'domain' and 'dealer' params for compatibility
  const domain = searchParams?.domain || searchParams?.dealer || 'your dealership';

  return (
    <DashboardShell>
      <AutopilotPanel domain={domain} />
    </DashboardShell>
  );
}