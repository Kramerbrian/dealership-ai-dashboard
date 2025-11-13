'use client';

import { useUser } from '@clerk/nextjs';
import { redirect, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import IntelligenceShell from '@/components/cognitive/IntelligenceShell';
import GroupAggregateReport from '@/components/locations/GroupAggregateReport';

export default function GroupReportPage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [groupId, setGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !user) {
      redirect('/sign-in');
    }
  }, [isLoaded, user]);

  useEffect(() => {
    if (user) {
      // Get groupId from URL params or fetch user's first group
      const urlGroupId = searchParams.get('groupId');
      if (urlGroupId) {
        setGroupId(urlGroupId);
        setLoading(false);
      } else {
        fetchDefaultGroup();
      }
    }
  }, [user, searchParams]);

  const fetchDefaultGroup = async () => {
    try {
      const response = await fetch('/api/groups');
      const data = await response.json();

      if (response.ok && data.groups && data.groups.length > 0) {
        setGroupId(data.groups[0].id);
      }
    } catch (error) {
      console.error('[GroupReportPage] Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (!groupId) {
    return (
      <IntelligenceShell dealerId={user.id} showCognitionBar={false}>
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No dealer group found</div>
          <p className="text-gray-600 text-sm">
            Create a dealer group to view aggregate reports
          </p>
          <button className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
            Create Dealer Group
          </button>
        </div>
      </IntelligenceShell>
    );
  }

  const dealerId = (user.publicMetadata?.dealerId as string) || user.id || 'demo-tenant';

  return (
    <IntelligenceShell dealerId={dealerId} showCognitionBar={false}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <a
            href="/locations"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Locations
          </a>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Group Performance Report</h1>
        <p className="text-gray-400">
          Comprehensive aggregate analysis across all dealership locations
        </p>
      </div>

      {/* Report Component */}
      <GroupAggregateReport groupId={groupId} />

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium">
          Export Report
        </button>
        <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-lg transition-colors font-medium">
          Schedule Email Report
        </button>
        <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-lg transition-colors font-medium">
          Share Link
        </button>
      </div>

      {/* Next Steps */}
      <div className="mt-8 p-6 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border border-emerald-500/30 rounded-xl">
        <h3 className="font-semibold text-white mb-3">📈 Improve Group Performance</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">✓</span>
            <span>Focus on locations with lower consistency scores - implement missing schemas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">✓</span>
            <span>Share best practices from top-performing locations with the rest of the group</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">✓</span>
            <span>Run regular scans to track improvement trends over time</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">✓</span>
            <span>Use the Schema Generator tool to quickly implement missing schemas</span>
          </li>
        </ul>
      </div>
    </IntelligenceShell>
  );
}
