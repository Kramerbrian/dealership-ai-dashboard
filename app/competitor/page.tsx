import CompetitorAnalysisDashboard from '@/src/components/competitor/CompetitorAnalysisDashboard';

export default function CompetitorPage() {
  return (
    <div className="container mx-auto py-6">
      <CompetitorAnalysisDashboard 
        tenantId="demo-tenant" 
        userRole="super_admin" 
      />
    </div>
  );
}
