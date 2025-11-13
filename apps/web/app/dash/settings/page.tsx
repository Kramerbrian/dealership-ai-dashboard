'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AnalyticsSettings } from './components/AnalyticsSettings';
import { GoogleBusinessSettings } from './components/GoogleBusinessSettings';
import { GoogleServicesSettings } from './components/GoogleServicesSettings';
import { SocialMediaSettings } from './components/SocialMediaSettings';
import { ReviewPlatformsSettings } from './components/ReviewPlatformsSettings';
import { IntegrationHealth } from './components/IntegrationHealth';
import { DealerSettings } from '@/lib/types/dealer-settings';

const TABS = [
  { id: 'health', label: 'Integration Health', icon: '💚' },
  { id: 'analytics', label: 'Analytics & Tracking', icon: '📊' },
  { id: 'googleBusiness', label: 'Google Business Profile', icon: '🏢' },
  { id: 'google', label: 'Google Services', icon: '🔍' },
  { id: 'social', label: 'Social Media', icon: '📱' },
  { id: 'reviews', label: 'Review Platforms', icon: '⭐' },
] as const;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>('health');
  const [settings, setSettings] = useState<DealerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Get dealerId from context/auth - using demo for now
  const dealerId = 'lou-grubbs-motors';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/settings/dealer?dealerId=${dealerId}`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSaveMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (section: string, data: any) => {
    try {
      setSaving(true);
      setSaveMessage(null);

      const response = await fetch('/api/settings/dealer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealerId, section, data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save settings');
      }

      const result = await response.json();
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });

      // Refresh settings
      await fetchSettings();

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setSaveMessage({ type: 'error', text: error.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 text-center">
            <p className="text-red-600">Failed to load settings. Please refresh the page.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dealer Settings</h1>
          <p className="text-gray-600">
            Configure your integrations to receive enhanced datasets and analytics
          </p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              saveMessage.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[200px] px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 border-b-2 border-transparent'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {activeTab === 'health' && (
            <IntegrationHealth dealerId={dealerId} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsSettings
              data={settings.analytics}
              onSave={(data) => updateSettings('analytics', data)}
              saving={saving}
            />
          )}
          {activeTab === 'googleBusiness' && (
            <GoogleBusinessSettings
              data={settings.googleBusinessProfile}
              onSave={(data) => updateSettings('googleBusinessProfile', data)}
              saving={saving}
            />
          )}
          {activeTab === 'google' && (
            <GoogleServicesSettings
              data={settings.google}
              onSave={(data) => updateSettings('google', data)}
              saving={saving}
            />
          )}
          {activeTab === 'social' && (
            <SocialMediaSettings
              data={settings.social}
              onSave={(data) => updateSettings('social', data)}
              saving={saving}
            />
          )}
          {activeTab === 'reviews' && (
            <ReviewPlatformsSettings
              data={settings.reviews}
              onSave={(data) => updateSettings('reviews', data)}
              saving={saving}
            />
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> All credentials are encrypted and stored securely. Enable integrations
            to receive enhanced analytics and insights specific to your dealership.
          </p>
        </div>
      </div>
    </div>
  );
}
