'use client';
import React, { useState } from 'react';

interface OpportunityCalculatorTriggerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const OpportunityCalculatorTrigger: React.FC<OpportunityCalculatorTriggerProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`
          bg-gradient-to-r from-blue-600 to-purple-600 
          text-white font-semibold rounded-lg 
          hover:from-blue-700 hover:to-purple-700 
          transition-all duration-200 
          transform hover:scale-105 
          shadow-lg hover:shadow-xl
          ${sizeClasses[size]}
          ${className}
        `}
      >
        🧮 Calculate My Opportunity
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Unrealized Opportunity Calculator
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Quick Estimate</h3>
                  <p className="text-blue-700 text-sm">
                    Based on industry averages, your dealership could potentially unlock 
                    <span className="font-bold"> $2.1M - $4.7M</span> in additional annual revenue 
                    through AI-driven optimizations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Cost Savings</h4>
                    <div className="text-2xl font-bold text-green-600">$1.2M</div>
                    <p className="text-sm text-gray-600">Annual operational savings</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Revenue Increase</h4>
                    <div className="text-2xl font-bold text-blue-600">$2.8M</div>
                    <p className="text-sm text-gray-600">Additional gross profit</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Total Opportunity</h4>
                  <div className="text-3xl font-bold text-gray-900">$4.0M</div>
                  <p className="text-sm text-gray-600">Annual unrealized potential</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Key Opportunities Identified:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Inventory optimization: +$800K</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Lead conversion improvement: +$1.2M</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Operational efficiency: +$600K</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Customer retention: +$1.4M</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // In a real app, this would navigate to a detailed calculator
                      alert('Detailed calculator coming soon!');
                    }}
                    className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Get Detailed Analysis
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OpportunityCalculatorTrigger;