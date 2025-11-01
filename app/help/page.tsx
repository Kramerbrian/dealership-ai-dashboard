import React from 'react';
import { Search, BookOpen, MessageCircle, Video, FileText } from 'lucide-react';
import Link from 'next/link';

/**
 * Help Center / Knowledge Base
 */
export default function HelpPage() {
  const categories = [
    {
      name: 'Getting Started',
      icon: BookOpen,
      articles: [
        { slug: 'what-is-trust-score', title: 'What is Trust Score?' },
        { slug: 'how-is-score-calculated', title: 'How is my score calculated?' },
        { slug: 'understanding-pillars', title: 'What are the 4 pillars?' },
        { slug: 'understanding-40-hacks', title: 'Understanding the 40 Hacks' },
      ],
    },
    {
      name: 'Improving Your Score',
      icon: FileText,
      articles: [
        { slug: 'quick-wins', title: 'Quick wins under 1 hour' },
        { slug: 'fix-schema-markup', title: 'How to fix schema markup' },
        { slug: 'improve-review-management', title: 'Improving review management' },
        { slug: 'competitive-analysis', title: 'Competitive analysis guide' },
      ],
    },
    {
      name: 'Features',
      icon: Video,
      articles: [
        { slug: 'using-agent', title: 'Using the AI agent' },
        { slug: 'mystery-shop', title: 'Mystery Shop insights' },
        { slug: 'one-click-fixes', title: 'One-click fixes (Enterprise)' },
        { slug: 'exporting-reports', title: 'Exporting reports' },
      ],
    },
    {
      name: 'Billing',
      icon: FileText,
      articles: [
        { slug: 'how-pricing-works', title: 'How pricing works' },
        { slug: 'upgrading-plan', title: 'Upgrading your plan' },
        { slug: 'canceling-subscription', title: 'Canceling your subscription' },
        { slug: 'viewing-invoices', title: 'Viewing invoices' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Help Center</h1>
          <p className="text-xl text-zinc-400 mb-8">
            Find answers and learn how to use DealershipAI
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {categories.map((category) => (
            <div
              key={category.name}
              className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <category.icon className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">{category.name}</h2>
              </div>
              <ul className="space-y-2">
                {category.articles.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/help/${category.name.toLowerCase().replace(' ', '-')}/${article.slug}`}
                      className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <span className="text-purple-400">→</span>
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Support Options */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Still Need Help?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <MessageCircle className="w-6 h-6 text-cyan-400 mb-2" />
              <h3 className="font-semibold text-white mb-1">Live Chat</h3>
              <p className="text-sm text-zinc-400">
                Chat with our support team (business hours)
              </p>
            </div>
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <FileText className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="font-semibold text-white mb-1">Submit Ticket</h3>
              <p className="text-sm text-zinc-400">
                We'll respond within 24-48 hours
              </p>
            </div>
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <Video className="w-6 h-6 text-amber-400 mb-2" />
              <h3 className="font-semibold text-white mb-1">Video Tutorials</h3>
              <p className="text-sm text-zinc-400">
                Watch step-by-step guides
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

