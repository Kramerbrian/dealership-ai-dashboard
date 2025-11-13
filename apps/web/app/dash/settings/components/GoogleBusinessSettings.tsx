'use client';

import { useState } from 'react';
import { DealerSettings } from '@/lib/types/dealer-settings';

interface Props {
  data: DealerSettings['googleBusinessProfile'];
  onSave: (data: DealerSettings['googleBusinessProfile']) => void;
  saving: boolean;
}

export function GoogleBusinessSettings({ data, onSave, saving }: Props) {
  const [formData, setFormData] = useState(data);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Google Business Profile</h2>
        <p className="text-gray-600 mb-6">
          Connect your Google Business Profile to track reviews, ratings, and local search performance.
        </p>
      </div>

      {/* Enable Toggle */}
      <div className="flex items-start justify-between p-6 bg-gray-50 rounded-lg">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Enable Google Business Profile</h3>
          <p className="text-sm text-gray-600 mt-1">
            Track your local search presence and customer reviews
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.enabled}
            onChange={(e) => updateField('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {formData.enabled && (
        <>
          {/* Place ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Place ID *
            </label>
            <input
              type="text"
              placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
              value={formData.placeId}
              onChange={(e) => updateField('placeId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={formData.enabled}
            />
            <p className="text-xs text-gray-500 mt-2">
              Find your Place ID:{' '}
              <a
                href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Place ID Finder Tool
              </a>
            </p>
          </div>

          {/* Location ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location ID (Optional)
            </label>
            <input
              type="text"
              placeholder="12345678901234567890"
              value={formData.locationId || ''}
              onChange={(e) => updateField('locationId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-2">
              Location ID from Google Business Profile API (for advanced features)
            </p>
          </div>

          {/* CID (Customer ID) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CID - Customer ID (Optional)
            </label>
            <input
              type="text"
              placeholder="1234567890123456789"
              value={formData.cid || ''}
              onChange={(e) => updateField('cid', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-2">
              Find CID in your Google Business Profile URL
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">What you'll get:</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Real-time review monitoring and alerts</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Local search ranking insights</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Customer engagement metrics</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Competitive benchmarking in your area</span>
              </li>
            </ul>
          </div>

          {/* Help Section */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Need help finding your IDs?</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Place ID:</strong> Visit{' '}
                <a
                  href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google's Place ID Finder
                </a>{' '}
                and search for your business
              </p>
              <p>
                <strong>CID:</strong> Visit your Google Business Profile and copy the long number from the URL
              </p>
            </div>
          </div>
        </>
      )}

      {/* Submit Button */}
      <div className="pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Google Business Settings'}
        </button>
      </div>
    </form>
  );
}
