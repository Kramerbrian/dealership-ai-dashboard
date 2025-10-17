'use client';

import React, { useState, useEffect } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Shield,
  Target,
  DollarSign,
  Users,
  Globe,
  Settings,
  Bell,
  RefreshCw,
  Eye,
  EyeOff,
  Maximize2,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import InteractiveChart from '@/components/charts/InteractiveChart';
import ResponsiveCard, { MobileButton, SwipeableContainer } from '@/components/ui/ResponsiveCard';
import { detectAccessibilityPreferences } from '@/lib/accessibility';
import { PerformanceMonitor, getMemoryUsage, getNetworkInfo } from '@/lib/performance';

export default function DemoPage() {
  const [activeDemo, setActiveDemo] = useState('charts');
  const [darkMode, setDarkMode] = useState(true);
  const [accessibility, setAccessibility] = useState({ highContrast: false, reducedMotion: false, largeText: false });
  const [performanceMonitor] = useState(new PerformanceMonitor());
  const [memoryUsage, setMemoryUsage] = useState({ used: 0, total: 0, percentage: 0 });
  const [networkInfo, setNetworkInfo] = useState({ connection: 'unknown', speed: 'unknown' });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setAccessibility(detectAccessibilityPreferences());
    setMemoryUsage(getMemoryUsage());
    setNetworkInfo(getNetworkInfo());
  }, []);

  // Update memory usage periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMemoryUsage(getMemoryUsage());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Mock data for demonstrations
  const chartData = [
    { name: 'Jan', value: 85.2 },
    { name: 'Feb', value: 87.1 },
    { name: 'Mar', value: 89.3 },
    { name: 'Apr', value: 91.7 },
    { name: 'May', value: 88.9 },
    { name: 'Jun', value: 92.4 }
  ];

  const pieData = [
    { name: 'SEO', value: 45 },
    { name: 'AEO', value: 30 },
    { name: 'GEO', value: 25 }
  ];

  const radarData = [
    { name: 'Trust', value: 85 },
    { name: 'Experience', value: 78 },
    { name: 'Expertise', value: 92 },
    { name: 'Authoritativeness', value: 88 },
    { name: 'Content Quality', value: 90 }
  ];

  const demos = [
    { id: 'charts', name: 'Interactive Charts', icon: BarChart3 },
    { id: 'cards', name: 'Responsive Cards', icon: Target },
    { id: 'accessibility', name: 'Accessibility', icon: Eye },
    { id: 'performance', name: 'Performance', icon: Zap },
    { id: 'mobile', name: 'Mobile Features', icon: Globe }
  ];

  const renderChartsDemo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveChart
          data={chartData}
          type="line"
          title="AI Visibility Trend"
          description="6-month performance across AI platforms"
          height={300}
          color="#3b82f6"
        />
        <InteractiveChart
          data={chartData}
          type="bar"
          title="Monthly Performance"
          description="Bar chart visualization"
          height={300}
          color="#8b5cf6"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveChart
          data={pieData}
          type="pie"
          title="Visibility Breakdown"
          description="Pie chart showing distribution"
          height={300}
        />
        <InteractiveChart
          data={radarData}
          type="radar"
          title="E-E-A-T Analysis"
          description="Radar chart for authority metrics"
          height={300}
          color="#10b981"
        />
      </div>
    </div>
  );

  const renderCardsDemo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ResponsiveCard
          title="AI Visibility Score"
          subtitle="Real-time performance metrics"
          icon={<Zap className="w-5 h-5 text-blue-400" />}
          collapsible
          expandable
        >
          <div className="space-y-4">
            <div className="text-3xl font-bold text-white">87.3%</div>
            <div className="flex items-center gap-2 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+2.1% this week</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '87.3%' }} />
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard
          title="Revenue at Risk"
          subtitle="Monthly exposure analysis"
          icon={<DollarSign className="w-5 h-5 text-red-400" />}
          collapsible
        >
          <div className="space-y-4">
            <div className="text-3xl font-bold text-white">$367K</div>
            <div className="flex items-center gap-2 text-red-400">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm">+5.2% increase</span>
            </div>
            <p className="text-sm text-white/60">Potential monthly revenue loss from AI visibility gaps</p>
          </div>
        </ResponsiveCard>

        <ResponsiveCard
          title="Performance Score"
          subtitle="System health metrics"
          icon={<Shield className="w-5 h-5 text-green-400" />}
          collapsible
          expandable
        >
          <div className="space-y-4">
            <div className="text-3xl font-bold text-white">99.9%</div>
            <div className="flex items-center gap-2 text-green-400">
              <Activity className="w-4 h-4" />
              <span className="text-sm">1.2s load time</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white/5 p-2 rounded">
                <div className="text-white/60">Uptime</div>
                <div className="text-white font-semibold">99.9%</div>
              </div>
              <div className="bg-white/5 p-2 rounded">
                <div className="text-white/60">Response</div>
                <div className="text-white font-semibold">120ms</div>
              </div>
            </div>
          </div>
        </ResponsiveCard>
      </div>
    </div>
  );

  const renderAccessibilityDemo = () => (
    <div className="space-y-6">
      <ResponsiveCard
        title="Accessibility Features"
        subtitle="WCAG 2.1 AA compliant components"
        icon={<Eye className="w-5 h-5 text-purple-400" />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Screen Reader Support</h4>
              <p className="text-sm text-white/60 mb-2">All charts include ARIA labels and descriptions</p>
              <div className="text-xs text-green-400">✓ Detected: {accessibility.screenReader ? 'Yes' : 'No'}</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Reduced Motion</h4>
              <p className="text-sm text-white/60 mb-2">Respects user motion preferences</p>
              <div className="text-xs text-green-400">✓ Detected: {accessibility.reducedMotion ? 'Yes' : 'No'}</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-2">High Contrast</h4>
              <p className="text-sm text-white/60 mb-2">Enhanced contrast for better visibility</p>
              <div className="text-xs text-green-400">✓ Detected: {accessibility.highContrast ? 'Yes' : 'No'}</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Keyboard Navigation</h4>
              <p className="text-sm text-white/60 mb-2">Full keyboard accessibility</p>
              <div className="text-xs text-green-400">✓ Arrow keys, Tab, Enter supported</div>
            </div>
          </div>
        </div>
      </ResponsiveCard>
    </div>
  );

  const renderPerformanceDemo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResponsiveCard
          title="Memory Usage"
          subtitle="Real-time memory monitoring"
          icon={<Activity className="w-5 h-5 text-blue-400" />}
        >
          <div className="space-y-4">
            {memoryUsage ? (
              <>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-white/5 p-2 rounded text-center">
                    <div className="text-white/60">Used</div>
                    <div className="text-white font-semibold">{memoryUsage.used}MB</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded text-center">
                    <div className="text-white/60">Total</div>
                    <div className="text-white font-semibold">{memoryUsage.total}MB</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded text-center">
                    <div className="text-white/60">Limit</div>
                    <div className="text-white font-semibold">{memoryUsage.limit}MB</div>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(memoryUsage.used / memoryUsage.limit) * 100}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-white/60">Memory usage not available</p>
            )}
          </div>
        </ResponsiveCard>

        <ResponsiveCard
          title="Network Information"
          subtitle="Connection quality metrics"
          icon={<Globe className="w-5 h-5 text-green-400" />}
        >
          <div className="space-y-4">
            {networkInfo ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Connection Type:</span>
                  <span className="text-white font-semibold">{networkInfo.effectiveType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Download Speed:</span>
                  <span className="text-white font-semibold">{networkInfo.downlink} Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Round Trip Time:</span>
                  <span className="text-white font-semibold">{networkInfo.rtt}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Data Saver:</span>
                  <span className="text-white font-semibold">{networkInfo.saveData ? 'On' : 'Off'}</span>
                </div>
              </div>
            ) : (
              <p className="text-white/60">Network information not available</p>
            )}
          </div>
        </ResponsiveCard>
      </div>

      <ResponsiveCard
        title="Performance Metrics"
        subtitle="Real-time performance monitoring"
        icon={<Zap className="w-5 h-5 text-yellow-400" />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white/5 p-3 rounded text-center">
              <div className="text-white/60">Long Tasks</div>
              <div className="text-white font-semibold">
                {performanceMonitor.getMetricStats('long-tasks')?.count || 0}
              </div>
            </div>
            <div className="bg-white/5 p-3 rounded text-center">
              <div className="text-white/60">Layout Shifts</div>
              <div className="text-white font-semibold">
                {performanceMonitor.getMetricStats('layout-shifts')?.count || 0}
              </div>
            </div>
            <div className="bg-white/5 p-3 rounded text-center">
              <div className="text-white/60">Avg CLS</div>
              <div className="text-white font-semibold">
                {performanceMonitor.getMetricStats('layout-shifts')?.avg?.toFixed(3) || '0.000'}
              </div>
            </div>
            <div className="bg-white/5 p-3 rounded text-center">
              <div className="text-white/60">P95 Long Task</div>
              <div className="text-white font-semibold">
                {performanceMonitor.getMetricStats('long-tasks')?.p95?.toFixed(0) || '0'}ms
              </div>
            </div>
          </div>
        </div>
      </ResponsiveCard>
    </div>
  );

  const renderMobileDemo = () => (
    <div className="space-y-6">
      <ResponsiveCard
        title="Mobile-Optimized Components"
        subtitle="Touch-friendly interactions and responsive design"
        icon={<Globe className="w-5 h-5 text-blue-400" />}
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-white mb-3">Touch-Friendly Buttons</h4>
            <div className="flex flex-wrap gap-3">
              <MobileButton variant="primary" size="sm">Small</MobileButton>
              <MobileButton variant="primary" size="md">Medium</MobileButton>
              <MobileButton variant="primary" size="lg">Large</MobileButton>
              <MobileButton variant="secondary" size="md">Secondary</MobileButton>
              <MobileButton variant="ghost" size="md">Ghost</MobileButton>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Swipeable Container</h4>
            <SwipeableContainer
              onSwipeLeft={() => alert('Swiped left!')}
              onSwipeRight={() => alert('Swiped right!')}
              className="bg-white/5 p-4 rounded-lg"
            >
              <p className="text-white/80 text-center">
                Swipe left or right on mobile devices
              </p>
            </SwipeableContainer>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Responsive Grid</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white/5 p-3 rounded-lg text-center">
                  <div className="text-white font-semibold">Item {i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ResponsiveCard>
    </div>
  );

  const renderDemoContent = () => {
    switch (activeDemo) {
      case 'charts': return renderChartsDemo();
      case 'cards': return renderCardsDemo();
      case 'accessibility': return renderAccessibilityDemo();
      case 'performance': return renderPerformanceDemo();
      case 'mobile': return renderMobileDemo();
      default: return renderChartsDemo();
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
    }`}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">DealershipAI Demo</h1>
                <p className="text-sm text-white/60">Enhanced UI Components Showcase</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {demos.map((demo) => {
            const Icon = demo.icon;
            return (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeDemo === demo.id
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{demo.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDemo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderDemoContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}