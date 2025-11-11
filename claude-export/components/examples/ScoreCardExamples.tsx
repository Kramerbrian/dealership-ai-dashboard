/**
 * ScoreCard Component Examples
 * Before: 5 separate score card implementations
 * After: Single reusable ScoreCard component with infinite variations
 */

import React from 'react';
import { ScoreCard } from '../ui/ScoreCard';
import {
  ChartBarIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export const ScoreCardExamples = () => {
  // Sample sparkline data
  const sampleSparkline = Array.from({ length: 16 }).map((_, i) => ({
    t: i,
    v: 65 + Math.sin(i / 3) * 10 + i * 0.5
  }));

  return (
    <div className="p-8 bg-gray-50 dark:bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">ScoreCard Component Examples</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          One component, infinite variations
        </p>

        {/* Before: 5 Separate Implementations */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            ❌ Before: 5 Separate Card Implementations
          </h2>
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
{`// Before: Each metric had its own custom component
<AIVisibilityScoreCard {...props} />
<GEOTrustScoreCard {...props} />
<AEOScoreCard {...props} />
<SEOScoreCard {...props} />
<CitationsCard {...props} />

// 5 different files, 5 different implementations
// Hard to maintain, inconsistent styling`}
            </pre>
          </div>
        </div>

        {/* After: Single Reusable Component */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            ✅ After: Single Reusable ScoreCard Component
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example 1: AI Visibility Score with Ring */}
          <ScoreCard
            title="AI Visibility Index"
            value={85}
            trend="up"
            trendValue="+12%"
            description="vs last month"
            color="text-blue-600"
            showRing={true}
            icon={<SparklesIcon className="w-6 h-6" />}
          />

          {/* Example 2: GEO Trust Score with Sparkline */}
          <ScoreCard
            title="GEO Trust Score"
            value={74}
            trend="up"
            trendValue="+8%"
            description="Local search visibility"
            color="text-green-600"
            sparklineData={sampleSparkline}
            icon={<GlobeAltIcon className="w-6 h-6" />}
          />

          {/* Example 3: AEO Score (Answer Engine Optimization) */}
          <ScoreCard
            title="AEO Score"
            value={61}
            trend="neutral"
            description="Answer engine citations"
            color="text-purple-600"
            icon={<ChartBarIcon className="w-6 h-6" />}
          />

          {/* Example 4: SEO Score with Trend */}
          <ScoreCard
            title="SEO Integrity Score"
            value={53}
            trend="down"
            trendValue="-3%"
            description="Technical SEO health"
            color="text-orange-600"
            sparklineData={sampleSparkline.map(d => ({ ...d, v: d.v - 15 }))}
            icon={<MagnifyingGlassIcon className="w-6 h-6" />}
          />

          {/* Example 5: Total Citations */}
          <ScoreCard
            title="Total AI Citations"
            value="1,247"
            trend="up"
            trendValue="+156"
            description="Last 30 days"
            color="text-blue-500"
            icon={<UserGroupIcon className="w-6 h-6" />}
          />

          {/* Example 6: Custom Color */}
          <ScoreCard
            title="Custom Metric"
            value={92}
            description="Fully customizable"
            color="text-pink-600"
            bgColor="bg-gradient-to-br from-pink-50 to-purple-50"
          />
        </div>

        {/* Code Example */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Usage Example
          </h2>
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`import { ScoreCard } from '@/components/ui/ScoreCard';

// Simple score
<ScoreCard
  title="AI Visibility Score"
  value={85}
  color="text-blue-600"
/>

// With trend and description
<ScoreCard
  title="GEO Trust Score"
  value={74}
  trend="up"
  trendValue="+8%"
  description="Local search visibility"
  color="text-green-600"
/>

// With sparkline chart
<ScoreCard
  title="SEO Score"
  value={53}
  sparklineData={data}
  color="text-orange-600"
/>

// With ring visualization
<ScoreCard
  title="Overall Score"
  value={85}
  showRing={true}
  color="text-purple-600"
/>

// With icon and click handler
<ScoreCard
  title="Citations"
  value="1,247"
  icon={<SparklesIcon />}
  onClick={() => console.log('Clicked!')}
  color="text-blue-500"
/>`}
            </pre>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold mb-2 text-green-600">✅ DRY Code</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              One component instead of 5 separate implementations
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold mb-2 text-blue-600">✅ Consistent</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Same styling and behavior across all score cards
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold mb-2 text-purple-600">✅ Flexible</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Infinite variations with simple props
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCardExamples;
