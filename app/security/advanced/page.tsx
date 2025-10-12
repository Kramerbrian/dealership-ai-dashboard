import AdvancedSecurityDashboard from '@/src/components/security/AdvancedSecurityDashboard';

export default function AdvancedSecurityPage() {
  return (
    <div className="container mx-auto py-6">
      <AdvancedSecurityDashboard 
        tenantId="demo-tenant" 
        userRole="super_admin" 
      />
    </div>
  );
}
