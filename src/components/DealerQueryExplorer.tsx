import React, { useState } from 'react';
import { Search, TrendingUp, Filter, Download, BarChart3, ArrowRight } from 'lucide-react';

export default function DealerQueryExplorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIntent, setSelectedIntent] = useState('all');

  const categories = [
    { id: 'all', name: 'All Queries', count: 24567 },
    { id: 'toyota', name: 'Toyota', count: 4892 },
    { id: 'ford', name: 'Ford', count: 5234 },
    { id: 'honda', name: 'Honda', count: 3456 },
    { id: 'luxury', name: 'Luxury', count: 2891 }
  ];

  const intents = [
    { id: 'all', name: 'All Intents' },
    { id: 'research', name: 'Research' },
    { id: 'comparison', name: 'Comparison' },
    { id: 'purchase', name: 'Purchase Ready' },
    { id: 'service', name: 'Service/Support' }
  ];

  const topQueries = [
    {
      query: 'best Toyota dealer near me',
      volume: 12400,
      trend: 18,
      intent: 'Research',
      platforms: { chatgpt: 45, perplexity: 32, claude: 23 },
      topDealer: 'Premier Toyota Sacramento'
    },
    {
      query: 'Honda dealer with best financing',
      volume: 8900,
      trend: 23,
      intent: 'Comparison',
      platforms: { chatgpt: 38, perplexity: 42, claude: 20 },
      topDealer: 'Elite Honda Chicago'
    },
    {
      query: 'should I buy used or new car',
      volume: 15600,
      trend: -5,
      intent: 'Research',
      platforms: { chatgpt: 52, perplexity: 28, claude: 20 },
      topDealer: 'Heritage Ford Group'
    },
    {
      query: 'certified pre-owned BMW dealerships',
      volume: 6200,
      trend: 31,
      intent: 'Purchase Ready',
      platforms: { chatgpt: 41, perplexity: 35, claude: 24 },
      topDealer: 'Westside BMW'
    },
    {
      query: 'Toyota dealer reviews near Chicago',
      volume: 7800,
      trend: 12,
      intent: 'Comparison',
      platforms: { chatgpt: 48, perplexity: 30, claude: 22 },
      topDealer: 'Metro Toyota Dealer Network'
    },
    {
      query: 'best time to buy a new car',
      volume: 11200,
      trend: 8,
      intent: 'Research',
      platforms: { chatgpt: 55, perplexity: 25, claude: 20 },
      topDealer: 'Johnson Chevrolet'
    },
    {
      query: 'Ford F-150 inventory near me',
      volume: 9400,
      trend: 27,
      intent: 'Purchase Ready',
      platforms: { chatgpt: 43, perplexity: 38, claude: 19 },
      topDealer: 'AutoNation Ford Phoenix'
    },
    {
      query: 'luxury car dealership recommendations',
      volume: 5600,
      trend: 15,
      intent: 'Research',
      platforms: { chatgpt: 39, perplexity: 36, claude: 25 },
      topDealer: 'Luxury Auto Collection'
    }
  ];

  const risingQueries = [
    { query: 'electric vehicle dealers near me', volume: 4200, trend: 145 },
    { query: 'best dealership trade-in offers', volume: 3800, trend: 89 },
    { query: 'Toyota hybrid inventory', volume: 5100, trend: 67 },
    { query: 'dealer financing vs bank loan', volume: 2900, trend: 134 }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <div className="border-b border-white/10 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black mb-2">Dealer Query Explorer</h1>
              <p className="text-gray-400">
                Real-time search volumes from 3M+ daily prompts across AI platforms
              </p>
            </div>
            <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded hover:bg-white/10 transition">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queries... (e.g., 'best Toyota dealer')"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:border-white/30 focus:outline-none"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded text-sm font-semibold transition ${
                    selectedCategory === cat.id
                      ? 'bg-white text-black'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {cat.name}
                  <span className="ml-2 text-xs opacity-60">({cat.count.toLocaleString()})</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 ml-auto">
              {intents.map((intent) => (
                <button
                  key={intent.id}
                  onClick={() => setSelectedIntent(intent.id)}
                  className={`px-4 py-2 rounded text-sm font-semibold transition ${
                    selectedIntent === intent.id
                      ? 'bg-white text-black'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {intent.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Top Queries */}
          <div className="col-span-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Top Dealer Queries</h2>
              <p className="text-sm text-gray-500">Sorted by monthly volume</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-white/5 border-b border-white/10 text-xs text-gray-500 uppercase tracking-wide font-semibold">
                <div className="col-span-5">Query</div>
                <div className="col-span-2">Volume/mo</div>
                <div className="col-span-2">Trend</div>
                <div className="col-span-3">Top Dealer</div>
              </div>

              {/* Rows */}
              {topQueries.map((item, i) => (
                <div 
                  key={i}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/5 transition cursor-pointer group"
                >
                  <div className="col-span-5">
                    <div className="font-semibold group-hover:text-blue-400 transition mb-1">
                      {item.query}
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded">
                        ChatGPT {item.platforms.chatgpt}%
                      </span>
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                        Perplexity {item.platforms.perplexity}%
                      </span>
                      <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded">
                        Claude {item.platforms.claude}%
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <div>
                      <div className="text-xl font-black">{item.volume.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">searches</div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <div className={`flex items-center gap-1 font-semibold ${
                      item.trend > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <TrendingUp className={`w-4 h-4 ${item.trend < 0 ? 'rotate-180' : ''}`} />
                      {item.trend > 0 ? '+' : ''}{item.trend}%
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <div className="text-sm text-gray-400">{item.topDealer}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 bg-white/5 border border-white/10 py-3 rounded font-semibold hover:bg-white/10 transition">
              Load More Queries
            </button>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Rising Queries */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="font-bold">Rising This Week</h3>
              </div>
              <div className="space-y-3">
                {risingQueries.map((item, i) => (
                  <div key={i} className="pb-3 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="text-sm font-semibold mb-1">{item.query}</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{item.volume.toLocaleString()}/mo</span>
                      <span className="text-green-400 font-bold">↑ {item.trend}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Query Insights */}
            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold">Query Insights</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-300">
                <p>
                  <span className="text-white font-semibold">Research intent</span> queries are up 
                  <span className="text-green-400 font-bold"> +34%</span> this month
                </p>
                <p>
                  <span className="text-white font-semibold">EV-related</span> searches growing 
                  <span className="text-green-400 font-bold"> +127%</span> year-over-year
                </p>
                <p>
                  <span className="text-white font-semibold">67%</span> of queries now mention 
                  <span className="text-white font-semibold">"financing"</span> or 
                  <span className="text-white font-semibold"> "trade-in"</span>
                </p>
              </div>
              <button className="w-full mt-4 bg-white text-black py-2 rounded font-semibold hover:bg-gray-200 transition text-sm flex items-center justify-center gap-2">
                View Full Report
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Track These Queries CTA */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-bold mb-3">Track these queries</h3>
              <p className="text-sm text-gray-400 mb-4">
                Get alerts when your dealership appears (or doesn't) in answers to these high-volume queries
              </p>
              <button className="w-full bg-white text-black py-2 rounded font-semibold hover:bg-gray-200 transition text-sm">
                Start Tracking
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-white/10 bg-white/[0.02] py-12 px-6 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Want to rank for these queries?
          </h2>
          <p className="text-gray-400 mb-6">
            DealershipAI shows you exactly which queries to target and how to optimize for them
          </p>
          <div className="flex gap-3 justify-center">
            <button className="bg-white text-black px-8 py-3 rounded font-semibold hover:bg-gray-200 transition">
              Get Started
            </button>
            <button className="border border-white/20 px-8 py-3 rounded font-semibold hover:bg-white/5 transition">
              View Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
