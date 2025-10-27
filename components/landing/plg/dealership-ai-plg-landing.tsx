'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export function DealershipAIPLGPage() {
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-blue-600">dealership<span className="text-gray-900">AI</span></div>
            </div>
            <nav className="hidden md:flex gap-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="/sign-in" className="text-blue-600 hover:text-blue-700">Sign In</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-gray-900 mb-6"
            >
              Product-Led Growth for AI Visibility
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-8"
            >
              Self-service onboarding that converts dealers to customers
            </motion.p>
            
            {/* Email Capture */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-4 max-w-2xl mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Start Free
              </button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Self-Service Setup', description: 'No sales calls, no waiting' },
              { title: 'Instant Value', description: 'See results in 60 seconds' },
              { title: 'Upgrade Path', description: 'Natural expansion to paid plans' },
            ].map((feature, idx) => (
              <div key={feature.title} className="p-6 bg-gray-50 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 DealershipAI</p>
        </div>
      </footer>
    </div>
  );
}
