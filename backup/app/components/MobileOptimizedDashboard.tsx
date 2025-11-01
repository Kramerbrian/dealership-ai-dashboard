'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Smartphone, Tablet, Monitor, Wifi, Battery, Signal } from 'lucide-react';

interface MobileOptimizedDashboardProps {
  tenantId: string;
}

export default function MobileOptimizedDashboard({ tenantId }: MobileOptimizedDashboardProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Detect device type
    const detectDevice = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getDeviceColor = () => {
    switch (deviceType) {
      case 'mobile':
        return 'text-blue-600';
      case 'tablet':
        return 'text-green-600';
      case 'desktop':
        return 'text-purple-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600" />
              <div className="text-base sm:text-lg font-semibold tracking-tight">
                dealership<span className="font-bold text-blue-600">AI</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Dashboard
              </a>
              <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Analytics
              </a>
              <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Reports
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              <a href="#" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                Dashboard
              </a>
              <a href="#" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                Analytics
              </a>
              <a href="#" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                Reports
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Status Bar (Mobile) */}
      {deviceType === 'mobile' && (
        <div className="bg-gray-900 text-white px-4 py-1 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span>9:41</span>
          </div>
          <div className="flex items-center gap-1">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3 h-3" />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Device Status */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className={`flex items-center gap-1 ${getDeviceColor()}`}>
              {getDeviceIcon()}
              <span className="capitalize">{deviceType}</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className={`flex items-center gap-1 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* AI Visibility Card */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">AI Visibility</h3>
              <div className="text-xs sm:text-sm text-green-600 font-medium">+3.2%</div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">89.3%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '89.3%' }} />
            </div>
          </div>

          {/* Zero-Click Rate Card */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Zero-Click Rate</h3>
              <div className="text-xs sm:text-sm text-red-600 font-medium">-1.2%</div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">34.2%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '34.2%' }} />
            </div>
          </div>

          {/* UGC Health Card */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">UGC Health</h3>
              <div className="text-xs sm:text-sm text-green-600 font-medium">+0.8%</div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">91.5%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '91.5%' }} />
            </div>
          </div>

          {/* Trust Signals Card */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Trust Signals</h3>
              <div className="text-xs sm:text-sm text-red-600 font-medium">-3.1%</div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">78.9%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '78.9%' }} />
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Charts */}
        <div className="mt-6 sm:mt-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              Performance Trends
            </h3>
            
            {/* Responsive Chart Placeholder */}
            <div className="h-48 sm:h-64 lg:h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">📊</div>
                <p className="text-sm sm:text-base text-gray-600">Interactive Chart</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Optimized for {deviceType} viewing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="mt-6 sm:mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Run AI Audit
            </button>
            <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              View Reports
            </button>
          </div>
        </div>

        {/* Mobile-First Features */}
        <div className="mt-6 sm:mt-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mobile Features</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Touch-Optimized</div>
                  <div className="text-sm text-gray-600">Large touch targets and gestures</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Wifi className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Offline Support</div>
                  <div className="text-sm text-gray-600">Works without internet connection</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Battery className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Battery Efficient</div>
                  <div className="text-sm text-gray-600">Optimized for mobile battery life</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
