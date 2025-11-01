'use client';

import { useState } from 'react';
import { Package, ShoppingCart, Star, Zap } from 'lucide-react';

export default function APIUnitsPage() {
  const [units] = useState([
    {
      id: 1,
      name: 'Schema Validator',
      description: 'Validate and fix schema markup issues',
      price: 5,
      usage: 124,
      rating: 4.8,
      category: 'SEO',
    },
    {
      id: 2,
      name: 'Competitor Analyzer',
      description: 'Analyze competitor AI visibility',
      price: 10,
      usage: 89,
      rating: 4.9,
      category: 'Intelligence',
    },
    {
      id: 3,
      name: 'Content Optimizer',
      description: 'Optimize content for AI platforms',
      price: 8,
      usage: 156,
      rating: 4.7,
      category: 'Content',
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">API Unit Store</h1>
        <p className="mt-2 text-gray-600">Purchase and use API units to power your automation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => (
          <div key={unit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-gray-900">{unit.rating}</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">{unit.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{unit.description}</p>

            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs text-gray-500">{unit.category}</span>
                <div className="text-sm text-gray-500 mt-1">{unit.usage} uses</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">${unit.price}</div>
                <div className="text-xs text-gray-500">per unit</div>
              </div>
            </div>

            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <ShoppingCart className="w-4 h-4" />
              <span>Purchase</span>
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Build Custom API Unit</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create your own API units and share them with the community
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

