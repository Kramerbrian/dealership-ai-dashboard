'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

export type BillingPeriod = 'monthly' | 'annual';

interface PricingToggleProps {
  defaultPeriod?: BillingPeriod;
  onChange?: (period: BillingPeriod) => void;
  savings?: number;
  showSavings?: boolean;
}

export function PricingToggle({
  defaultPeriod = 'annual',
  onChange,
  savings = 20,
  showSavings = true
}: PricingToggleProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(defaultPeriod);

  const handleToggle = (period: BillingPeriod) => {
    setBillingPeriod(period);
    if (onChange) {
      onChange(period);
    }

    // Track with analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'pricing_toggle_changed', {
        event_category: 'engagement',
        event_label: period
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      {/* Toggle Switch */}
      <div className="inline-flex items-center gap-3 p-1.5 bg-gray-800/50 rounded-full border border-white/10">
        {/* Monthly Button */}
        <button
          onClick={() => handleToggle('monthly')}
          className={`
            relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all
            ${billingPeriod === 'monthly'
              ? 'bg-white text-gray-900 shadow-lg'
              : 'text-gray-400 hover:text-white'
            }
          `}
          aria-pressed={billingPeriod === 'monthly'}
        >
          Monthly
        </button>

        {/* Annual Button */}
        <button
          onClick={() => handleToggle('annual')}
          className={`
            relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all
            ${billingPeriod === 'annual'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl'
              : 'text-gray-400 hover:text-white'
            }
          `}
          aria-pressed={billingPeriod === 'annual'}
        >
          <span>Annual</span>
          {showSavings && billingPeriod === 'annual' && (
            <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
              Save {savings}%
            </span>
          )}
        </button>
      </div>

      {/* Savings Badge */}
      {showSavings && billingPeriod === 'annual' && (
        <div className="flex items-center gap-2 text-sm text-green-400 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>You're saving {savings}% with annual billing!</span>
        </div>
      )}

      {/* Informational Text */}
      <p className="text-sm text-gray-500 text-center max-w-md">
        {billingPeriod === 'annual'
          ? `Pay annually and save ${savings}%. Cancel anytime.`
          : 'Billed monthly. Upgrade to annual and save 20%.'
        }
      </p>
    </div>
  );
}

// Pricing Calculator Hook
export function usePricingCalculator(monthlyPrice: number, savings: number = 20) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('annual');

  const calculatePrice = () => {
    if (billingPeriod === 'monthly') {
      return {
        price: monthlyPrice,
        period: 'month',
        total: monthlyPrice,
        savings: 0
      };
    }

    const annualMonthlyPrice = monthlyPrice * (1 - savings / 100);
    const annualTotal = annualMonthlyPrice * 12;
    const savedAmount = (monthlyPrice * 12) - annualTotal;

    return {
      price: Math.round(annualMonthlyPrice),
      period: 'month',
      total: Math.round(annualTotal),
      savings: Math.round(savedAmount),
      billedAs: 'annual'
    };
  };

  return {
    billingPeriod,
    setBillingPeriod,
    ...calculatePrice()
  };
}

// Pricing Display Component
export function PricingDisplay({
  monthlyPrice,
  billingPeriod,
  savings = 20
}: {
  monthlyPrice: number;
  billingPeriod: BillingPeriod;
  savings?: number;
}) {
  const price = billingPeriod === 'monthly'
    ? monthlyPrice
    : Math.round(monthlyPrice * (1 - savings / 100));

  const annualTotal = billingPeriod === 'annual' ? price * 12 : null;
  const savedAmount = billingPeriod === 'annual'
    ? (monthlyPrice * 12) - (price * 12)
    : null;

  return (
    <div className="space-y-2">
      {/* Main Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-bold text-white">${price}</span>
        <span className="text-xl text-gray-400">/month</span>
      </div>

      {/* Annual Billing Info */}
      {billingPeriod === 'annual' && annualTotal && (
        <div className="space-y-1">
          <p className="text-sm text-gray-400">
            ${annualTotal} billed annually
          </p>
          {savedAmount && (
            <p className="text-sm text-green-400 font-semibold">
              Save ${savedAmount}/year
            </p>
          )}
        </div>
      )}

      {/* Monthly Hint */}
      {billingPeriod === 'monthly' && (
        <p className="text-sm text-gray-500">
          Switch to annual and save ${Math.round(monthlyPrice * 12 * (savings / 100))}/year
        </p>
      )}
    </div>
  );
}

// Savings Calculator Badge
export function SavingsBadge({ savings = 20 }: { savings?: number }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-full">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-sm font-semibold text-green-400">
        Save {savings}% with annual billing
      </span>
    </div>
  );
}
