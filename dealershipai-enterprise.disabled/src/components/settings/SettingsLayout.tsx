'use client'

import { useState } from 'react'
import { User, Building2, Users, Bell, Shield, CreditCard } from 'lucide-react'

interface SettingsLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function SettingsLayout({ children, activeTab, onTabChange }: SettingsLayoutProps) {
  const tabs = [
    {
      id: 'profile',
      name: 'Profile',
      icon: User,
      description: 'Manage your personal information'
    },
    {
      id: 'organization',
      name: 'Organization',
      icon: Building2,
      description: 'Company settings and preferences'
    },
    {
      id: 'team',
      name: 'Team',
      icon: Users,
      description: 'Manage team members and permissions'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      description: 'Email and alert preferences'
    },
    {
      id: 'security',
      name: 'Security',
      icon: Shield,
      description: 'Password and security settings'
    },
    {
      id: 'billing',
      name: 'Billing',
      icon: CreditCard,
      description: 'Subscription and payment information'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{tab.name}</div>
                    <div className="text-sm text-slate-500">{tab.description}</div>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
