"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import ComprehensiveAVIDashboard from "./ComprehensiveAVIDashboard";
import EnhancedAVIDashboard from "./EnhancedAVIDashboard";
import { UserRole } from "@/lib/rbac";

interface RoleBasedDashboardProps {
  tenantId?: string;
}

export default function RoleBasedDashboard({ tenantId }: RoleBasedDashboardProps) {
  const { user, isLoaded } = useUser();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      // Get role from Clerk metadata or default to 'user'
      const role = (user.publicMetadata?.role as UserRole) || 'user';
      setUserRole(role);
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // SuperAdmin gets the comprehensive dashboard with all visualizations
  if (userRole === 'superadmin') {
    return <ComprehensiveAVIDashboard tenantId={tenantId} />;
  }

  // All other roles get the standard enhanced dashboard
  return <EnhancedAVIDashboard tenantId={tenantId} />;
}
