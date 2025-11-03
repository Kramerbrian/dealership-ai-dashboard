/**
 * Google OAuth Test Page
 * Tests WorkOS Google OAuth integration
 */

'use client';

import { useState } from 'react';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

export default function GoogleOAuthTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDirectURL = () => {
    addResult('Testing direct URL method...');
    window.location.href = '/api/auth/sso?provider=GoogleOAuth';
  };

  const testWithState = () => {
    addResult('Testing with state parameter...');
    const state = encodeURIComponent('/dashboard');
    window.location.href = `/api/auth/sso?provider=GoogleOAuth&state=${state}`;
  };

  const testWithScopes = () => {
    addResult('Testing with additional scopes...');
    const scopes = 'openid email profile';
    window.location.href = `/api/auth/sso?provider=GoogleOAuth&provider_scopes=${encodeURIComponent(scopes)}`;
  };

  const checkConfiguration = async () => {
    addResult('Checking configuration...');
    
    try {
      // Check if WorkOS is configured
      const response = await fetch('/api/auth/sso?provider=GoogleOAuth', {
        method: 'HEAD',
        redirect: 'manual',
      });

      if (response.status === 307 || response.status === 302) {
        addResult('✅ SSO endpoint is working (redirect detected)');
      } else if (response.status === 500) {
        addResult('❌ Error: WorkOS not configured or invalid');
      } else {
        addResult(`⚠️  Unexpected response: ${response.status}`);
      }
    } catch (error) {
      addResult(`❌ Error checking configuration: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Google OAuth Test Page
          </h1>
          <p className="text-gray-600 mb-8">
            Test your WorkOS Google OAuth integration
          </p>

          {/* Configuration Status */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Configuration Checklist
            </h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded border-2 border-gray-300"></span>
                Redirect URI configured in Google Cloud Console
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded border-2 border-gray-300"></span>
                OAuth consent screen published in Google Cloud Console
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded border-2 border-gray-300"></span>
                Google Client ID and Secret added to WorkOS Dashboard
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded border-2 border-gray-300"></span>
                WORKOS_CLIENT_ID configured in environment variables
              </li>
            </ul>
          </div>

          {/* Test Methods */}
          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Test Methods
              </h2>
              
              <div className="space-y-4">
                {/* React Component Test */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Method 1: React Component
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Uses the GoogleSignInButton component
                  </p>
                  <GoogleSignInButton />
                </div>

                {/* Direct URL Tests */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Method 2: Direct URL
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={testDirectURL}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Test Basic Google OAuth
                    </button>
                    <button
                      onClick={testWithState}
                      className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Test with State Parameter
                    </button>
                    <button
                      onClick={testWithScopes}
                      className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Test with Scopes
                    </button>
                  </div>
                </div>

                {/* Configuration Check */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Configuration Check
                  </h3>
                  <button
                    onClick={checkConfiguration}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Check Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Test Results
              </h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                  {testResults.join('\n')}
                </pre>
              </div>
              <button
                onClick={() => setTestResults([])}
                className="mt-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Results
              </button>
            </div>
          )}

          {/* Quick Links */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://dashboard.workos.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">WorkOS Dashboard</div>
                <div className="text-sm text-gray-600">Configure OAuth providers</div>
              </a>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Google Cloud Console</div>
                <div className="text-sm text-gray-600">Manage OAuth credentials</div>
              </a>
              <a
                href="https://console.cloud.google.com/apis/consent"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">OAuth Consent Screen</div>
                <div className="text-sm text-gray-600">Publish your app</div>
              </a>
              <a
                href="/api/auth/sso?provider=GoogleOAuth"
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Direct SSO URL</div>
                <div className="text-sm text-gray-600">Test authentication</div>
              </a>
            </div>
          </div>

          {/* Documentation Links */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Documentation
            </h2>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                📘 <a href="/WORKOS_GOOGLE_OAUTH_SETUP.md" className="text-blue-600 hover:underline">Full Setup Guide</a>
              </li>
              <li>
                📋 <a href="/GOOGLE_OAUTH_QUICK_REFERENCE.md" className="text-blue-600 hover:underline">Quick Reference</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

