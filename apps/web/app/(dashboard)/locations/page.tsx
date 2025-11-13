'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import IntelligenceShell from '@/components/cognitive/IntelligenceShell';
import LocationDashboard from '@/components/locations/LocationDashboard';

export default function LocationsPage() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && !user) {
      redirect('/sign-in');
    }
  }, [isLoaded, user]);

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  const dealerId = (user.publicMetadata?.dealerId as string) || user.id || 'demo-tenant';

  return (
    <IntelligenceShell dealerId={dealerId} showCognitionBar={false}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Multi-Location Management</h1>
        <p className="text-gray-400">
          Manage all dealership locations across your dealer group
        </p>
      </div>

      {/* Location Dashboard */}
      <LocationDashboard />

      {/* Additional Resources */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-gray-800/50 border border-gray-700 rounded-xl">
          <h3 className="font-semibold text-white mb-2">📊 Group Analytics</h3>
          <p className="text-sm text-gray-400 mb-3">
            View aggregate performance across all locations
          </p>
          <a
            href="/locations/report"
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            View Report →
          </a>
        </div>

        <div className="p-5 bg-gray-800/50 border border-gray-700 rounded-xl">
          <h3 className="font-semibold text-white mb-2">➕ Add Location</h3>
          <p className="text-sm text-gray-400 mb-3">
            Add a new dealership location to your group
          </p>
          <button className="text-sm text-emerald-400 hover:text-emerald-300">
            Add New Location →
          </button>
        </div>

        <div className="p-5 bg-gray-800/50 border border-gray-700 rounded-xl">
          <h3 className="font-semibold text-white mb-2">🔗 Consistency Check</h3>
          <p className="text-sm text-gray-400 mb-3">
            Ensure schema consistency across all locations
          </p>
          <a
            href="/locations/consistency"
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            Run Check →
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 p-6 bg-gray-800/30 border border-gray-700 rounded-xl">
        <h3 className="font-semibold text-white mb-4">Multi-Location Management FAQ</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-200 mb-1">What is a dealer group?</h4>
            <p className="text-sm text-gray-400">
              A dealer group is a parent organization that manages multiple dealership locations. It allows you to aggregate performance metrics, track trends across all locations, and ensure consistency in schema implementation.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-200 mb-1">How do I add a new location?</h4>
            <p className="text-sm text-gray-400">
              Click the "Add New Location" button and fill in the dealership details. Each location will be scanned independently, and you can view aggregate reports showing performance across all locations.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-200 mb-1">What is the consistency checker?</h4>
            <p className="text-sm text-gray-400">
              The consistency checker identifies schema types that are present in some locations but missing in others. This helps ensure all locations maintain the same high standards for schema implementation and E-E-A-T signals.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-200 mb-1">Can I set different admins for different locations?</h4>
            <p className="text-sm text-gray-400">
              Yes! You can assign location-specific roles (owner, admin, manager, viewer) with granular permissions. This allows distributed management while maintaining group-level oversight.
            </p>
          </div>
        </div>
      </div>
    </IntelligenceShell>
  );
}
