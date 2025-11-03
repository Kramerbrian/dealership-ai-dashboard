import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | DealershipAI',
  description: 'Terms and conditions for using DealershipAI services',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-400 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using DealershipAI ("Service"), you accept and agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Service Description</h2>
              <p className="mb-4">
                DealershipAI provides AI-powered analytics, insights, and tools for automotive dealerships including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Digital Trust & Reputation Intelligence (DTRI) scoring</li>
                <li>AI Visibility (AIV) tracking across AI platforms</li>
                <li>E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) analysis</li>
                <li>Marketing analytics and recommendations</li>
                <li>Customer engagement insights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
              <p className="mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring your account information is accurate and current</li>
                <li>Notifying us immediately of any unauthorized account access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Acceptable Use</h2>
              <p className="mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to any systems or networks</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Reverse engineer, decompile, or disassemble any aspect of the Service</li>
                <li>Remove, circumvent, or alter any security features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Subscription and Payment</h2>
              <p className="mb-4">
                Subscription fees are billed in advance on a monthly or annual basis. You authorize us to charge your
                payment method for all fees owed. Subscriptions automatically renew unless cancelled before the
                renewal date. No refunds are provided for partial subscription periods.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Data and Privacy</h2>
              <p className="mb-4">
                We collect and process data as described in our <Link href="/legal/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>.
                By using the Service, you consent to such collection and processing. You retain ownership of your
                dealership data, and we will not sell your data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Intellectual Property</h2>
              <p className="mb-4">
                The Service and its original content, features, and functionality are owned by DealershipAI and are
                protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                Our trademarks may not be used without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. AI-Generated Content</h2>
              <p className="mb-4">
                DealershipAI uses artificial intelligence to generate insights, recommendations, and analysis. While we
                strive for accuracy, AI-generated content may contain errors or inaccuracies. You are responsible for
                verifying and validating any information before acting on it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Service Availability</h2>
              <p className="mb-4">
                We strive to provide 99.9% uptime but do not guarantee uninterrupted access. We reserve the right to
                modify, suspend, or discontinue any part of the Service at any time with or without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Limitation of Liability</h2>
              <p className="mb-4">
                To the maximum extent permitted by law, DealershipAI shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred
                directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your use or inability to use the Service</li>
                <li>Any unauthorized access to or use of our servers</li>
                <li>Any interruption or cessation of transmission to or from the Service</li>
                <li>Any bugs, viruses, or other harmful code transmitted through the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless DealershipAI from any claims, damages, losses,
                liabilities, and expenses arising out of your use of the Service, violation of these Terms, or
                infringement of any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Termination</h2>
              <p className="mb-4">
                We may terminate or suspend your account immediately, without prior notice, for any reason including
                violation of these Terms. Upon termination, your right to use the Service will immediately cease.
                You may cancel your subscription at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of material changes via
                email or through the Service. Continued use of the Service after changes constitutes acceptance of
                the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Governing Law</h2>
              <p>
                These Terms shall be governed by the laws of the United States and the State of Delaware, without
                regard to conflict of law principles. Any disputes shall be resolved in the courts located in Delaware.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">15. Contact Information</h2>
              <p>
                For questions about these Terms, please contact us at:
                <br />
                <a href="mailto:legal@dealershipai.com" className="text-blue-400 hover:text-blue-300">
                  legal@dealershipai.com
                </a>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-gray-400 text-sm">
              By using DealershipAI, you acknowledge that you have read, understood, and agree to be bound by these
              Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
