'use client';
import { useState } from 'react';
import { ga } from '@/lib/ga';

export default function LandingPage() {
  const [openModal, setOpenModal] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Competitive Intelligence for Automotive Dealerships
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Real-time AI visibility tracking, predictive intelligence, and automated safeguards for modern dealerships.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a 
              href="#audit" 
              onClick={() => ga('cta_click', { id: 'audit' })}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              Run free audit
            </a>
            <a 
              href="/dashboard" 
              onClick={() => ga('cta_click', { id: 'open_dashboard' })}
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold"
            >
              Open Dashboard
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 bg-white/80 backdrop-blur rounded-2xl border border-gray-200">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold mb-2">AI Visibility Index</h3>
              <p className="text-gray-600">Track your presence across ChatGPT, Gemini, Perplexity, and AI Overviews</p>
            </div>
            
            <div className="p-6 bg-white/80 backdrop-blur rounded-2xl border border-gray-200">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Real-time Monitoring</h3>
              <p className="text-gray-600">Get instant alerts when AI search results change or competitors gain ground</p>
            </div>
            
            <div className="p-6 bg-white/80 backdrop-blur rounded-2xl border border-gray-200">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Automated Optimization</h3>
              <p className="text-gray-600">AI-powered recommendations and one-click fixes for maximum visibility</p>
            </div>
          </div>

          <button 
            onClick={() => { 
              ga('modal_open', { id: 'why_ai_visibility' }); 
              setOpenModal('why_ai_visibility'); 
            }}
            className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
          >
            View insights →
          </button>
        </div>
      </div>

      {/* Modal placeholder */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Why AI Visibility Matters</h2>
            <p className="text-gray-600 mb-6">
              AI search is changing how customers find dealerships. Stay ahead with real-time monitoring and optimization.
            </p>
            <button 
              onClick={() => setOpenModal(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
