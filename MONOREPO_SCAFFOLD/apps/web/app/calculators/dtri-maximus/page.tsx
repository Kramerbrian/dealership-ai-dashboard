'use client'

import { DTRIMaximus } from '@/components/calculators/DTRIMaximus'

export default function DTRIMaximusPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">DTRI Maximus Calculator</h1>
        <p className="text-gray-600 mb-8">
          Calculate the Cost of Inaction for your dealership
        </p>
        <DTRIMaximus />
      </div>
    </div>
  )
}

