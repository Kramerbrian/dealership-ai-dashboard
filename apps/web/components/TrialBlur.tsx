'use client';
import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrialBlurProps {
  children: ReactNode;
  trialStartDate?: Date;
  trialDurationDays?: number;
  onUpgrade?: () => void;
  tier?: 'free' | 'pro' | 'enterprise';
}

export default function TrialBlur({ 
  children, 
  trialStartDate = new Date(),
  trialDurationDays = 14,
  onUpgrade,
  tier = 'free'
}: TrialBlurProps) {
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const checkTrialStatus = () => {
      const now = new Date();
      const trialEnd = new Date(trialStartDate);
      trialEnd.setDate(trialEnd.getDate() + trialDurationDays);
      
      const timeDiff = trialEnd.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      setDaysRemaining(Math.max(0, daysLeft));
      setIsTrialExpired(daysLeft <= 0);
    };

    checkTrialStatus();
    const interval = setInterval(checkTrialStatus, 1000 * 60 * 60); // Check hourly

    return () => clearInterval(interval);
  }, [trialStartDate, trialDurationDays]);

  // Don't blur for paid tiers
  if (tier !== 'free') {
    return <>{children}</>;
  }

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      setShowUpgradeModal(true);
    }
  };

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className={`transition-all duration-300 ${isTrialExpired ? 'blur-sm pointer-events-none' : ''}`}>
        {children}
      </div>

      {/* Trial overlay */}
      <AnimatePresence>
        {isTrialExpired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 max-w-md mx-4 text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏰</span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Trial Expired
              </h2>
              
              <p className="text-gray-600 mb-6">
                Your 14-day free trial has ended. Upgrade to continue accessing all features and insights.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Upgrade Now
                </button>
                
                <button
                  onClick={() => window.location.href = '/pricing'}
                  className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  View Plans
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trial warning banner (shows when trial is ending soon) */}
      <AnimatePresence>
        {!isTrialExpired && daysRemaining <= 3 && daysRemaining > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg shadow-lg border border-yellow-300">
              <div className="flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                <div>
                  <div className="font-semibold">
                    {daysRemaining === 1 ? 'Trial ends tomorrow!' : `${daysRemaining} days left in trial`}
                  </div>
                  <div className="text-sm opacity-90">
                    Upgrade now to keep all features
                  </div>
                </div>
                <button
                  onClick={handleUpgrade}
                  className="bg-white text-orange-600 font-semibold px-4 py-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Upgrade
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Choose Your Plan
                </h2>
                <p className="text-gray-600">
                  Unlock the full power of DealershipAI
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Ignition Plan */}
                <div className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">Ignition</h3>
                    <div className="text-3xl font-bold text-gray-900 mb-1">$99</div>
                    <div className="text-gray-500 text-sm mb-4">/month</div>
                    <ul className="text-sm text-gray-600 space-y-2 mb-6">
                      <li>• AI Visibility Index™</li>
                      <li>• Weekly Reports</li>
                      <li>• Basic Analytics</li>
                      <li>• Email Support</li>
                    </ul>
                    <button className="w-full bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                      Select Plan
                    </button>
                  </div>
                </div>

                {/* Momentum Plan */}
                <div className="border-2 border-blue-500 rounded-xl p-6 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">Momentum</h3>
                    <div className="text-3xl font-bold text-gray-900 mb-1">$249</div>
                    <div className="text-gray-500 text-sm mb-4">/month</div>
                    <ul className="text-sm text-gray-600 space-y-2 mb-6">
                      <li>• Full Dashboard Access</li>
                      <li>• Crawl Graph Analytics</li>
                      <li>• API Access</li>
                      <li>• Priority Support</li>
                    </ul>
                    <button className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      Select Plan
                    </button>
                  </div>
                </div>

                {/* Hyperdrive Plan */}
                <div className="border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">Hyperdrive</h3>
                    <div className="text-3xl font-bold text-gray-900 mb-1">$499</div>
                    <div className="text-gray-500 text-sm mb-4">/month</div>
                    <ul className="text-sm text-gray-600 space-y-2 mb-6">
                      <li>• Auto-Fix AI</li>
                      <li>• Predictive Alerts</li>
                      <li>• Priority Support</li>
                      <li>• White Label</li>
                    </ul>
                    <button className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                      Select Plan
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-gray-500 hover:text-gray-700 font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
