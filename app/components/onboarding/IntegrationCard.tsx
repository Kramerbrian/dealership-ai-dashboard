'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Loader2,
  Info,
  Sparkles,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import { parseAndNormalizeUrl, isValidUrlOrDomain, isValidGoogleBusinessProfileId, getPlaceholderText, getValidationError } from '@/lib/url-utils';

interface IntegrationCardProps {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  benefit: string;
  required?: boolean;
  connected?: boolean;
  status?: 'pending' | 'connected' | 'failed' | 'testing';
  onConnect?: (id: string, value: string) => void;
  onTest?: (id: string) => void;
  placeholder?: string;
  inputType?: 'text' | 'url' | 'email';
  helpText?: string;
  helpUrl?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function IntegrationCard({
  id,
  name,
  description,
  icon,
  benefit,
  required = false,
  connected = false,
  status = 'pending',
  onConnect,
  onTest,
  placeholder,
  inputType = 'text',
  helpText,
  helpUrl,
  value = '',
  onChange
}: IntegrationCardProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleConnect = () => {
    if (onConnect && inputValue.trim()) {
      onConnect(id, inputValue.trim());
    }
  };

  const handleTest = () => {
    if (onTest) {
      onTest(id);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'testing':
        return <Loader2 className="w-5 h-5 text-[var(--brand-primary)] animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'border-emerald-500/30 bg-emerald-500/10';
      case 'failed':
        return 'border-red-500/30 bg-red-500/10';
      case 'testing':
        return 'border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/10';
      default:
        return 'border-white/20 bg-white/5';
    }
  };

  return (
    <div className={`glass rounded-xl p-6 transition-all duration-200 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[var(--brand-primary)]/20 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-lg">{name}</h4>
              {required && (
                <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">
                  Required
                </span>
              )}
              {getStatusIcon()}
            </div>
            <p className="text-sm text-white/70">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-emerald-400 font-medium">{benefit}</div>
          {status === 'connected' && (
            <div className="text-xs text-emerald-400 mt-1">Connected</div>
          )}
        </div>
      </div>

      {!connected && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {name} {inputType === 'url' ? 'URL' : 'ID'}
            </label>
            <input
              type={inputType}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                onChange?.(e.target.value);
              }}
              placeholder={placeholder}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
          </div>

          {helpText && (
            <div className="flex items-start gap-2 text-xs text-white/60">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p>{helpText}</p>
                {helpUrl && (
                  <a 
                    href={helpUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1"
                  >
                    Learn more <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleConnect}
              disabled={!inputValue.trim() || status === 'testing'}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
              style={{ backgroundImage: 'var(--brand-gradient)' }}
            >
              {status === 'testing' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Connect
                </>
              )}
            </button>
            
            {onTest && (
              <button
                onClick={handleTest}
                disabled={!inputValue.trim() || status === 'testing'}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              >
                Test
              </button>
            )}
          </div>
        </div>
      )}

      {connected && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Successfully connected</span>
          </div>
          <button
            onClick={() => {
              setInputValue('');
              onChange?.('');
            }}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            Reconnect
          </button>
        </div>
      )}

      {status === 'failed' && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Connection failed. Please check your credentials and try again.</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Pre-configured integration cards
export const GoogleAnalyticsCard = (props: Partial<IntegrationCardProps>) => (
  <IntegrationCard
    id="ga4"
    name="Google Analytics 4"
    description="Track website traffic and user behavior"
    icon={<TrendingUp className="w-6 h-6" />}
    benefit="87% more accurate traffic insights"
    required={true}
    placeholder="G-XXXXXXXXXX"
    helpText="Find your GA4 Property ID in your Google Analytics account under Admin > Property Settings"
    helpUrl="https://support.google.com/analytics/answer/9539598"
    {...props}
  />
);

export const GoogleBusinessCard = (props: Partial<IntegrationCardProps>) => (
  <IntegrationCard
    id="gbp"
    name="Google Business Profile"
    description="Monitor local search presence and reviews"
    icon={<Shield className="w-6 h-6" />}
    benefit="Track local AI search visibility"
    required={true}
    placeholder="ChIJ..."
    helpText="Find your Google Business Profile ID in your Google Business Profile dashboard"
    helpUrl="https://support.google.com/business/answer/7035772"
    {...props}
  />
);

export const FacebookPixelCard = (props: Partial<IntegrationCardProps>) => (
  <IntegrationCard
    id="facebook"
    name="Facebook Pixel"
    description="Track Facebook ads and page performance"
    icon={<Zap className="w-6 h-6" />}
    benefit="Monitor AI-generated content reach"
    required={false}
    placeholder="123456789012345"
    helpText="Find your Facebook Pixel ID in your Facebook Business Manager under Events Manager"
    helpUrl="https://www.facebook.com/business/help/952192354843755"
    {...props}
  />
);

export const InstagramBusinessCard = (props: Partial<IntegrationCardProps>) => (
  <IntegrationCard
    id="instagram"
    name="Instagram Business"
    description="Track Instagram engagement and reach"
    icon={<Sparkles className="w-6 h-6" />}
    benefit="Visual content AI visibility"
    required={false}
    placeholder="17841400000000000"
    helpText="Find your Instagram Business ID in your Instagram Business account settings"
    helpUrl="https://www.facebook.com/business/help/898752960195806"
    {...props}
  />
);
