'use client';

import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Zap, 
  Target, 
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Star,
  Award,
  Rocket
} from 'lucide-react';

interface PLGEnticementProps {
  type: 'welcome' | 'integration' | 'completion' | 'upgrade';
  connectedCount?: number;
  totalCount?: number;
  benefits?: string[];
  ctaText?: string;
  onCtaClick?: () => void;
}

export default function PLGEnticement({
  type,
  connectedCount = 0,
  totalCount = 0,
  benefits = [],
  ctaText,
  onCtaClick
}: PLGEnticementProps) {
  const getContent = () => {
    switch (type) {
      case 'welcome':
        return {
          title: "Unlock Maximum AI Visibility Insights",
          subtitle: "Connect your marketing platforms for 10x more accurate tracking",
          icon: <Sparkles className="w-8 h-8" />,
          stats: [
            { label: "More Accurate Data", value: "87%", icon: <TrendingUp className="w-5 h-5" /> },
            { label: "Faster Insights", value: "3x", icon: <Zap className="w-5 h-5" /> },
            { label: "Better ROI", value: "94%", icon: <Target className="w-5 h-5" /> }
          ],
          benefits: [
            "Real-time AI visibility tracking across all platforms",
            "Automated insights and actionable recommendations",
            "Competitive analysis and market positioning",
            "Revenue impact tracking and optimization"
          ]
        };
      
      case 'integration':
        return {
          title: `Great Progress! ${connectedCount} of ${totalCount} Connected`,
          subtitle: "Each connection makes your AI visibility tracking more powerful",
          icon: <BarChart3 className="w-8 h-8" />,
          stats: [
            { label: "Accuracy Boost", value: `${Math.round((connectedCount / totalCount) * 87)}%`, icon: <TrendingUp className="w-5 h-5" /> },
            { label: "Data Points", value: `${connectedCount * 15}`, icon: <BarChart3 className="w-5 h-5" /> },
            { label: "Insights Quality", value: connectedCount > 3 ? "Premium" : "Good", icon: <Star className="w-5 h-5" /> }
          ],
          benefits: [
            "More connected platforms = more accurate AI predictions",
            "Real-time monitoring across all your marketing channels",
            "Automated alerts when AI visibility changes",
            "Competitive advantage with comprehensive data"
          ]
        };
      
      case 'completion':
        return {
          title: "🎉 Setup Complete! You're Ready to Dominate AI Search",
          subtitle: "Your dealership is now equipped with enterprise-grade AI visibility tracking",
          icon: <Award className="w-8 h-8" />,
          stats: [
            { label: "Platforms Connected", value: `${connectedCount}`, icon: <CheckCircle2 className="w-5 h-5" /> },
            { label: "Data Accuracy", value: "94%", icon: <TrendingUp className="w-5 h-5" /> },
            { label: "Setup Time", value: "< 5 min", icon: <Zap className="w-5 h-5" /> }
          ],
          benefits: [
            "Your dashboard is now live with real-time AI visibility data",
            "Automated reports will be generated every 24 hours",
            "You'll receive alerts for any significant changes",
            "Access to premium insights and competitive analysis"
          ]
        };
      
      case 'upgrade':
        return {
          title: "Ready to Supercharge Your AI Visibility?",
          subtitle: "Upgrade to unlock advanced features and maximize your ROI",
          icon: <Rocket className="w-8 h-8" />,
          stats: [
            { label: "Advanced Analytics", value: "Unlimited", icon: <BarChart3 className="w-5 h-5" /> },
            { label: "AI Automation", value: "24/7", icon: <Zap className="w-5 h-5" /> },
            { label: "Priority Support", value: "1hr", icon: <Shield className="w-5 h-5" /> }
          ],
          benefits: [
            "Unlimited AI visibility audits and reports",
            "Automated response generation for AI platforms",
            "Advanced competitive intelligence and market analysis",
            "Dedicated account manager and priority support"
          ]
        };
      
      default:
        return {
          title: "Boost Your AI Visibility",
          subtitle: "Connect more platforms for better insights",
          icon: <Sparkles className="w-8 h-8" />,
          stats: [],
          benefits: []
        };
    }
  };

  const content = getContent();

  return (
    <div className="glass rounded-2xl p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--brand-primary)]/20 flex items-center justify-center mx-auto mb-6">
        {content.icon}
      </div>
      
      <h2 className="text-2xl font-semibold mb-3">{content.title}</h2>
      <p className="text-white/70 text-lg mb-8">{content.subtitle}</p>

      {/* Stats */}
      {content.stats.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {content.stats.map((stat, index) => (
            <div key={index} className="glass rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                {stat.icon}
                <span className="text-2xl font-bold text-[var(--brand-primary)]">{stat.value}</span>
              </div>
              <div className="text-sm text-white/70">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Benefits */}
      {content.benefits.length > 0 && (
        <div className="space-y-3 mb-8">
          {content.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3 text-left">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-white/90">{benefit}</span>
            </div>
          ))}
        </div>
      )}

      {/* Custom benefits */}
      {benefits.length > 0 && (
        <div className="space-y-3 mb-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3 text-left">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-white/90">{benefit}</span>
            </div>
          ))}
        </div>
      )}

      {/* CTA Button */}
      {ctaText && onCtaClick && (
        <button
          onClick={onCtaClick}
          className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold"
          style={{ backgroundImage: 'var(--brand-gradient)' }}
        >
          {ctaText} <ArrowRight className="w-5 h-5" />
        </button>
      )}

      {/* Progress indicator for integration type */}
      {type === 'integration' && totalCount > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/70">Setup Progress</span>
            <span className="text-sm text-white/70">{Math.round((connectedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-[var(--brand-primary)] h-2 rounded-full transition-all duration-500"
              style={{ width: `${(connectedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

// Specialized enticement components
export function WelcomeEnticement() {
  return (
    <PLGEnticement
      type="welcome"
      ctaText="Start Connecting Platforms"
      onCtaClick={() => {
        // Scroll to next section or trigger next step
        document.querySelector('[data-step="website"]')?.scrollIntoView({ behavior: 'smooth' });
      }}
    />
  );
}

export function IntegrationProgressEnticement({ connectedCount, totalCount }: { connectedCount: number; totalCount: number }) {
  return (
    <PLGEnticement
      type="integration"
      connectedCount={connectedCount}
      totalCount={totalCount}
      ctaText={connectedCount < totalCount ? "Continue Setup" : "Complete Setup"}
      onCtaClick={() => {
        if (connectedCount < totalCount) {
          // Continue to next integration
          const nextStep = document.querySelector('[data-step="next"]');
          nextStep?.scrollIntoView({ behavior: 'smooth' });
        } else {
          // Complete setup
          window.location.href = '/dash?onboarded=true';
        }
      }}
    />
  );
}

export function CompletionEnticement({ connectedCount }: { connectedCount: number }) {
  return (
    <PLGEnticement
      type="completion"
      connectedCount={connectedCount}
      ctaText="Go to Dashboard"
      onCtaClick={() => {
        window.location.href = '/dash?onboarded=true';
      }}
    />
  );
}

export function UpgradeEnticement() {
  return (
    <PLGEnticement
      type="upgrade"
      ctaText="Upgrade Now"
      onCtaClick={() => {
        window.location.href = '/pricing?upgrade=true';
      }}
    />
  );
}
