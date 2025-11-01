'use client';

import { useState } from 'react';
import { CreditCard, CheckCircle,  ArrowRight } from 'lucide-react';

export default function BillingPage() {
  const [plan] = useState({
    name: 'Professional',
    price: 499,
    features: [
      'Unlimited AI visibility tracking',
      'Advanced competitor analysis',
      'Custom AI agents',
      'Priority support',
      'Weekly reports',
    ],
  });

  const [paymentMethod] = useState({
    type: 'Visa',
    last4: '4242',
    expiry: '12/25',
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="mt-2 text-gray-600">Manage your subscription and payment methods</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Current Plan</h2>
          <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Billed monthly</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">${plan.price}</div>
                <div className="text-sm text-gray-500">per month</div>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Manage Subscription
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Method</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-8 h-8 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">{paymentMethod.type} •••• {paymentMethod.last4}</div>
                  <div className="text-sm text-gray-500">Expires {paymentMethod.expiry}</div>
                </div>
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Update Payment Method
            </button>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Billing History</h2>
        <div className="space-y-4">
          {[
            { date: 'Nov 1, 2025', amount: 499, status: 'paid' },
            { date: 'Oct 1, 2025', amount: 499, status: 'paid' },
            { date: 'Sep 1, 2025', amount: 499, status: 'paid' },
          ].map((invoice, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{invoice.date}</div>
                <div className="text-sm text-gray-500">Professional Plan</div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-lg font-semibold text-gray-900">${invoice.amount}</div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  invoice.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {invoice.status}
                </div>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

