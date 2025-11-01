'use client';
import { useState } from 'react';
import PermissionsInspector from './PermissionsInspector';
import SLOPanel from './SLOPanel';
import EnhancedButton from './EnhancedButton';
import EnhancedCard, { MetricCard, StatusCard } from './EnhancedCard';
import LoadingSpinner from './LoadingSpinner';

export default function ExampleUsage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'permissions' | 'dashboard' | 'slo'>('permissions');

  const fetchDashboardOverview = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard/overview', { cache: 'no-store' });
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'permissions', label: 'Permissions Inspector', icon: '🔐' },
    { id: 'dashboard', label: 'Dashboard Overview', icon: '📊' },
    { id: 'slo', label: 'SLO Monitors', icon: '⚡' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Production Upgrades Demo</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the enhanced UI with improved animations, better visual hierarchy, and polished interactions
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 p-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Permissions Inspector Example */}
          {activeTab === 'permissions' && (
            <section className="animate-in fade-in-50 duration-300">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Permissions Inspector</h2>
                    <p className="text-gray-600">Interactive RBAC debugging with enhanced UI</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Advanced Playbook
                    </h3>
                    <div className="flex items-center space-x-3">
                      <button 
                        disabled 
                        className="px-4 py-2 rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed text-sm"
                      >
                        Run Advanced Playbook
                      </button>
                      <PermissionsInspector 
                        resource="agents.advanced" 
                        action="run" 
                        role="dealer_user" 
                        plan="starter" 
                        features={[]} 
                      />
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Export CSV
                    </h3>
                    <div className="flex items-center space-x-3">
                      <button 
                        disabled 
                        className="px-4 py-2 rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed text-sm"
                      >
                        Export Audit CSV
                      </button>
                      <PermissionsInspector 
                        resource="export.csv" 
                        action="export" 
                        role="viewer" 
                        plan="starter" 
                        features={['view', 'edit']} 
                      />
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Admin Settings
                    </h3>
                    <div className="flex items-center space-x-3">
                      <button 
                        disabled 
                        className="px-4 py-2 rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed text-sm"
                      >
                        Admin Settings
                      </button>
                      <PermissionsInspector 
                        resource="admin.settings" 
                        action="admin" 
                        role="editor" 
                        plan="professional" 
                        features={['view', 'edit', 'export']} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Dashboard Overview API Example */}
          {activeTab === 'dashboard' && (
            <section className="animate-in fade-in-50 duration-300">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">One-Fetch Dashboard Overview</h2>
                    <p className="text-gray-600">Single API call replaces multiple dashboard fetches</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <EnhancedButton
                    onClick={fetchDashboardOverview}
                    loading={loading}
                    size="lg"
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    }
                  >
                    Fetch Dashboard Overview
                  </EnhancedButton>
                </div>
                
                {dashboardData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-500">
                    <MetricCard
                      title="AI Visibility Index"
                      value={`${dashboardData.kpis.aiv}%`}
                      change="+2.3%"
                      changeType="positive"
                      trend="up"
                      icon={
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      }
                    />
                    
                    <MetricCard
                      title="Search Performance"
                      value={`${dashboardData.kpis.search}%`}
                      change="+1.8%"
                      changeType="positive"
                      trend="up"
                      icon={
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      }
                    />
                    
                    <MetricCard
                      title="Trust Score"
                      value={`${dashboardData.kpis.trust}%`}
                      change="-0.5%"
                      changeType="negative"
                      trend="down"
                      icon={
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      }
                    />
                    
                    <MetricCard
                      title="Revenue at Risk"
                      value={`$${dashboardData.kpis.riskUSD.toLocaleString()}`}
                      change="-5.2%"
                      changeType="positive"
                      trend="up"
                      icon={
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      }
                    />
                    
                    <MetricCard
                      title="Conversion Funnel"
                      value={`${dashboardData.funnel.discover}%`}
                      change="+3.1%"
                      changeType="positive"
                      trend="up"
                      subtitle="Discovery Rate"
                      icon={
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      }
                    />
                    
                    <MetricCard
                      title="Active Listings"
                      value={dashboardData.listings.totals.vdp}
                      change="+12"
                      changeType="positive"
                      trend="up"
                      subtitle="Vehicle Detail Pages"
                      icon={
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      }
                    />
                  </div>
                ) : loading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" text="Loading dashboard data" />
                  </div>
                ) : null}
              </div>
            </section>
          )}

          {/* SLO Monitors Example */}
          {activeTab === 'slo' && (
            <section className="animate-in fade-in-50 duration-300">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">SLO Monitors</h2>
                    <p className="text-gray-600">Real-time performance tracking with enhanced visual indicators</p>
                  </div>
                </div>
                <SLOPanel />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
