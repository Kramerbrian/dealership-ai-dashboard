'use client'

import React, { useState } from 'react'
import { analytics } from '@/lib/analytics'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  dealershipName: string
  dealershipSize: string
  currentChallenges: string[]
  source: string
}

const DEALERSHIP_SIZES = [
  '1-10 employees',
  '11-25 employees', 
  '26-50 employees',
  '51-100 employees',
  '100+ employees'
]

const CHALLENGES = [
  'SEO & Search Rankings',
  'Social Media Marketing',
  'Online Reviews Management',
  'Lead Generation',
  'Competition Analysis',
  'Website Performance',
  'Local Search Visibility',
  'Customer Engagement',
  'Brand Awareness',
  'Conversion Optimization'
]

export default function FormSection() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    dealershipName: '',
    dealershipSize: '',
    currentChallenges: [],
    source: 'landing_page'
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleChallengeChange = (challenge: string) => {
    setFormData(prev => ({
      ...prev,
      currentChallenges: prev.currentChallenges.includes(challenge)
        ? prev.currentChallenges.filter(c => c !== challenge)
        : [...prev.currentChallenges, challenge]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      // Track form submission attempt
      analytics.trackEvent('Form Submission Started', {
        category: 'conversion',
        form_type: 'lead_capture',
        dealership_size: formData.dealershipSize,
        challenges_count: formData.currentChallenges.length
      })

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form')
      }

      // Track successful submission
      analytics.trackLeadCapture({
        email: formData.email,
        source: formData.source,
        dealership_size: formData.dealershipSize,
        challenges: formData.currentChallenges
      })

      setSubmitStatus('success')
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        dealershipName: '',
        dealershipSize: '',
        currentChallenges: [],
        source: 'landing_page'
      })

    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred')
      
      // Track form submission error
      analytics.trackError('Form Submission Failed', 'lead_capture', {
        error_message: error instanceof Error ? error.message : 'Unknown error',
        form_data: {
          dealership_size: formData.dealershipSize,
          challenges_count: formData.currentChallenges.length
        }
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h3>
        <p className="text-gray-600 mb-6">
          We've received your information and will get back to you within 24 hours with a personalized analysis of your dealership's online presence.
        </p>
        <button
          onClick={() => setSubmitStatus('idle')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Submit Another Lead
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Get Your Free AI Analysis
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dealership Name */}
        <div>
          <label htmlFor="dealershipName" className="block text-sm font-medium text-gray-700 mb-1">
            Dealership Name
          </label>
          <input
            type="text"
            id="dealershipName"
            name="dealershipName"
            value={formData.dealershipName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dealership Size */}
        <div>
          <label htmlFor="dealershipSize" className="block text-sm font-medium text-gray-700 mb-1">
            Dealership Size
          </label>
          <select
            id="dealershipSize"
            name="dealershipSize"
            value={formData.dealershipSize}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select size</option>
            {DEALERSHIP_SIZES.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {/* Current Challenges */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Challenges (Select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CHALLENGES.map(challenge => (
              <label key={challenge} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.currentChallenges.includes(challenge)}
                  onChange={() => handleChallengeChange(challenge)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{challenge}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {submitStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Get My Free Analysis'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By submitting this form, you agree to our privacy policy and terms of service.
        </p>
      </form>
    </div>
  )
}
