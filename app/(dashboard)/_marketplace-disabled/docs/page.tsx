/**
 * SDK Documentation
 * Comprehensive documentation for developers building marketplace apps
 */

'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, Book, Terminal, Package, 
  Copy, CheckCircle2, ExternalLink,
  ChevronRight, FileText, Zap 
} from 'lucide-react';
import { AlertBanner, useAlerts } from '@/app/components/dashboard/AlertBanner';

const docsSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    content: [
      {
        title: 'Installation',
        code: `npm install @dealershipai/sdk
# or
yarn add @dealershipai/sdk
# or
pnpm add @dealershipai/sdk`,
        description: 'Install the DealershipAI SDK for JavaScript/TypeScript'
      },
      {
        title: 'Quick Start',
        code: `import { DealershipAI } from '@dealershipai/sdk';

const client = new DealershipAI({
  apiKey: process.env.DEALERSHIPAI_API_KEY
});

// Get dealership data
const dealership = await client.dealerships.get('dealership-id');

// Get metrics
const metrics = await client.metrics.get({
  dealershipId: 'dealership-id',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});`,
        description: 'Basic usage example'
      }
    ]
  },
  {
    id: 'authentication',
    title: 'Authentication',
    icon: FileText,
    content: [
      {
        title: 'API Keys',
        code: `// Get your API keys from the marketplace dashboard
const client = new DealershipAI({
  apiKey: 'mkp_your_api_key_here',
  apiSecret: 'your_secret_here' // Optional for public endpoints
});`,
        description: 'Use your marketplace app API keys for authentication'
      },
      {
        title: 'Rate Limits',
        code: `// Rate limits are per app, not per developer
// Free tier: 1,000 requests/day
// Pro tier: 10,000 requests/day
// Enterprise: Unlimited`,
        description: 'Rate limits vary by subscription tier'
      }
    ]
  },
  {
    id: 'dealerships',
    title: 'Dealerships API',
    icon: Package,
    content: [
      {
        title: 'Get Dealership',
        code: `const dealership = await client.dealerships.get('dealership-id');

// Response:
{
  id: 'cuid...',
  name: 'Toyota Naples',
  domain: 'toyotanaples.com',
  city: 'Naples',
  state: 'FL',
  plan: 'PROFESSIONAL',
  status: 'ACTIVE'
}`,
        description: 'Retrieve dealership information'
      },
      {
        title: 'List Dealerships',
        code: `const dealerships = await client.dealerships.list({
  state: 'FL',
  plan: 'PROFESSIONAL',
  limit: 50,
  offset: 0
});`,
        description: 'List dealerships with filtering'
      }
    ]
  },
  {
    id: 'metrics',
    title: 'Metrics API',
    icon: Terminal,
    content: [
      {
        title: 'Get Metrics',
        code: `const metrics = await client.metrics.get({
  dealershipId: 'dealership-id',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  include: ['vai', 'piqr', 'hrp', 'qai']
});

// Response:
{
  vai: 87.3,
  piqr: 92.1,
  hrp: 0.12,
  qai: 78.9,
  revenueAtRisk: 24800,
  trends: {
    vai: +2.3,
    piqr: +1.1
  }
}`,
        description: 'Retrieve AI visibility metrics for a dealership'
      },
      {
        title: 'Real-time Webhooks',
        code: `// Register webhook in your app settings
// DealershipAI will POST to your webhook URL when:
// - New metrics are calculated
// - Scores change significantly
// - Critical alerts are triggered

app.post('/webhooks/dealershipai', (req, res) => {
  const { event, data } = req.body;
  
  if (event === 'metrics.updated') {
    console.log('Metrics updated:', data);
  }
  
  res.json({ received: true });
});`,
        description: 'Set up webhooks for real-time updates'
      }
    ]
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    icon: Zap,
    content: [
      {
        title: 'Webhook Events',
        code: `// Available webhook events:
{
  'metrics.updated': 'When dealership metrics are recalculated',
  'score.changed': 'When score changes by >5 points',
  'alert.triggered': 'When critical alert is triggered',
  'app.installed': 'When your app is installed',
  'app.uninstalled': 'When your app is uninstalled'
}`,
        description: 'All available webhook events'
      },
      {
        title: 'Webhook Security',
        code: `// Verify webhook signature
import crypto from 'crypto';

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(JSON.stringify(payload)).digest('hex');
  return digest === signature;
}

// In your webhook handler:
app.post('/webhooks/dealershipai', (req, res) => {
  const signature = req.headers['x-dealershipai-signature'];
  const isValid = verifyWebhook(req.body, signature, process.env.WEBHOOK_SECRET);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook...
});`,
        description: 'Verify webhook signatures for security'
      }
    ]
  }
];

export default function SDKDocsPage() {
  const [activeSection, setActiveSection] = useState(docsSections[0].id);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { alerts, addAlert } = useAlerts();

  const activeSectionData = docsSections.find(s => s.id === activeSection) || docsSections[0];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addAlert('success', 'Code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Book className="w-10 h-10 text-purple-400" />
            SDK Documentation
          </h1>
          <p className="text-gray-400">
            Complete guide to building apps for the DealershipAI marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 sticky top-6">
              <h2 className="text-lg font-semibold text-white mb-4">Sections</h2>
              <nav className="space-y-2">
                {docsSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              {/* Section Header */}
              <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  {React.createElement(activeSectionData.icon, {
                    className: 'w-6 h-6 text-purple-400'
                  })}
                  <h2 className="text-2xl font-bold text-white">
                    {activeSectionData.title}
                  </h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-8">
                {activeSectionData.content.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {item.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopyCode(item.code)}
                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
                        title="Copy code"
                      >
                        {copiedCode === item.code ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto border border-gray-700">
                      <code className="text-sm text-gray-300 font-mono">
                        {item.code}
                      </code>
                    </pre>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="#"
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">API Reference</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                </div>
              </a>
              <a
                href="#"
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">Examples</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                </div>
              </a>
              <a
                href="#"
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Code className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">GitHub Repo</span>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.map(alert => (
        <AlertBanner
          key={alert.id}
          type={alert.type}
          message={alert.message}
          autoHide={alert.autoHide}
        />
      ))}
    </div>
  );
}

