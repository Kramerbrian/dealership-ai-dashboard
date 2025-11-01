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
          ${sizeClasses[size]}
          bg-gradient-to-r from-blue-600 to-purple-600
          text-white font-semibold rounded-lg
          hover:from-blue-700 hover:to-purple-700
          transition-all duration-200
          shadow-lg hover:shadow-xl
          transform hover:-translate-y-0.5
          ${className}
        `}
      >
        🧮 Calculate My Opportunity
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
              
              <OpportunityCalculator />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const OpportunityCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    monthlyUnits: 50,
    averageGross: 2500,
    currentEfficiency: 75,
    currentCosts: 100000,
    currentLeads: 200
  });

  const [results, setResults] = useState({
    costSavings: 0,
    grossProfitIncrease: 0,
    additionalUnits: 0,
    additionalLeads: 0,
    totalOpportunity: 0
  });

  const calculateOpportunity = () => {
    const { monthlyUnits, averageGross, currentEfficiency, currentCosts, currentLeads } = inputs;
    
    // Calculate potential improvements
    const efficiencyGain = (100 - currentEfficiency) / 100;
    const costSavings = currentCosts * efficiencyGain * 0.3; // 30% of inefficiency cost
    const grossProfitIncrease = monthlyUnits * averageGross * efficiencyGain * 0.2; // 20% improvement
    const additionalUnits = Math.round(monthlyUnits * efficiencyGain * 0.15); // 15% more units
    const additionalLeads = Math.round(currentLeads * efficiencyGain * 0.25); // 25% more leads
    
    const totalOpportunity = costSavings + grossProfitIncrease + (additionalUnits * averageGross);

    setResults({
      costSavings: Math.round(costSavings),
      grossProfitIncrease: Math.round(grossProfitIncrease),
      additionalUnits,
      additionalLeads,
      totalOpportunity: Math.round(totalOpportunity)
    });
  };

  React.useEffect(() => {
    calculateOpportunity();
  }, [inputs]);

  const handleInputChange = (field: string, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Current Performance</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Units Sold
            </label>
            <input
              type="number"
              value={inputs.monthlyUnits}
              onChange={(e) => handleInputChange('monthlyUnits', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Average Gross Profit per Unit ($)
            </label>
            <input
              type="number"
              value={inputs.averageGross}
              onChange={(e) => handleInputChange('averageGross', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Efficiency (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={inputs.currentEfficiency}
              onChange={(e) => handleInputChange('currentEfficiency', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Current Operations</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Operating Costs ($)
            </label>
            <input
              type="number"
              value={inputs.currentCosts}
              onChange={(e) => handleInputChange('currentCosts', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Leads Generated
            </label>
            <input
              type="number"
              value={inputs.currentLeads}
              onChange={(e) => handleInputChange('currentLeads', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Your Opportunity Results</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              ${results.costSavings.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Monthly Cost Savings</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              ${results.grossProfitIncrease.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Gross Profit Increase</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              +{results.additionalUnits}
            </div>
            <div className="text-sm text-gray-600">Additional Units</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-orange-600">
              +{results.additionalLeads}
            </div>
            <div className="text-sm text-gray-600">Additional Leads</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 text-center shadow-sm">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            ${results.totalOpportunity.toLocaleString()}
          </div>
          <div className="text-lg text-gray-600 mb-2">Total Monthly Opportunity</div>
          <div className="text-2xl font-bold text-green-600">
            ${(results.totalOpportunity * 12).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Annual Opportunity</div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
            <p className="text-gray-700">
              <strong>Process Optimization:</strong> Implement AI-driven workflow automation to reduce manual tasks by 30%
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
            <p className="text-gray-700">
              <strong>Lead Management:</strong> Use AI-powered lead scoring to improve conversion rates by 25%
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
            <p className="text-gray-700">
              <strong>Inventory Optimization:</strong> Leverage predictive analytics to reduce carrying costs by 20%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
