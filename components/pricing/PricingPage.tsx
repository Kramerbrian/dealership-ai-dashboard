'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Star, Zap, Shield, Users, ArrowRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/lib/user-management';

interface PricingPageProps {
  onSelectPlan?: (plan: SubscriptionPlan) => void;
}

export default function PricingPage({ onSelectPlan }: PricingPageProps) {
  const { data: session } = useSession();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('professional');

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (onSelectPlan) {
      onSelectPlan(plan);
      return;
    }

    if (!session) {
      // Redirect to sign in with plan parameter
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(`/pricing?plan=${plan}`)}`;
      return;
    }

    try {
      // Create checkout session
      const response = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      const result = await response.json();

      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        console.error('Failed to create checkout session:', result.error);
        alert('Failed to start checkout. Please try again.');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
    id: key as SubscriptionPlan,
    ...plan,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Choose Your
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Advantage
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transform your dealership with AI-powered analytics. Start free, scale as you grow.
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border ${
                plan.id === 'professional'
                  ? 'border-blue-400 ring-2 ring-blue-400/50 scale-105'
                  : 'border-white/20'
              }`}
            >
              {/* Popular Badge */}
              {plan.id === 'professional' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-300">/{plan.interval}</span>
                  )}
                </div>
                {plan.price === 0 && (
                  <div className="text-green-400 font-semibold">Free Forever</div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Limits */}
              <div className="mb-8 p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-semibold mb-3">Plan Limits</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Reports/month:</span>
                    <span>
                      {plan.limits.reportsPerMonth === -1 ? 'Unlimited' : plan.limits.reportsPerMonth}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domains:</span>
                    <span>
                      {plan.limits.domainsPerUser === -1 ? 'Unlimited' : plan.limits.domainsPerUser}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>API calls/month:</span>
                    <span>
                      {plan.limits.apiCallsPerMonth === -1 ? 'Unlimited' : plan.limits.apiCallsPerMonth.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  plan.id === 'professional'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                    : plan.id === 'free'
                    ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                {plan.id === 'free' ? (
                  'Get Started Free'
                ) : (
                  <>
                    Start {plan.name} Trial
                    <ArrowRight className="w-5 h-5 ml-2 inline" />
                  </>
                )}
              </motion.button>

              {plan.id === 'free' && (
                <p className="text-center text-gray-400 text-sm mt-3">
                  No credit card required
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Everything You Need to Dominate AI Search
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Real-Time Analytics</h3>
              <p className="text-gray-300">
                Get live data from Google Search Console, Analytics, and PageSpeed Insights
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Enterprise Security</h3>
              <p className="text-gray-300">
                Bank-level security with OAuth SSO and encrypted data storage
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Team Collaboration</h3>
              <p className="text-gray-300">
                Share insights with your team and collaborate on optimization strategies
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: "Can I change plans anytime?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                q: "What happens to my data if I cancel?",
                a: "Your data is retained for 30 days after cancellation. You can export all your data before canceling."
              },
              {
                q: "Do you offer refunds?",
                a: "We offer a 14-day money-back guarantee for all paid plans. No questions asked."
              },
              {
                q: "Is there a setup fee?",
                a: "No setup fees! You only pay the monthly subscription fee. Start with our free plan to test everything."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-300">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
