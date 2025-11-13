'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, Settings, Sparkles } from 'lucide-react';

interface CommandBarProps {
  onCommand?: (command: string) => void;
  onVoiceStart?: () => void;
  onVoiceStop?: () => void;
}

export default function CommandBar({ onCommand, onVoiceStart, onVoiceStop }: CommandBarProps) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick suggestions
  const suggestions = [
    "Why did Zero-Click drop?",
    "Open E-E-A-T",
    "Show Revenue at Risk",
    "Run full cognitive scan",
    "Fix schema now",
    "Compare us to competitor",
    "What's our Trust Score?",
    "Show GEO Integrity"
  ];

  // ⌘K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowSuggestions(true);
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onCommand?.(query);
      setQuery('');
      setShowSuggestions(false);
    }
  };

  const handleVoiceClick = async () => {
    if (isListening) {
      setIsListening(false);
      onVoiceStop?.();
    } else {
      setIsListening(true);
      onVoiceStart?.();
      // TODO: Integrate ElevenLabs/Web Speech API
      // For now, simulate voice input
      setTimeout(() => {
        setIsListening(false);
        onVoiceStop?.();
      }, 3000);
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-3 shadow-lg focus-within:border-[#3BA3FF]/50 focus-within:ring-2 focus-within:ring-[#3BA3FF]/20 transition-all">
          <Sparkles className="w-5 h-5 text-[#3BA3FF] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Ask dAI anything... (⌘K)"
            className="flex-1 bg-transparent text-[#E6EEF7] placeholder:text-[#9BB2C9] outline-none text-base"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleVoiceClick}
              className={`p-2 rounded-lg transition-colors ${
                isListening
                  ? 'bg-red-500/20 text-red-400 animate-pulse'
                  : 'text-[#9BB2C9] hover:text-[#E6EEF7] hover:bg-white/5'
              }`}
              aria-label="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {/* Open settings */}}
              className="p-2 rounded-lg text-[#9BB2C9] hover:text-[#E6EEF7] hover:bg-white/5 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && (query.length === 0 || suggestions.some(s => s.toLowerCase().includes(query.toLowerCase()))) && (
        <div className="absolute top-full mt-2 w-full rounded-xl bg-[#0F141A] border border-white/10 shadow-2xl z-50 max-h-64 overflow-y-auto">
          {suggestions
            .filter(s => query.length === 0 || s.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5)
            .map((suggestion, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(suggestion);
                  onCommand?.(suggestion);
                  setShowSuggestions(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-[#E6EEF7] hover:bg-white/5 transition-colors first:rounded-t-xl last:rounded-b-xl flex items-center gap-3"
              >
                <Search className="w-4 h-4 text-[#9BB2C9] flex-shrink-0" />
                <span>{suggestion}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

