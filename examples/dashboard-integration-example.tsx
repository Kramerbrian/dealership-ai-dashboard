/**
 * Example: Integrating Zero-Click tracking into your dashboard
 * 
 * This file shows how to integrate the Zero-Click and AIRI cards
 * into your existing dashboard layouts.
 */

'use client';
import MarketAwareZeroClickCard from '@/components/zero-click/MarketAwareZeroClickCard';
import AiriCard from '@/components/zero-click/AiriCard';
import ZeroClickCard from '@/components/zero-click/ZeroClickCard';

// Example 1: Dashboard with Geo-Personalization
export default function DashboardWithGeo() {
  const tenantId = 'your-tenant-id'; // Get from auth context
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">DealershipAI Intelligence Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Market-aware Zero-Click Card - Automatically detects location */}
        <MarketAwareZeroClickCard tenantId={tenantId} />
        
        {/* AIRI Card - Tracks AI displacement */}
        <AiriCard tenantId={tenantId} />
      </div>
    </div>
  );
}

// Example 2: Dashboard without Geo-Personalization
export function DashboardWithoutGeo() {
  const tenantId = 'your-tenant-id';
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">DealershipAI Intelligence Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Standard Zero-Click Card */}
        <ZeroClickCard tenantId={tenantId} />
        
        {/* AIRI Card */}
        <AiriCard tenantId={tenantId} />
      </div>
    </div>
  );
}

// Example 3: Full Dashboard with all components
export function FullDashboard() {
  const tenantId = 'your-tenant-id';
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">DealershipAI Intelligence Dashboard</h1>
      
      {/* KPIs Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <MarketAwareZeroClickCard tenantId={tenantId} />
        <AiriCard tenantId={tenantId} />
        {/* Add other KPI cards here */}
      </div>
      
      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Add trend charts here */}
      </div>
      
      {/* Action Items Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Add quick wins, recommendations, etc. */}
      </div>
    </div>
  );
}

// Example 4: With Modals for Explanations
import { useState } from 'react';
import WhereDidClicksGo from '@/components/zero-click/modals/WhereDidClicksGo';
import AiriExplainer from '@/components/zero-click/modals/AiriExplainer';

export function DashboardWithModals() {
  const tenantId = 'your-tenant-id';
  const [showZeroClickModal, setShowZeroClickModal] = useState(false);
  const [showAiriModal, setShowAiriModal] = useState(false);
  
  return (
    <>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">DealershipAI Intelligence Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Zero-Click Tracking</h2>
              <button 
                onClick={() => setShowZeroClickModal(true)}
                className="text-xs text-blue-600 hover:underline"
              >
                What is this?
              </button>
            </div>
            <MarketAwareZeroClickCard tenantId={tenantId} />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">AI Impact</h2>
              <button 
                onClick={() => setShowAiriModal(true)}
                className="text-xs text-blue-600 hover:underline"
              >
                Learn more
              </button>
            </div>
            <AiriCard tenantId={tenantId} />
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <WhereDidClicksGo 
        open={showZeroClickModal} 
        onClose={() => setShowZeroClickModal(false)} 
      />
      <AiriExplainer 
        open={showAiriModal} 
        onClose={() => setShowAiriModal(false)} 
      />
    </>
  );
}

// Example 5: Dynamic Tenant ID from Auth Context
import { useAuth } from '@clerk/nextjs';

export function DashboardWithAuth() {
  const { userId } = useAuth();
  // Assuming you have a function to get tenantId from userId
  const tenantId = userId || 'default-tenant';
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your AI Intelligence Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <MarketAwareZeroClickCard tenantId={tenantId} />
        <AiriCard tenantId={tenantId} />
      </div>
    </div>
  );
}

// Example 6: Custom Styling
export function CustomStyledDashboard() {
  const tenantId = 'your-tenant-id';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">AI Intelligence Center</h1>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <MarketAwareZeroClickCard tenantId={tenantId} />
          <AiriCard tenantId={tenantId} />
        </div>
      </div>
    </div>
  );
}
