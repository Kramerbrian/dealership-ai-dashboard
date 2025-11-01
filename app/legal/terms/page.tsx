import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Terms of Service Page
 */
export default function TermsPage() {
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

        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-zinc-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Service Description</h2>
            <p className="text-zinc-300 leading-relaxed">
              DealershipAI provides AI visibility tracking and analytics services for automotive dealerships.
              Our service analyzes your dealership's presence across AI-powered search engines including
              ChatGPT, Claude, Perplexity, Gemini, Copilot, and Grok.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. User Obligations</h2>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li>Provide accurate dealership information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the service in compliance with all applicable laws</li>
              <li>Not attempt to reverse engineer or exploit the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Payment Terms</h2>
            <p className="text-zinc-300 leading-relaxed">
              Subscription fees are billed monthly in advance. Pro plan: $499/month. Enterprise plan: $999/month.
              Free tier is provided at no cost with limited features. All fees are non-refundable except as
              required by law. You may cancel your subscription at any time; cancellation takes effect at the
              end of the current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Usage</h2>
            <p className="text-zinc-300 leading-relaxed">
              We collect and process data about your dealership's online presence to provide our services.
              This includes public information from your website, Google Business Profile, and other publicly
              available sources. We do not collect or store sensitive personal information unless explicitly
              provided by you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
            <p className="text-zinc-300 leading-relaxed">
              DealershipAI is provided "as is" without warranties of any kind. We are not liable for any
              indirect, incidental, or consequential damages arising from use of the service. Our total
              liability shall not exceed the amount paid by you in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
            <p className="text-zinc-300 leading-relaxed">
              Either party may terminate this agreement at any time. Upon termination, your access to the
              service will cease at the end of your current billing period. We may suspend or terminate
              accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Dispute Resolution</h2>
            <p className="text-zinc-300 leading-relaxed">
              Any disputes arising from these terms shall be resolved through binding arbitration in
              accordance with the rules of the American Arbitration Association.
            </p>
          </section>

          <section className="pt-8 border-t border-zinc-800">
            <p className="text-zinc-400 text-sm">
              If you have questions about these terms, please contact us at legal@dealershipai.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
