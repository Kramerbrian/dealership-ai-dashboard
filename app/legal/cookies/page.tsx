import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Cookie Policy Page
 */
export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
        <p className="text-zinc-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
            <p className="text-zinc-300 leading-relaxed">
              Cookies are small text files stored on your device when you visit our website. They help us
              provide, protect, and improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>

            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 mb-4">
              <h3 className="text-xl font-semibold text-green-400 mb-3">Essential Cookies (Required)</h3>
              <p className="text-zinc-300 leading-relaxed mb-2">
                These cookies are necessary for the website to function properly. They cannot be disabled.
              </p>
              <ul className="list-disc list-inside text-zinc-300 space-y-1">
                <li><strong>Authentication:</strong> Clerk session cookies for user authentication</li>
                <li><strong>Preferences:</strong> Your dashboard settings and preferences</li>
                <li><strong>CSRF Protection:</strong> Security tokens to prevent attacks</li>
              </ul>
            </div>

            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 mb-4">
              <h3 className="text-xl font-semibold text-blue-400 mb-3">Analytics Cookies (Optional)</h3>
              <p className="text-zinc-300 leading-relaxed mb-2">
                These cookies help us understand how you use our service so we can improve it.
              </p>
              <ul className="list-disc list-inside text-zinc-300 space-y-1">
                <li><strong>Mixpanel:</strong> Product analytics and user behavior tracking</li>
                <li><strong>Vercel Analytics:</strong> Web analytics and performance monitoring</li>
                <li><strong>PostHog:</strong> Session replay (Pro+ tiers only)</li>
              </ul>
              <p className="text-zinc-400 text-sm mt-2">
                You can disable these in your <Link href="/dashboard/settings/privacy" className="text-purple-400 hover:text-purple-300">Privacy Settings</Link>.
              </p>
            </div>

            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-amber-400 mb-3">Third-Party Cookies</h3>
              <p className="text-zinc-300 leading-relaxed mb-2">
                These cookies are set by third-party services we use.
              </p>
              <ul className="list-disc list-inside text-zinc-300 space-y-1">
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>Intercom/Crisp:</strong> Customer support chat widget</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              You can manage cookies in several ways:
            </p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li><strong>Cookie Banner:</strong> Accept or reject non-essential cookies when you first visit</li>
              <li><strong>Browser Settings:</strong> Configure cookie preferences in your browser</li>
              <li><strong>Dashboard Settings:</strong> Update preferences in <Link href="/dashboard/settings/privacy" className="text-purple-400 hover:text-purple-300">Settings → Privacy</Link></li>
            </ul>
            <p className="text-zinc-300 leading-relaxed mt-4">
              Note: Disabling essential cookies may prevent certain features from working correctly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Cookie Duration</h2>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain for up to 2 years or until you delete them</li>
              <li><strong>Authentication Cookies:</strong> Valid for 24 hours, refreshed on activity</li>
            </ul>
          </section>

          <section className="pt-8 border-t border-zinc-800">
            <p className="text-zinc-400 text-sm">
              For questions about our cookie usage, contact us at privacy@dealershipai.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

