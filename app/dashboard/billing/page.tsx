'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Calendar, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

/**
 * Billing Portal Page
 * Stripe Customer Portal integration for subscription management
 */
export default function BillingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [usage, setUsage] = useState({ used: 0, limit: 0 });
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingData();
  }, [user]);

  const fetchBillingData = async () => {
    try {
      // Fetch current plan and usage
      const planRes = await fetch('/api/user/subscription');
      const planData = await planRes.json();
      setCurrentPlan(planData);

      // Fetch usage (using database integration)
      const usageRes = await fetch('/api/user/usage');
      const usageData = await usageRes.json();
      setUsage(usageData.usage || { used: 0, limit: 0 });

      // Fetch invoices
      const invoicesRes = await fetch('/api/billing/invoices');
      const invoicesData = await invoicesRes.json();
      setInvoices(invoicesData.invoices || []);

    } catch (error) {
      console.error('Billing data fetch error:', error);
      // Set defaults on error
      setUsage({ used: 0, limit: 3 });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal creation error:', error);
    }
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-white">Loading billing information...</div>
      </div>
    );
  }

  const planName = currentPlan?.tier || 'free';
  const planPrice = planName === 'pro' ? 499 : planName === 'enterprise' ? 999 : 0;
  const usagePercent = usage.limit > 0 ? (usage.used / usage.limit) * 100 : 0;

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
          <p className="text-zinc-400">Manage your plan, payment method, and invoices</p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Current Plan</h2>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  planName === 'enterprise' ? 'bg-amber-500/20 text-amber-400' :
                  planName === 'pro' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-zinc-700 text-zinc-300'
                }`}>
                  {planName.toUpperCase()}
                </div>
                {planPrice > 0 && (
                  <span className="text-2xl font-bold text-white">
                    ${planPrice}<span className="text-sm font-normal text-zinc-400">/month</span>
                  </span>
                )}
              </div>
            </div>
            {planName === 'free' && (
              <button
                onClick={handleUpgrade}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Upgrade
              </button>
            )}
          </div>

          {/* Usage Metrics */}
          {planName !== 'free' && (
            <div className="border-t border-zinc-700 pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Sessions Used This Month</span>
                <span className="text-sm font-medium text-white">
                  {usage.used} / {usage.limit || '∞'}
                </span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    usagePercent > 80 ? 'bg-red-500' :
                    usagePercent > 60 ? 'bg-amber-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              {usagePercent > 80 && (
                <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  You're using {usagePercent.toFixed(0)}% of your limit
                </p>
              )}
            </div>
          )}

          {/* Next Billing Date */}
          {planPrice > 0 && currentPlan?.nextBillingDate && (
            <div className="border-t border-zinc-700 pt-6 mt-6">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Calendar className="w-4 h-4" />
                <span>Next billing date: {new Date(currentPlan.nextBillingDate).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Method */}
        {planPrice > 0 && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-zinc-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Payment Method</h3>
                  <p className="text-sm text-zinc-400">
                    {currentPlan?.paymentMethod ? `**** ${currentPlan.paymentMethod.last4}` : 'No card on file'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleManageSubscription}
                className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors text-sm"
              >
                Update
              </button>
            </div>
          </div>
        )}

        {/* Invoice History */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Invoice History
          </h3>
          {invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-white">
                      {new Date(invoice.created * 1000).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {invoice.status === 'paid' ? (
                        <span className="flex items-center gap-1 text-green-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Paid
                        </span>
                      ) : (
                        <span className="text-amber-400">Pending</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">
                      ${(invoice.amount_paid / 100).toFixed(2)}
                    </div>
                    {invoice.hosted_invoice_url && (
                      <a
                        href={invoice.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-400 hover:text-purple-300"
                      >
                        View →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400 text-sm">No invoices yet</p>
          )}
        </div>

        {/* Manage Subscription Button */}
        {planPrice > 0 && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Manage Subscription</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Update your plan, payment method, or cancel your subscription
            </p>
            <button
              onClick={handleManageSubscription}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Open Customer Portal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
