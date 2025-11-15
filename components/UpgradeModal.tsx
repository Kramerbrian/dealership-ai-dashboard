// @ts-nocheck
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: 'free' | 'pro' | 'enterprise';
}

const plans = [
  {
    id: 'ignition',
    name: 'Ignition',
    price: 99,
    period: 'month',
    description: 'Perfect for getting started with AI visibility',
    features: [
      'AI Visibility Index™',
      'Weekly Reports',
      'Basic Analytics',
      'Email Support',
      '1 Dealership',
      'Basic API Access'
    ],
    priceId: process.env.STRIPE_IGNITION_PRICE_ID,
    popular: false,
    color: 'border-gray-200 hover:border-gray-300'
  },
  {
    id: 'momentum',
    name: 'Momentum',
    price: 249,
    period: 'month',
    description: 'Most popular for growing dealerships',
    features: [
      'Full Dashboard Access',
      'Crawl Graph Analytics',
      'API Access',
      'Priority Support',
      'Up to 3 Dealerships',
      'Advanced Analytics',
      'Custom Integrations'
    ],
    priceId: process.env.STRIPE_MOMENTUM_PRICE_ID,
    popular: true,
    color: 'border-blue-500 hover:border-blue-600'
  },
  {
    id: 'hyperdrive',
    name: 'Hyperdrive',
    price: 499,
    period: 'month',
    description: 'Enterprise-grade AI optimization',
    features: [
      'Auto-Fix AI',
      'Predictive Alerts',
      'Priority Support',
      'White Label',
      'Unlimited Dealerships',
      'Advanced API Access',
      'Dedicated Manager',
      'Custom Development'
    ],
    priceId: process.env.STRIPE_HYPERDRIVE_PRICE_ID,
    popular: false,
    color: 'border-purple-200 hover:border-purple-300'
  }
];

export default function UpgradeModal({ isOpen, onClose, currentTier = 'free' }: UpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const handleUpgrade = async (planId: string, priceId: string) => {
    if (!priceId) {
      console.error('Price ID not found for plan:', planId);
      return;
    }

    setLoading(planId);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customerEmail: email,
          successUrl: `${window.location.origin}/dashboard?upgraded=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      const { sessionId } = await response.json();

      if (sessionId) {
        const stripe = await stripePromise;
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId });
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-apple-2xl shadow-apple-large max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-apple-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Choose Your Plan
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Unlock the full power of DealershipAI
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-apple-md transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div className="p-6 border-b border-gray-200">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-2 border border-gray-300 rounded-apple-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Plans */}
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02 }}
                    className={`
                      relative rounded-apple-xl border-2 p-6 transition-all duration-200
                      ${plan.color}
                      ${plan.popular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                    `}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      <div className="mb-2">
                        <span className="text-4xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="text-gray-500 ml-1">
                          /{plan.period}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {plan.description}
                      </p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-600">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleUpgrade(plan.id, plan.priceId!)}
                      disabled={loading === plan.id || !email}
                      className={`
                        w-full py-3 px-4 rounded-apple-lg font-semibold transition-all duration-200
                        ${plan.popular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        }
                        ${loading === plan.id || !email
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                        }
                      `}
                    >
                      {loading === plan.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        `Choose ${plan.name}`
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  All plans include a 14-day free trial. Cancel anytime.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Need a custom plan? <a href="/contact" className="text-blue-600 hover:text-blue-700">Contact us</a>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
