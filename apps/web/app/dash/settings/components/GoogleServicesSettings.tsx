'use client';

import { useState } from 'react';
import { DealerSettings } from '@/lib/types/dealer-settings';

interface Props {
  data: DealerSettings['google'];
  onSave: (data: DealerSettings['google']) => void;
  saving: boolean;
}

export function GoogleServicesSettings({ data, onSave, saving }: Props) {
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Google Services</h2>
        <p className="text-gray-600 mb-6">
          Connect additional Google services to enhance your search presence and track advertising performance.
        </p>
      </div>

      {/* Google Search Console */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Google Search Console</h3>
            <p className="text-sm text-gray-600">Monitor your organic search performance</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.searchConsole.enabled}
              onChange={(e) => updateField('searchConsole', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {formData.searchConsole.enabled && (
          <div className="space-y-4 ml-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site URL *
              </label>
              <input
                type="url"
                placeholder="https://www.yourdealership.com"
                value={formData.searchConsole.siteUrl}
                onChange={(e) => updateField('searchConsole', 'siteUrl', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={formData.searchConsole.enabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must match exactly as it appears in Search Console
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code (Optional)
              </label>
              <input
                type="text"
                placeholder="google-site-verification=..."
                value={formData.searchConsole.verificationCode || ''}
                onChange={(e) => updateField('searchConsole', 'verificationCode', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Meta tag verification code from Search Console
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Benefits:</strong> Track keywords, impressions, clicks, and search rankings
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Google Ads */}
      <div className="pb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Google Ads</h3>
            <p className="text-sm text-gray-600">Track your Google advertising campaigns</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.ads.enabled}
              onChange={(e) => updateField('ads', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {formData.ads.enabled && (
          <div className="space-y-4 ml-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer ID *
              </label>
              <input
                type="text"
                placeholder="123-456-7890"
                value={formData.ads.customerId}
                onChange={(e) => updateField('ads', 'customerId', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={formData.ads.enabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                Find in Google Ads: Account settings (format: XXX-XXX-XXXX)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conversion ID (Optional)
              </label>
              <input
                type="text"
                placeholder="AW-123456789"
                value={formData.ads.conversionId || ''}
                onChange={(e) => updateField('ads', 'conversionId', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Conversion tracking ID for measuring ad performance
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conversion Label (Optional)
              </label>
              <input
                type="text"
                placeholder="abcDEF123ghi"
                value={formData.ads.conversionLabel || ''}
                onChange={(e) => updateField('ads', 'conversionLabel', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Conversion label for specific actions
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Benefits:</strong> Track ROI, conversions, and ad spend efficiency
              </p>
            </div>
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
          {saving ? 'Saving...' : 'Save Google Services Settings'}
        </button>
      </div>
    </form>
  );
}
