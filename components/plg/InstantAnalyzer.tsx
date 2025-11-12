import React from 'react';

export default function InstantAnalyzer() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold mb-2">Instant AI Analyzer</h3>
      <p className="text-gray-600 text-sm mb-4">
        Try our AI analyzer with your dealership domain
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="yourdealership.com"
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Analyze
        </button>
      </div>
    </div>
  );
}
