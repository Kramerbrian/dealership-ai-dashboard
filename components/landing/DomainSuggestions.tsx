'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp } from 'lucide-react';

interface DomainSuggestion {
  domain: string;
  type: 'popular' | 'recent' | 'similar';
}

// Popular dealership domains (can be updated from API)
const POPULAR_DOMAINS = [
  'thompsontoyota.com',
  'metrohonda.com',
  'martinezauto.com',
  'premiumauto.com',
  'elitemotors.com',
  'riversidechevrolet.com',
  'sunsetford.com',
  'coastalbMW.com'
];

export function useDomainSuggestions(input: string) {
  const [suggestions, setSuggestions] = useState<DomainSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!input || input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const cleanInput = input.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');

    // Get recent domains from localStorage
    const recentDomains = getRecentDomains();

    // Filter suggestions
    const filtered: DomainSuggestion[] = [];

    // Popular domains that match
    POPULAR_DOMAINS.forEach(domain => {
      if (domain.includes(cleanInput) && domain !== cleanInput) {
        filtered.push({ domain, type: 'popular' });
      }
    });

    // Recent domains that match
    recentDomains.forEach(domain => {
      if (domain.includes(cleanInput) && domain !== cleanInput && 
          !filtered.some(s => s.domain === domain)) {
        filtered.push({ domain, type: 'recent' });
      }
    });

    // Similar domains (typo suggestions)
    if (cleanInput.length >= 3) {
      POPULAR_DOMAINS.forEach(domain => {
        if (isSimilar(cleanInput, domain) && !filtered.some(s => s.domain === domain)) {
          filtered.push({ domain, type: 'similar' });
        }
      });
    }

    setSuggestions(filtered.slice(0, 5));
    setShowSuggestions(filtered.length > 0);
  }, [input]);

  return { suggestions, showSuggestions, setShowSuggestions };
}

function getRecentDomains(): string[] {
  try {
    const stored = localStorage.getItem('dealershipai_recent_domains');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveRecentDomain(domain: string) {
  try {
    const recent = getRecentDomains();
    const updated = [domain, ...recent.filter(d => d !== domain)].slice(0, 10);
    localStorage.setItem('dealershipai_recent_domains', JSON.stringify(updated));
  } catch {
    // Ignore errors
  }
}

function isSimilar(str1: string, str2: string): boolean {
  // Simple Levenshtein-like similarity check
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length - shorter.length > 2) return false;
  
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }
  return matches / shorter.length > 0.6;
}

interface DomainSuggestionsListProps {
  suggestions: DomainSuggestion[];
  onSelect: (domain: string) => void;
  onClose: () => void;
}

export function DomainSuggestionsList({ suggestions, onSelect, onClose }: DomainSuggestionsListProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (suggestions.length === 0) return null;

  const getLabel = (type: DomainSuggestion['type']) => {
    switch (type) {
      case 'popular': return 'Popular';
      case 'recent': return 'Recent';
      case 'similar': return 'Similar';
    }
  };

  const getIcon = (type: DomainSuggestion['type']) => {
    if (type === 'popular') {
      return <TrendingUp className="w-4 h-4 text-blue-500" />;
    }
    return <Search className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto"
    >
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          onClick={() => onSelect(suggestion.domain)}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            {getIcon(suggestion.type)}
            <span className="text-gray-900 font-medium">{suggestion.domain}</span>
          </div>
          <span className="text-xs text-gray-500">{getLabel(suggestion.type)}</span>
        </button>
      ))}
    </div>
  );
}

