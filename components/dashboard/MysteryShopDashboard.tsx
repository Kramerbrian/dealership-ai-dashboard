'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

/* ================== PREVIEW DATA GENERATOR ================== */
const generateRealisticData = () => {
  const dealers = [
    'Kennesaw Hyundai', 'Shottenkirk Canton', 'Ed Voyles Hyundai', 
    'Rick Case Hyundai', 'AutoNation Hyundai', 'Nalley Hyundai'
  ];
  
  const shoppers = [
    { name: 'Michael Thompson', avatar: '👨‍💼', type: 'Business Professional' },
    { name: 'Jennifer Martinez', avatar: '👩‍⚕️', type: 'Healthcare Worker' },
    { name: 'David Wilson', avatar: '👨‍👩‍👧', type: 'Family Buyer' },
    { name: 'Ashley Chen', avatar: '👩‍🎓', type: 'Recent Graduate' },
    { name: 'Robert Johnson', avatar: '👴', type: 'Senior Buyer' },
    { name: 'Maria Garcia', avatar: '👩‍💻', type: 'Tech Professional' },
  ];
  
  const models = ['Santa Fe', 'Tucson', 'Palisade', 'Elantra', 'Sonata', 'Kona'];
  const tradeIns = ['Honda CR-V', 'Toyota Camry', 'Ford F-150', 'Nissan Altima', 'Chevy Malibu'];
  
  const responseTemplates = [
    "Thanks for your interest! We have {model} in stock with great incentives. Your {trade} trade-in looks good. When can you visit?",
    "Hi {name}! I can get you pre-approved in minutes. The {model} is perfect for you. Let's discuss your {trade} trade value.",
    "Great choice on the {model}! We're offering 0% APR for qualified buyers. I'd love to evaluate your {trade} in person.",
    "I have the perfect {model} for you! Just arrived yesterday. Your {trade} has strong value right now. Can we schedule a test drive?",
    "Thanks for reaching out! Our {model} inventory is moving fast. I can guarantee top dollar for your {trade}. What's your timeline?",
  ];

  const shops = [];
  for (let i = 0; i < 25; i++) {
    const shopper = shoppers[i % shoppers.length];
    const model = models[i % models.length];
    const trade = tradeIns[i % tradeIns.length];
    const deployedHours = Math.floor(Math.random() * 72);
    
    const responses = [];
    const respondedDealers: string[] = [];

    // Generate 0-4 responses per shop
    const responseCount = Math.floor(Math.random() * 5);
    for (let j = 0; j < responseCount; j++) {
      const dealer = dealers[Math.floor(Math.random() * dealers.length)];
      if (!respondedDealers.includes(dealer)) {
        respondedDealers.push(dealer);
        const responseTime = Math.floor(Math.random() * 240) + 1; // 1-240 minutes
        const template = responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
        
        responses.push({
          dealer,
          responseTime,
          channel: ['email', 'phone', 'sms'][Math.floor(Math.random() * 3)],
          timestamp: new Date(Date.now() - (deployedHours - responseTime/60) * 3600000).toISOString(),
          quality: responseTime < 30 ? 'excellent' : responseTime < 120 ? 'good' : 'fair',
          content: template
            .replace('{name}', shopper.name.split(' ')[0])
            .replace('{model}', model)
            .replace('{trade}', trade),
          hasOTDPricing: Math.random() > 0.6,
          hasTradeValue: Math.random() > 0.5,
          followUpCount: Math.floor(Math.random() * 4),
        });
      }
    }
    
    // Calculate scores
    const avgResponseTime = responses.length 
      ? responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length 
      : null;
    
    const score = responses.length === 0 ? 0 :
      Math.min(100, Math.round(
        (responses.filter(r => r.quality === 'excellent').length * 40) +
        (responses.filter(r => r.hasOTDPricing).length * 20) +
        (responses.filter(r => r.responseTime < 60).length * 20) +
        (responses.length * 5)
      ));
    
    shops.push({
      id: i + 1,
      name: shopper.name,
      avatar: shopper.avatar,
      type: shopper.type,
      email: `${shopper.name.toLowerCase().replace(' ', '.')}${Math.floor(Math.random()*999)}@preview.com`,
      phone: `(${Math.floor(Math.random()*900)+100}) 555-${Math.floor(Math.random()*9000)+1000}`,
      model,
      tradeIn: trade,
      creditTier: ['Excellent (750+)', 'Good (700-749)', 'Fair (650-699)', 'Needs Help (<650)'][Math.floor(Math.random() * 4)],
      deployedAt: new Date(Date.now() - deployedHours * 3600000),
      responses,
      responseCount: responses.length,
      avgResponseTime,
      score,
      status: deployedHours > 48 ? 'completed' : responses.length > 0 ? 'active' : 'pending',
      targetDealers: dealers.slice(0, 3),
    });
  }
  
  return shops;
};

