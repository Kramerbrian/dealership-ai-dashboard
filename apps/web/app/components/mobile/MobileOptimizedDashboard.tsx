'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  BarChart3, 
  Users, 
  Settings, 
  Bell,
  Search,
  Filter,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  Hand,
  Move,
  ZoomIn
} from 'lucide-react';

interface MobileWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'gauge';
  priority: 'high' | 'medium' | 'low';
  collapsible: boolean;
  expanded: boolean;
}

export default function MobileOptimizedDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [widgets, setWidgets] = useState<MobileWidget[]>([
    {
      id: 'revenue-risk',
      title: 'Revenue at Risk',
      type: 'metric',
      priority: 'high',
      collapsible: false,
      expanded: true
    },
    {
      id: 'ai-visibility',
      title: 'AI Visibility Score',
      type: 'gauge',
      priority: 'high',
      collapsible: false,
      expanded: true
    },
    {
      id: 'performance-trends',
      title: 'Performance Trends',
      type: 'chart',
      priority: 'medium',
      collapsible: true,
      expanded: false
    },
    {
      id: 'competitor-analysis',
      title: 'Competitor Analysis',
      type: 'list',
      priority: 'medium',
      collapsible: true,
      expanded: false
    },
    {
      id: 'ai-opportunities',
      title: 'AI Opportunities',
      type: 'list',
      priority: 'low',
      collapsible: true,
      expanded: false
    }
  ]);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Touch gesture handling
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left - open sidebar
      setSidebarOpen(true);
    } else if (isRightSwipe) {
      // Swipe right - close sidebar
      setSidebarOpen(false);
    }
  };

  const toggleWidget = (widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, expanded: !widget.expanded }
        : widget
    ));
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'competitors', label: 'Competitors', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderWidget = (widget: MobileWidget) => {
    const baseClasses = `rounded-2xl p-4 mb-4 ${
      isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
    }`;

    switch (widget.type) {
      case 'metric':
        return (
          <div className={baseClasses}>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">$367,000</div>
              <div className="text-sm text-gray-600">Monthly Revenue at Risk</div>
              <div className="flex items-center justify-center mt-2">
                <span className="text-green-600 text-sm">↗ +12%</span>
              </div>
            </div>
          </div>
        );

      case 'gauge':
        return (
          <div className={baseClasses}>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">87.3%</div>
              <div className="text-sm text-gray-600 mb-3">AI Visibility Score</div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-600 h-3 rounded-full" style={{ width: '87.3%' }}></div>
              </div>
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className={baseClasses}>
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-medium">Performance Chart</span>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className={baseClasses}>
            <div className="space-y-3">
              {['Item 1', 'Item 2', 'Item 3'].map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <span className="text-sm">{item}</span>
                  <span className="text-sm font-semibold text-blue-600">{85 + index * 5}%</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Mobile Header */}
      <header className={`sticky top-0 z-40 border-b ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-lg font-bold">DealershipAI</h1>
                <p className="text-xs text-gray-500">Mobile Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Search className="w-5 h-5" />
              </button>
              
              <button className={`p-2 rounded-lg relative ${
                isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}>
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-3"
            >
              <input
                type="text"
                placeholder="Search widgets..."
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className={`fixed inset-y-0 left-0 z-50 w-64 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Navigation</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Theme</span>
                    <button
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className={`p-2 rounded-lg ${
                        isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {isDarkMode ? '☀️' : '🌙'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Tabs */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4">
        {/* Touch Gesture Instructions */}
        <div className={`mb-4 p-3 rounded-lg ${
          isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center space-x-2 text-sm">
            <Hand className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 font-medium">Touch Gestures:</span>
            <span className="text-gray-600">Swipe left for menu, swipe right to close</span>
          </div>
        </div>

        {/* Widgets */}
        <div className="space-y-4">
          {widgets
            .filter(widget => widget.priority === 'high' || widget.expanded)
            .map((widget) => (
              <motion.div
                key={widget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                {widget.collapsible && (
                  <button
                    onClick={() => toggleWidget(widget.id)}
                    className={`absolute top-2 right-2 p-1 rounded ${
                      isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {widget.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
                
                {renderWidget(widget)}
              </motion.div>
            ))}
        </div>

        {/* Quick Actions */}
        <div className={`mt-6 p-4 rounded-2xl ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
            <button className="flex items-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 border-t ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : isDarkMode
                  ? 'text-gray-400'
                  : 'text-gray-500'
              }`}
            >
              <tab.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom padding for fixed navigation */}
      <div className="h-16"></div>
    </div>
  );
}
