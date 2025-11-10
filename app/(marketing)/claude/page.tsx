import { Metadata } from 'next';
import Link from 'next/link';
import { Download, FileCode, GitBranch, Package, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Claude Export - DealershipAI',
  description: 'Download the complete DealershipAI codebase optimized for Claude and Cursor AI assistants.',
};

export default async function ClaudeExportPage() {
  // Get file stats (if available)
  let fileSize = '2.1 MB';
  let lastUpdated = new Date().toISOString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">DealershipAI</h1>
                <p className="text-sm text-slate-400">Claude Export Package</p>
              </div>
            </div>
            <Link
              href="/"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            AI-Optimized Codebase Export
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Complete Project Export
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              For Claude & Cursor
            </span>
          </h1>

          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Download the entire DealershipAI codebase with manifest, documentation,
            and cognitive interface components in one AI-ready package.
          </p>

          {/* Download Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="/claude/dealershipai_claude_export.zip"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50"
              download
            >
              <Download className="h-5 w-5" />
              Download Export ({fileSize})
            </a>

            <a
              href="#handoff-prompt"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all border border-slate-700"
            >
              <FileCode className="h-5 w-5" />
              View Claude Prompt
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">{fileSize}</div>
              <div className="text-sm text-slate-400">Package Size</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">200+</div>
              <div className="text-sm text-slate-400">Source Files</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">v3.0</div>
              <div className="text-sm text-slate-400">Version</div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="container mx-auto px-4 py-16 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            What's Included
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Source Code */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileCode className="h-5 w-5 text-blue-400" />
                Source Code
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><code className="text-sm bg-slate-800 px-2 py-0.5 rounded">app/</code> - Complete Next.js App Router</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><code className="text-sm bg-slate-800 px-2 py-0.5 rounded">components/</code> - React components & cognitive UI</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><code className="text-sm bg-slate-800 px-2 py-0.5 rounded">lib/</code> - Utilities, hooks, adapters</span>
                </li>
              </ul>
            </div>

            {/* Configuration */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-cyan-400" />
                Configuration
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>package.json, tsconfig.json</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Tailwind, Next.js configs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Clerk middleware setup</span>
                </li>
              </ul>
            </div>

            {/* Documentation */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-green-400" />
                Documentation
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>INDEX.md - Quick reference</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>README.md - Setup guide</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>manifest.json - AI guidance</span>
                </li>
              </ul>
            </div>

            {/* Tech Stack */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-400" />
                Tech Stack
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Next.js 14, Clerk, Framer Motion</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Tailwind CSS, Zustand</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Supabase, Upstash Redis</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Claude Handoff Prompt */}
      <section id="handoff-prompt" className="container mx-auto px-4 py-16 border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Claude Handoff Prompt
          </h2>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
            <p className="text-slate-300 mb-4">
              Copy and paste this prompt into Claude to load the project:
            </p>

            <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-200 overflow-x-auto">
              <pre className="whitespace-pre-wrap">
{`Load project from https://dealership-ai-dashboard-r4j5sfxi7-brian-kramer-dealershipai.vercel.app/claude/dealershipai_claude_export.zip

Manifest: /exports/manifest.json

Build cinematic Next.js 14 interface with Clerk + Framer Motion.
Use the cognitive interface patterns in components/cognitive/*.
Maintain brand hue continuity using the useBrandHue hook.`}
              </pre>
            </div>

            <button
              onClick={() => {
                const prompt = `Load project from https://dealership-ai-dashboard-r4j5sfxi7-brian-kramer-dealershipai.vercel.app/claude/dealershipai_claude_export.zip

Manifest: /exports/manifest.json

Build cinematic Next.js 14 interface with Clerk + Framer Motion.
Use the cognitive interface patterns in components/cognitive/*.
Maintain brand hue continuity using the useBrandHue hook.`;
                navigator.clipboard.writeText(prompt);
              }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Copy Prompt
            </button>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-3">
              What Claude Can Help With:
            </h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Build new features for landing and dashboard pages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Extend cognitive interface components</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Add new API endpoints and integrations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Refactor code and optimize performance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Debug issues with full project context</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-400 text-sm">
            <p className="mb-2">
              DealershipAI Cognitive Interface v3.0 • Last Updated: {new Date(lastUpdated).toLocaleDateString()}
            </p>
            <p>
              <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
                Return to Dashboard
              </Link>
              {' • '}
              <a
                href="https://github.com/Kramerbrian/dealership-ai-dashboard"
                className="text-blue-400 hover:text-blue-300 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Repository
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
