import React from 'react'
import ConfidenceIntervalExamples from '@/components/analytics/ConfidenceIntervalDisplay'

export default function ConfidenceIntervalsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Confidence Interval Analytics</h1>
          <p className="mt-2 text-gray-600">
            Statistical confidence intervals for key dealership metrics with 95% confidence levels
          </p>
        </div>

        <ConfidenceIntervalExamples />

        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About Confidence Intervals</h3>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              Confidence intervals provide a range of plausible values for the true population parameter. 
              A 95% confidence interval means that if we repeated the measurement process 100 times, 
              95 of those intervals would contain the true value.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Key Benefits</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Quantifies uncertainty in measurements</li>
                  <li>• Helps make data-driven decisions</li>
                  <li>• Provides statistical reliability</li>
                  <li>• Enables comparison between metrics</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Interpretation Guide</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Narrow intervals = high precision</li>
                  <li>• Wide intervals = low precision</li>
                  <li>• Larger samples = narrower intervals</li>
                  <li>• 95% confidence is standard practice</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">API Usage</h3>
          <p className="text-blue-800 text-sm mb-4">
            Use the confidence interval API to calculate intervals for your own data:
          </p>
          <div className="bg-blue-100 rounded p-4 font-mono text-sm">
            <div className="text-blue-900">
              POST /api/analytics/confidence-intervals
            </div>
            <div className="text-blue-700 mt-2">
              {`{
  "type": "ai_visibility",
  "data": { "scores": [78, 82, 75, 85, 79] },
  "confidence": 0.95
}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
