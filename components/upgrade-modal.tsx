/**
 * Upgrade Modal Component
 * Shows pricing and benefits when user hits tier limits
 */

import React, { useState } from 'react';
import { DealershipTier } from '@prisma/client';
import { X, Check, Star, Zap, Shield } from 'lucide-react';

interface UpgradeModalProps {
  feature: string;
  requiredTier: DealershipTier;
  currentTier: DealershipTier;
  onUpgrade?: () => void;
  onClose?: () => void;
}

export function UpgradeModal({
  feature,
  requiredTier,
  currentTier,
  onUpgrade,
  onClose
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  
  const plans = {
    PRO: {
      name: 'Professional',
      monthly: 499,
      annual: 4990,
      savings: 17,
      features: [
        '50 monthly audits',
        '25 competitor analyses',
        'Schema generation',
        'Review drafting',
        'Advanced analytics',
        'Priority support'
      ],
      icon: <Zap className="text-blue-600" size={24} />,
      color: 'blue'
    },
    ENTERPRISE: {
      name: 'Enterprise',
      monthly: 999,
      annual: 9990,
      savings: 17,
      features: [
        'Unlimited audits',
        'Unlimited competitor analyses',
        'Mystery shop automation',
        'Auto-inject schema',
        'Auto-respond to reviews',
        'Dedicated support',
        'Custom integrations'
      ],
      icon: <Shield className="text-purple-600" size={24} />,
      color: 'purple'
    }
  };
  
  const plan = plans[requiredTier];
  const price = selectedPlan === 'monthly' ? plan.monthly : plan.annual;
  const savings = selectedPlan === 'annual' ? plan.savings : 0;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {plan.icon}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Unlock {feature}
              </h2>
              <p className="text-gray-600">
                Upgrade to {plan.name} to access this feature
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>
          )}
        </div>
        
        {/* Pricing */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              ${price.toLocaleString()}
              <span className="text-lg text-gray-500">/{selectedPlan === 'monthly' ? 'month' : 'year'}</span>
            </div>
            {savings > 0 && (
              <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                <Star size={16} />
                Save {savings}% with annual billing
              </div>
            )}
          </div>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`px-4 py-2 ${selectedPlan === 'monthly' ? 'bg-blue-100 text-blue-800' : 'text-gray-600'} rounded-lg transition`}>
              Monthly
            </span>
            <button
              onClick={() => setSelectedPlan(selectedPlan === 'monthly' ? 'annual' : 'monthly')}
              className={`relative w-12 h-6 rounded-full transition ${
                selectedPlan === 'annual' ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                  selectedPlan === 'annual' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`px-4 py-2 ${selectedPlan === 'annual' ? 'bg-blue-100 text-blue-800' : 'text-gray-600'} rounded-lg transition`}>
              Annual
            </span>
          </div>
          
          {/* Features */}
          <div className="space-y-3 mb-8">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="text-green-600 flex-shrink-0" size={20} />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
          
          {/* ROI Calculator */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">ROI Calculator</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Monthly cost:</span>
                <span className="font-semibold ml-2">${price.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Potential revenue:</span>
                <span className="font-semibold ml-2 text-green-600">$15,000+</span>
              </div>
              <div>
                <span className="text-gray-600">ROI:</span>
                <span className="font-semibold ml-2 text-green-600">3,000%</span>
              </div>
              <div>
                <span className="text-gray-600">Payback period:</span>
                <span className="font-semibold ml-2">2.1 months</span>
              </div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onUpgrade}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition ${
                plan.color === 'blue' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              Upgrade to {plan.name}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
