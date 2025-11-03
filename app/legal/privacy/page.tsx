import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | DealershipAI',
  description: 'How DealershipAI collects, uses, and protects your data',
};

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p>
                DealershipAI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use our Service.
                Please read this policy carefully.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Account information (name, email, password)</li>
                <li>Dealership information (name, location, website)</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Communication preferences</li>
                <li>Support requests and correspondence</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Performance and error logs</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.3 Third-Party Data</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Public business information from Google, social media platforms</li>
                <li>AI platform visibility data (ChatGPT, Perplexity, etc.)</li>
                <li>Review and reputation data from public sources</li>
                <li>Website analytics and SEO metrics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use collected information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our Service</li>
                <li>Process transactions and send related information</li>
                <li>Generate AI-powered analytics and insights</li>
                <li>Send administrative information, updates, and security alerts</li>
                <li>Respond to inquiries and provide customer support</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect, prevent, and address technical issues and security threats</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Information Sharing and Disclosure</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1 We May Share Information With:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (hosting, analytics, payment processing)</li>
                <li><strong>AI Services:</strong> OpenAI, Anthropic, and other AI providers for generating insights</li>
                <li><strong>Analytics:</strong> Google Analytics, Sentry for monitoring and error tracking</li>
                <li><strong>Payment Processors:</strong> Stripe for secure payment processing</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Legal Requirements</h3>
              <p className="mb-4">
                We may disclose your information if required by law, subpoena, or other legal process, or when we
                believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety
                of others.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.3 Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the
                acquiring entity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
              <p className="mb-4">We implement industry-standard security measures including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and authentication (Clerk)</li>
                <li>Secure cloud infrastructure (Vercel, Supabase)</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
              <p className="mt-4">
                However, no method of transmission over the Internet is 100% secure. While we strive to protect your
                information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Data Retention</h2>
              <p>
                We retain your information for as long as necessary to provide our Service and fulfill the purposes
                outlined in this Privacy Policy. Account data is retained until you request deletion. Analytics and
                log data may be retained for up to 2 years for security and compliance purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Your Privacy Rights</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.1 Access and Control</h3>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your information</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of marketing communications</li>
                <li>Disable cookies through your browser settings</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.2 California Privacy Rights (CCPA)</h3>
              <p className="mb-4">California residents have additional rights including:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to opt-out of the sale of personal information</li>
                <li>Right to non-discrimination for exercising privacy rights</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.3 European Privacy Rights (GDPR)</h3>
              <p>
                If you are in the European Economic Area, you have rights under GDPR including data portability,
                erasure, and the right to lodge a complaint with a supervisory authority.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Cookies and Tracking Technologies</h2>
              <p className="mb-4">We use cookies and similar technologies for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for authentication and security</li>
                <li><strong>Analytics Cookies:</strong> Google Analytics to understand usage patterns</li>
                <li><strong>Performance Cookies:</strong> Monitor site performance and errors</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings, but disabling certain cookies may limit
                Service functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. AI and Machine Learning</h2>
              <p className="mb-4">
                Our Service uses artificial intelligence and machine learning to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Generate insights and recommendations</li>
                <li>Analyze reputation and visibility metrics</li>
                <li>Predict trends and opportunities</li>
              </ul>
              <p className="mt-4">
                AI processing may involve sharing anonymized data with third-party AI providers (OpenAI, Anthropic).
                We do not share personally identifiable information with AI services without your consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Children's Privacy</h2>
              <p>
                Our Service is not intended for children under 13 years of age. We do not knowingly collect
                personal information from children. If we become aware that we have collected information from a
                child under 13, we will take steps to delete such information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. International Data Transfers</h2>
              <p>
                Your information may be transferred to and maintained on servers located outside your jurisdiction.
                By using our Service, you consent to the transfer of information to the United States and other
                countries where data protection laws may differ.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Third-Party Links</h2>
              <p>
                Our Service may contain links to third-party websites. We are not responsible for the privacy
                practices of these external sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy periodically. We will notify you of material changes via email or
                through the Service. The "Last Updated" date at the top indicates when the policy was last revised.
                Continued use of the Service after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Contact Us</h2>
              <p className="mb-4">
                For questions about this Privacy Policy or to exercise your privacy rights, contact us at:
              </p>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:privacy@dealershipai.com" className="text-blue-400 hover:text-blue-300">
                    privacy@dealershipai.com
                  </a>
                </p>
                <p>
                  <strong>Data Protection Officer:</strong>{' '}
                  <a href="mailto:dpo@dealershipai.com" className="text-blue-400 hover:text-blue-300">
                    dpo@dealershipai.com
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">15. Do Not Track</h2>
              <p>
                Our Service does not currently respond to "Do Not Track" signals from browsers. You can disable
                tracking through browser settings and opt-out of Google Analytics using the{' '}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Google Analytics Opt-out Browser Add-on
                </a>.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-gray-400 text-sm">
              By using DealershipAI, you acknowledge that you have read, understood, and agree to the collection and
              use of information in accordance with this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
