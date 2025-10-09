'use client'

import React from 'react'
import { DashboardAIAssistant } from '@/components/ai-assistant'
import DealershipAIOverview from '@/components/DealershipAIOverview'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">DealershipAI Dashboard</h1>
              <p className="text-sm text-white/60">AI Visibility Analytics & Optimization</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs text-white/60">Current Tier</div>
                <div className="text-sm font-semibold text-white">Professional</div>
              </div>
              <button className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 hover:border-white/40">
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="py-8">
        <DealershipAIOverview />
      </div>

      {/* AI Assistant */}
      <DashboardAIAssistant
        dashboardType="dealership"
        metrics={{
          aiVisibility: '92%',
          monthlyLeads: 245,
          revenueAtRisk: '$367K'
        }}
        theme="dark"
        size="medium"
      />
    </div>
  )
}
