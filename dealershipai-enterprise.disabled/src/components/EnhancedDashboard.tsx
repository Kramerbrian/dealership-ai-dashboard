import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CpuChipIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  StarIcon,
  DocumentTextIcon,
  SparklesIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  EyeIcon,
  CogIcon,
  BellIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ChartPieIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import DataVisualization from './DataVisualization';

interface EnhancedDashboardProps {
  dealershipId?: string;
  dealershipName?: string;
  apiBaseUrl?: string;
  theme?: string;
  showLeaderboard?: boolean;
  showCommunity?: boolean;
  showAnalytics?: boolean;
  onDealerSelect?: (dealerId: string) => void;
  onFilterChange?: (filters: any) => void;
  onExport?: (data: any) => void;
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  dealershipId = 'demo-dealer',
  dealershipName = 'Premium Auto Dealership',
  apiBaseUrl = '/api',
  theme = 'light',
  showLeaderboard = true,
  showCommunity = true,
  showAnalytics = true,
  onDealerSelect,
  onFilterChange,
  onExport
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<any>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const openModal = (id: string, content: any = {}) => {
    setModalContent(content);
    setActiveModal(id);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalContent({});
  };

  const handleAction = async (action: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    alert(`${action} completed!`);
  };

  // Mock data for demonstration
  const metrics = {
    seo: { score: 87, trend: 'up', change: 5.2 },
    aeo: { score: 72, trend: 'down', change: -2.1 },
    geo: { score: 65, trend: 'up', change: 3.8 },
    eeat: {
      experience: { score: 78, trend: 'up', change: 4.2 },
      expertise: { score: 82, trend: 'up', change: 2.1 },
      authority: { score: 75, trend: 'down', change: -1.5 },
      trust: { score: 88, trend: 'up', change: 6.3 }
    }
  };

