'use client';

import { useState, useEffect } from 'react';
import { Search, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface UrlInputProps {
  isValidating: boolean;
  setIsValidating: (validating: boolean) => void;
}

export function UrlInput({ isValidating, setIsValidating }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [showGbpOption, setShowGbpOption] = useState(false);

  const validateUrl = (inputUrl: string): boolean => {
    if (!inputUrl) return false;
    
    // Auto-prepend https if no protocol
    let fullUrl = inputUrl;
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      fullUrl = `https://${inputUrl}`;
    }
    
    try {
      const urlObj = new URL(fullUrl);
      return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
    } catch {
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    
    if (value.length > 0) {
      const valid = validateUrl(value);
      setIsValid(valid);
      setError(valid ? '' : 'Please enter a valid website URL');
    } else {
      setIsValid(null);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid || !url) return;
    
    setIsValidating(true);
    
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if it's a Google Business Profile site
    const isGbpSite = url.includes('google.com') || url.includes('g.page');
    setShowGbpOption(isGbpSite);
    
    setIsValidating(false);
  };

  const handleGbpScan = () => {
    // Extract business info from GBP URL
    console.log('Scanning GBP site:', url);
    // Redirect to scan with GBP data
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="Enter your dealership website URL"
              className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 ${
                isValid === true 
                  ? 'border-green-500 bg-green-50' 
                  : isValid === false 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              data-analytics="url-input-focus"
            />
            
            {/* Validation Icon */}
            {isValid !== null && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                {isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        
        {/* GBP Option */}
        {showGbpOption && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">Google Business Profile Detected</h4>
                <p className="text-sm text-blue-700">We can extract your business info automatically</p>
              </div>
              <button
                type="button"
                onClick={handleGbpScan}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Use My GBP Site
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isValid || isValidating}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-4 rounded-xl text-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed"
        data-analytics="url-submit-click"
      >
        {isValidating ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Validating URL...
          </div>
        ) : (
          'Run Free AI Visibility Scan'
        )}
      </button>
    </form>
  );
}
