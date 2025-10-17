'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Download,
  Share2,
  Maximize2,
  Minimize2,
  RefreshCw,
  Filter,
  Grid,
  List,
  Eye,
  EyeOff
} from 'lucide-react';

interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'table' | 'gauge';
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number; w: number; h: number };
  visible: boolean;
}

interface DashboardLayout {
  widgets: DashboardWidget[];
  theme: 'light' | 'dark';
  viewMode: 'grid' | 'list';
  compactMode: boolean;
}

export default function EnhancedDashboardUI() {
  const [layout, setLayout] = useState<DashboardLayout>({
    widgets: [
      {
        id: 'revenue-at-risk',
        title: 'Revenue at Risk',
        type: 'metric',
        size: 'medium',
        position: { x: 0, y: 0, w: 2, h: 1 },
        visible: true
      },
      {
        id: 'ai-visibility',
        title: 'AI Visibility Score',
        type: 'gauge',
        size: 'medium',
        position: { x: 2, y: 0, w: 2, h: 1 },
        visible: true
      },
      {
        id: 'trends-chart',
        title: 'Performance Trends',
        type: 'chart',
        size: 'large',
        position: { x: 0, y: 1, w: 4, h: 2 },
        visible: true
      },
      {
        id: 'competitor-analysis',
        title: 'Competitor Analysis',
        type: 'table',
        size: 'medium',
        position: { x: 0, y: 3, w: 2, h: 2 },
        visible: true
      },
      {
        id: 'opportunities',
        title: 'AI Opportunities',
        type: 'chart',
        size: 'medium',
        position: { x: 2, y: 3, w: 2, h: 2 },
        visible: true
      }
    ],
    theme: 'light',
    viewMode: 'grid',
    compactMode: false
  });

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'AI Visibility increased by 12%', type: 'success', time: '2m ago' },
    { id: 2, message: 'New competitor detected', type: 'warning', time: '5m ago' },
    { id: 3, message: 'Revenue at risk alert', type: 'error', time: '10m ago' }
  ]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Theme persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboard-theme');
    if (savedTheme) {
      setLayout(prev => ({ ...prev, theme: savedTheme as 'light' | 'dark' }));
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = layout.theme === 'light' ? 'dark' : 'light';
    setLayout(prev => ({ ...prev, theme: newTheme }));
    localStorage.setItem('dashboard-theme', newTheme);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
      )
    }));
  };

  const exportDashboard = () => {
    // Implementation for dashboard export
    console.log('Exporting dashboard...');
  };

  const shareDashboard = () => {
    // Implementation for dashboard sharing
    console.log('Sharing dashboard...');
  };

  const refreshData = () => {
    // Implementation for data refresh
    console.log('Refreshing data...');
  };

  const filteredWidgets = layout.widgets.filter(widget =>
    widget.visible && widget.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      layout.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b ${
        layout.theme === 'dark' 
          ? 'border-gray-700 bg-gray-800' 
          : 'border-gray-200 bg-white'
      }`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile menu button */}
            <div className="flex items-center">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`p-2 rounded-md ${
                    layout.theme === 'dark' 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">DealershipAI Dashboard</h1>
                  <p className="text-sm text-gray-500">AI-Powered Analytics</p>
                </div>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  layout.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search widgets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    layout.theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setLayout(prev => ({ ...prev, viewMode: 'grid' }))}
                  className={`p-2 rounded-lg ${
                    layout.viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : layout.theme === 'dark'
                      ? 'bg-gray-700 text-gray-400 hover:text-white'
                      : 'bg-gray-100 text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayout(prev => ({ ...prev, viewMode: 'list' }))}
                  className={`p-2 rounded-lg ${
                    layout.viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : layout.theme === 'dark'
                      ? 'bg-gray-700 text-gray-400 hover:text-white'
                      : 'bg-gray-100 text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={refreshData}
                  className={`p-2 rounded-lg ${
                    layout.theme === 'dark'
                      ? 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg ${
                    layout.theme === 'dark'
                      ? 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {layout.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <button
                  onClick={exportDashboard}
                  className={`p-2 rounded-lg ${
                    layout.theme === 'dark'
                      ? 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={shareDashboard}
                  className={`p-2 rounded-lg ${
                    layout.theme === 'dark'
                      ? 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className={`p-2 rounded-lg ${
                  layout.theme === 'dark'
                    ? 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }`}>
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={`fixed inset-y-0 left-0 z-50 w-64 ${
              layout.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } border-r ${
              layout.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Dashboard Settings</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Search Widgets</label>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      layout.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Widget Visibility</label>
                  <div className="space-y-2">
                    {layout.widgets.map((widget) => (
                      <label key={widget.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={widget.visible}
                          onChange={() => toggleWidgetVisibility(widget.id)}
                          className="rounded"
                        />
                        <span className="text-sm">{widget.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Dashboard Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
            <span className={`px-3 py-1 rounded-full text-sm ${
              layout.theme === 'dark'
                ? 'bg-green-900 text-green-300'
                : 'bg-green-100 text-green-800'
            }`}>
              Live Data
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setLayout(prev => ({ ...prev, compactMode: !prev.compactMode }))}
              className={`p-2 rounded-lg ${
                layout.compactMode
                  ? 'bg-blue-600 text-white'
                  : layout.theme === 'dark'
                  ? 'bg-gray-700 text-gray-400 hover:text-white'
                  : 'bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
            >
              {layout.compactMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setLayout(prev => ({ ...prev, viewMode: prev.viewMode === 'grid' ? 'list' : 'grid' }))}
              className={`p-2 rounded-lg ${
                layout.theme === 'dark'
                  ? 'bg-gray-700 text-gray-400 hover:text-white'
                  : 'bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Widget Grid */}
        <div className={`${
          layout.viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' 
            : 'space-y-4'
        }`}>
          <AnimatePresence>
            {filteredWidgets.map((widget) => (
              <motion.div
                key={widget.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`${
                  layout.viewMode === 'grid'
                    ? widget.size === 'large' ? 'md:col-span-2 lg:col-span-4' : ''
                    : 'w-full'
                }`}
              >
                <div className={`rounded-2xl p-6 ${
                  layout.theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
                } shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{widget.title}</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleWidgetVisibility(widget.id)}
                        className={`p-1 rounded ${
                          layout.theme === 'dark'
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Widget Content */}
                  <div className="space-y-4">
                    {widget.type === 'metric' && (
                      <div className="text-3xl font-bold text-blue-600">
                        $367,000
                      </div>
                    )}
                    
                    {widget.type === 'gauge' && (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-600 mb-2">87.3%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '87.3%' }}></div>
                        </div>
                      </div>
                    )}
                    
                    {widget.type === 'chart' && (
                      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium">Chart Visualization</span>
                      </div>
                    )}
                    
                    {widget.type === 'table' && (
                      <div className="space-y-2">
                        {['Competitor A', 'Competitor B', 'Competitor C'].map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span>{item}</span>
                            <span className="font-semibold">{85 + index * 5}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredWidgets.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No widgets found</h3>
            <p className="text-gray-500">Try adjusting your search or show all widgets</p>
          </div>
        )}
      </main>
    </div>
  );
}
