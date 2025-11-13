/**
 * Upgrade Modal Component
 * Tier upgrade prompts with Stripe integration
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, ArrowRight, Star, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PRICING_PLANS } from '@/lib/stripe-config';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: 'FREE' | 'PRO' | 'ENTERPRISE';
  requiredTier: 'PRO' | 'ENTERPRISE';
  feature: string;
  onUpgrade?: (tier: 'PRO' | 'ENTERPRISE') => void;
}

const TIER_ICONS = {
  PRO: Zap,
  ENTERPRISE: Crown
};

const TIER_COLORS = {
  PRO: {
    text: 'text-blue-600',
    bg: 'from-blue-50 to-blue-100',
    border: 'border-blue-200'
  },
  ENTERPRISE: {
    text: 'text-purple-600',
    bg: 'from-purple-50 to-purple-100',
    border: 'border-purple-200'
  }
};

export function UpgradeModal({ 
  isOpen, 
  onClose, 
  currentTier, 
  requiredTier, 
  feature,
  onUpgrade 
}: UpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async (tier: 'PRO' | 'ENTERPRISE') => {
    try {
      setLoading(tier);
      
      if (onUpgrade) {
        onUpgrade(tier);
      } else {
        // Default upgrade flow
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier })
        });

        const data = await response.json();
        
        if (data.success) {
          window.location.href = data.url;
        } else {
          alert(data.error || 'Failed to start checkout');
        }
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start upgrade');
    } finally {
      setLoading(null);
    }
  };

  const plan = PRICING_PLANS[requiredTier];
  const Icon = TIER_ICONS[requiredTier];
  const colors = TIER_COLORS[requiredTier];

  const getFeatureDescription = (feature: string) => {
    const descriptions = {
      'eeat_scoring': 'Get detailed E-E-A-T analysis with expertise, experience, authoritativeness, and trustworthiness scores.',
      'mystery_shop': 'Schedule and manage mystery shop tests to evaluate your customer experience.',
      'competitive_intel': 'Access advanced competitive intelligence and market positioning insights.',
      'api_access': 'Get API access for custom integrations and white-label solutions.',
      'white_label': 'White-label the platform for your own brand and clients.'
    };
    
    return descriptions[feature as keyof typeof descriptions] || `This ${requiredTier} feature is not available in your current plan.`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl"
      >
        <Card className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} shadow-xl`}>
          <CardHeader className="relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
                <Icon className={`w-8 h-8 ${colors.text}`} />
              </div>
              
              <CardTitle className={`text-2xl font-bold ${colors.text} mb-2`}>
                Upgrade to {requiredTier}
              </CardTitle>
              
              <CardDescription className="text-gray-600">
                {getFeatureDescription(feature)}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Plan Details */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                ${plan.price}
                <span className="text-lg text-gray-600 ml-1">/month</span>
              </div>
              <p className="text-gray-600">{plan.description}</p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">What you'll get:</h3>
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current vs New */}
            <div className="bg-white/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Plan</p>
                  <p className="font-semibold">{currentTier}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Upgrading to</p>
                  <p className="font-semibold text-blue-600">{requiredTier}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Maybe Later
              </Button>
              
              <Button 
                className={`flex-1 bg-gradient-to-r ${
                  requiredTier === 'PRO' 
                    ? 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                    : 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                } text-white`}
                onClick={() => handleUpgrade(requiredTier)}
                disabled={loading === requiredTier}
              >
                {loading === requiredTier ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {loading === requiredTier ? 'Processing...' : `Upgrade to ${requiredTier}`}
              </Button>
            </div>

            {/* Trust Signals */}
            <div className="text-center text-sm text-gray-500">
              <p>✓ Secure payment via Stripe</p>
              <p>✓ Cancel anytime</p>
              <p>✓ 30-day money-back guarantee</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/**
 * Quick Upgrade Button Component
 */
interface QuickUpgradeButtonProps {
  requiredTier: 'PRO' | 'ENTERPRISE';
  feature: string;
  className?: string;
}

export function QuickUpgradeButton({ 
  requiredTier, 
  feature, 
  className = '' 
}: QuickUpgradeButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)}
        className={`bg-gradient-to-r ${
          requiredTier === 'PRO' 
            ? 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
            : 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
        } text-white ${className}`}
      >
        <Star className="w-4 h-4 mr-2" />
        Upgrade to {requiredTier}
      </Button>
      
      <UpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentTier="FREE"
        requiredTier={requiredTier}
        feature={feature}
      />
    </>
  );
}
