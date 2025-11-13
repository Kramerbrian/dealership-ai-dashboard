import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { AutopilotPanel } from '@/components/dashboard/AutopilotPanel';

export default async function AutopilotPage({ searchParams }: { searchParams?: { domain?: string } }) {
  const { userId } = auth();
  if (!userId) {
    const qs = new URLSearchParams();
    if (searchParams?.domain) qs.set('redirect_domain', searchParams.domain);
    const redirectUrl = qs.toString() ? `/sign-in?${qs.toString()}` : '/sign-in';
    redirect(redirectUrl);
  }

  const domain = searchParams?.domain || 'your dealership';

  return (
    <DashboardShell>
      <AutopilotPanel domain={domain} />
    </DashboardShell>
  );
}
