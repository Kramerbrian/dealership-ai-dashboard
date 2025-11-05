'use client';

import { AlertCircle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface WebVitalsTabProps {
  dealership?: {
    name?: string;
    domain?: string;
  };
}

export function WebVitalsTab({ dealership }: WebVitalsTabProps) {
  const vitals = {
    schema: {
      status: 'warning' as const,
      score: 72,
      issues: 3,
      items: [
        { name: 'Organization Schema', status: 'good' as const, url: '/' },
        { name: 'LocalBusiness Schema', status: 'good' as const, url: '/' },
        { name: 'Product Schema', status: 'missing' as const, url: '/inventory' },
        { name: 'FAQ Schema', status: 'missing' as const, url: '/faq' },
        { name: 'Review Schema', status: 'warning' as const, url: '/reviews' }
      ]
    },
    nap: {
      status: 'good' as const,
      score: 95,
      issues: 0,
      consistency: '95% consistent across 12 sources'
    },
    coreVitals: {
      status: 'warning' as const,
      lcp: { value: 3.2, status: 'warning' as const, target: '< 2.5s' },
      fid: { value: 85, status: 'good' as const, target: '< 100ms' },
      cls: { value: 0.15, status: 'warning' as const, target: '< 0.1' }
    },
    errors: {
      status: 'critical' as const,
      total: 23,
      '404': 15,
      '500': 2,
      '503': 6
    }
  };

  return (
    <div className="space-y-6">
      {/* Schema Markup */}
      <VitalCard
        title="Schema Markup"
        status={vitals.schema.status}
        score={vitals.schema.score}
        description="Structured data for AI search engines"
      >
        <div className="space-y-2">
          {vitals.schema.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 
                                     dark:bg-gray-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                {item.status === 'good' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : item.status === 'warning' ? (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.name}
                </span>
              </div>
              <a 
                href={item.url} 
                className="text-blue-600 dark:text-blue-400 text-sm 
                          hover:underline flex items-center gap-1"
              >
                View page
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 
                         text-white rounded-lg font-medium">
          Fix Schema Issues
        </button>
      </VitalCard>

      {/* NAP Consistency */}
      <VitalCard
        title="NAP Consistency"
        status={vitals.nap.status}
        score={vitals.nap.score}
        description="Name, Address, Phone across the web"
      >
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {vitals.nap.consistency}
        </div>
      </VitalCard>

      {/* Core Web Vitals */}
      <VitalCard
        title="Core Web Vitals"
        status={vitals.coreVitals.status}
        description="Google's performance metrics"
      >
        <div className="grid grid-cols-3 gap-4">
          <MetricBox 
            label="LCP" 
            value={`${vitals.coreVitals.lcp.value}s`} 
            target={vitals.coreVitals.lcp.target} 
            status={vitals.coreVitals.lcp.status} 
          />
          <MetricBox 
            label="FID" 
            value={`${vitals.coreVitals.fid.value}ms`} 
            target={vitals.coreVitals.fid.target} 
            status={vitals.coreVitals.fid.status} 
          />
          <MetricBox 
            label="CLS" 
            value={vitals.coreVitals.cls.value.toString()} 
            target={vitals.coreVitals.cls.target} 
            status={vitals.coreVitals.cls.status} 
          />
        </div>
      </VitalCard>

      {/* Errors */}
      <VitalCard
        title="Error Detection"
        status={vitals.errors.status}
        description="HTTP errors on your website"
      >
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {vitals.errors['404']}
            </div>
            <div className="text-xs text-gray-500">404 Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {vitals.errors['500']}
            </div>
            <div className="text-xs text-gray-500">500 Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {vitals.errors['503']}
            </div>
            <div className="text-xs text-gray-500">503 Errors</div>
          </div>
        </div>
        <button className="mt-4 w-full px-4 py-2 bg-red-600 hover:bg-red-700 
                         text-white rounded-lg font-medium">
          View Error Report
        </button>
      </VitalCard>
    </div>
  );
}

interface VitalCardProps {
  title: string;
  status: 'good' | 'warning' | 'critical';
  score?: number;
  description: string;
  children: React.ReactNode;
}

function VitalCard({ title, status, score, description, children }: VitalCardProps) {
  const statusColors = {
    good: 'border-green-500',
    warning: 'border-yellow-500',
    critical: 'border-red-500'
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border-l-4 ${statusColors[status]} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        {score && (
          <div className="text-3xl font-light text-gray-900 dark:text-white">
            {score}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

interface MetricBoxProps {
  label: string;
  value: string;
  target: string;
  status: 'good' | 'warning' | 'critical';
}

function MetricBox({ label, value, target, status }: MetricBoxProps) {
  const colors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600'
  };

  return (
    <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
      <div className={`text-2xl font-bold ${colors[status]}`}>
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
      <div className="text-xs text-gray-400 mt-1">{target}</div>
    </div>
  );
}

