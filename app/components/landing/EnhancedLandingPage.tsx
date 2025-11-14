'use client';

import React from 'react';
import { 
  TrendingUp, 
  Settings, 
  BarChart3, 
  X, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Globe,
  Loader2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useLandingPage } from '@/app/hooks/useLandingPage';

interface EnhancedLandingPageProps {
  onAnalyze?: (url: string) => void;
  onRegister?: () => void;
  onSaveProfile?: (profile: { name: string; url: string }) => void;
}

export default function EnhancedLandingPage({ 
  onAnalyze, 
  onRegister, 
  onSaveProfile 
}: EnhancedLandingPageProps) {
  const { state, schema, actions } = useLandingPage();

  // Get icon component
  const getIcon = (iconName: string) => {
    const icons = {
      trending_up: TrendingUp,
      engineering: Settings,
      analytics: BarChart3
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Globe;
    return <IconComponent className="w-8 h-8" />;
  };

  // Handle analyze action
  const handleAnalyze = async () => {
    await actions.analyzeUrl();
    if (state.urlInput && !state.urlError) {
      onAnalyze?.(state.urlInput);
    }
  };

  // Handle save profile action
  const handleSaveProfile = () => {
    const success = actions.saveProfile();
    if (success) {
      onSaveProfile?.(state.profileData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Hero Section */}
      <section
        className="relative py-20 px-4 text-center overflow-hidden"
        aria-labelledby="hero-title"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" aria-hidden="true"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" aria-hidden="true"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" aria-hidden="true"></div>

        <div className="relative max-w-6xl mx-auto z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
            <Sparkles className="w-4 h-4 text-yellow-400" aria-hidden="true" />
            <span className="text-sm font-medium">AI-Powered Dealership Analytics</span>
          </div>

          <h1
            id="hero-title"
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight"
          >
            {schema.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            {schema.hero.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {schema.hero.cta_buttons.map((button: any, index: number) => (
              <button
                key={index}
                onClick={() => {
                  if (button.action === 'openUrlEntryModal') {
                    actions.openUrlModal();
                  } else if (button.action === 'registerOrLogin') {
                    onRegister?.();
                  }
                }}
                aria-label={
                  button.action === 'openUrlEntryModal'
                    ? 'Start free AI visibility analysis'
                    : 'Sign up or log in to your account'
                }
                className={`group px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  index === 0
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 focus:ring-white/50'
                }`}
              >
                {button.label}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose DealershipAI?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Transform your dealership with cutting-edge AI analytics and insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {schema.features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-200 hover:transform hover:scale-105"
              >
                <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-200">
                  {getIcon(feature.icon)}
                </div>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profile Section */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Customize Your Experience</h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Set up your dealership profile to get personalized insights and recommendations tailored to your business.
          </p>
          <button
            onClick={actions.openProfileModal}
            className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
          >
            <Settings className="w-5 h-5" />
            Set Up Profile
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* URL Entry Modal */}
      {state.urlModalVisible && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="url-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) actions.closeUrlModal();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') actions.closeUrlModal();
          }}
        >
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 id="url-modal-title" className="text-2xl font-bold">
                {schema.url_entry_modal.title}
              </h3>
              <button
                onClick={actions.closeUrlModal}
                aria-label="Close modal"
                className="text-gray-400 hover:text-white transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4">
              {schema.url_entry_modal.inputs.map((input) => (
                <div key={input.id}>
                  <label htmlFor={input.id} className="block text-sm font-medium mb-2">
                    {input.label}
                  </label>
                  <input
                    type={input.type}
                    id={input.id}
                    value={state.urlInput}
                    onChange={(e) => actions.handleUrlChange(e.target.value)}
                    placeholder={input.placeholder}
                    pattern={input.validation.pattern}
                    required={input.validation.required}
                    aria-required={input.validation.required}
                    aria-invalid={!!state.urlError}
                    aria-describedby={state.urlError ? `${input.id}-error` : undefined}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                  {state.urlError && (
                    <div
                      id={`${input.id}-error`}
                      role="alert"
                      className="mt-2 text-sm text-red-400 flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" aria-hidden="true" />
                      {state.urlError}
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={handleAnalyze}
                disabled={!state.urlInput || !!state.urlError || state.isAnalyzing}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {state.isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5" />
                    {schema.url_entry_modal.actions[0].label}
                  </>
                )}
              </button>

              {state.analysisResult && (
                <div className="mt-6 p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-green-400">Analysis Complete</span>
                  </div>
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {state.analysisResult}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {state.profileModalVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Dealership Profile</h3>
              <button
                onClick={actions.closeProfileModal}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {schema.profile_section.form.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium mb-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    id={field.id}
                    value={state.profileData[field.id as keyof typeof state.profileData]}
                    onChange={(e) => actions.handleProfileChange(field.id as keyof typeof state.profileData, e.target.value)}
                    placeholder={field.placeholder}
                    pattern={field.validation?.pattern}
                    required={field.validation?.required}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                  {state.profileErrors[field.id as keyof typeof state.profileErrors] && (
                    <div className="mt-2 text-sm text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {state.profileErrors[field.id as keyof typeof state.profileErrors]}
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={handleSaveProfile}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {schema.profile_section.form.save_button.label}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 mb-4">{schema.footer.legal}</p>
          <div className="flex justify-center gap-6">
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
      </footer>
    </div>
  );
}
