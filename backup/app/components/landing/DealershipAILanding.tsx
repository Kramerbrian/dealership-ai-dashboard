'use client';

import React from 'react';

const DealershipAILanding: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">DealershipAI v2.0</h1>
      <p className="text-xl text-gray-600 mb-8">Digital Trust Revenue Index - DTRI-MAXIMUS-MASTER-4.0</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">QAI Internal Execution</h2>
          <p className="text-gray-600">Measure internal operational excellence</p>
        </div>
        <div className="p-6 bg-green-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">E-E-A-T External Perception</h2>
          <p className="text-gray-600">Track trust signals and authority</p>
        </div>
        <div className="p-6 bg-purple-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Financial Impact</h2>
          <p className="text-gray-600">Predict revenue and optimize costs</p>
        </div>
      </div>
    </div>
  );
};

export default DealershipAILanding;
