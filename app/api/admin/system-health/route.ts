import { NextResponse } from 'next/server';

export async function GET() {
  // Simulated system health data - replace with actual monitoring
  const metrics = [
    {
      name: 'API Server',
      status: 'healthy' as const,
      value: '99.9%',
      description: 'Uptime over last 24 hours',
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'Database',
      status: 'healthy' as const,
      value: '45ms',
      description: 'Average query response time',
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'Memory Usage',
      status: 'warning' as const,
      value: '78%',
      description: 'Current memory utilization',
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'CPU Usage',
      status: 'healthy' as const,
      value: '32%',
      description: 'Current CPU utilization',
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'Redis Cache',
      status: 'healthy' as const,
      value: '2ms',
      description: 'Average cache response time',
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'External APIs',
      status: 'healthy' as const,
      value: '98.5%',
      description: 'Success rate for external calls',
      lastChecked: new Date().toISOString(),
    },
  ];

  return NextResponse.json({ metrics });
}
