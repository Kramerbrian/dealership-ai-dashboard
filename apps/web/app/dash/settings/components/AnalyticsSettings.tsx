'use client';

import { useState } from 'react';
import { DealerSettings } from '@/lib/types/dealer-settings';

interface Props {
  data: DealerSettings['analytics'];
  onSave: (data: DealerSettings['analytics']) => void;
  saving: boolean;
}

export function AnalyticsSettings({ data, onSave, saving }: Props) {
  const [formData, setFormData] = useState(data);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (section: keyof typeof formData, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics & Tracking</h2>
        <p className="text-gray-600 mb-6">
          Configure your analytics platforms to track visitor behavior and conversions.
        </p>
      </div>

      {/* Google Analytics 4 */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Google Analytics 4</h3>
            <p className="text-sm text-gray-600">Track website traffic and user behavior</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.googleAnalytics.enabled}
              onChange={(e) => updateField('googleAnalytics', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {formData.googleAnalytics.enabled && (
          <div className="space-y-4 ml-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Measurement ID *
              </label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={formData.googleAnalytics.measurementId}
                onChange={(e) => updateField('googleAnalytics', 'measurementId', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={formData.googleAnalytics.enabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                Find in Google Analytics: Admin → Data Streams → Measurement ID
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property ID (Optional)
              </label>
              <input
                type="text"
                placeholder="UA-XXXXXXXXX-X (Legacy)"
                value={formData.googleAnalytics.propertyId || ''}
                onChange={(e) => updateField('googleAnalytics', 'propertyId', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Google Tag Manager */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Google Tag Manager</h3>
            <p className="text-sm text-gray-600">Manage all your marketing tags in one place</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.googleTagManager.enabled}
              onChange={(e) => updateField('googleTagManager', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {formData.googleTagManager.enabled && (
          <div className="ml-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Container ID *
            </label>
            <input
              type="text"
              placeholder="GTM-XXXXXXX"
              value={formData.googleTagManager.containerId}
              onChange={(e) => updateField('googleTagManager', 'containerId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={formData.googleTagManager.enabled}
            />
            <p className="text-xs text-gray-500 mt-1">
              Find in Google Tag Manager: Admin → Container Settings
            </p>
          </div>
        )}
      </div>

      {/* Facebook Pixel */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Facebook Pixel</h3>
            <p className="text-sm text-gray-600">Track conversions from Facebook ads</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.facebookPixel.enabled}
              onChange={(e) => updateField('facebookPixel', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {formData.facebookPixel.enabled && (
          <div className="ml-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pixel ID *
            </label>
            <input
              type="text"
              placeholder="123456789012345"
              value={formData.facebookPixel.pixelId}
              onChange={(e) => updateField('facebookPixel', 'pixelId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={formData.facebookPixel.enabled}
            />
            <p className="text-xs text-gray-500 mt-1">
              Find in Facebook Events Manager: Data Sources → Pixels
            </p>
          </div>
        )}
      </div>

      {/* TikTok Pixel */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">TikTok Pixel</h3>
            <p className="text-sm text-gray-600">Track TikTok ad performance</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.tiktokPixel.enabled}
              onChange={(e) => updateField('tiktokPixel', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {formData.tiktokPixel.enabled && (
          <div className="ml-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pixel ID *
            </label>
            <input
              type="text"
              placeholder="CXXXXXXXXXXXXXXXXX"
              value={formData.tiktokPixel.pixelId}
              onChange={(e) => updateField('tiktokPixel', 'pixelId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={formData.tiktokPixel.enabled}
            />
            <p className="text-xs text-gray-500 mt-1">
              Find in TikTok Ads Manager: Assets → Events
            </p>
          </div>
        )}
      </div>

      {/* Microsoft Clarity */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Microsoft Clarity</h3>
            <p className="text-sm text-gray-600">Session recordings and heatmaps</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.microsoftClarity.enabled}
              onChange={(e) => updateField('microsoftClarity', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {formData.microsoftClarity.enabled && (
          <div className="ml-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project ID *
            </label>
            <input
              type="text"
              placeholder="abc123def456"
              value={formData.microsoftClarity.projectId}
              onChange={(e) => updateField('microsoftClarity', 'projectId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={formData.microsoftClarity.enabled}
            />
            <p className="text-xs text-gray-500 mt-1">
              Find in Microsoft Clarity: Settings → Setup
            </p>
          </div>
        )}
      </div>

      {/* Hotjar */}
      <div className="pb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Hotjar</h3>
            <p className="text-sm text-gray-600">User behavior analytics and feedback</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hotjar.enabled}
              onChange={(e) => updateField('hotjar', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {formData.hotjar.enabled && (
          <div className="ml-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site ID *
            </label>
            <input
              type="text"
              placeholder="1234567"
              value={formData.hotjar.siteId}
              onChange={(e) => updateField('hotjar', 'siteId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={formData.hotjar.enabled}
            />
            <p className="text-xs text-gray-500 mt-1">
              Find in Hotjar: Sites & Organizations → Tracking Code
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Analytics Settings'}
        </button>
      </div>
    </form>
  );
}
