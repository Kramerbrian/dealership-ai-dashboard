import IPProtectionDashboard from '@/components/ip-protection/IPProtectionDashboard';

export const dynamic = 'force-dynamic';

export default function IPProtectionPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <IPProtectionDashboard />
      </div>
    </div>
  );
}
