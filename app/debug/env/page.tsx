'use client';

/**
 * Debug Environment Variables Page (Dev-Only)
 *
 * Shows which environment variables are present/missing.
 * Requires Clerk authentication and redirects in production.
 */

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const REQUIRED_PUBLIC_ENV = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_APP_URL',
];

const REQUIRED_SERVER_ENV = [
  'CLERK_SECRET_KEY',
  'DATABASE_URL',
  'DIRECT_URL',
  'SENDGRID_API_KEY',
  'SENDGRID_FROM_EMAIL',
  'CRON_SECRET',
];

const OPTIONAL_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'NEXT_PUBLIC_GA_ID',
  'POSTHOG_KEY',
  'POSTHOG_HOST',
];

interface EnvStatus {
  ok: boolean;
  nodeEnv: string;
  required: Record<string, boolean>;
  optional: Record<string, boolean>;
  missingRequired: string[];
  presentOptional: string[];
}

export default function DebugEnvPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to homepage if in production
    if (process.env.NODE_ENV === 'production') {
      router.push('/');
      return;
    }

    // Wait for Clerk to load
    if (!isLoaded) return;

    // Redirect to sign-in if not authenticated
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=/debug/env');
      return;
    }

    // Fetch environment status from health-dev API
    async function fetchEnvStatus() {
      try {
        const res = await fetch('/api/health-dev');
        const data = await res.json();
        setEnvStatus(data);
      } catch (error) {
        console.error('Failed to fetch env status:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEnvStatus();
  }, [isLoaded, isSignedIn, router]);

  // Check public env vars client-side
  const publicEnvChecks: Record<string, boolean> = {};
  for (const key of REQUIRED_PUBLIC_ENV) {
    const envKey = key as keyof typeof process.env;
    publicEnvChecks[key] = !!process.env[envKey];
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Router will redirect
  }

  const maskValue = (key: string): string => {
    const envKey = key as keyof typeof process.env;
    const value = process.env[envKey];
    if (!value) return '❌ Not set';
    if (value.length <= 8) return '****';
    return `${value.slice(0, 4)}...${value.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Environment Variables
            </span>
          </h1>
          <p className="text-white/60">Dev-only debug page for environment validation</p>
          {envStatus && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className={`w-2 h-2 rounded-full ${envStatus.ok ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-white/80">
                {envStatus.ok ? 'All required variables present' : 'Missing required variables'}
              </span>
            </div>
          )}
        </div>

        {/* Public Environment Variables (Client-Side) */}
        <div className="mb-8 bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Public Variables (Client-Side)
          </h2>
          <div className="space-y-3">
            {REQUIRED_PUBLIC_ENV.map((key) => {
              const isPresent = publicEnvChecks[key];
              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${isPresent ? 'bg-green-500' : 'bg-red-500'}`} />
                    <code className="text-cyan-400">{key}</code>
                  </div>
                  <span className="text-white/60 text-sm font-mono">
                    {maskValue(key)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Server Environment Variables */}
        {envStatus && (
          <div className="mb-8 bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Server Variables (API-Only)
            </h2>
            <div className="space-y-3">
              {REQUIRED_SERVER_ENV.map((key) => {
                const isPresent = envStatus.required[key];
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${isPresent ? 'bg-green-500' : 'bg-red-500'}`} />
                      <code className="text-cyan-400">{key}</code>
                    </div>
                    <span className="text-white/60 text-sm">
                      {isPresent ? '✓ Present' : '❌ Missing'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Optional Environment Variables */}
        {envStatus && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Optional Variables
            </h2>
            <div className="space-y-3">
              {OPTIONAL_ENV.map((key) => {
                const isPresent = envStatus.optional[key];
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${isPresent ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                      <code className="text-cyan-400/70">{key}</code>
                    </div>
                    <span className="text-white/40 text-sm">
                      {isPresent ? '✓ Present' : 'Not set'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Missing Variables Alert */}
        {envStatus && envStatus.missingRequired.length > 0 && (
          <div className="mt-8 bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-red-400 mb-3">
              ⚠️ Missing Required Variables
            </h3>
            <ul className="space-y-2">
              {envStatus.missingRequired.map((key) => (
                <li key={key} className="text-red-300 font-mono">• {key}</li>
              ))}
            </ul>
            <p className="mt-4 text-white/60 text-sm">
              Add these variables to your <code className="text-cyan-400">.env.local</code> file
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
