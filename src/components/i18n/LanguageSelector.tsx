"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Globe, 
  Check, 
  ChevronDown,
  Settings
} from 'lucide-react';
import { 
  SUPPORTED_LOCALES, 
  getCurrentLocale, 
  setCurrentLocale, 
  type SupportedLocale,
  type LocaleConfig 
} from '@/lib/i18n';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'button' | 'compact';
  showLabel?: boolean;
  className?: string;
}

export default function LanguageSelector({ 
  variant = 'dropdown', 
  showLabel = true,
  className = '' 
}: LanguageSelectorProps) {
  const [currentLocale, setCurrentLocaleState] = useState<SupportedLocale>('en');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentLocaleState(getCurrentLocale());
  }, []);

  const handleLocaleChange = (locale: SupportedLocale) => {
    setCurrentLocaleState(locale);
    setCurrentLocale(locale);
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('localeChanged', { 
      detail: { locale } 
    }));
    
    // Reload the page to apply the new locale
    // In a real app, you might want to use a more sophisticated state management
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const currentConfig = SUPPORTED_LOCALES.find(l => l.code === currentLocale) || SUPPORTED_LOCALES[0];

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Globe className="h-4 w-4 text-gray-600" />
        <Select value={currentLocale} onValueChange={handleLocaleChange}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{currentConfig.flag}</span>
                <span className="text-sm">{currentConfig.code.toUpperCase()}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LOCALES.map((locale) => (
              <SelectItem key={locale.code} value={locale.code}>
                <div className="flex items-center gap-2">
                  <span>{locale.flag}</span>
                  <span>{locale.nativeName}</span>
                  {locale.code === currentLocale && (
                    <Check className="h-3 w-3 ml-auto" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          {showLabel && <span>{currentConfig.nativeName}</span>}
          <span>{currentConfig.flag}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
        
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50">
            <div className="p-2">
              <div className="text-sm font-medium text-gray-700 mb-2 px-2">
                Select Language
              </div>
              <div className="space-y-1">
                {SUPPORTED_LOCALES.map((locale) => (
                  <button
                    key={locale.code}
                    onClick={() => {
                      handleLocaleChange(locale.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md hover:bg-gray-100 transition-colors ${
                      locale.code === currentLocale ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{locale.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium">{locale.nativeName}</div>
                      <div className="text-sm text-gray-500">{locale.name}</div>
                    </div>
                    {locale.code === currentLocale && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {isOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Globe className="h-4 w-4 text-gray-600" />
      {showLabel && (
        <span className="text-sm font-medium text-gray-700">
          Language:
        </span>
      )}
      <Select value={currentLocale} onValueChange={handleLocaleChange}>
        <SelectTrigger className="w-48">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{currentConfig.flag}</span>
              <span>{currentConfig.nativeName}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LOCALES.map((locale) => (
            <SelectItem key={locale.code} value={locale.code}>
              <div className="flex items-center gap-2">
                <span>{locale.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{locale.nativeName}</div>
                  <div className="text-sm text-gray-500">{locale.name}</div>
                </div>
                {locale.code === currentLocale && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Hook for using translations
export function useTranslation() {
  const [locale, setLocale] = useState<SupportedLocale>(getCurrentLocale());

  useEffect(() => {
    const handleLocaleChange = (event: CustomEvent) => {
      setLocale(event.detail.locale);
    };

    window.addEventListener('localeChanged', handleLocaleChange as EventListener);
    return () => {
      window.removeEventListener('localeChanged', handleLocaleChange as EventListener);
    };
  }, []);

  const t = (key: string) => {
    // Import the translation function dynamically to avoid SSR issues
    const { t: translate } = require('@/lib/i18n');
    return translate(key, locale);
  };

  return { t, locale };
}

// Higher-order component for translating components
export function withTranslation<P extends object>(
  Component: React.ComponentType<P>
) {
  return function TranslatedComponent(props: P) {
    const { t } = useTranslation();
    return <Component {...props} t={t} />;
  };
}
