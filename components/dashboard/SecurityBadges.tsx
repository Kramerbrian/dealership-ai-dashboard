'use client';

import { Shield, Lock, Eye, CheckCircle } from 'lucide-react';

export function SecurityBadges() {
  const badges = [
    {
      icon: Shield,
      title: "No Write Access",
      description: "Read-only scanning only",
      color: "text-blue-600"
    },
    {
      icon: Lock,
      title: "SOC2 Ready",
      description: "Enterprise security standards",
      color: "text-green-600"
    },
    {
      icon: Eye,
      title: "Privacy First",
      description: "Data never stored permanently",
      color: "text-purple-600"
    },
    {
      icon: CheckCircle,
      title: "GDPR Compliant",
      description: "Full data protection compliance",
      color: "text-indigo-600"
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Privacy</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge, index) => (
          <div key={index} className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <badge.icon className={`w-8 h-8 ${badge.color} mb-2`} />
            <h4 className="text-sm font-medium text-gray-900 mb-1">{badge.title}</h4>
            <p className="text-xs text-gray-500">{badge.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
