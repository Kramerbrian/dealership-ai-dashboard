'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Settings, User, Bell, Shield, Palette, Database, Key } from 'lucide-react';
import OrchestratorStatusPanel from '@/components/command-center/OrchestratorStatusPanel';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('orchestrator');

  useEffect(() => {
    if (isLoaded && !user) {
      redirect('/sign-in');
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const dealerId = (user.publicMetadata?.dealerId as string) || user.id || 'demo-tenant';

  const tabs = [
    { id: 'orchestrator', label: 'Orchestrator', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Database },
    { id: 'api', label: 'API Keys', icon: Key },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-slate-400">Manage your dashboard preferences and configurations</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Orchestrator Tab */}
          {activeTab === 'orchestrator' && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">AI Orchestrator Configuration</h2>
                <p className="text-slate-400 mb-6">
                  Monitor and configure your AI Chief Strategy Officer system
                </p>
                <OrchestratorStatusPanel dealerId={dealerId} />
              </div>

              {/* Additional Orchestrator Settings */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Automation Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                    <div>
                      <div className="text-white font-medium">Auto-Run Daily Analysis</div>
                      <div className="text-sm text-slate-400">Automatically run full analysis every morning</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded bg-slate-700 border-slate-600" />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                    <div>
                      <div className="text-white font-medium">Real-Time Monitoring</div>
                      <div className="text-sm text-slate-400">Continuously monitor for issues and opportunities</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded bg-slate-700 border-slate-600" />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                    <div>
                      <div className="text-white font-medium">Email Alerts</div>
                      <div className="text-sm text-slate-400">Send email notifications for critical insights</div>
                    </div>
                    <input type="checkbox" className="w-5 h-5 rounded bg-slate-700 border-slate-600" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Profile Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                  <input
                    type="text"
                    defaultValue={user.fullName || user.firstName || ''}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={user.primaryEmailAddress?.emailAddress || ''}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Dealer ID</label>
                  <input
                    type="text"
                    defaultValue={dealerId}
                    disabled
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <span className="text-white">Email Notifications</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <span className="text-white">Push Notifications</span>
                  <input type="checkbox" className="w-5 h-5" />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <span className="text-white">Weekly Summary Reports</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </label>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Security Settings</h2>
              <div className="space-y-4">
                <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
                  Change Password
                </button>
                <button className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-medium transition-colors">
                  Enable Two-Factor Authentication
                </button>
                <button className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors">
                  Sign Out All Devices
                </button>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Appearance</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Theme</label>
                  <select className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white">
                    <option>Dark (Default)</option>
                    <option>Light</option>
                    <option>Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Accent Color</label>
                  <div className="flex gap-2">
                    <button className="w-12 h-12 rounded-lg bg-blue-500 border-2 border-white"></button>
                    <button className="w-12 h-12 rounded-lg bg-purple-500 border-2 border-transparent hover:border-white"></button>
                    <button className="w-12 h-12 rounded-lg bg-emerald-500 border-2 border-transparent hover:border-white"></button>
                    <button className="w-12 h-12 rounded-lg bg-pink-500 border-2 border-transparent hover:border-white"></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Integrations</h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Google Analytics 4</div>
                      <div className="text-sm text-slate-400">Track website analytics</div>
                    </div>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium">
                      Connected
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Supabase</div>
                      <div className="text-sm text-slate-400">Database & storage</div>
                    </div>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium">
                      Connected
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Upstash Redis</div>
                      <div className="text-sm text-slate-400">Caching & rate limiting</div>
                    </div>
                    <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium">
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'api' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">API Keys</h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-medium">Production API Key</div>
                    <button className="text-sm text-blue-400 hover:text-blue-300">Regenerate</button>
                  </div>
                  <code className="block px-4 py-2 bg-slate-900 rounded text-sm text-slate-400 font-mono">
                    sk_prod_••••••••••••••••••••••••
                  </code>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-medium">Development API Key</div>
                    <button className="text-sm text-blue-400 hover:text-blue-300">Regenerate</button>
                  </div>
                  <code className="block px-4 py-2 bg-slate-900 rounded text-sm text-slate-400 font-mono">
                    sk_dev_••••••••••••••••••••••••
                  </code>
                </div>
                <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
                  Create New API Key
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
