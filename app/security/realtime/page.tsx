import RealTimeSecurityDashboard from '@/src/components/security/RealTimeSecurityDashboard';

export default function RealTimeSecurityPage() {
  return (
    <div className="container mx-auto py-6">
      <RealTimeSecurityDashboard 
        tenantId="demo-tenant" 
        userRole="super_admin" 
      />
    </div>
  );
}