/* ================== COMPONENTS ================== */
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    excellent: 'bg-green-100 text-green-800',
    good: 'bg-blue-100 text-blue-800',
    fair: 'bg-yellow-100 text-yellow-800',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
};

const ProgressBar = ({ value, showLabel = false }: { value: number; showLabel?: boolean }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-500 ${
          value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
    {showLabel && <span className="text-xs font-medium w-10">{value}%</span>}
  </div>
);

const MetricCard = ({ title, value, change, icon }: { title: string; value: string | number; change?: number; icon: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-600">{title}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    {change !== undefined && (
      <div className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change > 0 ? '↑' : '↓'} {Math.abs(change)}% vs last week
      </div>
    )}
  </div>
);

const TimeAgo = ({ date }: { date: string | Date }) => {
  const [timeAgo, setTimeAgo] = useState('');
  
  useEffect(() => {
    const updateTime = () => {
      try {
        const inputDate = new Date(date);
        if (isNaN(inputDate.getTime())) {
          setTimeAgo('Unknown');
          return;
        }
        
        const seconds = Math.floor((new Date().getTime() - inputDate.getTime()) / 1000);
        
        if (seconds < 0) {
          setTimeAgo('just now');
        } else if (seconds < 60) {
          setTimeAgo('just now');
        } else if (seconds < 3600) {
          setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
        } else if (seconds < 86400) {
          setTimeAgo(`${Math.floor(seconds / 3600)}h ago`);
        } else {
          const days = Math.floor(seconds / 86400);
          setTimeAgo(`${days}d ago`);
        }
      } catch (error) {
        setTimeAgo('Unknown');
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [date]);
  
  return <span>{timeAgo}</span>;
};

/* ================== MAIN DASHBOARD ================== */
const MysteryShopDashboard = () => {
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLive, setIsLive] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(true);
  const liveInterval = useRef<NodeJS.Timeout | null>(null);

  // Generate initial data
  useEffect(() => {
    setShops(generateRealisticData());
  }, []);

  // Simulate live updates
  useEffect(() => {
    if (isLive) {
      liveInterval.current = setInterval(() => {
        setShops(prevShops => {
          const updatedShops = [...prevShops];
          const eligibleShops = updatedShops.filter(s => s.status === 'pending' || s.status === 'active').slice(0, 5);
          
          if (eligibleShops.length > 0 && Math.random() > 0.5) {
            const shop = eligibleShops[Math.floor(Math.random() * eligibleShops.length)];
            const shopIndex = updatedShops.findIndex((s: any) => s.id === shop.id);
            
            if (shopIndex !== -1) {
              const dealers = ['Kennesaw Hyundai', 'Shottenkirk Canton', 'Ed Voyles Hyundai', 'Rick Case Hyundai'];
              const availableDealers = dealers.filter(d => !shop.responses.find((r: any) => r.dealer === d));
              
              if (availableDealers.length > 0) {
                const dealer = availableDealers[Math.floor(Math.random() * availableDealers.length)];
                const responseTime = Math.floor(Math.random() * 60) + 1;
                const newResponse = {
                  dealer,
                  responseTime,
                  channel: ['email', 'phone', 'sms'][Math.floor(Math.random() * 3)],
                  timestamp: new Date().toISOString(),
                  quality: responseTime < 15 ? 'excellent' : responseTime < 30 ? 'good' : 'fair',
                  content: `Great news! We have your ${shop.model} ready with special pricing. Excellent trade value on your ${shop.tradeIn}.`,
                  hasOTDPricing: Math.random() > 0.3,
                  hasTradeValue: Math.random() > 0.3,
                  followUpCount: 0,
                };
                
                updatedShops[shopIndex] = {
                  ...shop,
                  responses: [...shop.responses, newResponse],
                  responseCount: shop.responses.length + 1,
                  status: 'active',
                  avgResponseTime: ((shop.avgResponseTime || 0) * shop.responses.length + responseTime) / (shop.responses.length + 1),
                  score: Math.min(100, shop.score + (responseTime < 15 ? 20 : 10))
                };
                
                const notificationId = `${Date.now()}-${dealer}-${shop.id}`;
                setNotifications(prev => {
                  if (prev.find(n => n.id === notificationId)) return prev;
                  
                  return [{
                    id: notificationId,
                    message: `${dealer} responded to ${shop.name} in ${responseTime} minutes!`,
                    type: 'success',
                    timestamp: new Date()
                  }, ...prev].slice(0, 5);
                });
              }
            }
          }
          
          return updatedShops;
        });
      }, 5000);
    }
    
    return () => {
      if (liveInterval.current) {
        clearInterval(liveInterval.current);
        liveInterval.current = null;
      }
    };
  }, [isLive]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalShops = shops.length;
    const activeShops = shops.filter(s => s.status === 'active').length;
    const totalResponses = shops.reduce((sum, s) => sum + s.responseCount, 0);
    const avgScore = shops.length 
      ? Math.round(shops.reduce((sum, s) => sum + s.score, 0) / shops.length)
      : 0;
    
    const responseTimes = shops
      .filter(s => s.avgResponseTime)
      .map(s => s.avgResponseTime);
    const avgResponseTime = responseTimes.length
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;
    
    const dealerStats: Record<string, any> = {};
    shops.forEach(shop => {
      shop.responses.forEach((response: any) => {
        if (!dealerStats[response.dealer]) {
          dealerStats[response.dealer] = {
            name: response.dealer,
            responses: 0,
            avgTime: 0,
            times: [],
            score: 0
          };
        }
        dealerStats[response.dealer].responses++;
        dealerStats[response.dealer].times.push(response.responseTime);
      });
    });
    
    Object.values(dealerStats).forEach((dealer: any) => {
      dealer.avgTime = Math.round(dealer.times.reduce((a: number, b: number) => a + b, 0) / dealer.times.length);
      dealer.score = Math.round(100 - (dealer.avgTime / 2));
    });
    
    return {
      totalShops,
      activeShops,
      totalResponses,
      avgScore,
      avgResponseTime,
      dealerStats: Object.values(dealerStats).sort((a, b) => b.score - a.score),
    };
  }, [shops]);

  // Filter shops
  const filteredShops = useMemo(() => {
    let filtered = [...shops];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }
    
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s => {
        try {
          return (
            (s.name && s.name.toLowerCase().includes(query)) ||
            (s.model && s.model.toLowerCase().includes(query)) ||
            (s.email && s.email.toLowerCase().includes(query)) ||
            (s.tradeIn && s.tradeIn.toLowerCase().includes(query)) ||
            (s.type && s.type.toLowerCase().includes(query))
          );
        } catch (error) {
          console.error('Search filter error:', error);
          return false;
        }
      });
    }
    
    return filtered.sort((a, b) => new Date(b.deployedAt).getTime() - new Date(a.deployedAt).getTime());
  }, [shops, filterStatus, searchQuery]);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Active Mystery Shops" value={metrics.activeShops} change={12} icon="🕵️" />
        <MetricCard title="Total Responses" value={metrics.totalResponses} change={28} icon="💬" />
        <MetricCard title="Avg Response Time" value={`${metrics.avgResponseTime}m`} change={-15} icon="⏱️" />
        <MetricCard title="Overall Score" value={`${metrics.avgScore}%`} change={5} icon="📊" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Dealer Performance Leaderboard</h3>
        <div className="space-y-3">
          {metrics.dealerStats.slice(0, 5).map((dealer, idx) => (
            <div key={dealer.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                <div>
                  <div className="font-medium">{dealer.name}</div>
                  <div className="text-sm text-gray-600">
                    {dealer.responses} responses • Avg {dealer.avgTime}m
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ProgressBar value={dealer.score} showLabel />
                {idx === 0 && <span className="text-2xl">🏆</span>}
                {idx === 1 && <span className="text-2xl">🥈</span>}
                {idx === 2 && <span className="text-2xl">🥉</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <span className="text-2xl">🕵️</span>
              <h1 className="text-xl font-bold">Mystery Shop Command Center</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${
                  isLive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {isLive ? 'Live' : 'Paused'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'shops', label: 'Mystery Shops', icon: '🕵️' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'shops' && <div className="text-center py-12">Shops Tab - Coming Soon</div>}
        {activeTab === 'analytics' && <div className="text-center py-12">Analytics Tab - Coming Soon</div>}
      </main>
    </div>
  );
};

export default MysteryShopDashboard;
