'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  showFilters = true,
  onToggleFilters,
  suggestions = [],
  onSuggestionSelect,
  className = ""
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(newValue.length > 0 && suggestions.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    onSuggestionSelect?.(suggestion);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    onChange('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            if (value.length > 0 && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg
            bg-white/80 backdrop-blur-sm
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200
            ${isFocused ? 'shadow-lg' : 'shadow-sm'}
            placeholder-gray-500
          `}
        />

        <div className="absolute inset-y-0 right-0 flex items-center">
          {value && (
            <button
              onClick={clearSearch}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {showFilters && onToggleFilters && (
            <button
              onClick={onToggleFilters}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Filter className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
