'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * One-Click Schema Generator Component
 *
 * Generates Schema.org JSON-LD markup for automotive dealerships
 * with copy-paste functionality and platform-specific installation guides.
 */

export interface DealerInfo {
  name: string;
  url: string;
  telephone: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  email?: string;
  priceRange?: string;
  openingHours?: string[];
  image?: string;
  latitude?: number;
  longitude?: number;
}

export type SchemaType =
  | 'LocalBusiness'
  | 'AutoDealer'
  | 'Product'
  | 'Review'
  | 'FAQPage'
  | 'BreadcrumbList'
  | 'Organization';

export type Platform =
  | 'wordpress'
  | 'shopify'
  | 'html'
  | 'react'
  | 'nextjs';

interface SchemaGeneratorProps {
  dealerInfo?: Partial<DealerInfo>;
  missingSchemaTypes?: string[];
  onGenerate?: (schemaType: SchemaType, code: string) => void;
}

export default function SchemaGenerator({
  dealerInfo,
  missingSchemaTypes = [],
  onGenerate
}: SchemaGeneratorProps) {
  const [selectedType, setSelectedType] = useState<SchemaType>('AutoDealer');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('html');
  const [formData, setFormData] = useState<Partial<DealerInfo>>(dealerInfo || {});
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const schemaTypes: { value: SchemaType; label: string; description: string }[] = [
    { value: 'AutoDealer', label: 'Auto Dealer', description: 'Main dealership information' },
    { value: 'LocalBusiness', label: 'Local Business', description: 'Alternative to AutoDealer' },
    { value: 'Product', label: 'Product', description: 'Vehicle inventory listings' },
    { value: 'Review', label: 'Review', description: 'Customer testimonials' },
    { value: 'FAQPage', label: 'FAQ Page', description: 'Frequently asked questions' },
    { value: 'BreadcrumbList', label: 'Breadcrumb', description: 'Site navigation' },
    { value: 'Organization', label: 'Organization', description: 'Corporate information' },
  ];

  const platforms: { value: Platform; label: string; icon: string }[] = [
    { value: 'html', label: 'HTML', icon: '📄' },
    { value: 'wordpress', label: 'WordPress', icon: '📝' },
    { value: 'shopify', label: 'Shopify', icon: '🛒' },
    { value: 'react', label: 'React', icon: '⚛️' },
    { value: 'nextjs', label: 'Next.js', icon: '▲' },
  ];

  /**
   * Generate JSON-LD schema based on type
   */
  const generateSchema = (type: SchemaType): object => {
    const baseUrl = formData.url || 'https://example.com';

    switch (type) {
      case 'AutoDealer':
      case 'LocalBusiness':
        return {
          '@context': 'https://schema.org',
          '@type': type === 'AutoDealer' ? 'AutoDealer' : 'LocalBusiness',
          name: formData.name || 'Example Dealership',
          url: baseUrl,
          telephone: formData.telephone || '+1-555-0100',
          email: formData.email || 'info@example.com',
          address: {
            '@type': 'PostalAddress',
            streetAddress: formData.streetAddress || '123 Main St',
            addressLocality: formData.addressLocality || 'City',
            addressRegion: formData.addressRegion || 'ST',
            postalCode: formData.postalCode || '12345',
            addressCountry: 'US',
          },
          geo: formData.latitude && formData.longitude ? {
            '@type': 'GeoCoordinates',
            latitude: formData.latitude,
            longitude: formData.longitude,
          } : undefined,
          image: formData.image || `${baseUrl}/logo.png`,
          priceRange: formData.priceRange || '$$',
          openingHoursSpecification: formData.openingHours?.map(hours => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: hours.split(' ')[0],
            opens: hours.split(' ')[1],
            closes: hours.split(' ')[2],
          })) || [
            { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Monday', opens: '09:00', closes: '18:00' },
            { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Tuesday', opens: '09:00', closes: '18:00' },
          ],
          sameAs: [
            `https://www.facebook.com/${formData.name?.toLowerCase().replace(/ /g, '')}`,
            `https://www.twitter.com/${formData.name?.toLowerCase().replace(/ /g, '')}`,
          ],
        };

      case 'Product':
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: '2024 Honda Accord EX',
          description: 'New 2024 Honda Accord EX with advanced safety features',
          brand: { '@type': 'Brand', name: 'Honda' },
          offers: {
            '@type': 'Offer',
            url: `${baseUrl}/inventory/2024-honda-accord-ex`,
            priceCurrency: 'USD',
            price: '28995',
            availability: 'https://schema.org/InStock',
            seller: {
              '@type': 'AutoDealer',
              name: formData.name || 'Example Dealership',
            },
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '127',
          },
        };

      case 'Review':
        return {
          '@context': 'https://schema.org',
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: 'John Smith',
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5',
          },
          reviewBody: 'Excellent service and great selection. The sales team was knowledgeable and helpful throughout the entire process.',
          itemReviewed: {
            '@type': 'AutoDealer',
            name: formData.name || 'Example Dealership',
          },
          datePublished: new Date().toISOString().split('T')[0],
        };

      case 'FAQPage':
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What are your service hours?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Our service department is open Monday-Friday 7:00 AM - 6:00 PM, and Saturday 8:00 AM - 4:00 PM.',
              },
            },
            {
              '@type': 'Question',
              name: 'Do you offer financing?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes, we work with multiple lenders to offer competitive financing options for all credit levels.',
              },
            },
          ],
        };

      case 'BreadcrumbList':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: baseUrl,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Inventory',
              item: `${baseUrl}/inventory`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: 'New Vehicles',
              item: `${baseUrl}/inventory/new`,
            },
          ],
        };

      case 'Organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: formData.name || 'Example Dealership',
          url: baseUrl,
          logo: formData.image || `${baseUrl}/logo.png`,
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: formData.telephone || '+1-555-0100',
            contactType: 'Customer Service',
            email: formData.email || 'info@example.com',
          },
          sameAs: [
            `https://www.facebook.com/${formData.name?.toLowerCase().replace(/ /g, '')}`,
            `https://www.twitter.com/${formData.name?.toLowerCase().replace(/ /g, '')}`,
          ],
        };

      default:
        return {};
    }
  };

  /**
   * Wrap schema in platform-specific code
   */
  const wrapForPlatform = (schema: object, platform: Platform): string => {
    const jsonLd = JSON.stringify(schema, null, 2);

    switch (platform) {
      case 'html':
        return `<script type="application/ld+json">\n${jsonLd}\n</script>`;

      case 'wordpress':
        return `<!-- Add to your theme's header.php or use a plugin like "Insert Headers and Footers" -->
<script type="application/ld+json">
${jsonLd}
</script>`;

      case 'shopify':
        return `<!-- Add to theme.liquid in the <head> section -->
<script type="application/ld+json">
${jsonLd}
</script>`;

      case 'react':
        return `// Add this component to your page
import React from 'react';

export function ${selectedType}Schema() {
  const schema = ${jsonLd};

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}`;

      case 'nextjs':
        return `// Add to your page metadata (App Router)
export const metadata = {
  // ... other metadata
  other: {
    '${selectedType.toLowerCase()}-schema': ${jsonLd}
  }
};

// Or use the <Script> component in your layout/page:
import Script from 'next/script';

<Script
  id="${selectedType.toLowerCase()}-schema"
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(${jsonLd})
  }}
/>`;

      default:
        return jsonLd;
    }
  };

  const schema = generateSchema(selectedType);
  const code = wrapForPlatform(schema, selectedPlatform);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onGenerate?.(selectedType, code);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedType.toLowerCase()}-schema.${selectedPlatform === 'react' || selectedPlatform === 'nextjs' ? 'tsx' : 'html'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">One-Click Schema Generator</h2>
        <p className="mt-1 text-sm text-gray-600">
          Generate and install Schema.org markup in seconds
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Schema Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Schema Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {schemaTypes.map((type) => {
              const isMissing = missingSchemaTypes.includes(type.value);
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    selectedType === type.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {isMissing && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" title="Missing from your site" />
                  )}
                  <div className="font-semibold text-gray-900 text-sm">{type.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Platform Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Choose Your Platform
          </label>
          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => (
              <button
                key={platform.value}
                onClick={() => setSelectedPlatform(platform.value)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedPlatform === platform.value
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{platform.icon}</span>
                {platform.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview Toggle */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {showPreview ? '▼' : '▶'} Preview
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              {copied ? '✓ Copied!' : '📋 Copy Code'}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              ⬇ Download
            </button>
          </div>
        </div>

        {/* Code Preview */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
                <code>{code}</code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Installation Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="font-semibold text-blue-900 mb-2">📝 Installation Instructions</h3>
          <div className="text-sm text-blue-800 space-y-2">
            {selectedPlatform === 'html' && (
              <p>Copy the code above and paste it in the <code className="bg-blue-100 px-1 rounded">&lt;head&gt;</code> section of your HTML file.</p>
            )}
            {selectedPlatform === 'wordpress' && (
              <>
                <p><strong>Option 1:</strong> Use a plugin like "Insert Headers and Footers" or "WPCode"</p>
                <p><strong>Option 2:</strong> Add directly to your theme's <code className="bg-blue-100 px-1 rounded">header.php</code> file before the closing <code className="bg-blue-100 px-1 rounded">&lt;/head&gt;</code> tag</p>
              </>
            )}
            {selectedPlatform === 'shopify' && (
              <p>Go to <strong>Online Store → Themes → Edit Code</strong>, then open <code className="bg-blue-100 px-1 rounded">theme.liquid</code> and paste the code in the <code className="bg-blue-100 px-1 rounded">&lt;head&gt;</code> section.</p>
            )}
            {selectedPlatform === 'react' && (
              <p>Create a new component with the code above and import it into your page component. Add the component to your page's JSX.</p>
            )}
            {selectedPlatform === 'nextjs' && (
              <>
                <p><strong>App Router:</strong> Add to your page's metadata or use the <code className="bg-blue-100 px-1 rounded">&lt;Script&gt;</code> component.</p>
                <p><strong>Pages Router:</strong> Add to <code className="bg-blue-100 px-1 rounded">_document.tsx</code> in the <code className="bg-blue-100 px-1 rounded">&lt;Head&gt;</code> component.</p>
              </>
            )}
          </div>
        </div>

        {/* Validation Link */}
        <div className="mt-4 text-center">
          <a
            href={`https://validator.schema.org/#url=${encodeURIComponent(formData.url || 'https://example.com')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            🔍 Test with Google's Schema Validator →
          </a>
        </div>
      </div>
    </div>
  );
}
