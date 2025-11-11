'use client';

import { CheckCircle, Shield, CreditCard, Clock, Users, Lock, Award, TrendingUp } from 'lucide-react';

interface TrustBadge {
  icon: React.ReactNode;
  text: string;
  subtext?: string;
}

export function TrustBadges({ variant = 'default' }: { variant?: 'default' | 'compact' | 'pricing' }) {
  const badges: TrustBadge[] = [
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      text: '14-day free trial',
      subtext: 'Full access'
    },
    {
      icon: <CreditCard className="w-5 h-5 text-green-500" />,
      text: 'No credit card required',
      subtext: 'Start instantly'
    },
    {
      icon: <Shield className="w-5 h-5 text-green-500" />,
      text: 'Cancel anytime',
      subtext: '30-day guarantee'
    },
    {
      icon: <Users className="w-5 h-5 text-green-500" />,
      text: '500+ dealerships',
      subtext: 'Join leaders'
    }
  ];

  const securityBadges: TrustBadge[] = [
    {
      icon: <Lock className="w-4 h-4 text-gray-500" />,
      text: 'SSL encrypted'
    },
    {
      icon: <Shield className="w-4 h-4 text-gray-500" />,
      text: 'PCI compliant'
    },
    {
      icon: <Award className="w-4 h-4 text-gray-500" />,
      text: 'SOC 2 certified'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
        {badges.map((badge, i) => (
          <div key={i} className="flex items-center gap-2">
            {badge.icon}
            <span>{badge.text}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'pricing') {
    return (
      <div className="space-y-6">
        {/* Main Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-8">
          {badges.map((badge, i) => (
            <div key={i} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                {badge.icon}
              </div>
              <div>
                <p className="font-semibold text-white">{badge.text}</p>
                {badge.subtext && (
                  <p className="text-xs text-gray-500">{badge.subtext}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Security Badges */}
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500 pt-4 border-t border-white/5">
          {securityBadges.map((badge, i) => (
            <div key={i} className="flex items-center gap-2">
              {badge.icon}
              <span>{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default variant - Full featured
  return (
    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/10 rounded-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {badges.map((badge, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
          >
            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-colors">
              {badge.icon}
            </div>
            <div>
              <p className="font-semibold text-white mb-1">{badge.text}</p>
              {badge.subtext && (
                <p className="text-sm text-gray-400">{badge.subtext}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Trust Signals */}
      <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center gap-8 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>24/7 support</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          <span>Bank-level security</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span>99.9% uptime</span>
        </div>
      </div>
    </div>
  );
}

// Money-Back Guarantee Badge
export function MoneyBackGuarantee() {
  return (
    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-full">
      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
        <Shield className="w-4 h-4 text-green-400" />
      </div>
      <div className="text-left">
        <p className="text-sm font-bold text-white">30-Day Money-Back Guarantee</p>
        <p className="text-xs text-gray-400">No questions asked</p>
      </div>
    </div>
  );
}

// Social Proof Counter
export function SocialProofCounter({
  count = 500,
  label = 'dealerships trust us'
}: {
  count?: number;
  label?: string;
}) {
  return (
    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full">
      <div className="flex -space-x-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-gray-900 flex items-center justify-center text-xs font-bold"
          >
            {['J', 'S', 'M'][i - 1]}
          </div>
        ))}
      </div>
      <div className="text-left">
        <p className="text-sm font-bold text-white">{count.toLocaleString()}+</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}
