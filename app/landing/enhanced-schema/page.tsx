'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Brain, Search, Sparkles, Shield, Gauge, LineChart, CheckCircle2, MapPin, Target, TrendingUp, Zap, Clock, Users, Building2, Globe, BarChart3, Check, Stars } from 'lucide-react';
import UrlEntryModal from '@/components/landing/UrlEntryModal';
import ProfileSection from '@/components/landing/ProfileSection';
import landingPageSchema from '@/lib/landing-page-schema.json';

// Define query keys for type safety
export const queryKeys = {
  scan: ['scan'] as const,
} as const;

// Define the response type for scan results
interface ScanResponse {
  success: boolean;
  data: {
    domain: string;
    analysis: {
      aiVisibility: {
        overall: number;
        breakdown: Record<string, number | { score: number }>;
      };
      revenueAnalysis: {
        revenueAtRisk: number;
      };
      trustMetrics: {
        qaiScore: number;
      };
      recommendations: Array<{
        description: string;
        impact: string;
      }>;
    };
  };
  error?: string;
  suggestions?: string[];
}

// Custom hook for scan API calls with Clerk authentication
function useScanQuery(domain: string | null) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.scan, domain],
    queryFn: async (): Promise<ScanResponse> => {
      if (!domain) {
        throw new Error('Domain is required');
      }

      // Get the current session token
      const token = await getToken();

      // Make the authenticated request
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          domain,
          includeCompetitors: true,
          analysisType: 'comprehensive'
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data as ScanResponse;
    },
    enabled: !!domain, // Only run query when domain is provided
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export default function EnhancedSchemaLanding() {
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    dealershipName: '',
    websiteUrl: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const { isSignedIn, isLoaded } = useAuth();
  
  // Use the authenticated scan query
  const { data: scanResults, isLoading: isAnalyzing, error: scanError } = useScanQuery(currentUrl);

  const schema = landingPageSchema.landing_page;

  const handleAnalyzeUrl = async (url: string) => {
    setCurrentUrl(url);
    // The useScanQuery will automatically trigger
  };

  const handleSaveProfile = async (data: { dealershipName: string; websiteUrl: string }) => {
    setIsSavingProfile(true);
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfileData(data);
      // Profile saved successfully
    } catch (error) {
      // Error saving profile - handle silently or show user-friendly message
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRegisterOrLogin = () => {
    if (isSignedIn) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/sign-in';
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      trending_up: TrendingUp,
      engineering: Building2,
      analytics: BarChart3,
    };
    const IconComponent = icons[iconName] || BarChart3;
    return <IconComponent className="w-8 h-8" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600" />
            <div className="text-lg font-semibold tracking-tight">
              dealership<span className="font-bold text-blue-600">AI</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#profile" className="hover:text-gray-900">Profile</a>
            <a href="#pricing" className="hover:text-gray-900">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <a 
              href="/sign-in" 
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </a>
            <button 
              onClick={() => setIsUrlModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Analyze Website <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {schema.hero.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {schema.hero.subtitle}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {schema.hero.cta_buttons.map((button, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (button.action === 'openUrlEntryModal') {
                      setIsUrlModalOpen(true);
                    } else if (button.action === 'registerOrLogin') {
                      handleRegisterOrLogin();
                    }
                  }}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
                    index === 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {button.label}
                </button>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { label: 'Revenue at Risk', value: '$47K/mo', icon: DollarSign },
                { label: 'AI Visibility', value: '34%', icon: Eye },
                { label: 'Recovery Window', value: '30 days', icon: Clock },
              ].map((stat, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <Logos />

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Your Dealership
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to optimize your dealership's online presence
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {schema.features.map((feature, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center mx-auto mb-6">
                  {getIcon(feature.icon)}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profile Section */}
      <section id="profile" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-4xl px-5">
          <ProfileSection 
            onSave={handleSaveProfile}
            isSaving={isSavingProfile}
            initialData={profileData}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600" />
                <div className="text-lg font-semibold">
                  dealership<span className="font-bold text-blue-400">AI</span>
                </div>
              </div>
              <p className="text-gray-400">{schema.footer.legal}</p>
            </div>
            <div className="flex space-x-6">
              {schema.footer.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* URL Entry Modal */}
      <UrlEntryModal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        onAnalyze={handleAnalyzeUrl}
        isAnalyzing={isAnalyzing}
        analysisResult={scanResults?.data}
      />
    </div>
  );
}

// Helper components for icons
const DollarSign = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const Eye = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
