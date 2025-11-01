'use client';

import { useState, useEffect } from 'react';
import { Search, ArrowRight, CheckCircle, MapPin, Globe } from 'lucide-react';
import { UrlInput } from './UrlInput';
import { CityPersonalization } from './CityPersonalization';

export function HeroSection() {
  const [userCity, setUserCity] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Get user's city from IP (mock implementation)
    const mockCity = 'Los Angeles';
    setUserCity(mockCity);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full -translate-y-48 translate-x-48"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200/20 rounded-full translate-y-40 -translate-x-40"></div>

      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Run Free{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Visibility Scan
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            See how your dealership appears across ChatGPT, Gemini, Perplexity, and more AI engines
          </p>
          
          {/* City Personalization */}
          {userCity && (
            <CityPersonalization city={userCity} />
          )}
          
          {/* URL Input Form */}
          <div className="max-w-2xl mx-auto mb-8">
            <UrlInput 
              isValidating={isValidating}
              setIsValidating={setIsValidating}
            />
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mb-12">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>~20s • No login • Read-only</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>Works with any dealership website</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-500" />
              <span>Privacy-first scanning</span>
            </div>
          </div>
          
          {/* CTA Button */}
          <button 
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-xl animate-pulse-glow"
            data-analytics="hero-cta-click"
          >
            Start Free Scan
            <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          {/* Sample Report Link */}
          <div className="mt-6">
            <button className="text-blue-600 hover:text-blue-700 font-medium underline">
              View Sample Report
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
