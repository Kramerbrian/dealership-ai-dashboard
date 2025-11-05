'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, ArrowRight, X } from 'lucide-react';
import { ga } from '@/lib/ga';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  action: () => void;
  shortcut?: string;
  category?: string;
}

interface CommandPaletteProps {
  items: CommandItem[];
  onClose?: () => void;
}

export function CommandPalette({ items, onClose }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open palette with Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
        ga('command_palette_open', {});
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
        setSearch('');
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Filter items based on search
  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase())
  );

  // Handle selection
  const handleSelect = (item: CommandItem) => {
    item.action();
    setOpen(false);
    setSearch('');
    ga('command_palette_select', { item_id: item.id });
  };

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredItems[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredItems, selectedIndex]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white shadow-lg hover:opacity-90 transition-opacity"
        title="Open command palette (Cmd+K)"
      >
        <Command className="w-4 h-4" />
        <span className="text-sm font-medium">Commands</span>
        <kbd className="ml-2 px-2 py-0.5 text-xs bg-white/20 rounded">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4">
        <div className="rounded-2xl border bg-white shadow-2xl ring-1 ring-gray-900/5 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 p-4 border-b">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Type a command or search..."
              className="flex-1 outline-none text-lg"
            />
            <button
              onClick={() => {
                setOpen(false);
                setSearch('');
                onClose?.();
              }}
              className="p-1 rounded hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No commands found</p>
                <p className="text-sm mt-2">Try a different search term</p>
              </div>
            ) : (
              <div className="py-2">
                {filteredItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      index === selectedIndex ? 'bg-gray-50' : ''
                    }`}
                  >
                    {item.icon && (
                      <div className="flex-shrink-0 text-gray-400">
                        {item.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{item.label}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500 mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </div>
                    {item.shortcut && (
                      <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">
                        {item.shortcut}
                      </kbd>
                    )}
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
            <span>Navigate with ↑↓ and press Enter to select</span>
            <span>Press Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

