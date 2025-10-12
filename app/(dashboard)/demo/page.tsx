'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedSalesIntelligenceDashboard from '@/components/EnhancedSalesIntelligenceDashboard';
import MobileSalesIntelligence from '@/components/MobileSalesIntelligence';
import SalesIntelligenceDashboard from '@/components/SalesIntelligenceDashboard';
import {
  Monitor,
  Smartphone,
  Zap,
  BarChart3,
  Eye,
  MousePointer,
  Users, // Handshake doesn't exist in lucide-react, using Users instead
  Flame,
  Shield,
  Search,
  TrendingUp,
  DollarSign,
  Target,
  Settings,
  Play,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Activity,
  Star,
  Globe,
  Command
} from 'lucide-react';

export default function DemoPage() {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile' | 'enhanced'>('enhanced');
  const [showFeatures, setShowFeatures] = useState(false);

  const features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Dealership AI Pipeline',
      description: '5-stage funnel with real-time animations and momentum tracking',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Mission Metrics',
      description: '6 core KPIs with Apple Dashboard aesthetic and micro-animations',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: <Play className="w-6 h-6" />,
      title: 'Action Queue',
      description: 'Contextual actions and playbooks with priority-based workflow',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Command className="w-6 h-6" />,
      title: 'Radial Navigation',
      description: 'Cupertino-style command menu with keyboard shortcuts',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'Proactive Hints',
      description: 'Behavioral UX that anticipates user needs and suggests actions',
      color: 'from-red-500 to-rose-500'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Mobile Optimized',
      description: 'Responsive design with swipe gestures and touch-friendly interface',
      color: 'from-indigo-500 to-blue-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Demo Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">DealershipAI Demo</h1>
                <p className="text-sm text-slate-600">Ultra-optimal UX architecture showcase</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Monitor className="w-4 h-4 inline mr-1" />
                  Desktop
                </button>
                <button
                  onClick={() => setViewMode('enhanced')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'enhanced' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-4 h-4 inline mr-1" />
                  Enhanced
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4 inline mr-1" />
                  Mobile
                </button>
              </div>
              
              <button
                onClick={() => setShowFeatures(!showFeatures)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {showFeatures ? 'Hide' : 'Show'} Features
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Panel */}
      <AnimatePresence>
        {showFeatures && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Key Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                      {feature.icon}
                    </div>
                    <h4 className="font-medium text-slate-900 mb-1">{feature.title}</h4>
                    <p className="text-xs text-slate-600">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Content */}
      <div className="h-[calc(100vh-80px)]">
        <AnimatePresence mode="wait">
          {viewMode === 'desktop' && (
            <motion.div
              key="desktop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <SalesIntelligenceDashboard />
            </motion.div>
          )}
          
          {viewMode === 'enhanced' && (
            <motion.div
              key="enhanced"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <EnhancedSalesIntelligenceDashboard />
            </motion.div>
          )}
          
          {viewMode === 'mobile' && (
            <motion.div
              key="mobile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full max-w-md mx-auto"
            >
              <MobileSalesIntelligence />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Demo Instructions */}
      <div className="fixed bottom-4 left-4 right-4 z-30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-slate-200 max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-slate-900">Live Demo</span>
              </div>
              <div className="text-sm text-slate-600">
                Try: Hover over metrics • Click funnel stages • Use ⌘K to search • Swipe on mobile
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span>Zero cognitive friction • One truth • Speed of thought</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
