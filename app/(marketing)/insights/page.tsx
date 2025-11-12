import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Calendar, ArrowRight, Rss } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Visibility Insights | DealershipAI',
  description: 'Research, analysis, and insights on AI search optimization (AEO/GEO) for automotive dealerships.',
  alternates: {
    types: {
      'application/rss+xml': '/insights/feed.xml',
    },
  },
};

const insights = [
  {
    slug: 'why-ai-visibility-isnt-seo',
    title: 'Why Treating ChatGPT Like Google Will Guarantee Your Failure',
    excerpt: 'The fundamental differences between AI search optimization (AEO/GEO) and traditional SEO. Why RAG, reranking, and probabilistic systems require new frameworks.',
    date: '2025-01-31',
    readTime: '15 min',
    tags: ['AEO/GEO', 'RAG Systems', 'AI Search'],
  },
];

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link 
            href="/" 
            className="inline-block mb-6 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            ← Back to DealershipAI
          </Link>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/30">
                <BookOpen className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">AI Visibility Insights</h1>
                <p className="text-zinc-400 text-lg">
                  Research, analysis, and frameworks for the new era of AI search
                </p>
              </div>
            </div>
            <a
              href="/insights/feed.xml"
              className="px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600/50 text-sm text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
              title="Subscribe to RSS feed"
            >
              <Rss className="w-4 h-4" />
              RSS Feed
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid gap-8">
          {insights.map((insight) => (
            <Link
              key={insight.slug}
              href={`/insights/${insight.slug}`}
              className="group block p-8 rounded-2xl bg-zinc-800/30 border border-zinc-700/50 hover:border-zinc-600/50 transition-all hover:bg-zinc-800/40"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    {insight.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-medium border border-blue-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
                    {insight.title}
                  </h2>
                  <p className="text-zinc-400 mb-4 leading-relaxed">
                    {insight.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(insight.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <span>•</span>
                    <span>{insight.readTime} read</span>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-16 p-8 rounded-2xl bg-zinc-800/20 border border-zinc-700/30 text-center">
          <p className="text-zinc-400 mb-2">More insights coming soon</p>
          <p className="text-sm text-zinc-500">
            We're continuously researching AI search systems and will share our findings here.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-zinc-400 text-sm">
          <p>© 2025 DealershipAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

