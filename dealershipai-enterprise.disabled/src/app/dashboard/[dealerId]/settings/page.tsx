'use client'

import { useState } from 'react'
import SettingsLayout from '@/components/settings/SettingsLayout'
import ProfileSettings from '@/components/settings/ProfileSettings'
import TeamSettings from '@/components/settings/TeamSettings'
import BillingSettings from '@/components/settings/BillingSettings'

interface SettingsPageProps {
  params: Promise<{ dealerId: string }>
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState('profile')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />
      case 'team':
        return <TeamSettings />
      case 'billing':
        return <BillingSettings />
      case 'organization':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Organization Settings</h2>
            <p className="text-slate-600">Organization settings coming soon...</p>
          </div>
        )
      case 'notifications':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Notification Settings</h2>
            <p className="text-slate-600">Notification settings coming soon...</p>
          </div>
        )
      case 'security':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Security Settings</h2>
            <p className="text-slate-600">Security settings coming soon...</p>
          </div>
        )
      default:
        return <ProfileSettings />
    }
  }

  return (
    <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </SettingsLayout>
  )
}
