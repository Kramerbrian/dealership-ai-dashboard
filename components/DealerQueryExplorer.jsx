import React, { useState } from 'react';
import { Search, TrendingUp, Download, BarChart3, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-[#000000] text-white antialiased">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="flex items-start justify-between mb-10">
            <div>
              <h1 className="text-[40px] font-bold tracking-tight leading-tight mb-3">
                Dealer Query Explorer
              </h1>
              <p className="text-gray-400 text-lg">
                Real-time search volumes from 3M+ daily prompts across AI platforms
              </p>
            </div>
            <button className="flex items-center gap-2.5 bg-white/5 border border-white/20 px-6 py-3 rounded-lg hover:bg-white/10 transition-all font-semibold text-[15px]">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queries..."
                className="w-full bg-white/5 border border-white/20 rounded-xl pl-14 pr-6 py-4 text-white text-[15px] placeholder-gray-500 focus:border-white/40 focus:outline-none focus:ring-0 transition-all"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center justify-between">
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-white text-black'
                      : 'bg-transparent border border-white/20 hover:bg-white/5'
                  }`}
                >
                  {cat.name}
                  {cat.id === 'all' && (
                    <span className="ml-2 text-[13px] opacity-50">
                      {cat.count.toLocaleString()}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {intents.map((intent) => (
                <button
                  key={intent.id}
                  onClick={() => setSelectedIntent(intent.id)}
                  className={`px-4 py-2.5 rounded-lg text-[14px] font-semibold transition-all ${
                    selectedIntent === intent.id
                      ? 'bg-white text-black'
                      : 'bg-transparent border border-white/20 hover:bg-white/5'
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
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-12 gap-8">
          {/* Top Queries */}
          <div className="col-span-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-1">Top Dealer Queries</h2>
              <p className="text-[15px] text-gray-500">Sorted by monthly volume</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-6 px-8 py-4 bg-white/[0.02] border-b border-white/10 text-[12px] text-gray-500 uppercase tracking-wider font-bold">
                <div className="col-span-5">Query</div>
                <div className="col-span-2">Volume/mo</div>
                <div className="col-span-2">Trend</div>
                <div className="col-span-3">Top Dealer</div>
              </div>

              {/* Rows */}
              {topQueries.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-6 px-8 py-6 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <div className="col-span-5">
                    <div className="font-semibold text-[15px] mb-3 group-hover:text-white transition-colors">
                      {item.query}
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2.5 py-1 bg-white/5 text-gray-400 rounded text-[11px] font-medium uppercase tracking-wide">
                        ChatGPT {item.platforms.chatgpt}%
                      </span>
                      <span className="px-2.5 py-1 bg-white/5 text-gray-400 rounded text-[11px] font-medium uppercase tracking-wide">
                        Perplexity {item.platforms.perplexity}%
                      </span>
                      <span className="px-2.5 py-1 bg-white/5 text-gray-400 rounded text-[11px] font-medium uppercase tracking-wide">
                        Claude {item.platforms.claude}%
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <div>
                      <div className="text-2xl font-bold tabular-nums">{item.volume.toLocaleString()}</div>
                      <div className="text-[12px] text-gray-500 mt-0.5">searches</div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <div className={`flex items-center gap-1.5 font-bold text-[15px] ${
                      item.trend > 0 ? 'text-white' : 'text-gray-500'
                    }`}>
                      <TrendingUp className={`w-4 h-4 ${item.trend < 0 ? 'rotate-180' : ''}`} />
                      {item.trend > 0 ? '+' : ''}{item.trend}%
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <div className="text-[14px] text-gray-400">{item.topDealer}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 bg-white/5 border border-white/10 py-4 rounded-xl font-semibold hover:bg-white/[0.07] transition-all text-[15px]">
              Load More Queries
            </button>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Rising Queries */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-2.5 mb-6">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-bold text-[17px]">Rising This Week</h3>
              </div>
              <div className="space-y-4">
                {risingQueries.map((item, i) => (
                  <div key={i} className="pb-4 border-b border-white/10 last:border-0 last:pb-0">
                    <div className="text-[14px] font-semibold mb-2 leading-snug">{item.query}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-gray-500 tabular-nums">
                        {item.volume.toLocaleString()}/mo
                      </span>
                      <span className="text-white font-bold text-[13px] tabular-nums">
                        ↑ {item.trend}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Query Insights */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-white/20 rounded-xl p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <BarChart3 className="w-5 h-5" />
                <h3 className="font-bold text-[17px]">Query Insights</h3>
              </div>
              <div className="space-y-4 text-[14px] text-gray-300 leading-relaxed">
                <p>
                  <span className="text-white font-semibold">Research intent</span> queries are up
                  <span className="text-white font-bold"> +34%</span> this month
                </p>
                <p>
                  <span className="text-white font-semibold">EV-related</span> searches growing
                  <span className="text-white font-bold"> +127%</span> year-over-year
                </p>
                <p>
                  <span className="text-white font-semibold">67%</span> of queries now mention
                  <span className="text-white font-semibold"> financing</span> or
                  <span className="text-white font-semibold"> trade-in</span>
                </p>
              </div>
              <button className="w-full mt-6 bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all text-[14px] flex items-center justify-center gap-2">
                View Full Report
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Track These Queries CTA */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-bold text-[17px] mb-3">Track these queries</h3>
              <p className="text-[14px] text-gray-400 mb-5 leading-relaxed">
                Get alerts when your dealership appears (or doesn't) in answers to these high-volume queries
              </p>
              <button className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all text-[14px]">
                Start Tracking
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-white/10 py-16 px-8 mt-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Want to rank for these queries?
          </h2>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            DealershipAI shows you exactly which queries to target and how to optimize for them
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-black px-10 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all text-[15px]">
              Get Started
            </button>
            <button className="border border-white/20 px-10 py-4 rounded-lg font-semibold hover:bg-white/5 transition-all text-[15px]">
              View Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
