'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface IntegrationProvider {
  id: string;
  provider_name: string;
  provider_slug: string;
  category: string;
  description: string;
  logo_url: string | null;
  website_url: string | null;
  capabilities: string[];
  supported_auth_types: string[];
  status: string;
  is_premium: boolean;
  documentation_url: string | null;
}

interface ActiveIntegration {
  id: string;
  provider_id: string;
  status: string;
  sync_enabled: boolean;
  last_synced_at: string | null;
  error_message: string | null;
  integration_providers: IntegrationProvider;
  health: {
    health_score: number;
    syncs_last_24h: number;
    failures_last_24h: number;
  } | null;
}

interface IntegrationMarketplaceProps {
  dealerId: string;
}

export default function IntegrationMarketplace({ dealerId }: IntegrationMarketplaceProps) {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<IntegrationProvider[]>([]);
  const [activeIntegrations, setActiveIntegrations] = useState<ActiveIntegration[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [view, setView] = useState<'marketplace' | 'active'>('active');

  useEffect(() => {
    fetchData();
  }, [dealerId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch providers and active integrations in parallel
      const [providersRes, integrationsRes] = await Promise.all([
        fetch('/api/integrations/providers'),
        fetch(`/api/integrations?dealerId=${dealerId}`),
      ]);

      const providersData = await providersRes.json();
      const integrationsData = await integrationsRes.json();

      if (providersRes.ok) {
        setProviders(providersData.providers || []);
      }

      if (integrationsRes.ok) {
        setActiveIntegrations(integrationsData.integrations || []);
      }
    } catch (error) {
      console.error('[IntegrationMarketplace] Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { key: 'all', label: 'All', icon: '🔗' },
    { key: 'reviews', label: 'Reviews', icon: '⭐' },
    { key: 'dms', label: 'DMS', icon: '🚗' },
    { key: 'analytics', label: 'Analytics', icon: '📊' },
    { key: 'crm', label: 'CRM', icon: '👥' },
    { key: 'social', label: 'Social', icon: '📱' },
  ];

  const filteredProviders = selectedCategory === 'all'
    ? providers
    : providers.filter(p => p.category === selectedCategory);

  const getHealthColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthBg = (score: number | null) => {
    if (score === null) return 'bg-gray-800/50';
    if (score >= 90) return 'bg-emerald-900/30';
    if (score >= 70) return 'bg-yellow-900/30';
    return 'bg-red-900/30';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-emerald-900/30 text-emerald-400',
      paused: 'bg-gray-700 text-gray-400',
      error: 'bg-red-900/30 text-red-400',
      setup_required: 'bg-yellow-900/30 text-yellow-400',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-700 text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Integrations</h2>
          <p className="text-gray-400 text-sm mt-1">
            Connect your dealership data with external platforms
          </p>
        </div>

        <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setView('active')}
            className={`px-4 py-2 text-sm rounded transition-colors ${
              view === 'active'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Active ({activeIntegrations.length})
          </button>
          <button
            onClick={() => setView('marketplace')}
            className={`px-4 py-2 text-sm rounded transition-colors ${
              view === 'marketplace'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Marketplace
          </button>
        </div>
      </div>

      {/* Category filters (marketplace view only) */}
      {view === 'marketplace' && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Active Integrations View */}
      {view === 'active' && (
        <div className="space-y-4">
          {activeIntegrations.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
              <div className="text-gray-500 text-lg mb-2">No active integrations</div>
              <p className="text-gray-600 text-sm mb-4">
                Connect your first integration to start syncing data
              </p>
              <button
                onClick={() => setView('marketplace')}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            activeIntegrations.map((integration) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Provider logo */}
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                      {integration.integration_providers.logo_url ? (
                        <img
                          src={integration.integration_providers.logo_url}
                          alt={integration.integration_providers.provider_name}
                          className="w-8 h-8"
                        />
                      ) : (
                        '🔗'
                      )}
                    </div>

                    {/* Provider details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {integration.integration_providers.provider_name}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(integration.status)}`}>
                          {integration.status.replace('_', ' ')}
                        </span>
                        {integration.integration_providers.is_premium && (
                          <span className="px-2 py-1 text-xs bg-purple-900/30 text-purple-400 rounded">
                            Premium
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-400 mb-3">
                        {integration.integration_providers.description}
                      </p>

                      {/* Health metrics */}
                      {integration.health && (
                        <div className="flex gap-4 text-sm">
                          <div className={`${getHealthBg(integration.health.health_score)} rounded-lg px-3 py-2`}>
                            <span className="text-gray-400 mr-2">Health:</span>
                            <span className={`font-bold ${getHealthColor(integration.health.health_score)}`}>
                              {integration.health.health_score}%
                            </span>
                          </div>
                          <div className="bg-gray-700/50 rounded-lg px-3 py-2">
                            <span className="text-gray-400 mr-2">Syncs (24h):</span>
                            <span className="text-white font-medium">{integration.health.syncs_last_24h}</span>
                          </div>
                          {integration.health.failures_last_24h > 0 && (
                            <div className="bg-red-900/30 rounded-lg px-3 py-2">
                              <span className="text-gray-400 mr-2">Failures:</span>
                              <span className="text-red-400 font-medium">{integration.health.failures_last_24h}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Error message */}
                      {integration.error_message && (
                        <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                          <div className="text-xs text-red-300">{integration.error_message}</div>
                        </div>
                      )}

                      {/* Last synced */}
                      {integration.last_synced_at && (
                        <div className="mt-2 text-xs text-gray-500">
                          Last synced: {new Date(integration.last_synced_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                      Configure
                    </button>
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors">
                      Sync Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Marketplace View */}
      {view === 'marketplace' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProviders.map((provider) => {
            const isConnected = activeIntegrations.some(
              (i) => i.provider_id === provider.id
            );

            return (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-emerald-500/50 transition-all"
              >
                {/* Provider header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                    {provider.logo_url ? (
                      <img src={provider.logo_url} alt={provider.provider_name} className="w-8 h-8" />
                    ) : (
                      '🔗'
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{provider.provider_name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded">
                        {provider.category}
                      </span>
                      {provider.is_premium && (
                        <span className="px-2 py-0.5 text-xs bg-purple-900/30 text-purple-400 rounded">
                          Premium
                        </span>
                      )}
                      {provider.status === 'beta' && (
                        <span className="px-2 py-0.5 text-xs bg-blue-900/30 text-blue-400 rounded">
                          Beta
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-4">{provider.description}</p>

                {/* Capabilities */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">Capabilities:</div>
                  <div className="flex flex-wrap gap-1">
                    {provider.capabilities.slice(0, 3).map((cap) => (
                      <span
                        key={cap}
                        className="px-2 py-1 text-xs bg-emerald-900/20 text-emerald-300 rounded"
                      >
                        {cap.replace('_', ' ')}
                      </span>
                    ))}
                    {provider.capabilities.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-700 text-gray-400 rounded">
                        +{provider.capabilities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {provider.documentation_url && (
                    <a
                      href={provider.documentation_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm text-center transition-colors"
                    >
                      Docs
                    </a>
                  )}
                  <button
                    disabled={isConnected}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                      isConnected
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isConnected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
