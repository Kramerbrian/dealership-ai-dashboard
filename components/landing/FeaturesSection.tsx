'use client';

import { Bot, Brain, Search, Zap, Shield, BarChart3, Target, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: "ChatGPT Visibility",
    description: "Track how well you appear in ChatGPT responses",
    score: "85.1",
    color: "text-green-600"
  },
  {
    icon: Brain,
    title: "Gemini Performance",
    description: "Monitor your presence in Google's AI",
    score: "78.9",
    color: "text-blue-600"
  },
  {
    icon: Search,
    title: "Perplexity Citations",
    description: "See your search-focused AI visibility",
    score: "74.3",
    color: "text-purple-600"
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Get instant alerts when scores change",
    score: "Live",
    color: "text-orange-600"
  },
  {
    icon: Shield,
    title: "E-E-A-T Analysis",
    description: "Expertise, Experience, Authority, Trust",
    score: "71%",
    color: "text-indigo-600"
  },
  {
    icon: BarChart3,
    title: "Revenue Impact",
    description: "See how visibility affects your bottom line",
    score: "$12K",
    color: "text-green-600"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Complete AI Visibility Intelligence
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track your dealership across all major AI engines with our proprietary AIV™ scoring system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <span className={`text-2xl font-bold ${feature.color}`}>
                      {feature.score}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3-Step Storyboard */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Probe</h4>
              <p className="text-gray-600">
                We scan your website and analyze how AI engines see your content
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Score</h4>
              <p className="text-gray-600">
                Get your AIV™, ATI™, and CRS scores with detailed breakdowns
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Fix</h4>
              <p className="text-gray-600">
                Follow our actionable recommendations to improve your visibility
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
