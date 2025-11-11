'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Crown, 
  Star, 
  ArrowUpRight, 
  X,
  CheckCircle,
  Zap,
  Shield,
  Building
} from 'lucide-react';
import { PlanTier } from '@/lib/tier-manager';

interface TierGateProps {
  children: React.ReactNode;
  requiredTier: PlanTier;
  currentTier: PlanTier;
  showUpgrade?: boolean;
  featureName?: string;
  className?: string;
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: PlanTier;
  requiredTier: PlanTier;
  featureName?: string;
}

const TierGate: React.FC<TierGateProps> = ({
  children,
  requiredTier,
  currentTier,
  showUpgrade = true,
  featureName,
  className = ''
}) => {
  const [showModal, setShowModal] = useState(false);

  // Check if user has access
  const hasAccess = getTierLevel(currentTier) >= getTierLevel(requiredTier);

  const handleUpgradeClick = () => {
    if (showUpgrade) {
      setShowModal(true);
    }
  };

  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Blurred content */}
        <div className="blur-sm pointer-events-none select-none">
          {children}
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200">
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="mb-4">
              {getTierIcon(requiredTier, 'w-12 h-12 text-slate-400')}
            </div>
            
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {featureName || `${requiredTier} Feature`}
            </h3>
            
            <p className="text-sm text-slate-600 mb-4 max-w-sm">
              This feature requires {requiredTier} tier access. 
              {currentTier === 'FREE' && ' Upgrade to unlock advanced analytics and insights.'}
              {currentTier === 'PRO' && ' Upgrade to Enterprise for premium features.'}
            </p>
            
            {showUpgrade && (
              <button
                onClick={handleUpgradeClick}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <span>Upgrade to {requiredTier}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentTier={currentTier}
        requiredTier={requiredTier}
        featureName={featureName}
      />
    </>
  );
};

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  requiredTier,
  featureName
}) => {
  const pricing = {
    FREE: { name: 'Free', price: 0, color: 'text-slate-600' },
    PRO: { name: 'Pro', price: 97, color: 'text-blue-600' },
    ENTERPRISE: { name: 'Enterprise', price: 297, color: 'text-purple-600' }
  };

  const features = {
    FREE: [
      'Basic AI Visibility Scores',
      '5 Sessions per Month',
      'Email Support',
      'Basic Analytics'
    ],
    PRO: [
      'Everything in Free',
      'E-E-A-T Authority Scores',
      'Competitive Intelligence',
      '50 Sessions per Month',
      'Priority Support',
      'Advanced Analytics'
    ],
    ENTERPRISE: [
      'Everything in Pro',
      'Mystery Shop Testing',
      'White Label Options',
      '200 Sessions per Month',
      'Dedicated Support',
      'Custom Integrations',
      'API Access'
    ]
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Upgrade to {pricing[requiredTier].name}
                  </h2>
                  <p className="text-slate-600 mt-1">
                    {featureName && `Unlock ${featureName} and more`}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(pricing).map(([tier, info]) => {
                  const isCurrentTier = tier === currentTier;
                  const isRecommended = tier === requiredTier;
                  const isUpgrade = getTierLevel(tier as PlanTier) > getTierLevel(currentTier);

                  return (
                    <motion.div
                      key={tier}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: tier === 'FREE' ? 0 : tier === 'PRO' ? 0.1 : 0.2 }}
                      className={`relative p-6 rounded-xl border-2 transition-all ${
                        isRecommended
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : isCurrentTier
                          ? 'border-slate-300 bg-slate-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {isRecommended && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Recommended
                          </span>
                        </div>
                      )}

                      {isCurrentTier && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-slate-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Current Plan
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <div className="mb-4">
                          {getTierIcon(tier as PlanTier, 'w-12 h-12 mx-auto')}
                        </div>
                        <h3 className={`text-xl font-bold ${info.color}`}>
                          {info.name}
                        </h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold text-slate-900">
                            ${info.price}
                          </span>
                          <span className="text-slate-600">/month</span>
                        </div>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {features[tier as PlanTier].map((feature, index) => (
                          <li key={index} className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            <span className="text-sm text-slate-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="space-y-2">
                        {isCurrentTier ? (
                          <button
                            disabled
                            className="w-full py-2 px-4 bg-slate-300 text-slate-500 rounded-lg font-medium cursor-not-allowed"
                          >
                            Current Plan
                          </button>
                        ) : isUpgrade ? (
                          <button
                            onClick={() => {
                              // Handle upgrade
                              window.open(`/upgrade?plan=${tier}`, '_blank');
                            }}
                            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                              isRecommended
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-slate-600 hover:bg-slate-700 text-white'
                            }`}
                          >
                            Upgrade to {info.name}
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full py-2 px-4 bg-slate-200 text-slate-400 rounded-lg font-medium cursor-not-allowed"
                          >
                            Downgrade Not Available
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 rounded-b-2xl">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-4">
                  All plans include 30-day money-back guarantee
                </p>
                <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
                  <span>✓ Secure Payment</span>
                  <span>✓ Cancel Anytime</span>
                  <span>✓ 24/7 Support</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Helper functions
function getTierLevel(tier: PlanTier): number {
  const levels = { FREE: 0, PRO: 1, ENTERPRISE: 2 };
  return levels[tier];
}

function getTierIcon(tier: PlanTier, className: string) {
  switch (tier) {
    case 'FREE':
      return <Zap className={className} />;
    case 'PRO':
      return <Crown className={className} />;
    case 'ENTERPRISE':
      return <Building className={className} />;
    default:
      return <Lock className={className} />;
  }
}

export default TierGate;
