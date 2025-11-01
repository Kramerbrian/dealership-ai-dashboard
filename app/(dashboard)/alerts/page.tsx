'use client';

import { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, X, Filter } from 'lucide-react';

export default function AlertsPage() {
  const [filter, setFilter] = useState('all');
  const [alerts] = useState([
    {
      id: 1,
      type: 'critical',
      title: 'Revenue at Risk Alert',
      message: 'Your revenue at risk increased by $15,000 this week',
      time: '2 minutes ago',
      read: false,
    },
    {
      id: 2,
      type: 'warning',
      title: 'Competitor Activity',
      message: 'New competitor entered your market',
      time: '15 minutes ago',
      read: false,
    },
    {
      id: 3,
      type: 'info',
      title: 'Schema Validation',
      message: 'Schema markup validation completed successfully',
      time: '1 hour ago',
      read: true,
    },
    {
      id: 4,
      type: 'success',
      title: 'AI Visibility Improved',
      message: 'ChatGPT visibility increased by 5%',
      time: '2 hours ago',
      read: true,
    },
  ]);

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.type === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
          <p className="mt-2 text-gray-600">AI and compliance alerts for your dealership</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {['all', 'critical', 'warning', 'info', 'success'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const typeStyles = {
            critical: 'bg-red-50 border-red-200 text-red-900',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
            info: 'bg-blue-50 border-blue-200 text-blue-900',
            success: 'bg-green-50 border-green-200 text-green-900',
          };

          const Icon = {
            critical: AlertTriangle,
            warning: AlertTriangle,
            info: Bell,
            success: CheckCircle,
          }[alert.type] || Bell;

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-2 ${
                typeStyles[alert.type as keyof typeof typeStyles]
              } ${!alert.read ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${
                    alert.type === 'critical' ? 'bg-red-100 text-red-600' :
                    alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    alert.type === 'info' ? 'bg-blue-100 text-blue-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{alert.title}</h3>
                    <p className="text-sm opacity-80">{alert.message}</p>
                    <p className="text-xs opacity-60 mt-2">{alert.time}</p>
                  </div>
                </div>
                <button className="p-1 hover:bg-black/10 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

