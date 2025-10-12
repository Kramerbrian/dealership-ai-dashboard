/**
 * DealershipAI v2.0 - Enhanced Upgrade Modal
 * 
 * Integrates with Stripe for seamless plan upgrades
 */

'use client';

import React, { useState } from 'react';
import { Crown, Zap, Check, Loader2, CreditCard, Shield } from 'lucide-react';
import { PRICING_PLANS, redirectToCheckout } from '@/src/lib/stripe';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: 'FREE' | 'PRO' | 'ENTERPRISE';
  requiredTier: 'PRO' | 'ENTERPRISE';
  featureName: string;
  description?: string;
  userId: string;
  onUpgradeSuccess?: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  requiredTier,
  featureName,
  description,
  userId,
  onUpgradeSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'enterprise'>(requiredTier === 'PRO' ? 'pro' : 'enterprise');

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      
      const plan = PRICING_PLANS.find(p => p.id === selectedPlan);
      if (!plan || !plan.priceId) {
        throw new Error('Plan not found');
      }

      const success = await redirectToCheckout(
        plan.priceId,
        userId,
        `${window.location.origin}/dashboard?upgrade=success`,
        `${window.location.origin}/dashboard?upgrade=cancelled`
      );

      if (success) {
        onUpgradeSuccess?.();
      } else {
        throw new Error('Failed to redirect to checkout');
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentTierInfo = () => {
    return PRICING_PLANS.find(p => p.id === currentTier.toLowerCase()) || PRICING_PLANS[0];
  };

  const getRequiredTierInfo = () => {
    return PRICING_PLANS.find(p => p.id === requiredTier.toLowerCase()) || PRICING_PLANS[1];
  };

  const currentTierInfo = getCurrentTierInfo();
  const requiredTierInfo = getRequiredTierInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8" />
              <div>
                <h2 className="text-3xl font-bold">Upgrade Your Plan</h2>
                <p className="text-white/90">Unlock {featureName} and more</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Feature Description */}
          {description && (
            <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">About {featureName}</h3>
              <p className="text-blue-700">{description}</p>
            </div>
          )}

          {/* Current vs Required Plan */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current vs Required Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  <span className="font-medium text-gray-700">Current: {currentTierInfo.name}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{currentTierInfo.price}/month</div>
                <div className="text-sm text-gray-500">{currentTierInfo.sessions} sessions/month</div>
              </div>
              
              <div className="p-4 border-2 border-blue-500 rounded-xl bg-blue-50">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="font-medium text-blue-700">Required: {requiredTierInfo.name}</span>
                </div>
                <div className="text-2xl font-bold text-blue-900 mb-2">{requiredTierInfo.price}/month</div>
                <div className="text-sm text-blue-600">{requiredTierInfo.sessions} sessions/month</div>
              </div>
            </div>
          </div>

          {/* Plan Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRICING_PLANS.filter(plan => plan.id !== 'free').map((plan) => (
                <div
                  key={plan.id}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan(plan.id as 'pro' | 'enterprise')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {plan.id === 'pro' ? <Crown className="w-6 h-6 text-yellow-500" /> : <Zap className="w-6 h-6 text-purple-500" />}
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                        <p className="text-gray-500">{plan.sessions} sessions/month</p>
                      </div>
                    </div>
                    {plan.popular && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  
                  <div className="text-3xl font-bold text-gray-900 mb-4">{plan.price}/month</div>
                  
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {selectedPlan === plan.id && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Security & Trust */}
          <div className="mb-8 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="font-medium text-gray-900">Secure Payment</span>
            </div>
            <p className="text-sm text-gray-600">
              Your payment is processed securely by Stripe. You can cancel or change your plan at any time.
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Upgrade to {PRICING_PLANS.find(p => p.id === selectedPlan)?.name}</span>
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-4 text-gray-500 font-medium hover:text-gray-700 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
