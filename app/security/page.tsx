import BasicSecurityDashboard from '@/src/components/security/BasicSecurityDashboard';

export default function SecurityPage() {
  return (
    <div className="container mx-auto py-6">
      <BasicSecurityDashboard 
        tenantId="demo-tenant" 
        userRole="super_admin" 
      />
    </div>
  );
}
