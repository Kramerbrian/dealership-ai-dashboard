'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import SchemaGenerator, { type DealerInfo } from '@/components/schema/SchemaGenerator';
import IntelligenceShell from '@/components/cognitive/IntelligenceShell';

export default function SchemaToolsPage() {
  const { user, isLoaded } = useUser();
  const [dealerInfo, setDealerInfo] = useState<Partial<DealerInfo>>({});
  const [missingSchemas, setMissingSchemas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !user) {
      redirect('/sign-in');
    }
  }, [isLoaded, user]);

  useEffect(() => {
    if (user) {
      const dealerId = (user.publicMetadata?.dealerId as string) || user.id || 'demo-tenant';
      const domain = (user.publicMetadata?.domain as string) ||
                     (user.publicMetadata?.dealershipUrl as string)?.replace(/^https?:\/\//, '') ||
                     'demo-dealership.com';

      // Fetch latest schema scan to get missing schemas and dealer info
      fetch(`/api/marketpulse/eeat/score?domain=${domain}&dealer=${dealerId}`)
        .then(res => res.json())
        .then(data => {
          if (data.details) {
            setMissingSchemas(data.details.missingSchemaTypes || []);

            // Pre-fill dealer info from user metadata if available
            setDealerInfo({
              name: (user.publicMetadata?.dealershipName as string) || 'Your Dealership',
              url: `https://${domain}`,
              telephone: (user.publicMetadata?.phone as string) || '',
              streetAddress: (user.publicMetadata?.address as string) || '',
              addressLocality: (user.publicMetadata?.city as string) || '',
              addressRegion: (user.publicMetadata?.state as string) || '',
              postalCode: (user.publicMetadata?.zip as string) || '',
              email: user.primaryEmailAddress?.emailAddress || '',
            });
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('[schema-tools] Error fetching schema data:', err);
          setLoading(false);
        });
    }
  }, [user]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const dealerId = (user.publicMetadata?.dealerId as string) || user.id || 'demo-tenant';

  const handleSchemaGenerate = (type: string, code: string) => {
    console.log(`[schema-tools] Generated ${type} schema:`, code.slice(0, 100) + '...');

    // Track schema generation event
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.track('Schema Generated', {
        type,
        dealerId,
        codeLength: code.length,
      });
    }
  };

  return (
    <IntelligenceShell dealerId={dealerId} showCognitionBar={false}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Schema Tools</h1>
        <p className="text-gray-400">
          Generate and implement Schema.org markup to improve your AI visibility
        </p>
      </div>

      {/* Missing Schemas Alert */}
      {missingSchemas.length > 0 && (
        <div className="mb-6 p-4 bg-amber-900/20 border border-amber-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-amber-200 mb-1">
                Missing {missingSchemas.length} Critical Schema{missingSchemas.length > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-amber-300/80 mb-2">
                Our scanner detected that your website is missing the following schema types:
              </p>
              <div className="flex flex-wrap gap-2">
                {missingSchemas.map(type => (
                  <span key={type} className="px-3 py-1 bg-amber-500/20 text-amber-200 rounded-lg text-sm font-medium">
                    {type}
                  </span>
                ))}
              </div>
              <p className="text-xs text-amber-300/60 mt-2">
                Use the generator below to create these schemas and boost your E-E-A-T score
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Schema Generator */}
      <SchemaGenerator
        dealerInfo={dealerInfo}
        missingSchemaTypes={missingSchemas}
        onGenerate={handleSchemaGenerate}
      />

      {/* Additional Resources */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-gray-800/50 border border-gray-700 rounded-xl">
          <h3 className="font-semibold text-white mb-2">📚 Schema Guide</h3>
          <p className="text-sm text-gray-400 mb-3">
            Learn which schemas are most important for automotive dealerships
          </p>
          <a
            href="https://schema.org/AutoDealer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            View Documentation →
          </a>
        </div>

        <div className="p-5 bg-gray-800/50 border border-gray-700 rounded-xl">
          <h3 className="font-semibold text-white mb-2">🔍 Test Your Schema</h3>
          <p className="text-sm text-gray-400 mb-3">
            Validate your schema markup with Google's testing tool
          </p>
          <a
            href="https://validator.schema.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            Open Validator →
          </a>
        </div>

        <div className="p-5 bg-gray-800/50 border border-gray-700 rounded-xl">
          <h3 className="font-semibold text-white mb-2">📊 View Your Score</h3>
          <p className="text-sm text-gray-400 mb-3">
            See how schema impacts your overall E-E-A-T score
          </p>
          <a
            href="/dashboard"
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            Go to Dashboard →
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 p-6 bg-gray-800/30 border border-gray-700 rounded-xl">
        <h3 className="font-semibold text-white mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-200 mb-1">What is Schema.org markup?</h4>
            <p className="text-sm text-gray-400">
              Schema.org markup (JSON-LD) is structured data that helps search engines and AI platforms understand your website content. It's critical for appearing in AI search results.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-200 mb-1">Which schema types should I implement first?</h4>
            <p className="text-sm text-gray-400">
              Start with <strong>AutoDealer</strong> or <strong>LocalBusiness</strong> on your homepage, then add <strong>Product</strong> schemas to vehicle pages, and <strong>Review</strong> schemas to testimonial pages.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-200 mb-1">How do I know if my schema is working?</h4>
            <p className="text-sm text-gray-400">
              Use Google's Rich Results Test or Schema Validator to check for errors. Our dashboard will also show improved E-E-A-T scores within 24-48 hours of implementation.
            </p>
          </div>
        </div>
      </div>
    </IntelligenceShell>
  );
}