  const chartData = {
    traffic: [
      { label: 'Jan', value: 65 },
      { label: 'Feb', value: 72 },
      { label: 'Mar', value: 68 },
      { label: 'Apr', value: 85 },
      { label: 'May', value: 92 },
      { label: 'Jun', value: 88 }
    ],
    sources: [
      { label: 'Organic', value: 45, color: '#3B82F6' },
      { label: 'Direct', value: 25, color: '#10B981' },
      { label: 'Social', value: 15, color: '#F59E0B' },
      { label: 'Referral', value: 10, color: '#EF4444' },
      { label: 'Paid', value: 5, color: '#8B5CF6' }
    ],
    competitors: [
      { label: 'AutoMax', value: 92, trend: 'up', change: 3.2, color: 'blue' },
      { label: 'CarWorld', value: 87, trend: 'up', change: 1.8, color: 'green' },
      { label: 'DriveRight', value: 78, trend: 'down', change: -2.1, color: 'orange' },
      { label: 'Your Dealership', value: 85, trend: 'up', change: 4.5, color: 'purple' }
    ]
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: HomeIcon, color: 'blue' },
    { id: 'ai-health', label: 'AI Health', icon: CpuChipIcon, color: 'purple' },
    { id: 'website', label: 'Website', icon: GlobeAltIcon, color: 'green' },
    { id: 'schema', label: 'Schema', icon: MagnifyingGlassIcon, color: 'orange' },
    { id: 'reviews', label: 'Reviews', icon: StarIcon, color: 'yellow' },
    { id: 'analytics', label: 'Analytics', icon: ChartPieIcon, color: 'indigo' },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheckIcon, color: 'red' },
    { id: 'war-room', label: 'War Room', icon: UserGroupIcon, color: 'pink' },
    { id: 'settings', label: 'Settings', icon: CogIcon, color: 'gray' }
  ];

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, href: '#' },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon, href: '#' },
    { id: 'reports', label: 'Reports', icon: ClipboardDocumentListIcon, href: '#' },
    { id: 'settings', label: 'Settings', icon: CogIcon, href: '#' }
  ];

  const MetricCard = ({ title, value, trend, change, color, icon: Icon, onClick, subtitle }: any) => (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${color}-50 group-hover:bg-${color}-100 transition-colors`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="flex items-center space-x-1">
          {trend === 'up' ? (
            <TrendingUpIcon className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDownIcon className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(change)}%
          </span>
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );

  const EEATCard = ({ factor, score, trend, change, color, onClick }: any) => (
    <div 
      className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">{factor}</h4>
        <div className="flex items-center space-x-1">
          {trend === 'up' ? (
            <ArrowUpIcon className="w-3 h-3 text-green-500" />
          ) : (
            <ArrowDownIcon className="w-3 h-3 text-red-500" />
          )}
          <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(change)}%
          </span>
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{score}</div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div 
          className={`bg-${color}-500 h-2 rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );

  const ActionButton = ({ label, icon: Icon, color, onClick, loading, variant = 'primary' }: any) => {
    const baseClasses = `flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95`;
    const variantClasses = variant === 'primary' 
      ? `text-white bg-${color}-600 hover:bg-${color}-700 disabled:opacity-50 disabled:cursor-not-allowed`
      : `text-${color}-600 bg-${color}-50 hover:bg-${color}-100 border border-${color}-200`;

    return (
      <button
        onClick={onClick}
        disabled={loading}
        className={`${baseClasses} ${variantClasses}`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                {sidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">DealershipAI</h1>
                  <p className="text-xs text-gray-500">Algorithmic Trust Dashboard</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{dealershipName}</span>
                <span className="text-xs text-gray-500">|</span>
                <span className="text-sm text-gray-600">Cape Coral, FL</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
                <span>•</span>
                <span>{formatTime(currentTime)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
                  <BellIcon className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <UserIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Navigation Tabs */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-1 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                        activeTab === tab.id
                          ? `bg-${tab.color}-100 text-${tab.color}-700 border border-${tab.color}-200`
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">AI Visibility Overview</h2>
                      <p className="text-blue-100 text-lg">Monitor and optimize your dealership's AI search presence</p>
                    </div>
                    <div className="hidden md:block">
                      <div className="text-right">
                        <div className="text-4xl font-bold">87</div>
                        <div className="text-blue-100">Overall Score</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <MetricCard
                    title="SEO Score"
                    value={metrics.seo.score}
                    trend={metrics.seo.trend}
                    change={metrics.seo.change}
                    color="green"
                    icon={ChartBarIcon}
                    onClick={() => openModal('seo-details', { title: 'SEO Analysis', score: metrics.seo.score })}
                    subtitle="Search Engine Optimization"
                  />
                  <MetricCard
                    title="AEO Score"
                    value={metrics.aeo.score}
                    trend={metrics.aeo.trend}
                    change={metrics.aeo.change}
                    color="orange"
                    icon={CpuChipIcon}
                    onClick={() => openModal('aeo-details', { title: 'AI Engine Optimization', score: metrics.aeo.score })}
                    subtitle="AI Engine Optimization"
                  />
                  <MetricCard
                    title="GEO Score"
                    value={metrics.geo.score}
                    trend={metrics.geo.trend}
                    change={metrics.geo.change}
                    color="purple"
                    icon={GlobeAltIcon}
                    onClick={() => openModal('geo-details', { title: 'Geographic Optimization', score: metrics.geo.score })}
                    subtitle="Geographic Optimization"
                  />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <DataVisualization
                    type="line"
                    data={chartData.traffic}
                    title="Traffic Trends"
                    subtitle="Monthly website traffic over the last 6 months"
                  />
                  <DataVisualization
                    type="donut"
                    data={chartData.sources}
                    title="Traffic Sources"
                    subtitle="Distribution of traffic by source"
                  />
                </div>

                {/* E-E-A-T Analysis */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">E-E-A-T Analysis</h3>
                    <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                      Google Quality Guidelines
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <EEATCard
                      factor="Experience"
                      score={metrics.eeat.experience.score}
                      trend={metrics.eeat.experience.trend}
                      change={metrics.eeat.experience.change}
                      color="blue"
                      onClick={() => openModal('eeat-experience', { factor: 'Experience', score: metrics.eeat.experience.score })}
                    />
                    <EEATCard
                      factor="Expertise"
                      score={metrics.eeat.expertise.score}
                      trend={metrics.eeat.expertise.trend}
                      change={metrics.eeat.expertise.change}
                      color="green"
                      onClick={() => openModal('eeat-expertise', { factor: 'Expertise', score: metrics.eeat.expertise.score })}
                    />
                    <EEATCard
                      factor="Authority"
                      score={metrics.eeat.authority.score}
                      trend={metrics.eeat.authority.trend}
                      change={metrics.eeat.authority.change}
                      color="orange"
                      onClick={() => openModal('eeat-authority', { factor: 'Authority', score: metrics.eeat.authority.score })}
                    />
                    <EEATCard
                      factor="Trust"
                      score={metrics.eeat.trust.score}
                      trend={metrics.eeat.trust.trend}
                      change={metrics.eeat.trust.change}
                      color="purple"
                      onClick={() => openModal('eeat-trust', { factor: 'Trust', score: metrics.eeat.trust.score })}
                    />
                  </div>
                </div>

                {/* Competitor Analysis */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Competitor Analysis</h3>
                    <ActionButton
                      label="View All"
                      icon={EyeIcon}
                      color="blue"
                      variant="secondary"
                      onClick={() => handleAction('Competitor Analysis')}
                    />
                  </div>
                  <DataVisualization
                    type="trend"
                    data={chartData.competitors}
                    className="mb-0"
                  />
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ActionButton
                      label="Generate Report"
                      icon={DocumentTextIcon}
                      color="blue"
                      onClick={() => handleAction('Report Generation')}
                      loading={isLoading}
                    />
                    <ActionButton
                      label="Start Optimization"
                      icon={SparklesIcon}
                      color="green"
                      onClick={() => handleAction('Optimization')}
                      loading={isLoading}
                    />
                    <ActionButton
                      label="View Competitors"
                      icon={EyeIcon}
                      color="purple"
                      onClick={() => handleAction('Competitor Analysis')}
                      loading={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Other Tabs */}
            {activeTab !== 'overview' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {React.createElement(tabs.find(tab => tab.id === activeTab)?.icon || ChartBarIcon, { className: "w-8 h-8 text-gray-400" })}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {tabs.find(tab => tab.id === activeTab)?.label} Dashboard
                  </h3>
                  <p className="text-gray-600">
                    This section is under development and will be available soon.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {modalContent.title || modalContent.factor} Details
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {modalContent.score}
                </div>
                <p className="text-gray-600">
                  {modalContent.title || modalContent.factor} Performance Score
                </p>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Recommendations</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Optimize meta descriptions for better click-through rates</li>
                    <li>• Improve page loading speed by 20%</li>
                    <li>• Add structured data markup</li>
                  </ul>
                </div>
                <button
                  onClick={() => handleAction('Detailed Analysis')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Generate Detailed Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default EnhancedDashboard;
