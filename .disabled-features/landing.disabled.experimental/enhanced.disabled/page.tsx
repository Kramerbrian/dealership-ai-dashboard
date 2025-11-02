'use client';

import { EnhancedHero } from '@/components/ui/EnhancedHero';
import { EnhancedFeatures } from '@/components/ui/EnhancedFeatures';
import { EnhancedResults } from '@/components/ui/EnhancedResults';
import { EnhancedPricing } from '@/components/ui/EnhancedPricing';
import { EnhancedFAQ } from '@/components/ui/EnhancedFAQ';
import { EnhancedFooter } from '@/components/ui/EnhancedFooter';
import { EnhancedFeedbackWidget } from '@/components/ui/EnhancedFeedbackWidget';

export default function EnhancedLandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Enhanced Hero Section */}
      <EnhancedHero />
      
      {/* Enhanced Features Section */}
      <EnhancedFeatures />
      
      {/* Enhanced Results Section */}
      <EnhancedResults />
      
      {/* Enhanced Pricing Section */}
      <EnhancedPricing />
      
      {/* Enhanced FAQ Section */}
      <EnhancedFAQ />
      
      {/* Enhanced Footer */}
      <EnhancedFooter />
      
      {/* Enhanced Feedback Widget */}
      <EnhancedFeedbackWidget />
    </div>
  );
}