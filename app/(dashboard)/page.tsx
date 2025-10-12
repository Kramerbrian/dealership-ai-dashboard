import DealershipAIDashboard from '@/src/components/DealershipAIDashboard';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <DealershipAIDashboard domain="naplesfordfl.com" />
      </div>
    </div>
  );
}