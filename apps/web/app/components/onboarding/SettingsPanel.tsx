'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  RefreshCw, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: any) => void;
}

interface Settings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
  integrations: {
    autoSync: boolean;
    syncFrequency: 'realtime' | 'hourly' | 'daily';
    dataRetention: number;
  };
}

export default function SettingsPanel({ isOpen, onClose, onSave }: SettingsPanelProps) {
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      dataSharing: true,
      analytics: true,
      marketing: false
    },
    appearance: {
      theme: 'dark',
      language: 'en',
      timezone: 'America/New_York'
    },
    integrations: {
      autoSync: true,
      syncFrequency: 'hourly',
      dataRetention: 365
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'notifications' | 'privacy' | 'appearance' | 'integrations'>('notifications');
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Load settings from API or localStorage
      const savedSettings = localStorage.getItem('onboarding-settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      // Save to localStorage
      localStorage.setItem('onboarding-settings', JSON.stringify(settings));
      
      // Save to API
      if (onSave) {
        await onSave(settings);
      }
      
      setSaveStatus('success');
      
      // Clear success status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Failed to save settings:', error);
      
      // Clear error status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (category: keyof Settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const toggleApiKeyVisibility = (key: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integrations', icon: <Globe className="w-4 h-4" /> }
  ] as const;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--brand-card)] border border-[var(--brand-border)] rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-primary)]" />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[var(--brand-primary)] text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Notification Preferences</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Email Notifications</div>
                        <div className="text-sm text-white/70">Receive updates via email</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.email}
                        onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
                        className="w-4 h-4 text-[var(--brand-primary)] bg-white/10 border-white/20 rounded focus:ring-[var(--brand-primary)]"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Push Notifications</div>
                        <div className="text-sm text-white/70">Browser notifications for important updates</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.push}
                        onChange={(e) => updateSetting('notifications', 'push', e.target.checked)}
                        className="w-4 h-4 text-[var(--brand-primary)] bg-white/10 border-white/20 rounded focus:ring-[var(--brand-primary)]"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">SMS Notifications</div>
                        <div className="text-sm text-white/70">Text messages for urgent alerts</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.sms}
                        onChange={(e) => updateSetting('notifications', 'sms', e.target.checked)}
                        className="w-4 h-4 text-[var(--brand-primary)] bg-white/10 border-white/20 rounded focus:ring-[var(--brand-primary)]"
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Privacy & Data</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Data Sharing</div>
                        <div className="text-sm text-white/70">Allow sharing of anonymized data for product improvement</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.privacy.dataSharing}
                        onChange={(e) => updateSetting('privacy', 'dataSharing', e.target.checked)}
                        className="w-4 h-4 text-[var(--brand-primary)] bg-white/10 border-white/20 rounded focus:ring-[var(--brand-primary)]"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Analytics</div>
                        <div className="text-sm text-white/70">Help us improve by sharing usage analytics</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.privacy.analytics}
                        onChange={(e) => updateSetting('privacy', 'analytics', e.target.checked)}
                        className="w-4 h-4 text-[var(--brand-primary)] bg-white/10 border-white/20 rounded focus:ring-[var(--brand-primary)]"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Marketing Communications</div>
                        <div className="text-sm text-white/70">Receive promotional emails and updates</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.privacy.marketing}
                        onChange={(e) => updateSetting('privacy', 'marketing', e.target.checked)}
                        className="w-4 h-4 text-[var(--brand-primary)] bg-white/10 border-white/20 rounded focus:ring-[var(--brand-primary)]"
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Appearance & Language</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Theme</label>
                      <select
                        value={settings.appearance.theme}
                        onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Language</label>
                      <select
                        value={settings.appearance.language}
                        onChange={(e) => updateSetting('appearance', 'language', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Timezone</label>
                      <select
                        value={settings.appearance.timezone}
                        onChange={(e) => updateSetting('appearance', 'timezone', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Integration Settings</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Auto Sync</div>
                        <div className="text-sm text-white/70">Automatically sync data from connected platforms</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.integrations.autoSync}
                        onChange={(e) => updateSetting('integrations', 'autoSync', e.target.checked)}
                        className="w-4 h-4 text-[var(--brand-primary)] bg-white/10 border-white/20 rounded focus:ring-[var(--brand-primary)]"
                      />
                    </label>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Sync Frequency</label>
                      <select
                        value={settings.integrations.syncFrequency}
                        onChange={(e) => updateSetting('integrations', 'syncFrequency', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                      >
                        <option value="realtime">Real-time</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Data Retention (days)</label>
                      <input
                        type="number"
                        value={settings.integrations.dataRetention}
                        onChange={(e) => updateSetting('integrations', 'dataRetention', parseInt(e.target.value))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                        min="30"
                        max="3650"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center gap-2">
                {saveStatus === 'success' && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Settings saved
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Failed to save
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/80 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
