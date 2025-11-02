'use client';
import DealershipAIDashboardLA from '../components/DealershipAIDashboardLA';

// Force dynamic rendering to avoid SSR context issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function DashboardPage() {
  return <DealershipAIDashboardLA />;
}
