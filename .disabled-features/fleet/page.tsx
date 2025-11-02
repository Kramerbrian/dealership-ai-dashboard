'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FleetDealership {
  id: string;
  domain: string;
  name: string;
  city: string;
  state: string;
  status: string;
  plan: string;
  lastScore: {
    aiVisibility: number;
    zeroClick: number;
    ugcHealth: number;
    createdAt: string;
  } | null;
  lastAudit: {
    status: string;
    createdAt: string;
  } | null;
}

export default function FleetDashboardPage() {
  const [dealerships, setDealerships] = useState<FleetDealership[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState({ city: '', state: '' });

  const limit = 50;

  useEffect(() => {
    loadDealerships();
  }, [page, filter]);

  const loadDealerships = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filter.city && { city: filter.city }),
        ...(filter.state && { state: filter.state }),
      });

      const res = await fetch(`/api/origins?${params}`);
      const data = await res.json();

      setDealerships(data.origins || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to load dealerships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkRefresh = async () => {
    if (selected.size === 0) return;

    try {
      const domains = dealerships
        .filter((d) => selected.has(d.id))
        .map((d) => `https://${d.domain}`);

      await fetch('/api/origins/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origins: domains }),
      });

      alert(`Queued refresh for ${selected.size} dealerships`);
      setSelected(new Set());
      loadDealerships();
    } catch (error) {
      console.error('Bulk refresh error:', error);
      alert('Failed to queue refresh');
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['Domain', 'Name', 'City', 'State', 'AI Visibility', 'Zero-Click', 'UGC Health', 'Status'].join(','),
      ...dealerships.map((d) =>
        [
          d.domain,
          d.name,
          d.city,
          d.state,
          d.lastScore?.aiVisibility || 'N/A',
          d.lastScore?.zeroClick || 'N/A',
          d.lastScore?.ugcHealth || 'N/A',
          d.status,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleet-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Fleet Management</h1>
        <p className="text-gray-600">
          Manage {total.toLocaleString()} dealership rooftops across your portfolio
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Input
            placeholder="Filter by city"
            value={filter.city}
            onChange={(e) => setFilter({ ...filter, city: e.target.value })}
            className="max-w-xs"
          />
          <Input
            placeholder="Filter by state"
            value={filter.state}
            onChange={(e) => setFilter({ ...filter, state: e.target.value })}
            className="max-w-xs"
          />
          <div className="flex-1" />
          <Button onClick={handleExportCSV} variant="outline">
            Export CSV
          </Button>
          <Button onClick={handleBulkRefresh} disabled={selected.size === 0}>
            Refresh Selected ({selected.size})
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selected.size === dealerships.length && dealerships.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelected(new Set(dealerships.map((d) => d.id)));
                      } else {
                        setSelected(new Set());
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Domain</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Location</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">AI Visibility</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Schema %</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">UGC Score</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Revenue-at-Risk</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Last Refresh</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : dealerships.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    No dealerships found
                  </td>
                </tr>
              ) : (
                dealerships.map((dealer) => (
                  <tr key={dealer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(dealer.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selected);
                          if (e.target.checked) {
                            newSelected.add(dealer.id);
                          } else {
                            newSelected.delete(dealer.id);
                          }
                          setSelected(newSelected);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{dealer.domain}</td>
                    <td className="px-4 py-3 text-sm">{dealer.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {dealer.city}, {dealer.state}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold">
                        {dealer.lastScore?.aiVisibility?.toFixed(1) || '—'}%
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{dealer.lastScore?.zeroClick?.toFixed(1) || '—'}%</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{dealer.lastScore?.ugcHealth?.toFixed(1) || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-red-600">
                        ${((100 - (dealer.lastScore?.aiVisibility || 0)) * 120).toFixed(0)}k
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {dealer.lastScore?.createdAt
                        ? new Date(dealer.lastScore.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          dealer.lastAudit?.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : dealer.lastAudit?.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {dealer.lastAudit?.status || dealer.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page * limit >= total}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

