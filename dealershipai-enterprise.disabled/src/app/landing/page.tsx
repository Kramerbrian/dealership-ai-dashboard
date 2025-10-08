'use client'

import { useState, useEffect } from 'react'
import ProgressiveForm from '@/components/landing/ProgressiveForm'
import CompetitiveFOMO from '@/components/landing/CompetitiveFOMO'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react'

export default function LandingPage() {
  const [dealershipUrl, setDealershipUrl] = useState<string>('')
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    // Load conversion metrics
    fetch('/api/metrics/conversions')
      .then(res => res.json())
      .then(setMetrics)
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Are You <span className="text-blue-400">Invisible</span> to AI?
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Dealerships are losing 40% of leads to AI-recommended competitors. 
            Get your free AI visibility audit in 60 seconds.
          </p>

          {/* Social Proof */}
          {metrics && (
            <div className="flex items-center justify-center gap-8 mb-12 text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{metrics.page_views?.toLocaleString() || '2,500+'} dealerships checked</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>4.9/5 average score</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Free forever</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Progressive Form */}
        <div className="mb-16">
          <ProgressiveForm />
        </div>

        {/* Competitive FOMO */}
        {dealershipUrl && (
          <CompetitiveFOMO dealershipUrl={dealershipUrl} />
        )}

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <BarChart3 className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">8+ Platform Analysis</h3>
            <p className="text-gray-400">
              ChatGPT, Claude, Perplexity, Google AI Overview, and more
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <Zap className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">60-Second Results</h3>
            <p className="text-gray-400">
              Instant AI visibility score with actionable recommendations
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <Shield className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">100% Free</h3>
            <p className="text-gray-400">
              No credit card required. No hidden fees. No spam.
            </p>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Enter Your Website</h3>
              <p className="text-gray-400">We'll analyze your AI visibility across all major platforms</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Get Your Score</h3>
              <p className="text-gray-400">Receive your AI visibility score and competitor analysis</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Take Action</h3>
              <p className="text-gray-400">Follow our recommendations to improve your AI visibility</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Don't Let Competitors Steal Your AI Traffic
          </h2>
          <p className="text-blue-100 mb-6">
            Join 2,500+ dealerships who've already checked their AI visibility
          </p>
          <button
            onClick={() => {
              document.querySelector('input[type="url"]')?.scrollIntoView({ behavior: 'smooth' })
              document.querySelector('input[type="url"]')?.focus()
            }}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 mx-auto"
          >
            Check Your AI Visibility Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16 text-gray-400"
        >
          <p className="text-sm">
            © 2024 DealershipAI. All rights reserved. | 
            <a href="/privacy" className="hover:text-white ml-1">Privacy Policy</a> | 
            <a href="/terms" className="hover:text-white ml-1">Terms of Service</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}