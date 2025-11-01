'use client';

import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            DealershipAI Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered optimization for automotive dealerships
          </p>
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Features</h2>
              <ul className="text-left space-y-2">
                <li>✅ AI Visibility Scoring</li>
                <li>✅ Compliance Assessment</li>
                <li>✅ Optimization Recommendations</li>
                <li>✅ Multi-tenant Architecture</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
