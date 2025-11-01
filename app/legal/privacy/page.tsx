import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Privacy Policy Page
 * GDPR and CCPA compliant
 */
export default function PrivacyPage() {
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

        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-zinc-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Data We Collect</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              We collect the following types of information:
            </p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li><strong>Account Information:</strong> Name, email, dealership name, location</li>
              <li><strong>Website Data:</strong> Public information from your dealership website</li>
              <li><strong>Usage Data:</strong> How you interact with our dashboard</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store card details)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Data</h2>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li>Provide and improve our services</li>
              <li>Calculate your Trust Score and analytics</li>
              <li>Send transactional emails (welcome, alerts, reports)</li>
              <li>Process payments and manage subscriptions</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Data Sharing</h2>
            <p className="text-zinc-300 leading-relaxed">
              We do not sell or share your personal data with third parties except:
            </p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 mt-2">
              <li>Service providers (hosting, payment processing, email delivery)</li>
              <li>When required by law or to protect our rights</li>
              <li>With your explicit consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Your Rights (GDPR/CCPA)</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li><strong>Access:</strong> Request a copy of all data we hold about you</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing emails (transactional emails cannot be opted out)</li>
            </ul>
            <p className="text-zinc-300 leading-relaxed mt-4">
              To exercise these rights, visit <Link href="/dashboard/settings/data" className="text-purple-400 hover:text-purple-300">Settings → Data</Link> or
              email us at privacy@dealershipai.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Cookie Usage</h2>
            <p className="text-zinc-300 leading-relaxed">
              We use essential cookies for authentication and preferences. We also use analytics cookies
              (Mixpanel, Vercel Analytics) to understand how you use our service. You can manage cookie
              preferences in your browser settings or through our cookie banner.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p className="text-zinc-300 leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide services.
              After account deletion, we retain data for 30 days (grace period for account recovery), then
              permanently delete all personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Security</h2>
            <p className="text-zinc-300 leading-relaxed">
              We implement industry-standard security measures including encryption, secure authentication,
              and regular security audits. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
            <p className="text-zinc-300 leading-relaxed">
              Our service is not intended for users under 13 years of age. We do not knowingly collect
              personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
            <p className="text-zinc-300 leading-relaxed">
              For privacy-related questions or requests:
            </p>
            <ul className="list-none text-zinc-300 space-y-1 mt-2">
              <li>Email: privacy@dealershipai.com</li>
              <li>Address: DealershipAI, Inc., 123 Main St, Suite 100, San Francisco, CA 94105</li>
            </ul>
          </section>

          <section className="pt-8 border-t border-zinc-800">
            <p className="text-zinc-400 text-sm">
              This privacy policy complies with GDPR (EU), CCPA (California), and other applicable data
              protection regulations.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

