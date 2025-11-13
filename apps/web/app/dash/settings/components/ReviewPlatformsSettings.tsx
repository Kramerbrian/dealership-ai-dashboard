'use client';

import { useState } from 'react';
import { DealerSettings } from '@/lib/types/dealer-settings';

interface Props {
  data: DealerSettings['reviews'];
  onSave: (data: DealerSettings['reviews']) => void;
  saving: boolean;
}

export function ReviewPlatformsSettings({ data, onSave, saving }: Props) {
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Platforms</h2>
        <p className="text-gray-600 mb-6">
          Connect review platforms to monitor and manage your online reputation.
        </p>
      </div>

      {/* Google Reviews */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Google Reviews</h3>
            <p className="text-sm text-gray-600">Monitor and respond to Google reviews</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.googleReviews.enabled}
              onChange={(e) => updateField('googleReviews', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {formData.googleReviews.enabled && (
          <div className="space-y-4 ml-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Auto-Monitor New Reviews</p>
                <p className="text-xs text-gray-600">Get notified when new reviews are posted</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.googleReviews.autoMonitor}
                  onChange={(e) => updateField('googleReviews', 'autoMonitor', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Auto-Respond (Beta)</p>
                <p className="text-xs text-gray-600">AI-powered review responses</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.googleReviews.autoRespond}
                  onChange={(e) => updateField('googleReviews', 'autoRespond', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Google Reviews are automatically pulled from your Google Business Profile settings.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Yelp */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Yelp</h3>
            <p className="text-sm text-gray-600">Track your Yelp business reviews</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.yelp.enabled}
              onChange={(e) => updateField('yelp', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {formData.yelp.enabled && (
          <div className="ml-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business ID (Optional)
            </label>
            <input
              type="text"
              placeholder="xyz-dealership-chicago"
              value={formData.yelp.businessId || ''}
              onChange={(e) => updateField('yelp', 'businessId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Find in your Yelp business page URL: yelp.com/biz/[business-id]
            </p>
          </div>
        )}
      </div>

      {/* DealerRater */}
      <div className="pb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">DealerRater</h3>
            <p className="text-sm text-gray-600">Monitor automotive-specific reviews</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.dealerRater.enabled}
              onChange={(e) => updateField('dealerRater', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {formData.dealerRater.enabled && (
          <div className="ml-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dealer ID (Optional)
            </label>
            <input
              type="text"
              placeholder="12345"
              value={formData.dealerRater.dealerId || ''}
              onChange={(e) => updateField('dealerRater', 'dealerId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Find in your DealerRater profile URL
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Review Management Benefits:</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Centralized review monitoring across all platforms</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Real-time alerts for new reviews</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Sentiment analysis and trend tracking</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Competitive review benchmarking</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>AI-powered response suggestions</span>
          </li>
        </ul>
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Review Platform Settings'}
        </button>
      </div>
    </form>
  );
}
