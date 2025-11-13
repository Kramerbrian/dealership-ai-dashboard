"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import DecayBanner from "@/components/plg/DecayBanner";
import SessionCounter from "@/components/plg/SessionCounter";
import GeoPoolingDemo from "@/components/plg/GeoPoolingDemo";
import LiveActivityFeed from "@/components/plg/LiveActivityFeed";

const InstantAnalyzer = dynamic(
  () => import("@/components/plg/InstantAnalyzer"),
  { ssr: false }
);

export default function InstantScanPage() {
  const [dealer, setDealer] = useState("");
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState(3);

  useEffect(() => {
    const saved = Number(localStorage.getItem("plg_scans_left") || "3");
    setLeft(saved);
  }, []);

  const run = () => {
    if (left === 0) {
      // Redirect to sign up
      window.location.href = "/sign-up";
      return;
    }

    const next = Math.max(0, left - 1);
    setLeft(next);
    localStorage.setItem("plg_scans_left", String(next));
    setOpen(true);
  };

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <DecayBanner />

      {/* Header */}
      <header className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white grid place-items-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-lg font-bold">DealershipAI</div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Home
            </Link>
            <Link
              href="/fleet"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Fleet Manager
            </Link>
            <Link
              href="/dash"
              className="text-sm px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 grid place-items-center p-6 py-20">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              See how trusted your dealership looks to AI — in 3 seconds
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Run a zero-click + AI visibility scan. Get a score out of 100, see
              your revenue at risk, and trigger fixes instantly.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <input
                className="flex-1 rounded-xl border-2 border-gray-200 focus:border-blue-500 px-4 py-3 outline-none transition-colors"
                placeholder="https://yourdealership.com"
                value={dealer}
                onChange={(e) => setDealer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && run()}
              />
              <button
                onClick={run}
                disabled={!dealer.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                <Zap className="w-5 h-5" />
                Run 3-sec Scan
              </button>
            </div>

            <div className="flex items-center justify-between">
              <SessionCounter count={left} />
              <Link
                href={`/dash?dealer=${encodeURIComponent(
                  dealer || "demo-dealer"
                )}`}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Or view full dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {left === 0 && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <p className="text-sm text-amber-900">
                  You've used all your free scans.{" "}
                  <Link
                    href="/sign-up"
                    className="font-semibold underline hover:text-amber-700"
                  >
                    Sign up for unlimited access
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold mb-2">Zero-Click Analysis</h3>
              <p className="text-sm text-gray-600">
                See how often your dealership appears in AI-powered search
                results without needing a click.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-bold mb-2">AI Visibility Score</h3>
              <p className="text-sm text-gray-600">
                Test your visibility across ChatGPT, Claude, Perplexity, and
                Gemini in real-time.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-bold mb-2">Revenue Impact</h3>
              <p className="text-sm text-gray-600">
                Quantify revenue at risk from poor AI visibility and get instant
                fix recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {open && (
        <InstantAnalyzer
          dealer={dealer || "demo-dealer"}
          onClose={() => setOpen(false)}
        />
      )}

      {/* Social Proof */}
      <section className="py-8 bg-white/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-sm text-gray-500 mb-2">
              Trusted by dealerships nationwide
            </div>
            <div className="flex items-center justify-center gap-8 text-gray-400">
              <div className="text-lg font-semibold">Toyota</div>
              <div className="text-lg font-semibold">Honda</div>
              <div className="text-lg font-semibold">VW</div>
              <div className="text-lg font-semibold">Hyundai</div>
              <div className="text-lg font-semibold">Ford</div>
            </div>
          </div>
        </div>
      </section>

      {/* Geo Pooling Demo */}
      <section className="py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">
            How Geo-Pooling Beats Price Swings
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Distribute OEM price shocks across a market cohort. See how fixed
            costs amortize as network size grows.
          </p>
        </div>
        <GeoPoolingDemo />
      </section>

      {/* Live Activity Feed */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Real Results, Real Time</h2>
          <p className="text-gray-600">
            See what dealerships are achieving with DealershipAI
          </p>
        </div>
        <LiveActivityFeed />
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">
            Ready to boost your AI visibility?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of dealerships using DealershipAI to dominate
            zero-click search and AI recommendations.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/dash"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-700 text-white rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors"
            >
              View Demo Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto p-6 text-sm text-gray-600">
          <div className="flex justify-between items-center mb-4">
            <div>© {new Date().getFullYear()} DealershipAI</div>
            <div className="flex gap-4">
              <Link href="/" className="hover:text-gray-900">
                Home
              </Link>
              <Link href="#" className="hover:text-gray-900">
                Privacy
              </Link>
              <Link href="#" className="hover:text-gray-900">
                Terms
              </Link>
              <Link href="/fleet" className="hover:text-gray-900">
                Fleet Manager
              </Link>
            </div>
          </div>
          <div className="text-xs text-gray-500 text-center">
            AI-powered dealership visibility platform. Boost your presence across
            ChatGPT, Claude, Perplexity, and more.
          </div>
        </div>
      </footer>
    </main>
  );
}
