'use client';
import { useState } from 'react';
import PermissionsInspector from '@/components/PermissionsInspector';
import FeatureButton from '@/components/FeatureButton';

export default function PermissionsDemoPage() {
  const [userRole, setUserRole] = useState<'viewer' | 'editor' | 'admin' | 'dealer_user'>('viewer');
  const [userPlan, setUserPlan] = useState<'starter' | 'growth' | 'professional'>('starter');
  const [userFeatures, setUserFeatures] = useState<string[]>(['view']);

  const updateFeatures = (plan: string) => {
    switch (plan) {
      case 'starter':
        setUserFeatures(['view']);
        break;
      case 'growth':
        setUserFeatures(['view', 'edit', 'export']);
        break;
      case 'professional':
        setUserFeatures(['view', 'edit', 'export', 'admin', 'advanced']);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900">Permissions Inspector Demo</h1>
          <p className="text-gray-600 mt-2">Test RBAC debugging and feature gating</p>
        </div>

        {/* User Configuration */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">User Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
                <option value="dealer_user">Dealer User</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan
              </label>
              <select
                value={userPlan}
                onChange={(e) => {
                  setUserPlan(e.target.value as any);
                  updateFeatures(e.target.value);
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="professional">Professional</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Features
            </label>
            <div className="flex flex-wrap gap-2">
              {userFeatures.map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Button Examples */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Feature Button Examples</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <FeatureButton
                feature="analytics.advanced"
                action="view"
                userRole={userRole}
                userPlan={userPlan}
                userFeatures={userFeatures}
                onClick={() => console.log('Viewing advanced analytics')}
              >
                View Advanced Analytics
              </FeatureButton>
            </div>

            <div className="flex items-center space-x-4">
              <FeatureButton
                feature="export.csv"
                action="export"
                userRole={userRole}
                userPlan={userPlan}
                userFeatures={userFeatures}
                onClick={() => console.log('Exporting CSV')}
              >
                Export CSV Report
              </FeatureButton>
            </div>

            <div className="flex items-center space-x-4">
              <FeatureButton
                feature="admin.settings"
                action="admin"
                userRole={userRole}
                userPlan={userPlan}
                userFeatures={userFeatures}
                onClick={() => console.log('Admin settings')}
              >
                Admin Settings
              </FeatureButton>
            </div>

            <div className="flex items-center space-x-4">
              <FeatureButton
                feature="audit.advanced"
                action="run"
                userRole={userRole}
                userPlan={userPlan}
                userFeatures={userFeatures}
                onClick={() => console.log('Running advanced audit')}
              >
                Run Advanced Audit
              </FeatureButton>
            </div>
          </div>
        </div>

        {/* Manual Permissions Inspector Examples */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Manual Permissions Inspector Examples</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <button 
                disabled 
                className="px-4 py-2 rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed"
              >
                Run Advanced Playbook
              </button>
              <PermissionsInspector 
                resource="agents.advanced" 
                action="run" 
                role={userRole} 
                plan={userPlan} 
                features={userFeatures} 
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                disabled 
                className="px-4 py-2 rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed"
              >
                Export Audit CSV
              </button>
              <PermissionsInspector 
                resource="export.csv" 
                action="export" 
                role={userRole} 
                plan={userPlan} 
                features={userFeatures} 
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                disabled 
                className="px-4 py-2 rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed"
              >
                Admin Settings
              </button>
              <PermissionsInspector 
                resource="admin.settings" 
                action="admin" 
                role={userRole} 
                plan={userPlan} 
                features={userFeatures} 
              />
            </div>
          </div>
        </div>

        {/* Testing Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🧪 Testing Guide</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>1. Change User Role:</strong> Try different roles (viewer, editor, admin) to see how permissions change</p>
            <p><strong>2. Change Plan:</strong> Switch between starter, growth, and professional to see feature availability</p>
            <p><strong>3. Click "Why disabled?":</strong> See detailed explanations for why features are disabled</p>
            <p><strong>4. Test Combinations:</strong> Try viewer + professional vs admin + starter to see how both role and plan affect access</p>
          </div>
        </div>
      </div>
    </div>
  );
}
