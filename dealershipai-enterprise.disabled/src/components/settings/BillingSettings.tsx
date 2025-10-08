'use client'

import { useState } from 'react'
import { CreditCard, Download, AlertCircle, CheckCircle, ExternalLink, ArrowUpRight } from 'lucide-react'
import { api } from '@/lib/trpc-client'

export default function BillingSettings() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const { data: subscription, isLoading: subscriptionLoading } = api.billing.getSubscription.useQuery()
  const { data: usage, isLoading: usageLoading } = api.billing.getUsage.useQuery()
  const { data: tenantSettings } = api.settings.getTenantSettings.useQuery()

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-emerald-600 bg-emerald-50',
      cancelled: 'text-red-600 bg-red-50',
      past_due: 'text-amber-600 bg-amber-50',
      trialing: 'text-blue-600 bg-blue-50',
    }
    return colors[status as keyof typeof colors] || 'text-slate-600 bg-slate-50'
  }

  const getPlanFeatures = (plan: string) => {
    const features = {
      test_drive: ['Basic AI visibility tracking', '1 dealership', 'Email support'],
      tier_1: ['Full AI tracking', '1 dealership', 'Weekly reports', 'Priority support'],
      tier_2: ['Everything in Tier 1', 'Action plans', 'Bulk operations', 'Phone support'],
      tier_3: ['Everything in Tier 2', 'dAI Agent automation', 'Hands-off optimization', 'Dedicated support'],
      enterprise: ['Up to 350 rooftops', 'Custom integrations', 'SLA guarantee', 'White-glove service'],
    }
    return features[plan as keyof typeof features] || []
  }

  const getPlanPrice = (plan: string) => {
    const prices = {
      test_drive: 0,
      tier_1: 499,
      tier_2: 999,
      tier_3: 1999,
      enterprise: 'Custom'
    }
    return prices[plan as keyof typeof prices] || 0
  }

  if (subscriptionLoading || usageLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="h-32 bg-slate-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Billing & Subscription</h2>
        <p className="text-sm text-slate-500">Manage your subscription and billing information</p>
      </div>

      <div className="space-y-6">
        {/* Current Subscription */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Current Plan</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription?.status || 'active')}`}>
              {subscription?.status?.replace('_', ' ') || 'Active'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600 mb-1">Plan</p>
              <p className="text-xl font-bold text-slate-900 capitalize">
                {subscription?.plan?.replace('_', ' ') || 'Test Drive'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Monthly Cost</p>
              <p className="text-xl font-bold text-slate-900">
                ${subscription?.mrr || 0}/month
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Next Billing</p>
              <p className="text-xl font-bold text-slate-900">
                {subscription?.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : '--'}
              </p>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => window.open('https://billing.stripe.com/p/login/test_123', '_blank')}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Manage Billing
            </button>
            <button
              onClick={() => window.open('/api/billing/invoice-history', '_blank')}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Invoices
            </button>
            {subscription?.status === 'active' && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" />
                Upgrade Plan
              </button>
            )}
          </div>
        </div>

        {/* Usage Statistics */}
        {usage && (
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Usage This Month</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">AI Queries</p>
                <p className="text-2xl font-bold text-slate-900">
                  {usage.aiQueries.toLocaleString()} / {usage.maxQueries.toLocaleString()}
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{ width: `${Math.min((usage.aiQueries / usage.maxQueries) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Reports Generated</p>
                <p className="text-2xl font-bold text-slate-900">
                  {usage.reportsGenerated} / {usage.maxReports}
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min((usage.reportsGenerated / usage.maxReports) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">API Calls</p>
                <p className="text-2xl font-bold text-slate-900">
                  {usage.apiCalls.toLocaleString()} / {usage.maxApiCalls.toLocaleString()}
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${Math.min((usage.apiCalls / usage.maxApiCalls) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plan Features */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Current Plan Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getPlanFeatures(subscription?.plan || 'test_drive').map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Available Plans */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'tier_1', name: 'Intelligence', price: 499 },
              { id: 'tier_2', name: 'Boss Mode', price: 999 },
              { id: 'enterprise', name: 'Enterprise', price: 'Custom' }
            ].map((plan) => (
              <div key={plan.id} className="border border-slate-200 rounded-lg p-4">
                <div className="text-center mb-4">
                  <h4 className="font-semibold text-slate-900">{plan.name}</h4>
                  <p className="text-2xl font-bold text-slate-900">
                    ${plan.price}{typeof plan.price === 'number' ? '/month' : ''}
                  </p>
                </div>
                <ul className="space-y-2 mb-4">
                  {getPlanFeatures(plan.id).slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  {subscription?.plan === plan.id ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Upgrade Plan</h3>
                    <p className="text-sm text-slate-500">Choose a plan that fits your needs</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-600 mb-4">
                Contact our sales team to discuss upgrading your plan and get a custom quote.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => window.open('mailto:sales@dealershipai.com?subject=Plan Upgrade Inquiry', '_blank')}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
