"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle, Building2, Mail, User, Briefcase } from 'lucide-react'

interface FormData {
  website: string
  dealership_name?: string
  challenge?: string
  email?: string
  name?: string
  role?: string
}

export default function ProgressiveForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({ website: '' })
  const [loading, setLoading] = useState(false)

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        // Track conversion
        window.gtag?.('event', 'conversion', {
          send_to: 'AW-XXXXX',
          value: 100,
          currency: 'USD'
        })
        
        // Redirect to instant gratification
        window.location.href = `/thank-you?url=${formData.website}`
      }
    } catch (error) {
      console.error('Submission failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-gray-900 rounded-2xl border border-gray-700 p-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center
              ${i <= step ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
              {i < step ? <CheckCircle size={16} /> : i}
            </div>
            {i < 3 && (
              <div className={`w-20 h-1 mx-2 ${i < step ? 'bg-blue-600' : 'bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <Step1 
            value={formData.website}
            onChange={(v) => updateField('website', v)}
            onNext={async () => {
              // Enrichment: fetch dealership name
              const name = await fetchDealershipName(formData.website)
              updateField('dealership_name', name)
              setStep(2)
            }}
          />
        )}

        {step === 2 && (
          <Step2
            dealershipName={formData.dealership_name || 'your dealership'}
            value={formData.challenge || ''}
            onChange={(v) => updateField('challenge', v)}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <Step3
            email={formData.email || ''}
            name={formData.name || ''}
            role={formData.role || ''}
            onEmailChange={(v) => updateField('email', v)}
            onNameChange={(v) => updateField('name', v)}
            onRoleChange={(v) => updateField('role', v)}
            onSubmit={handleSubmit}
            onBack={() => setStep(2)}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Step 1: Website URL
function Step1({ value, onChange, onNext }: any) {
  const [error, setError] = useState('')
  
  const handleNext = () => {
    if (!value || !isValidUrl(value)) {
      setError('Please enter a valid website URL')
      return
    }
    setError('')
    onNext()
  }

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Building2 className="text-blue-400 mb-4" size={32} />
      <h3 className="text-2xl font-bold mb-2">
        What's your dealership website?
      </h3>
      <p className="text-gray-400 mb-6">
        We'll analyze your AI visibility across 8+ platforms
      </p>
      
      <input
        type="url"
        placeholder="yourdealership.com"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleNext()}
        autoFocus
        className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600
                 focus:border-blue-500 focus:outline-none text-lg"
      />
      
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      
      <button
        onClick={handleNext}
        className="mt-6 w-full py-3 bg-blue-600 rounded-lg font-semibold
                 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        Continue <ArrowRight size={20} />
      </button>
    </motion.div>
  )
}

// Step 2: Challenge Selection
function Step2({ dealershipName, value, onChange, onNext, onBack }: any) {
  const challenges = [
    { id: 'invisible', label: "Not showing up in ChatGPT/AI searches", icon: '🔍' },
    { id: 'competitors', label: "Losing leads to AI-recommended competitors", icon: '🏆' },
    { id: 'reviews', label: "Reviews hurting AI rankings", icon: '⭐' },
    { id: 'unknown', label: "Don't know if I have a problem yet", icon: '❓' }
  ]

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <CheckCircle className="text-green-400 mb-4" size={32} />
      <h3 className="text-2xl font-bold mb-2">
        Nice! We found <span className="text-blue-400">{dealershipName}</span>
      </h3>
      <p className="text-gray-400 mb-6">
        What's your biggest AI visibility challenge?
      </p>
      
      <div className="space-y-3">
        {challenges.map(challenge => (
          <button
            key={challenge.id}
            onClick={() => {
              onChange(challenge.id)
              setTimeout(onNext, 300) // Smooth transition
            }}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all
              ${value === challenge.id 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-700 hover:border-gray-600 bg-gray-800'
              }`}
          >
            <span className="text-2xl mr-3">{challenge.icon}</span>
            <span className="text-sm">{challenge.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="mt-6 text-gray-400 hover:text-white transition-colors"
      >
        ← Back
      </button>
    </motion.div>
  )
}

// Step 3: Contact Info
function Step3({ email, name, role, onEmailChange, onNameChange, onRoleChange, onSubmit, onBack, loading }: any) {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Mail className="text-blue-400 mb-4" size={32} />
      <h3 className="text-2xl font-bold mb-2">
        Last step — where should we send your report?
      </h3>
      <p className="text-gray-400 mb-6">
        Your complete AI visibility analysis will be ready in ~60 seconds
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Email</label>
          <input
            type="email"
            placeholder="you@dealership.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            autoFocus
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600
                     focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Name</label>
          <input
            type="text"
            placeholder="John Smith"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600
                     focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Role (optional)</label>
          <select
            value={role}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600
                     focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select role...</option>
            <option value="owner">Owner/GM</option>
            <option value="marketing">Marketing Director</option>
            <option value="digital">Digital Marketing Manager</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={loading || !email || !name}
        className="mt-6 w-full py-3 bg-blue-600 rounded-lg font-semibold
                 hover:bg-blue-700 transition-colors disabled:opacity-50
                 flex items-center justify-center gap-2"
      >
        {loading ? 'Generating Report...' : 'Get My Free AI Audit'}
      </button>

      <button
        onClick={onBack}
        className="mt-4 text-gray-400 hover:text-white transition-colors"
      >
        ← Back
      </button>
      
      <p className="text-xs text-gray-500 text-center mt-4">
        No credit card required. Unsubscribe anytime.
      </p>
    </motion.div>
  )
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`)
    return true
  } catch {
    return false
  }
}

async function fetchDealershipName(url: string): Promise<string> {
  try {
    const res = await fetch('/api/enrich-dealership', {
      method: 'POST',
      body: JSON.stringify({ url })
    })
    const data = await res.json()
    return data.name || 'Your Dealership'
  } catch {
    return 'Your Dealership'
  }
}