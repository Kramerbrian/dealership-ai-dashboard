'use client';

import { Shield, Lock, Eye, CheckCircle, FileText, Users } from 'lucide-react';

const securityFeatures = [
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

export function SecuritySection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Security & Privacy First
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your data security is our top priority. We use enterprise-grade security measures to protect your information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className={`w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Privacy Notice */}
        <div className="bg-gray-50 rounded-xl p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4 mb-6">
              <FileText className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Privacy Notice
                </h3>
                <p className="text-gray-600">
                  URL is used once to run a read-only scan. We never store your website data permanently and follow strict privacy guidelines.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">No personal data collection</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">Read-only website access</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">Data deleted after scan</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">No third-party sharing</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Trusted by 500+ dealerships
                  </span>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Read Full Privacy Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
