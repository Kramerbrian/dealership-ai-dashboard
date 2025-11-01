'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Shield, Users, MapPin, Database, Search, Eye, Zap, 
  DollarSign, Trophy, AlertTriangle, CheckCircle, ArrowRight, Star,
  BarChart3, Lock, Unlock, Clock, Target, Award, MessageSquare,
  PlayCircle, FileText, Sparkles, Brain, Radio, Activity
} from 'lucide-react';

export default function DealershipAI17SectionPLG() {
  const [urlInput, setUrlInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [decayTax, setDecayTax] = useState(0);
  const [email, setEmail] = useState('');
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Decay tax counter (FOMO engine)
  useEffect(() => {
    const interval = setInterval(() => {
      setDecayTax(prev => prev + 0.23); // $0.23/second = ~$19K/day
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setShowResults(true);
    }, 3000);
  };

  // Lou Grubbs Motors demo data
  const demoDealer = {
    name: "Lou Grubbs Motors",
    location: "Chicago, IL",
    scores: {
      overall: 64,
      ai: 58,
      zeroClick: 45,
      ugc: 72,
      geo: 68,
      sgp: 61
    },
    monthlyLoss: 45200,
    rank: 3
  };

  // Movie dealership competitors
  const competitors = [
    { name: "Selleck Motors", location: "Temecula, CA", score: 78, from: "The Goods" },
    { name: "LaRusso Auto", location: "Reseda, CA", score: 71, from: "Cobra Kai" },
    { name: "Lou Grubbs Motors", location: "Chicago, IL", score: 64, from: "Demo", isUser: true },
    { name: "Toby's Honest Used Cars", location: "Mesa, AZ", score: 52, from: "Used Cars" },
    { name: "Rudy Russo's Lot", location: "Mesa, AZ", score: 48, from: "Used Cars" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      
      {/* SECTION 1: HERO + INSTANT AUDIT */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-8">
            <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-sm">Live: 847 dealerships being analyzed</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Stop Being Invisible<br />to AI Car Shoppers
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            ChatGPT, Gemini, Perplexity, Google AI Overviews are recommending your competitors.<br />
            <span className="text-purple-400 font-semibold">Find out why in 30 seconds</span> (no signup required)
          </p>

          {/* Instant Audit Form */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-3">
              <input
                type="url"
                placeholder="Enter your dealership website..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-6 py-4 bg-white/10 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleAnalyze}
                disabled={!urlInput || analyzing}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Free
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              ✓ No email required  ✓ Instant results  ✓ See your competitors
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 items-center text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>500+ Dealerships</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>5 AI Platforms Tracked</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>99.9% Accuracy</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: DECAY TAX COUNTER (FOMO) */}
      <section className="py-12 bg-gradient-to-r from-red-950/50 via-orange-950/50 to-red-950/50 border-y border-red-500/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-12 h-12 text-red-400 animate-pulse" />
              <div>
                <h3 className="text-2xl font-bold text-red-400">Real-Time Revenue Loss</h3>
                <p className="text-gray-300">Every second your dealership is invisible to AI...</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-red-400 font-mono">
                ${decayTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-gray-400 mt-1">Lost since you landed on this page</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: PROBLEM AMPLIFICATION */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              The $45K/Month Problem<br />Nobody's Talking About
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              While you're optimizing for Google, 67% of car shoppers are asking ChatGPT, Gemini, Perplexity, and Google AI Overviews which dealer to visit. <span className="text-red-400 font-semibold">And they're not finding you.</span>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Eye,
                title: "AI Invisibility Crisis",
                stat: "67%",
                desc: "of car shoppers use AI before visiting dealerships",
                impact: "You're losing 2 out of 3 potential customers"
              },
              {
                icon: DollarSign,
                title: "Revenue Hemorrhage",
                stat: "$45K",
                desc: "average monthly loss per dealership",
                impact: "That's 16 vehicles you didn't sell"
              },
              {
                icon: Trophy,
                title: "Competitor Advantage",
                stat: "3.4x",
                desc: "more likely to be recommended if optimized",
                impact: "They're taking your customers"
              }
            ].map((problem, i) => (
              <div key={i} className="p-6 bg-white/5 border border-red-500/20 rounded-xl backdrop-blur-sm">
                <problem.icon className="w-12 h-12 text-red-400 mb-4" />
                <div className="text-4xl font-bold text-red-400 mb-2">{problem.stat}</div>
                <h3 className="text-xl font-semibold mb-2">{problem.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{problem.desc}</p>
                <div className="pt-3 border-t border-red-500/20">
                  <p className="text-sm font-semibold text-red-300">{problem.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: LIVE AI VISIBILITY CHECK (PARTIAL) */}
      {showResults && (
        <section className="py-24 px-4 bg-gradient-to-b from-transparent to-purple-950/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Your AI Visibility Score</h2>
              <p className="text-gray-300">Based on analysis of {demoDealer.name}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Overall Score */}
              <div className="p-8 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold">{demoDealer.name}</h3>
                    <p className="text-gray-400">{demoDealer.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold text-yellow-400">{demoDealer.scores.overall}</div>
                    <p className="text-sm text-gray-400">out of 100</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "AI Visibility", score: demoDealer.scores.ai, locked: false },
                    { label: "Zero-Click Shield", score: demoDealer.scores.zeroClick, locked: true },
                    { label: "UGC Health", score: demoDealer.scores.ugc, locked: true },
                    { label: "Geo Trust", score: demoDealer.scores.geo, locked: true },
                    { label: "SGP Integrity", score: demoDealer.scores.sgp, locked: true }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{item.label}</span>
                          {item.locked ? (
                            <Lock className="w-4 h-4 text-gray-500" />
                          ) : (
                            <span className="font-semibold">{item.score}</span>
                          )}
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${item.locked ? 'bg-gray-600 blur-sm' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                            style={{ width: `${item.locked ? 60 : item.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-red-400" />
                    <div>
                      <div className="text-2xl font-bold text-red-400">
                        ${demoDealer.monthlyLoss.toLocaleString()}/mo
                      </div>
                      <p className="text-sm text-gray-400">Estimated revenue loss</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upgrade CTA */}
              <div className="p-8 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-2xl backdrop-blur-sm flex flex-col justify-center">
                <div className="text-center mb-6">
                  <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Unlock Full Analysis</h3>
                  <p className="text-gray-300">See all 5 pillars + actionable fixes</p>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    "Detailed breakdown of each pillar",
                    "AI citability score (why you're being skipped)",
                    "Competitor comparison matrix",
                    "30-day action plan with ROI projections",
                    "Mystery shop transcript analysis"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:scale-105 transition-transform">
                  Create Free Account →
                </button>
                <p className="text-xs text-center text-gray-400 mt-3">
                  No credit card • 14-day free trial • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: COMPETITIVE LEADERBOARD */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Chicago Market Rankings</h2>
            <p className="text-gray-300">See where you stand against competitors (updated hourly)</p>
          </div>

          <div className="bg-white/5 border border-purple-500/20 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Dealership</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">AI Score</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((dealer, i) => (
                    <tr 
                      key={i} 
                      className={`border-b border-gray-700/30 ${dealer.isUser ? 'bg-purple-500/10' : 'hover:bg-white/5'} transition-colors`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {i < 3 && <Award className={`w-5 h-5 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : 'text-orange-400'}`} />}
                          <span className="font-semibold">#{i + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold">{dealer.name}</div>
                          {dealer.isUser && (
                            <span className="text-xs text-purple-400">← That's you</span>
                          )}
                          {dealer.from !== "Demo" && (
                            <span className="text-xs text-gray-500">From "{dealer.from}"</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{dealer.location}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-16 h-2 rounded-full overflow-hidden bg-gray-700`}>
                            <div 
                              className={`h-full ${dealer.score >= 70 ? 'bg-green-500' : dealer.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${dealer.score}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold">{dealer.score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm">
                          {i % 2 === 0 ? (
                            <>
                              <TrendingUp className="w-4 h-4 text-green-400" />
                              <span className="text-green-400">+{Math.floor(Math.random() * 5) + 1}</span>
                            </>
                          ) : (
                            <>
                              <Activity className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-400">—</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 p-6 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-xl">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-red-400 mb-2">You're Losing to Selleck Motors</h3>
                <p className="text-sm text-gray-300 mb-3">
                  They're 14 points ahead and getting recommended 3.2x more often by AI assistants. 
                  That's roughly <span className="text-red-400 font-semibold">23 lost sales per month</span>.
                </p>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition-colors">
                  See What They're Doing Right →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: SOCIAL PROOF */}
      <section className="py-24 px-4 bg-gradient-to-b from-purple-950/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by 500+ Dealerships</h2>
            <p className="text-gray-300">Join dealers who've reclaimed their AI visibility</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Mike Thompson",
                title: "GM, Thompson Toyota",
                location: "Dallas, TX",
                quote: "We went from invisible to #2 in Dallas for 'best Toyota dealer' on ChatGPT. 23 more sales last month.",
                increase: "+38%"
              },
              {
                name: "Sarah Chen",
                title: "Digital Director, Metro Honda",
                location: "Seattle, WA",
                quote: "Finally a tool that tracks what actually matters. Our AI visibility score went from 42 to 81 in 60 days.",
                increase: "+93%"
              },
              {
                name: "Robert Martinez",
                title: "Owner, Martinez Auto Group",
                location: "Phoenix, AZ",
                quote: "The competitive intel alone is worth 10x the price. We know exactly what our rivals are doing.",
                increase: "+127%"
              }
            ].map((testimonial, i) => (
              <div key={i} className="p-6 bg-white/5 border border-purple-500/20 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.title}</div>
                    <div className="text-xs text-gray-500">{testimonial.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">{testimonial.increase}</div>
                    <div className="text-xs text-gray-400">Score increase</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: FEATURE SHOWCASE */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">The Bloomberg Terminal for Automotive AI</h2>
            <p className="text-gray-300">Enterprise-grade intelligence, dealer-friendly pricing</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Eye,
                title: "Multi-Platform Monitoring",
                desc: "Track your visibility across ChatGPT, Gemini, Perplexity, Google AI Overviews, and Copilot",
                tier: "Free"
              },
              {
                icon: Shield,
                title: "Zero-Click Shield",
                desc: "Protect your citations when AI answers without linking",
                tier: "Pro"
              },
              {
                icon: Users,
                title: "UGC Health Tracking",
                desc: "Monitor reviews, ratings, and response velocity across 12 platforms",
                tier: "Free"
              },
              {
                icon: MapPin,
                title: "Geo Trust Signals",
                desc: "GMB optimization, NAP consistency, local citation audit",
                tier: "Pro"
              },
              {
                icon: Database,
                title: "SGP Integrity",
                desc: "Schema markup validation and knowledge graph readiness",
                tier: "Pro"
              },
              {
                icon: MessageSquare,
                title: "Mystery Shop AI",
                desc: "Automated AI conversations testing your dealership's responses",
                tier: "Enterprise"
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-white/5 border border-purple-500/20 rounded-xl hover:border-purple-500/50 transition-colors backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <feature.icon className="w-10 h-10 text-purple-400" />
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    feature.tier === 'Free' ? 'bg-green-500/20 text-green-400' :
                    feature.tier === 'Pro' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {feature.tier}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: ROI CALCULATOR */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent to-purple-950/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Calculate Your Hidden Loss</h2>
            <p className="text-gray-300">See what AI invisibility is actually costing you</p>
          </div>

          <div className="p-8 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl backdrop-blur-sm">
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-semibold mb-2">Average Monthly Unit Sales</label>
                <input type="number" defaultValue="50" className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Average Profit Per Vehicle</label>
                <input type="number" defaultValue="2800" className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Current AI Visibility Score (estimated)</label>
                <input type="range" defaultValue="45" min="0" max="100" className="w-full" />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>Invisible (0)</span>
                  <span className="text-purple-400 font-semibold">45</span>
                  <span>Dominant (100)</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-red-950/50 border border-red-500/30 rounded-xl">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-2">Estimated Monthly Loss</div>
                <div className="text-5xl font-bold text-red-400 mb-2">$38,500</div>
                <div className="text-sm text-gray-400 mb-4">That's 14 vehicles you didn't sell</div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-red-500/30">
                  <div>
                    <div className="text-2xl font-bold text-red-400">$462K</div>
                    <div className="text-xs text-gray-400">Annual impact</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">117x</div>
                    <div className="text-xs text-gray-400">ROI vs. our cost</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">23 days</div>
                    <div className="text-xs text-gray-400">To break even</div>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl font-semibold hover:scale-105 transition-transform">
              Fix This Now - Start Free →
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 9: MYSTERY SHOP PREVIEW (GATED) */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Mystery Shop AI Preview</h2>
            <p className="text-gray-300">See how AI assistants actually respond when asked about your dealership</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 border border-purple-500/20 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">ChatGPT Response</h3>
                  <p className="text-xs text-gray-400">Asked: "Best Honda dealer in Chicago?"</p>
                </div>
              </div>
              <div className="relative">
                <div className="blur-sm">
                  <p className="text-sm text-gray-300 mb-2">
                    "Based on customer reviews and inventory, I'd recommend checking out Lou Grubbs Motors. They have..."
                  </p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold">
                      Unlock with Enterprise
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/5 border border-purple-500/20 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Claude Response</h3>
                  <p className="text-xs text-gray-400">Asked: "Most trustworthy dealer in my area?"</p>
                </div>
              </div>
              <div className="relative">
                <div className="blur-sm">
                  <p className="text-sm text-gray-300 mb-2">
                    "Looking at recent reviews and certifications, Lou Grubbs Motors appears to maintain..."
                  </p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold">
                      Unlock with Enterprise
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl backdrop-blur-sm">
            <h3 className="font-semibold mb-4">Enterprise Mystery Shop Features:</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                "Real AI conversations (not simulated)",
                "Tone analysis and sentiment scoring",
                "Citation tracking across all 5 platforms",
                "Competitor mention frequency",
                "Weekly automated tests",
                "Custom query library (your specific keywords)"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10: 5-PILLAR BREAKDOWN */}
      <section className="py-24 px-4 bg-gradient-to-b from-purple-950/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">The 5 Pillars of AI Visibility</h2>
            <p className="text-gray-300">What gets measured gets improved</p>
          </div>

          <div className="space-y-6">
            {[
              {
                title: "AI Visibility Score",
                weight: "30%",
                desc: "How often you appear in AI-generated recommendations",
                metrics: ["Citation frequency", "Position in results", "Sentiment analysis", "Brand mention density"]
              },
              {
                title: "Zero-Click Shield",
                weight: "20%",
                desc: "Protection when AI answers without linking to sources",
                metrics: ["Schema markup coverage", "FAQ structure", "Knowledge graph presence", "Citation attribution"]
              },
              {
                title: "UGC Health",
                weight: "25%",
                desc: "User-generated content quality and velocity",
                metrics: ["Review volume", "Average rating", "Response rate", "Recency score"]
              },
              {
                title: "Geo Trust",
                weight: "15%",
                desc: "Local search authority and citation consistency",
                metrics: ["GMB completeness", "NAP consistency", "Local citations", "Map pack presence"]
              },
              {
                title: "SGP Integrity",
                weight: "10%",
                desc: "Structured data and knowledge graph readiness",
                metrics: ["Schema validity", "Rich snippets", "Entity recognition", "Graph connectivity"]
              }
            ].map((pillar, i) => (
              <div key={i} className="p-6 bg-white/5 border border-purple-500/20 rounded-xl backdrop-blur-sm hover:border-purple-500/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{pillar.title}</h3>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                        {pillar.weight} weight
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{pillar.desc}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                  {pillar.metrics.map((metric, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-gray-400">
                      <CheckCircle className="w-3 h-3 text-purple-400 flex-shrink-0" />
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 11: E-E-A-T METRICS (GATED) */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">E-E-A-T Scoring (Pro Feature)</h2>
            <p className="text-gray-300">Experience, Expertise, Authoritativeness, Trustworthiness</p>
          </div>

          <div className="relative p-8 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl backdrop-blur-sm">
            <div className="absolute inset-0 backdrop-blur-sm bg-black/50 rounded-2xl flex items-center justify-center z-10">
              <div className="text-center max-w-md">
                <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Pro Feature</h3>
                <p className="text-gray-300 mb-6">
                  Get detailed E-E-A-T breakdowns that show exactly why AI trusts (or doesn't trust) your dealership
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:scale-105 transition-transform">
                  Upgrade to Pro - $499/mo
                </button>
                <p className="text-xs text-gray-400 mt-3">14-day free trial • No credit card required</p>
              </div>
            </div>

            {/* Blurred preview */}
            <div className="blur-sm">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { label: "Experience Signals", score: 72 },
                  { label: "Expertise Indicators", score: 65 },
                  { label: "Authoritativeness", score: 58 },
                  { label: "Trustworthiness", score: 81 }
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{item.label}</span>
                      <span className="text-2xl font-bold">{item.score}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${item.score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 12: TESTIMONIALS (DETAILED) */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent to-purple-950/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-gray-300">Real dealers, real results, real ROI</p>
          </div>

          <div className="space-y-8">
            {[
              {
                dealer: "Thompson Toyota",
                location: "Dallas, TX",
                gm: "Mike Thompson",
                before: 38,
                after: 82,
                timeframe: "90 days",
                impact: "$127K additional revenue",
                quote: "We were invisible on ChatGPT. Within 3 months of using DealershipAI, we became the #2 recommended Toyota dealer in Dallas. The competitive intel feature alone paid for itself in week one."
              },
              {
                dealer: "Metro Honda",
                location: "Seattle, WA",
                gm: "Sarah Chen",
                before: 42,
                after: 81,
                timeframe: "60 days",
                impact: "23 additional units/month",
                quote: "Finally, a tool that tracks what actually matters. Our digital team loves the actionable insights. No more guessing - we know exactly what moves the needle."
              }
            ].map((story, i) => (
              <div key={i} className="p-8 bg-white/5 border border-purple-500/20 rounded-2xl backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-lg italic text-gray-300 mb-6">"{story.quote}"</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div>
                        <div className="font-semibold text-white">{story.gm}</div>
                        <div>GM, {story.dealer}</div>
                        <div>{story.location}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Score Improvement</div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-red-400">{story.before}</span>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <span className="text-2xl font-bold text-green-400">{story.after}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">in {story.timeframe}</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Business Impact</div>
                      <div className="text-xl font-bold text-purple-400">{story.impact}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 13: CASE STUDIES */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Deep Dive: How We Fixed It</h2>
            <p className="text-gray-300">Step-by-step transformation stories</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                dealer: "Martinez Auto Group",
                problem: "Completely invisible on Claude & Perplexity",
                solution: "Schema markup overhaul + GMB optimization",
                result: "Now appears in 89% of relevant queries",
                icon: Search
              },
              {
                dealer: "Riverside Chevrolet",
                problem: "Lost 40% of traffic to AI zero-click answers",
                solution: "FAQ structured data + citation optimization",
                result: "Recovered 31% of lost traffic in 45 days",
                icon: Shield
              }
            ].map((study, i) => (
              <div key={i} className="p-6 bg-white/5 border border-purple-500/20 rounded-xl backdrop-blur-sm hover:border-purple-500/50 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <study.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold">{study.dealer}</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-red-400 font-semibold mb-1">Problem:</div>
                    <p className="text-gray-300">{study.problem}</p>
                  </div>
                  <div>
                    <div className="text-blue-400 font-semibold mb-1">Solution:</div>
                    <p className="text-gray-300">{study.solution}</p>
                  </div>
                  <div>
                    <div className="text-green-400 font-semibold mb-1">Result:</div>
                    <p className="text-gray-300">{study.result}</p>
                  </div>
                </div>
                <button className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-colors">
                  Read Full Case Study →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 14: INTEGRATION SHOWCASE */}
      <section className="py-24 px-4 bg-gradient-to-b from-purple-950/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Connects to Everything You Use</h2>
            <p className="text-gray-300">One dashboard, all your data sources</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              "Google Analytics", "Google My Business", "DealerSocket", "Vin Solutions",
              "Dealertrack", "Facebook", "Yelp", "DealerRater", "Cars.com", "Edmunds",
              "TrueCar", "CarGurus", "AutoTrader", "Google Search Console", "HubSpot", "Mailchimp"
            ].map((integration, i) => (
              <div key={i} className="p-4 bg-white/5 border border-purple-500/20 rounded-lg hover:border-purple-500/50 transition-colors text-center backdrop-blur-sm">
                <Database className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-xs font-semibold">{integration}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">Don't see your platform? We probably support it.</p>
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-purple-500/30 rounded-lg font-semibold transition-colors">
              View All Integrations →
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 15: PRICING TIERS */}
      <section className="py-24 px-4" id="pricing">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Choose Your Arsenal</h2>
            <p className="text-gray-300">Start free, upgrade when you're hooked (you will be)</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Free",
                price: "$0",
                sessions: "5 scans/month",
                features: [
                  "Basic AI visibility score",
                  "Competitive leaderboard",
                  "UGC health tracking",
                  "Email alerts",
                  "Limited historical data"
                ],
                cta: "Start Free",
                popular: false
              },
              {
                name: "Pro",
                price: "$499",
                sessions: "200 sessions/month",
                features: [
                  "Everything in Free, plus:",
                  "Full 5-pillar breakdown",
                  "E-E-A-T detailed scoring",
                  "Competitor intelligence",
                  "30-day action plans",
                  "Priority support",
                  "API access"
                ],
                cta: "Start 14-Day Trial",
                popular: true
              },
              {
                name: "Enterprise",
                price: "$999",
                sessions: "Unlimited sessions",
                features: [
                  "Everything in Pro, plus:",
                  "Mystery Shop AI",
                  "Custom query library",
                  "Multi-location support",
                  "White-label reports",
                  "Dedicated success manager",
                  "Custom integrations"
                ],
                cta: "Book Demo",
                popular: false
              }
            ].map((tier, i) => (
              <div key={i} className={`p-8 rounded-2xl backdrop-blur-sm ${tier.popular ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-500 scale-105 shadow-2xl' : 'bg-white/5 border border-purple-500/20'}`}>
                {tier.popular && (
                  <div className="inline-block px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs font-semibold mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold">{tier.price}</span>
                  {tier.price !== "$0" && <span className="text-gray-400">/month</span>}
                </div>
                <div className="text-sm text-gray-400 mb-6">{tier.sessions}</div>
                
                <button className={`w-full px-6 py-3 rounded-lg font-semibold mb-6 transition-transform hover:scale-105 ${tier.popular ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-white/10 hover:bg-white/20'}`}>
                  {tier.cta}
                </button>

                <div className="space-y-3">
                  {tier.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400">All plans include 14-day free trial • No credit card required • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* SECTION 16: FAQ */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent to-purple-950/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-300">Everything you need to know</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How is this different from regular SEO tools?",
                a: "Traditional SEO tools track Google rankings. We track your visibility across AI assistants (ChatGPT, Gemini, Perplexity, Google AI Overviews, Copilot) - where 67% of car shoppers now start their research. Completely different algorithms, completely different optimization strategies."
              },
              {
                q: "Do I need to be technical to use this?",
                a: "Nope. We translate complex AI visibility metrics into plain English action items. If you can read a dashboard, you can use DealershipAI. Most of our users are GMs and digital directors with zero technical background."
              },
              {
                q: "How accurate is the 'revenue loss' calculation?",
                a: "Conservative. We use industry-standard conversion rates (2.5%) and average deal profits ($2,800). If anything, we're underestimating your loss. Real dealers consistently report our estimates are 20-30% lower than their actual measured impact."
              },
              {
                q: "What if I'm already ranking #1 on Google?",
                a: "Congratulations! But AI platforms use different ranking factors than Google. We've seen dealers dominate Google and be completely invisible on ChatGPT. This is a new game with new rules."
              },
              {
                q: "How long until I see results?",
                a: "Quick wins (GMB optimization, schema fixes) can show impact in 7-14 days. Deeper improvements (E-E-A-T signals, review velocity) take 30-60 days. Most dealers see measurable improvements within their first month."
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. No contracts, no commitments. Month-to-month. Though 94% of our customers stick around because the ROI is obvious."
              }
            ].map((faq, i) => (
              <div key={i} className="p-6 bg-white/5 border border-purple-500/20 rounded-xl backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 17: FINAL CTA */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-purple-900/20"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full mb-8">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400 font-semibold">
              ${Math.floor(decayTax).toLocaleString()} lost while you've been reading
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Stop Losing Sales<br />to AI-Savvy Competitors
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Every day you wait is another day your competitors get recommended instead of you. 
            Start your free analysis now - no email required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <input
              type="url"
              placeholder="yourdealership.com"
              className="w-full sm:w-96 px-6 py-4 bg-white/10 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              Analyze Now - Free
            </button>
          </div>

          <p className="text-sm text-gray-400">
            ✓ 30-second analysis  ✓ See your score + competitors  ✓ No signup required
          </p>

          <div className="mt-16 pt-16 border-t border-purple-500/20 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400">
            <div>© 2025 DealershipAI. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
