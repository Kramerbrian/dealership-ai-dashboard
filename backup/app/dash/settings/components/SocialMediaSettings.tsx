'use client';

import { useState } from 'react';
import { DealerSettings } from '@/lib/types/dealer-settings';

interface Props {
  data: DealerSettings['social'];
  onSave: (data: DealerSettings['social']) => void;
  saving: boolean;
}

export function SocialMediaSettings({ data, onSave, saving }: Props) {
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Social Media</h2>
        <p className="text-gray-600 mb-6">
          Connect your social media accounts to track engagement and brand presence.
        </p>
      </div>

      {/* Facebook */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Facebook</h3>
            <p className="text-sm text-gray-600">Track your Facebook page performance</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.facebook.enabled}
              onChange={(e) => updateField('facebook', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {formData.facebook.enabled && (
          <div className="ml-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page ID (Optional)
            </label>
            <input
              type="text"
              placeholder="123456789012345"
              value={formData.facebook.pageId || ''}
              onChange={(e) => updateField('facebook', 'pageId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Find at: facebook.com/your-page → About → Page ID
            </p>
          </div>
        )}
      </div>

      {/* Instagram */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Instagram</h3>
            <p className="text-sm text-gray-600">Track your Instagram business account</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.instagram.enabled}
              onChange={(e) => updateField('instagram', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {formData.instagram.enabled && (
          <div className="ml-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Account ID (Optional)
            </label>
            <input
              type="text"
              placeholder="17841400000000000"
              value={formData.instagram.businessAccountId || ''}
              onChange={(e) => updateField('instagram', 'businessAccountId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Available through Facebook Business Manager
            </p>
          </div>
        )}
      </div>

      {/* Twitter/X */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Twitter / X</h3>
            <p className="text-sm text-gray-600">Monitor your Twitter presence</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.twitter.enabled}
              onChange={(e) => updateField('twitter', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {formData.twitter.enabled && (
          <div className="ml-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username (Optional)
            </label>
            <input
              type="text"
              placeholder="@yourdealership"
              value={formData.twitter.username || ''}
              onChange={(e) => updateField('twitter', 'username', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your Twitter/X handle (include the @)
            </p>
          </div>
        )}
      </div>

      {/* LinkedIn */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">LinkedIn</h3>
            <p className="text-sm text-gray-600">Track your company's LinkedIn presence</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.linkedin.enabled}
              onChange={(e) => updateField('linkedin', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {formData.linkedin.enabled && (
          <div className="ml-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company ID (Optional)
            </label>
            <input
              type="text"
              placeholder="12345678"
              value={formData.linkedin.companyId || ''}
              onChange={(e) => updateField('linkedin', 'companyId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Find in your company page URL: linkedin.com/company/[ID]
            </p>
          </div>
        )}
      </div>

      {/* YouTube */}
      <div className="pb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">YouTube</h3>
            <p className="text-sm text-gray-600">Monitor your YouTube channel</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.youtube.enabled}
              onChange={(e) => updateField('youtube', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {formData.youtube.enabled && (
          <div className="ml-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Channel ID (Optional)
            </label>
            <input
              type="text"
              placeholder="UCxxxxxxxxxxxxxxxxxxxxxx"
              value={formData.youtube.channelId || ''}
              onChange={(e) => updateField('youtube', 'channelId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Find at: youtube.com/account_advanced
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Social Media Benefits:</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Track engagement metrics across all platforms</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Monitor brand mentions and sentiment</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Analyze social media ROI and reach</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Competitive social media benchmarking</span>
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
          {saving ? 'Saving...' : 'Save Social Media Settings'}
        </button>
      </div>
    </form>
  );
}
