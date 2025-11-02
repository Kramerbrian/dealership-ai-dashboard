import MobileOptimizedDashboard from '../components/mobile/MobileOptimizedDashboard';

// Force dynamic rendering to avoid SSR context issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export default function MobileDashboardPage() {
  return <MobileOptimizedDashboard />;
}
