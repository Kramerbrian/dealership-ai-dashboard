/**
 * Marketplace Developer Portal
 * 
 * Allows 3rd party developers to:
 * - Register applications
 * - Access SDK documentation
 * - Submit apps for approval
 * - Track revenue sharing
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, Book, CheckCircle2, DollarSign, 
  ExternalLink, Copy, Plus, FileText, 
  TrendingUp, Users, Package, Settings 
} from 'lucide-react';
import { AlertBanner, useAlerts } from '@/app/components/dashboard/AlertBanner';

interface DeveloperApp {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'live';
  installs: number;
  revenue: number;
  rating: number;
  apiCalls: number;
  createdAt: string;
}

interface RevenueShare {
  period: string;
  grossRevenue: number;
  platformFee: number; // 30%
  developerShare: number; // 70%
  paid: boolean;
}

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'apps' | 'docs' | 'revenue'>('overview');
  const [apps, setApps] = useState<DeveloperApp[]>([
    {
      id: '1',
      name: 'Inventory Sync Pro',
      description: 'Sync inventory across multiple platforms',
      status: 'live',
      installs: 142,
      revenue: 2840,
      rating: 4.8,
      apiCalls: 45000,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Review Manager AI',
      description: 'AI-powered review response system',
      status: 'pending',
      installs: 0,
      revenue: 0,
      rating: 0,
      apiCalls: 0,
      createdAt: '2024-01-28'
    }
  ]);

  const [revenueHistory, setRevenueHistory] = useState<RevenueShare[]>([
    {
      period: 'January 2024',
      grossRevenue: 2840,
      platformFee: 852,
      developerShare: 1988,
      paid: true
    },
    {
      period: 'February 2024',
      grossRevenue: 3200,
      platformFee: 960,
      developerShare: 2240,
      paid: false
    }
  ]);

  const { alerts, addAlert } = useAlerts();

  const totalRevenue = revenueHistory.reduce((sum, r) => sum + r.developerShare, 0);
  const pendingPayout = revenueHistory.filter(r => !r.paid).reduce((sum, r) => sum + r.developerShare, 0);
  const totalInstalls = apps.reduce((sum, a) => sum + a.installs, 0);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Developer Marketplace
              </h1>
              <p className="text-gray-400">
                Build, distribute, and monetize apps for DealershipAI
              </p>
            </div>
            <button
              onClick={() => addAlert('info', 'Creating new app...')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              New App
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400 text-sm">Total Apps</span>
              </div>
              <div className="text-2xl font-bold text-white">{apps.length}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Total Installs</span>
              </div>
              <div className="text-2xl font-bold text-white">{totalInstalls.toLocaleString()}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <span className="text-gray-400 text-sm">Total Revenue</span>
              </div>
              <div className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400 text-sm">Pending Payout</span>
              </div>
              <div className="text-2xl font-bold text-white">${pendingPayout.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'apps', label: 'My Apps', icon: Package },
              { id: 'docs', label: 'SDK Docs', icon: Book },
              { id: 'revenue', label: 'Revenue', icon: DollarSign }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === id
                    ? 'border-purple-500 text-purple-400 bg-gray-900'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Start */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-400" />
                  Quick Start
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-900">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Create App</h3>
                      <p className="text-sm text-gray-400">
                        Register your application to get API keys and access credentials
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-900">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Build & Test</h3>
                      <p className="text-sm text-gray-400">
                        Use our SDK to build your app in our sandbox environment
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-900">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Submit for Review</h3>
                      <p className="text-sm text-gray-400">
                        Submit your app for approval to be listed in the marketplace
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-900">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Go Live & Earn</h3>
                      <p className="text-sm text-gray-400">
                        Once approved, start earning 70% revenue share on every install
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval Workflow */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Approval Workflow
                </h2>
                <div className="space-y-3">
                  {[
                    { status: 'draft', label: 'Draft', color: 'gray' },
                    { status: 'pending', label: 'Under Review', color: 'yellow' },
                    { status: 'approved', label: 'Approved', color: 'green' },
                    { status: 'rejected', label: 'Rejected', color: 'red' },
                    { status: 'live', label: 'Live in Marketplace', color: 'purple' }
                  ].map((stage, index) => (
                    <div key={stage.status} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        stage.color === 'gray' ? 'bg-gray-500' :
                        stage.color === 'yellow' ? 'bg-yellow-500' :
                        stage.color === 'green' ? 'bg-green-500' :
                        stage.color === 'red' ? 'bg-red-500' :
                        'bg-purple-500'
                      }`} />
                      <span className="text-gray-300">{stage.label}</span>
                      {index < 4 && (
                        <div className="flex-1 h-px bg-gray-700 mx-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Share Info */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-500/30">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-400" />
                Revenue Sharing
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">70%</div>
                  <div className="text-sm text-gray-400">Developer Share</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">30%</div>
                  <div className="text-sm text-gray-400">Platform Fee</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">Monthly</div>
                  <div className="text-sm text-gray-400">Payout Schedule</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'apps' && (
          <div className="space-y-4">
            {apps.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{app.name}</h3>
                    <p className="text-gray-400">{app.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    app.status === 'live' ? 'bg-green-500/20 text-green-400' :
                    app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    app.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                    app.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {app.status.toUpperCase()}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Installs</div>
                    <div className="text-lg font-bold text-white">{app.installs}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Revenue</div>
                    <div className="text-lg font-bold text-white">${app.revenue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">API Calls</div>
                    <div className="text-lg font-bold text-white">{app.apiCalls.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Rating</div>
                    <div className="text-lg font-bold text-white">{app.rating > 0 ? app.rating.toFixed(1) : 'N/A'}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium">
                    Edit
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium">
                    View Analytics
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium">
                    API Keys
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Book className="w-6 h-6 text-purple-400" />
                SDK Documentation
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-900">
                  <h3 className="font-semibold text-white mb-2">JavaScript/TypeScript SDK</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-sm text-purple-400">npm install @dealershipai/sdk</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('npm install @dealershipai/sdk');
                        addAlert('success', 'Copied to clipboard!');
                      }}
                      className="p-1 hover:bg-gray-800 rounded"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <a href="#" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    View Docs <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="p-4 rounded-lg bg-gray-900">
                  <h3 className="font-semibold text-white mb-2">Python SDK</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-sm text-purple-400">pip install dealershipai-sdk</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('pip install dealershipai-sdk');
                        addAlert('success', 'Copied to clipboard!');
                      }}
                      className="p-1 hover:bg-gray-800 rounded"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <a href="#" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    View Docs <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="p-4 rounded-lg bg-gray-900">
                  <h3 className="font-semibold text-white mb-2">REST API</h3>
                  <p className="text-sm text-gray-400 mb-2">
                    Full REST API documentation with interactive examples
                  </p>
                  <a href="#" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    API Reference <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Example Code */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="font-semibold text-white mb-4">Quick Example</h3>
              <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-gray-300">
{`import { DealershipAI } from '@dealershipai/sdk';

const client = new DealershipAI({
  apiKey: process.env.DEALERSHIPAI_API_KEY
});

// Get dealership metrics
const metrics = await client.dealerships.getMetrics('dealership-id');

// Create a new app
const app = await client.apps.create({
  name: 'My Awesome App',
  description: 'Does amazing things',
  webhookUrl: 'https://myapp.com/webhooks'
});`}
                </code>
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            {/* Revenue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="text-sm text-gray-400 mb-2">Total Earnings</div>
                <div className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="text-sm text-gray-400 mb-2">Pending Payout</div>
                <div className="text-3xl font-bold text-amber-400">${pendingPayout.toLocaleString()}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="text-sm text-gray-400 mb-2">Next Payout</div>
                <div className="text-3xl font-bold text-purple-400">March 1</div>
              </div>
            </div>

            {/* Revenue History */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Revenue History</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Period</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold">Gross Revenue</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold">Platform Fee (30%)</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold">Your Share (70%)</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueHistory.map((period, index) => (
                      <tr key={index} className="border-b border-gray-700/50">
                        <td className="py-4 px-4 text-white">{period.period}</td>
                        <td className="py-4 px-4 text-right text-white">${period.grossRevenue.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right text-gray-400">-${period.platformFee.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right text-green-400 font-semibold">
                          ${period.developerShare.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {period.paid ? (
                            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                              Paid
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {alerts.map(alert => (
        <AlertBanner
          key={alert.id}
          type={alert.type}
          message={alert.message}
          autoHide={alert.autoHide}
        />
      ))}
    </div>
  );
}

