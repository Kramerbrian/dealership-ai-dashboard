'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Target,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  website: string;
  brand: string;
  city: string;
  state: string;
  visibility_score: number;
  total_mentions: number;
  avg_rank: number;
  sentiment_score: number;
  scan_date: string;
  rank_position: number;
}

interface LeaderboardStats {
  totalDealers: number;
  averageScore: number;
  averageMentions: number;
  averageSentiment: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  statistics: LeaderboardStats;
  scanDate: string;
  filters: {
    limit: number;
    brand?: string;
    state?: string;
  };
}

export default function AILeaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    brand: '',
    state: '',
    limit: 100,
  });

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.state) params.append('state', filters.state);
      params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/leaderboard?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch leaderboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [filters]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getRankIcon = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `#${position}`;
  };

  const exportToCSV = () => {
    if (!data?.leaderboard) return;

    const csvContent = [
      ['Rank', 'Dealership', 'Brand', 'Location', 'AI Visibility Score', 'Mentions', 'Avg Rank', 'Sentiment'],
      ...data.leaderboard.map(entry => [
        entry.rank_position,
        entry.name,
        entry.brand,
        `${entry.city}, ${entry.state}`,
        entry.visibility_score,
        entry.total_mentions,
        entry.avg_rank?.toFixed(2) || 'N/A',
        entry.sentiment_score?.toFixed(2) || 'N/A',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-leaderboard-${data.scanDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading leaderboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchLeaderboard}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No leaderboard data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Visibility Leaderboard</h1>
          <p className="text-muted-foreground">
            Monthly rankings based on AI search platform visibility
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {new Date(data.scanDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={fetchLeaderboard}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dealers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statistics.totalDealers}</div>
            <p className="text-xs text-muted-foreground">
              Scanned this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statistics.averageScore}/100</div>
            <p className="text-xs text-muted-foreground">
              AI visibility score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Mentions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statistics.averageMentions}</div>
            <p className="text-xs text-muted-foreground">
              Per dealer across platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sentiment</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.statistics.averageSentiment > 0 ? '+' : ''}
              {data.statistics.averageSentiment.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Sentiment score (-1 to +1)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Brand</label>
              <select
                className="w-full mt-1 p-2 border rounded-md"
                value={filters.brand}
                onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
              >
                <option value="">All Brands</option>
                <option value="Toyota">Toyota</option>
                <option value="Honda">Honda</option>
                <option value="Ford">Ford</option>
                <option value="Chevrolet">Chevrolet</option>
                <option value="BMW">BMW</option>
                <option value="Mercedes-Benz">Mercedes-Benz</option>
                <option value="Audi">Audi</option>
                <option value="Nissan">Nissan</option>
                <option value="Hyundai">Hyundai</option>
                <option value="Kia">Kia</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">State</label>
              <select
                className="w-full mt-1 p-2 border rounded-md"
                value={filters.state}
                onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
              >
                <option value="">All States</option>
                <option value="CA">California</option>
                <option value="TX">Texas</option>
                <option value="FL">Florida</option>
                <option value="NY">New York</option>
                <option value="PA">Pennsylvania</option>
                <option value="IL">Illinois</option>
                <option value="OH">Ohio</option>
                <option value="GA">Georgia</option>
                <option value="NC">North Carolina</option>
                <option value="MI">Michigan</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Limit</label>
              <select
                className="w-full mt-1 p-2 border rounded-md"
                value={filters.limit}
                onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
              >
                <option value="50">Top 50</option>
                <option value="100">Top 100</option>
                <option value="250">Top 250</option>
                <option value="500">Top 500</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dealership Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Rank</th>
                  <th className="text-left p-2">Dealership</th>
                  <th className="text-left p-2">Brand</th>
                  <th className="text-left p-2">Location</th>
                  <th className="text-left p-2">AI Score</th>
                  <th className="text-left p-2">Mentions</th>
                  <th className="text-left p-2">Avg Rank</th>
                  <th className="text-left p-2">Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {data.leaderboard.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="flex items-center">
                        <span className="text-lg">{getRankIcon(entry.rank_position)}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{entry.name}</div>
                        <div className="text-sm text-gray-500">{entry.website}</div>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">{entry.brand}</Badge>
                    </td>
                    <td className="p-2">
                      {entry.city}, {entry.state}
                    </td>
                    <td className="p-2">
                      <Badge variant={getScoreBadgeVariant(entry.visibility_score)}>
                        <span className={getScoreColor(entry.visibility_score)}>
                          {entry.visibility_score}/100
                        </span>
                      </Badge>
                    </td>
                    <td className="p-2">{entry.total_mentions}</td>
                    <td className="p-2">
                      {entry.avg_rank ? entry.avg_rank.toFixed(1) : 'N/A'}
                    </td>
                    <td className="p-2">
                      <span className={
                        entry.sentiment_score > 0 ? 'text-green-600' : 
                        entry.sentiment_score < 0 ? 'text-red-600' : 'text-gray-600'
                      }>
                        {entry.sentiment_score > 0 ? '+' : ''}
                        {entry.sentiment_score?.toFixed(2) || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
