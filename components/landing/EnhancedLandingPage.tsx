/**
 * Enhanced Landing Page Component
 * Improved URL handling, personalized messaging, and motivational content
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRightIcon, CheckCircleIcon, SparklesIcon, TrophyIcon, CheckIcon, SearchIcon, GlobeAltIcon, StarIcon, ArrowRightIcon as ArrowRight } from '@heroicons/react/24/outline'
import { personalizationEngine, DealershipProfile } from '@/lib/onboarding/personalization-engine'

// Additional components for Apple-style landing page
const Search = SearchIcon
const Globe = GlobeAltIcon
const Stars = StarIcon
const Check = CheckIcon
const ArrowRightComp = ArrowRight

interface EnhancedLandingPageProps {
  onAnalyze?: (domain: string) => void
  onSignIn?: () => void
}

export default function EnhancedLandingPage({ onAnalyze, onSignIn }: EnhancedLandingPageProps) {
  const [domain, setDomain] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dealershipProfile, setDealershipProfile] = useState<DealershipProfile | null>(null)
  const [personalizedMessage, setPersonalizedMessage] = useState<string>('')
  const [showResults, setShowResults] = useState(false)

  // Generate personalized message based on time of day and other factors
  useEffect(() => {
    const hour = new Date().getHours()
    let timeBasedMessage = ''
    
    if (hour < 12) {
      timeBasedMessage = "Good morning! Ready to dominate the AI landscape today?"
    } else if (hour < 17) {
      timeBasedMessage = "Good afternoon! Time to crush your competition with AI."
    } else {
      timeBasedMessage = "Good evening! Perfect time to plan tomorrow's AI domination."
    }
    
    setPersonalizedMessage(timeBasedMessage)
  }, [])

  const normalizeDomain = (input: string): string => {
    // Remove protocol and www if present
    let cleanDomain = input.replace(/^https?:\/\//, '').replace(/^www\./, '')
    
    // Add www. prefix for consistency
    if (!cleanDomain.startsWith('www.')) {
      cleanDomain = `www.${cleanDomain}`
    }
    
    return cleanDomain
  }

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) return

    setIsAnalyzing(true)
    try {
      const normalizedDomain = normalizeDomain(domain)
      const profile = await personalizationEngine.initializeProfile(normalizedDomain)
      setDealershipProfile(profile)
      setShowResults(true)
      onAnalyze?.(normalizedDomain)
    } catch (error) {
      console.error('Error analyzing domain:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // Auto-add www. if user starts typing without it
    if (value && !value.startsWith('www.') && !value.startsWith('http')) {
      value = `www.${value}`
    }
    
    setDomain(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">dealershipAI</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#how" className="text-gray-600 hover:text-gray-900">How it works</a>
              <a href="#results" className="text-gray-600 hover:text-gray-900">Results</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button
                onClick={onSignIn}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => document.getElementById('scan')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center"
              >
                Run Free Scan
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center mb-6">
                <img
                  src="/api/placeholder/40/40"
                  alt="AI Overviews"
                  className="h-10 w-10 rounded-lg mr-3"
                />
                <span className="text-lg font-semibold text-gray-900">Algorithmic Trust Dashboard</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Be visible where shoppers actually decide:
                <span className="block text-blue-600 mt-2">
                  AI Overviews
                  <span className="text-gray-400">•</span>
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We audit and lift your AI visibility, then convert it into real leads and lower ad waste. 
                <span className="font-semibold text-gray-900"> Zero-click ready. Dealer-proof simple.</span>
              </p>

              {/* Personalized Message */}
              {personalizedMessage && (
                <motion.div
                  className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-purple-800 font-medium">
                    {personalizedMessage}
                  </p>
                </motion.div>
              )}

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 mb-1">$47K/mo</div>
                  <div className="text-sm text-gray-600">Revenue at Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">34%</div>
                  <div className="text-sm text-gray-600">AI Visibility</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">30 days</div>
                  <div className="text-sm text-gray-600">Recovery Window</div>
                </div>
              </div>

              {/* Domain Input Form */}
              <form onSubmit={handleDomainSubmit} className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={domain}
                      onChange={handleDomainChange}
                      placeholder="www.yourdealership.com"
                      className="w-full px-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Include www. for best results (e.g., www.fortmyerstoyota.com)
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze My Dealership
                        <ArrowRightIcon className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* CTA Links */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <a
                  href="/auth/signin?callbackUrl=%2Fintelligence%3Fmode%3Dcalculator"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  🧮 Calculate My Opportunity
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </a>
                <a
                  href="#how"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  See How It Works
                </a>
              </div>

              <p className="text-sm text-gray-500">
                Free scan. No credit card. 20s setup.
              </p>
            </motion.div>

            {/* Right Column - Dashboard Preview */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <SparklesIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Visibility Snapshot</h3>
                    <p className="text-sm text-gray-500">Live model blend</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {[
                    { label: 'ChatGPT mentions:', status: 'Low', color: 'red' },
                    { label: 'Gemini citations:', status: 'Sparse', color: 'orange' },
                    { label: 'Perplexity coverage:', status: 'Missing', color: 'red' },
                    { label: 'Google AIO inclusion:', status: 'Intermittent', color: 'yellow' },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-3 bg-${item.color}-500`}></div>
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </div>
                      <span className={`text-sm font-medium text-${item.color}-600`}>
                        {item.status}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">62/100</div>
                    <div className="text-xs text-blue-800">AEO Score</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">38%</div>
                    <div className="text-xs text-green-800">Zero-Click</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-600">Moderate</div>
                    <div className="text-xs text-yellow-800">Trust Signals</div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">Sample data shown. Your scan runs live.</p>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                +25% AI Mentions
              </motion.div>
              
              <motion.div
                className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                $60K+ Revenue
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Results Section - Show when analysis is complete */}
      {showResults && dealershipProfile && (
        <motion.section
          className="py-16 bg-gradient-to-r from-green-50 to-blue-50"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Analysis Complete for {dealershipProfile.name}!
              </h2>
              <p className="text-xl text-gray-600">
                Here's what we found in the {dealershipProfile.location.market} market
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">
                  ${(dealershipProfile.revenueAtRisk / 1000).toFixed(0)}K/mo
                </div>
                <div className="text-gray-600">Revenue at Risk</div>
                <div className="text-sm text-red-500 mt-2">
                  Every month you're missing out
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {dealershipProfile.aiVisibility}%
                </div>
                <div className="text-gray-600">AI Visibility</div>
                <div className="text-sm text-orange-500 mt-2">
                  Below industry average
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {dealershipProfile.competitors.length}
                </div>
                <div className="text-gray-600">Competitors</div>
                <div className="text-sm text-blue-500 mt-2">
                  In your local market
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
                <TrophyIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Dominate the {dealershipProfile.location.market} Market?
                </h3>
                <p className="text-gray-600 mb-6">
                  Your competitors are about to get a wake-up call. Let's turn your AI visibility 
                  from {dealershipProfile.aiVisibility}% to 90%+ and recover that ${(dealershipProfile.revenueAtRisk / 1000).toFixed(0)}K monthly revenue.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => window.location.href = '/onboarding/enhanced'}
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg"
                  >
                    Start Your AI Transformation
                  </button>
                  <button
                    onClick={() => setShowResults(false)}
                    className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    Try Another Domain
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* How It Works Section */}
      <section id="how" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our three-step process turns your dealership into an AI magnet, 
              capturing customers at the moment of decision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: '🔍',
                title: 'Probe the models',
                description: 'Normalize buyer intents then sample ChatGPT, Gemini, Perplexity, and Google AIO.',
              },
              {
                icon: '📊',
                title: 'Score & verify',
                description: 'Blend real responses with public signals (schema, GBP, site speed) for calibrated truth.',
              },
              {
                icon: '⚡',
                title: 'Fix the gaps',
                description: 'One-click JSON-LD, FAQ hubs, review responder, and geo-entity optimization.',
              },
            ].map((step, index) => (
              <motion.div
                key={step.title}
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="text-6xl mb-6">{step.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Expected Outcomes Section */}
      <section id="results" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Expected outcomes</h2>
            <p className="text-xl text-gray-600">
              Real results from real dealerships using our AI optimization platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { metric: 'AI Mentions', value: '+25–45%', color: 'blue' },
              { metric: 'Zero-Click Coverage', value: '+18–35%', color: 'green' },
              { metric: 'Review Response', value: '→ 80%+', color: 'purple' },
              { metric: 'Revenue Recovered', value: '$60–150K/mo', color: 'red' },
            ].map((outcome, index) => (
              <motion.div
                key={outcome.metric}
                className="bg-white rounded-xl p-6 shadow-lg text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`text-3xl font-bold text-${outcome.color}-600 mb-2`}>
                  {outcome.value}
                </div>
                <div className="text-gray-600 font-medium">{outcome.metric}</div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-500">
              Ranges based on prior launches; your live scan sets the baseline.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple plans</h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your dealership's needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Level 1',
                price: 'Free',
                features: ['AI scan', 'Evidence report', 'Fix list'],
                cta: 'Run Free Scan',
                ctaLink: '#scan',
                popular: false,
              },
              {
                name: 'Level 2',
                price: '$499/mo',
                features: ['Bi-weekly checks', 'Auto-responses', 'Schema generator'],
                cta: 'Start Trial',
                ctaLink: '/auth/signin?callbackUrl=%2Fintelligence%3Fplan%3Dlevel-2',
                popular: true,
              },
              {
                name: 'Level 3',
                price: '$999/mo',
                features: ['Enterprise guardrails', 'Multi-rooftop', 'SLA & SSO'],
                cta: 'Talk to Sales',
                ctaLink: '/auth/signin?callbackUrl=%2Fintelligence%3Fplan%3Dlevel-3',
                popular: false,
              },
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`relative bg-white rounded-xl shadow-lg p-8 ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-4">{plan.price}</div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.ctaLink}
                  className={`w-full block text-center py-3 px-6 rounded-lg font-semibold ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">FAQ</h2>
            <p className="text-xl text-gray-600">
              Common questions about our AI optimization platform
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: 'What signals power the score?',
                answer: 'We analyze ChatGPT mentions, Gemini citations, Perplexity coverage, Google AI Overviews inclusion, schema markup, Google Business Profile signals, and site performance metrics to create a comprehensive AI visibility score.',
              },
              {
                question: 'Will this replace my SEO agency?',
                answer: 'No, we complement your existing SEO efforts by focusing specifically on AI visibility. We work alongside your current agency to ensure you\'re visible in AI-generated responses.',
              },
              {
                question: 'How fast do results show up?',
                answer: 'Most dealerships see initial improvements within 2-4 weeks, with significant gains by 8-12 weeks. The exact timeline depends on your current AI visibility baseline and implementation speed.',
              },
            ].map((faq, index) => (
              <motion.div
                key={faq.question}
                className="bg-white rounded-lg shadow-sm p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <SparklesIcon className="h-8 w-8 text-blue-400 mr-3" />
              <span className="text-xl font-bold">dealershipAI</span>
            </div>
            <div className="flex space-x-6">
              <a href="/privacy" className="text-gray-400 hover:text-white">Privacy</a>
              <a href="/terms" className="text-gray-400 hover:text-white">Terms</a>
              <a href="mailto:kainomura@dealershipai.com" className="text-gray-400 hover:text-white">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 dealershipAI | Kai Nomura</p>
          </div>
        </div>
      </footer>

      {/* Add missing components after footer */}
      <Logos />
      <Explainers />
      <QuickAudit />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}

/* ---------- Missing sections (compact) ---------- */
function Logos(){
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-xs uppercase tracking-wide text-gray-500 text-center">Trusted by data-driven operators</div>
        <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-6 opacity-70">
          {Array.from({length:6}).map((_,i)=>(<div key={i} className="h-8 rounded bg-gray-100"/>))}
        </div>
      </div>
    </section>
  );
}

function Explainers(){
  const blocks=[
    {t:'AEO (Answer Engine Optimization)',b:'Structure answers AI can cite. Validate FAQ/Entity schema, citations, and review signals used by AI Overviews & assistants.',list:['FAQPage & AutoDealer JSON-LD','Citations & sources','Review response velocity'],icon:<Search className="w-4 h-4"/>},
    {t:'SEO (Search Foundations)',b:'Fix vitals, sitemaps, robots, and semantics so crawlers and AIs trust your site.',list:['LCP/INP/CLS','Sitemap + robots.txt','Title/Meta/OG hygiene'],icon:<Globe className="w-4 h-4"/>},
    {t:'GEO (Local & Maps)',b:'Complete GBP, NAP consistency, and service-area entities to win local AI answers.',list:['GBP completeness','Local citations','Service entity markup'],icon:<Stars className="w-4 h-4"/>},
  ];
  return (
    <section id="explainers">
      <div className="mx-auto max-w-7xl px-4 py-12 grid lg:grid-cols-3 gap-6">
        {blocks.map(x=>(
          <div key={x.t} className="rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-shadow hover:shadow-md relative overflow-hidden group">
            <div className="flex items-center gap-2 text-sm font-medium">{x.icon}{x.t}</div>
            <p className="mt-3 text-sm text-gray-600">{x.b}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              {x.list.map(i=> (<li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600"/>{i}</li>))}
            </ul>
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-gray-50/0 via-gray-50/60 to-gray-50/0"/>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickAudit(){
  const [site,setSite]=useState(''); const [email,setEmail]=useState('');
  const valid=/^(https?:\/\/)?[\w-]+\.[\w.-]+$/.test(site)&&/@/.test(email);
  return (
    <section id="audit" className="border-t bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-16 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl font-semibold">Run a free AI Visibility audit</h2>
          <p className="mt-2 text-gray-600">We check AI mentions, zero-click coverage, schema health, and review responsiveness.</p>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            {['60-second scan','Email report with fixes'].map(t=> (<li key={t} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600"/>{t}</li>))}
          </ul>
        </div>
        <form onSubmit={(e)=>{e.preventDefault(); if(valid) window.location.href='/dashboard?domain='+encodeURIComponent(site)}} className="rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <label className="text-sm font-medium">Dealership website</label>
          <input value={site} onChange={e=>setSite(e.target.value)} placeholder="www.exampledealer.com" className="mt-2 w-full rounded-lg border px-3 py-3"/>
          <label className="mt-4 block text-sm font-medium">Work email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@dealer.com" className="mt-2 w-full rounded-lg border px-3 py-3"/>
          <button disabled={!valid} className="mt-4 w-full h-11 px-4 rounded-xl bg-black text-white disabled:opacity-50">Run audit</button>
          <p className="mt-3 text-xs text-gray-500">No card. Cached public signals with periodic calibration.</p>
        </form>
      </div>
    </section>
  );
}

function Pricing(){
  const tiers=[
    {name:'Level 1',price:'$0/mo',badge:'Free',highlight:false,features:['AI Visibility score + 3 competitors','Zero-click snapshot','Email report']},
    {name:'Level 2',price:'$499/mo',badge:'Pro',highlight:true,features:['AEO/SEO/GEO dashboards','E-E-A-T analysis & playbooks','Unlimited competitors, API access']},
    {name:'Level 3',price:'$999/mo',badge:'Enterprise',highlight:false,features:['Mystery Shop engine','Multi-rooftop intelligence','Auto-fix workflows']},
  ];
  return (
    <section id="pricing" className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-semibold text-center">Pricing that matches your ambition</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {tiers.map(t=>(
            <div key={t.name} className={`rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-shadow hover:shadow-md ${t.highlight?'border-black shadow-sm':''}`}>
              <span className="text-xs inline-flex items-center gap-2 px-2 py-1 rounded-full border">{t.badge}</span>
              <div className="mt-3 text-lg font-medium">{t.name}</div>
              <div className="mt-1 text-3xl font-semibold">{t.price}</div>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {t.features.map(f=>(<li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600"/>{f}</li>))}
              </ul>
              <a href="/signup" className={`mt-6 inline-flex w-full items-center justify-center gap-2 h-11 px-4 rounded-xl ${t.highlight?'bg-black text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-black/30':'border hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-black/10'} transition`}>Get started <ArrowRightComp className="w-4 h-4"/></a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA(){
  return (
    <section className="border-y bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-2 gap-6 items-center">
        <div>
          <div className="text-sm font-medium">Algorithmic Trust Index (ATI)</div>
          <p className="mt-1 text-gray-600">Clarity = how well you're seen. Trust = how much the system believes you.</p>
        </div>
        <div className="md:text-right">
          <a href="#audit" className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-black text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-black/30 transition">
            Run free audit <ArrowRightComp className="w-4 h-4"/>
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer(){
  const cols=[{title:'Product',links:[['#explainers','AEO · SEO · GEO'],['#pricing','Pricing']]},{title:'Company',links:[['/privacy','Privacy'],['/terms','Terms']]}];
  return (
    <footer>
      <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-3 gap-6 text-sm">
        <div>
          <div className="text-lg font-semibold">dealership<span className="font-normal">AI</span></div>
          <p className="mt-2 text-gray-600">The Bloomberg-grade control panel for AI-search visibility.</p>
        </div>
        {cols.map(c=>(
          <div key={c.title}>
            <div className="font-medium">{c.title}</div>
            <ul className="mt-2 space-y-1 text-gray-600">{c.links.map(([h,l]:any)=>(<li key={h}><a href={h}>{l}</a></li>))}</ul>
          </div>
        ))}
      </div>
      <div className="border-t py-6 text-center text-xs text-gray-500">© {new Date().getFullYear()} DealershipAI</div>
    </footer>
  );
}
