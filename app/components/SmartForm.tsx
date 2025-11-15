'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartFormProps {
  onSubmit?: (data: FormData) => void;
  className?: string;
}

interface FormData {
  website: string;
  dealershipName: string;
  challenge: string;
  email: string;
  name: string;
}

export default function SmartForm({ onSubmit, className = '' }: SmartFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({
    website: '',
    dealershipName: '',
    challenge: '',
    email: '',
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lookup dealership information via API
  const handleWebsiteSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/lookup-dealership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website: formData.website }),
      });

      const result = await response.json();

      if ((result as any).success) {
        setFormData(prev => ({
          ...prev,
          dealershipName: (result as any).data.name || (result as any).data.dealershipName,
        }));
        setStep(2);
      } else {
        throw new Error((result as any).error || 'Failed to lookup dealership');
      }
    } catch (err) {
      console.error('Lookup error:', err);
      // Fallback: extract name from URL
      const url = formData.website || '';
      const domain = url.replace(/^https?:\/\//i, '').split('/')[0];
      const name = domain.split('.')[0]
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      setFormData(prev => ({ ...prev, dealershipName: name }));
      setStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit form and capture lead
  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealershipName: formData.dealershipName,
          contactName: formData.name,
          email: formData.email,
          website: formData.website,
        }),
      });

      const result = await response.json();

      if ((result as any).success) {
        if (onSubmit) {
          onSubmit(formData as FormData);
        }
        setStep(4); // Success screen
      } else {
        throw new Error((result as any).error || 'Failed to submit form');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const slideVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className={`relative mx-auto max-w-md ${className}`}>
      {/* Progress indicator */}
      {step < 4 && (
        <div className="mb-8 flex gap-2">
          {[1, 2, 3].map(num => (
            <div
              key={num}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                num <= step ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-white">
                What&apos;s your dealership website?
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                We&apos;ll analyze your AI visibility across all major platforms
              </p>
            </div>

            <div>
              <input
                type="url"
                autoFocus
                placeholder="https://yourdealership.com"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && formData.website && !isLoading && handleWebsiteSubmit()}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              onClick={handleWebsiteSubmit}
              disabled={!formData.website || isLoading}
              className="group w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Continue
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              )}
            </button>

            <p className="text-center text-xs text-gray-500">
              No credit card required • Free analysis
            </p>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-white">
                Nice! We found {formData.dealershipName || 'your dealership'}
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Quick question: What&apos;s your biggest AI challenge?
              </p>
            </div>

            <div>
              <select
                value={formData.challenge}
                onChange={(e) => setFormData(prev => ({ ...prev, challenge: e.target.value }))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select your top concern...</option>
                <option value="not-showing-chatgpt">Not showing up in ChatGPT searches</option>
                <option value="losing-leads">Losing leads to AI-recommended competitors</option>
                <option value="reviews-hurting">Reviews hurting AI rankings</option>
                <option value="dont-know">Don&apos;t know if I have a problem yet</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                disabled={isLoading}
                className="rounded-lg border border-gray-700 px-6 py-3 font-medium text-white transition-all hover:border-gray-600 hover:bg-gray-800 disabled:opacity-50"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.challenge || isLoading}
                className="group flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex items-center justify-center gap-2">
                  Continue
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-white">
                Last step - where should we send your report?
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Get your personalized AI visibility audit in 2 minutes
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-300">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="john@dealership.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && formData.email && formData.name && !isLoading && handleFinalSubmit()}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                disabled={isLoading}
                className="rounded-lg border border-gray-700 px-6 py-3 font-medium text-white transition-all hover:border-gray-600 hover:bg-gray-800 disabled:opacity-50"
              >
                ← Back
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={!formData.email || !formData.name || isLoading}
                className="group flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    🎉 Get My Free AI Audit
                  </span>
                )}
              </button>
            </div>

            <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔒</div>
                <div className="text-xs text-gray-400">
                  <p className="font-medium text-gray-300">Your data is secure</p>
                  <p className="mt-1">
                    We respect your privacy. No spam, ever. Unsubscribe anytime.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6 text-center"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
              <svg className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white">
                You&apos;re all set! 🎉
              </h3>
              <p className="mt-2 text-gray-400">
                We&apos;re analyzing {formData.dealershipName}&apos;s AI visibility right now.
              </p>
            </div>

            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-6 text-left">
              <p className="text-sm text-gray-300">
                <strong className="text-white">What happens next:</strong>
              </p>
              <ul className="mt-3 space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">1.</span>
                  <span>You&apos;ll receive a confirmation email at <strong className="text-white">{formData.email}</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">2.</span>
                  <span>We&apos;ll scan your presence across Google, ChatGPT, Perplexity, and Claude</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">3.</span>
                  <span>Your full report will arrive in 2-5 minutes with actionable insights</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setStep(1);
                setFormData({
                  website: '',
                  dealershipName: '',
                  challenge: '',
                  email: '',
                  name: '',
                });
              }}
              className="text-sm text-gray-400 hover:text-white"
            >
              Start another audit →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual feedback for completed steps */}
      {step > 1 && step < 4 && (
        <div className="mt-6 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
          <div className="flex items-center gap-2 text-sm text-green-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Website verified: {formData.website}</span>
          </div>
        </div>
      )}
    </div>
  );
}
