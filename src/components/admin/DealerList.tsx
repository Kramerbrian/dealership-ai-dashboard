'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';

interface Dealer {
  id: string;
  name: string;
  location: string;
  aiScore: number;
  reviewCount: number;
  status: 'active' | 'inactive' | 'pending';
  lastUpdated: string;
}

export default function DealerList() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dealers');
      const data = await res.json();
      setDealers(data.dealers);
    } catch (error) {
      console.error('Failed to fetch dealers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDealers = dealers.filter(dealer => {
    const matchesSearch = dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dealer.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dealer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-600 bg-emerald-50';
      case 'inactive': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-amber-600 bg-amber-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">Dealership Management</h3>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          Add Dealer
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search dealers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Dealer</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Location</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">AI Score</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Reviews</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Last Updated</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDealers.map((dealer) => (
              <tr key={dealer.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold">
                      {dealer.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{dealer.name}</p>
                      <p className="text-sm text-slate-500">ID: {dealer.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-700">{dealer.location}</td>
                <td className="py-4 px-4">
                  <span className={`font-semibold ${getScoreColor(dealer.aiScore)}`}>
                    {dealer.aiScore}/100
                  </span>
                </td>
                <td className="py-4 px-4 text-slate-700">{dealer.reviewCount}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(dealer.status)}`}>
                    {dealer.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-slate-500">
                  {new Date(dealer.lastUpdated).toLocaleDateString()}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-slate-100 rounded">
                      <Eye className="w-4 h-4 text-slate-600" />
                    </button>
                    <button className="p-1 hover:bg-slate-100 rounded">
                      <Edit className="w-4 h-4 text-slate-600" />
                    </button>
                    <button className="p-1 hover:bg-slate-100 rounded">
                      <MoreVertical className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredDealers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500">No dealers found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
