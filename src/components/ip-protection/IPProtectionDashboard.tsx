"use client";
import { useState, useEffect } from "react";

interface IPProtectionDashboardProps {
  className?: string;
}

export default function IPProtectionDashboard({ className = "" }: IPProtectionDashboardProps) {
  const [patentDocs, setPatentDocs] = useState<any>(null);
  const [tradeSecrets, setTradeSecrets] = useState<any>(null);
  const [licenseStats, setLicenseStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIPProtectionData();
  }, []);

  const loadIPProtectionData = async () => {
    try {
      setLoading(true);
      
      // Load patent documentation
      const patentResponse = await fetch('/api/ip-protection/patent-docs?type=patent');
      const patentData = await patentResponse.json();
      setPatentDocs(patentData.data);

      // Load trade secrets
      const tradeSecretsResponse = await fetch('/api/ip-protection/patent-docs?type=trade-secrets');
      const tradeSecretsData = await tradeSecretsResponse.json();
      setTradeSecrets(tradeSecretsData.data);

      // Mock license stats
      setLicenseStats({
        total_licenses: 150,
        active_licenses: 142,
        expired_licenses: 5,
        suspended_licenses: 2,
        revoked_licenses: 1,
        active_percentage: 94.7
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load IP protection data');
    } finally {
      setLoading(false);
    }
  };

  const generateLicense = async () => {
    try {
      const response = await fetch('/api/ip-protection/generate-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: ['hyperaiv_optimizer', 'model_training', 'api_access'],
          tier: 'enterprise',
          maxUsers: 100,
          maxDealers: 50
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`License generated: ${data.license.license_key}`);
      }
    } catch (err) {
      alert('Failed to generate license');
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-700">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-4 bg-slate-700 rounded w-2/3"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-900 text-white p-6 rounded-2xl border border-slate-700 space-y-8 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">IP Protection Dashboard</h1>
          <p className="text-slate-400 mt-1">Protect HyperAIV Optimizer intellectual property</p>
        </div>
        <button
          onClick={generateLicense}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Generate License
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-xl p-4">
          <p className="text-red-400">Error: {error}</p>
        </div>
      )}

      {/* Patent Documentation */}
      {patentDocs && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-4">Patent Documentation</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-400">Title</p>
              <p className="text-white">{patentDocs.title}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Filing Date</p>
              <p className="text-white">{new Date(patentDocs.filing_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Patent Classification</p>
              <p className="text-white">{patentDocs.patent_classification}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Number of Claims</p>
              <p className="text-white">{patentDocs.claims.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Trade Secrets */}
      {tradeSecrets && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-4">Trade Secrets</h3>
          <div className="space-y-4">
            {tradeSecrets.map((secret: any, index: number) => (
              <div key={index} className="border border-slate-600 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-400">{secret.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    secret.protection_level === 'CRITICAL' ? 'bg-red-900 text-red-300' :
                    secret.protection_level === 'HIGH' ? 'bg-orange-900 text-orange-300' :
                    secret.protection_level === 'MEDIUM' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-green-900 text-green-300'
                  }`}>
                    {secret.protection_level}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-2">{secret.description}</p>
                <div className="text-xs text-slate-400">
                  <p>Last Updated: {new Date(secret.last_updated).toLocaleDateString()}</p>
                  <p>Access Restrictions: {secret.access_restrictions.length} rules</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* License Statistics */}
      {licenseStats && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-4">License Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{licenseStats.active_licenses}</p>
              <p className="text-sm text-slate-400">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{licenseStats.expired_licenses}</p>
              <p className="text-sm text-slate-400">Expired</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{licenseStats.suspended_licenses}</p>
              <p className="text-sm text-slate-400">Suspended</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{licenseStats.active_percentage.toFixed(1)}%</p>
              <p className="text-sm text-slate-400">Active Rate</p>
            </div>
          </div>
        </div>
      )}

      {/* IP Protection Measures */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-4">IP Protection Measures</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-400 mb-2">Code Protection</h4>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>• Algorithm obfuscation</li>
              <li>• Encrypted parameters</li>
              <li>• Watermarking system</li>
              <li>• Access control</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-400 mb-2">Legal Protection</h4>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>• Patent applications</li>
              <li>• Trade secret documentation</li>
              <li>• Confidentiality agreements</li>
              <li>• License management</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-4">Security Recommendations</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium text-green-400">Regular Security Audits</p>
              <p className="text-xs text-slate-400">Conduct monthly security reviews of all IP protection measures</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium text-yellow-400">Employee Training</p>
              <p className="text-xs text-slate-400">Regular training on IP protection and confidentiality requirements</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium text-blue-400">Access Monitoring</p>
              <p className="text-xs text-slate-400">Implement real-time monitoring of all IP access attempts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
