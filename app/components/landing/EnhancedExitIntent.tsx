'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, TrendingUp, Sparkles } from 'lucide-react';

interface ExitIntentProps {
  onClose: () => void;
  onAccept: () => void;
}

export default function EnhancedExitIntent({ onClose, onAccept }: ExitIntentProps) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Detect mouse leaving viewport at top
      if (e.clientY <= 0) {
        setStep(1);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  const handleAccept = () => {
    onAccept();
    setStep(step + 1);
    if (step >= 3) {
      onClose();
    }
  };

  if (step === 1) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-purple-900 to-slate-900 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Wait! Don't Miss Out
              </h3>
              <p className="text-gray-300 mb-6">
                Get your free AI visibility score and see how you compare to competitors
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleAccept}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  Get My Free Score
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-3 text-gray-400 hover:text-white transition"
                >
                  No Thanks
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (step === 2) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-purple-900 to-slate-900 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <Gift className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Get Your Free Audit Report
              </h3>
              <p className="text-gray-300 mb-6">
                We'll email you a detailed AI visibility report - no spam, just insights
              </p>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 mb-4 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleAccept}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform"
              >
                Send My Report
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (step === 3) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-purple-900 to-slate-900 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Last Chance!
              </h3>
              <p className="text-gray-300 mb-6">
                See how you compare to your top 5 competitors - completely free
              </p>
              <button
                onClick={handleAccept}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform"
              >
                Show Me My Competitors
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}

