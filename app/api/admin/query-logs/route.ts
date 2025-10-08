import { NextResponse } from 'next/server';

export async function GET() {
  // Simulated query logs - replace with actual logging system
  const logs = [
    {
      id: 'log-1',
      query: 'SELECT * FROM dealerships WHERE status = "active"',
      response: { count: 5, dealers: ['dealer-1', 'dealer-2', 'dealer-3', 'dealer-4', 'dealer-5'] },
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      duration: 23,
      status: 'success' as const,
      endpoint: '/api/admin/dealers',
    },
    {
      id: 'log-2',
      query: 'GET /api/dashboard/metrics?dealerId=dealer-1',
      response: { aiVisibility: 72, reviewHealth: 4.6, localRank: 3, monthlyLeads: 47 },
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      duration: 156,
      status: 'success' as const,
      endpoint: '/api/dashboard/metrics',
    },
    {
      id: 'log-3',
      query: 'POST /api/ai-scores { domain: "terryreidhyundai.com" }',
      response: { error: 'Rate limit exceeded' },
      timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      duration: 12,
      status: 'error' as const,
      endpoint: '/api/ai-scores',
    },
    {
      id: 'log-4',
      query: 'SELECT ai_visibility_score FROM dealership_data WHERE tenant_id = "tenant-1"',
      response: { scores: [72, 78, 65, 58, 82] },
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      duration: 8,
      status: 'success' as const,
      endpoint: '/api/dashboard/timeline',
    },
    {
      id: 'log-5',
      query: 'GET /api/dashboard/competitor-matrix',
      response: { competitors: [{ name: 'Larusso Motors', aiVisibility: 78 }] },
      timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
      duration: 45,
      status: 'success' as const,
      endpoint: '/api/dashboard/competitor-matrix',
    },
  ];

  return NextResponse.json({ logs });
}

export async function DELETE() {
  // In production, this would clear the actual query logs
  return NextResponse.json({ message: 'Query logs cleared successfully' });
}
