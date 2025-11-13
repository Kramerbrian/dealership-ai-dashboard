'use client';

import { useState } from 'react';
import { Check, X, Zap, Crown, Building2 } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    dealerships: number;
    queries: number;
    storage: number;
    apiCalls: number;
  };
  popular?: boolean;
  icon: React.ComponentType<any>;
}

interface PricingPlansProps {
  currentPlan: {
    name: string;
    price: number;
    interval: 'month' | 'year';
  };
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small dealerships getting started',
    price: 99,
    interval: 'month',
    features: [
      'Up to 2 dealerships',
      '10,000 queries/month',
      'Basic analytics',
      'Email support',
      'Standard reporting'
    ],
    limits: {
      dealerships: 2,
      queries: 10000,
      storage: 10,
      apiCalls: 50000
    },
    icon: Zap
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing dealerships with multiple locations',
    price: 299,
    interval: 'month',
    features: [
      'Up to 10 dealerships',
      '50,000 queries/month',
      'Advanced analytics',
      'Priority support',
      'Custom reporting',
      'API access',
      'White-label options'
    ],
    limits: {
      dealerships: 10,
      queries: 50000,
      storage: 100,
      apiCalls: 500000
    },
    popular: true,
    icon: Crown
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large dealership groups and automotive companies',
    price: 999,
    interval: 'month',
    features: [
      'Unlimited dealerships',
      'Unlimited queries',
      'Enterprise analytics',
      '24/7 phone support',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantees',
      'On-premise deployment'
    ],
    limits: {
      dealerships: -1, // unlimited
      queries: -1,
      storage: 1000,
      apiCalls: -1
    },
    icon: Building2
  }
];

export default function PricingPlans({ currentPlan }: PricingPlansProps) {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [loading, setLoading] = useState<string | null>(null);

  const getPrice = (plan: Plan) => {
    if (billingInterval === 'year') {
      return Math.round(plan.price * 12 * 0.8); // 20% discount for annual
    }
    return plan.price;
  };

  const getPriceDisplay = (plan: Plan) => {
    const price = getPrice(plan);
    const interval = billingInterval === 'year' ? 'year' : plan.interval;
    return { price, interval };
  };

  const handlePlanChange = async (planId: string) => {
    setLoading(planId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Changing to plan: ${planId}`);
      // Handle actual plan change logic here
    } catch (error) {
      console.error('Failed to change plan:', error);
    } finally {
      setLoading(null);
    }
  };

  const isCurrentPlan = (plan: Plan) => {
    return plan.name === currentPlan.name && plan.interval === currentPlan.interval;
  };

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setBillingInterval('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingInterval === 'month'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('year')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingInterval === 'year'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Annual
            <span className="ml-1 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const { price, interval } = getPriceDisplay(plan);
          const isCurrent = isCurrentPlan(plan);
          const Icon = plan.icon;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-8 ${
                plan.popular
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white'
              } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-4 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`inline-flex p-3 rounded-xl mb-4 ${
                  plan.popular ? 'bg-indigo-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    plan.popular ? 'text-indigo-600' : 'text-gray-600'
                  }`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">${price}</span>
                  <span className="text-gray-500">/{interval}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Limits */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Limits</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Dealerships:</span>
                    <span className="ml-1 font-medium">
                      {plan.limits.dealerships === -1 ? 'Unlimited' : plan.limits.dealerships}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Queries:</span>
                    <span className="ml-1 font-medium">
                      {plan.limits.queries === -1 ? 'Unlimited' : plan.limits.queries.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Storage:</span>
                    <span className="ml-1 font-medium">{plan.limits.storage}GB</span>
                  </div>
                  <div>
                    <span className="text-gray-500">API Calls:</span>
                    <span className="ml-1 font-medium">
                      {plan.limits.apiCalls === -1 ? 'Unlimited' : plan.limits.apiCalls.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handlePlanChange(plan.id)}
                disabled={isCurrent || loading === plan.id}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isCurrent
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } ${loading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading === plan.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : isCurrent ? (
                  'Current Plan'
                ) : (
                  'Change Plan'
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Starter</h4>
            <p className="text-gray-600">
              Perfect for single-location dealerships or those just getting started with AI-powered analytics.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Professional</h4>
            <p className="text-gray-600">
              Ideal for multi-location dealerships that need advanced features and higher usage limits.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Enterprise</h4>
            <p className="text-gray-600">
              For large dealership groups requiring unlimited usage, custom integrations, and dedicated support.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Can I change my plan anytime?</h4>
            <p className="text-gray-600 text-sm mt-1">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">What happens if I exceed my limits?</h4>
            <p className="text-gray-600 text-sm mt-1">
              We'll notify you when you're approaching your limits. You can upgrade your plan or purchase additional capacity as needed.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Is there a free trial?</h4>
            <p className="text-gray-600 text-sm mt-1">
              Yes, all plans come with a 14-day free trial. No credit card required to get started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
