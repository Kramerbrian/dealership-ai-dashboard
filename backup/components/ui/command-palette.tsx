/**
 * Command Palette Component (Cmd+K)
 * Inspired by: Linear, Vercel, GitHub
 * Fast navigation + actions for power users
 */
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Home, Search, Target, Download, Brain, Zap, Settings, 
  FileText, TrendingUp, Users, Bell, HelpCircle, BarChart,
  Globe, Shield, Eye, DollarSign, Award, ArrowRight
} from 'lucide-react';

export interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  keywords: string[];
  category: 'navigation' | 'action' | 'search' | 'ai' | 'help';
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  commands?: Command[];
  onExecute?: (commandId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  commands: customCommands,
  onExecute 
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Default commands
  const defaultCommands: Command[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      description: 'View your main dashboard',
      icon: <Home size={18} />,
      keywords: ['home', 'overview', 'main'],
      category: 'navigation',
      action: () => window.location.href = '/dashboard'
    },
    {
      id: 'nav-competitive',
      label: 'View Competitors',
      description: 'Competitive intelligence war room',
      icon: <Target size={18} />,
      keywords: ['compete', 'war room', 'rivals'],
      category: 'navigation',
      action: () => window.location.href = '/competitor'
    },
    {
      id: 'nav-schema',
      label: 'Schema Audit',
      description: 'Check your structured data',
      icon: <FileText size={18} />,
      keywords: ['schema', 'markup', 'seo'],
      category: 'navigation',
      action: () => window.location.href = '/scan'
    },
    {
      id: 'nav-analytics',
      label: 'Analytics',
      description: 'Deep dive into your data',
      icon: <BarChart size={18} />,
      keywords: ['stats', 'metrics', 'data'],
      category: 'navigation',
      action: () => window.location.href = '/intelligence'
    },
    
    // Quick actions
    {
      id: 'action-audit',
      label: 'Run New Audit',
      description: 'Scan your AI visibility',
      icon: <Search size={18} />,
      keywords: ['scan', 'check', 'analyze', 'test'],
      category: 'action',
      action: () => console.log('Trigger audit'),
      shortcut: '⌘ A'
    },
    {
      id: 'action-export',
      label: 'Export Report',
      description: 'Download PDF or CSV',
      icon: <Download size={18} />,
      keywords: ['pdf', 'download', 'save', 'report'],
      category: 'action',
      action: () => console.log('Export report'),
      shortcut: '⌘ E'
    },
    {
      id: 'action-quick-wins',
      label: 'Show Quick Wins',
      description: 'Easy fixes for immediate impact',
      icon: <Zap size={18} />,
      keywords: ['fix', 'improve', 'boost', 'optimize'],
      category: 'action',
      action: () => console.log('Show quick wins'),
      shortcut: '⌘ Q'
    },
    {
      id: 'action-share-report',
      label: 'Share Report',
      description: 'Generate shareable link',
      icon: <Globe size={18} />,
      keywords: ['share', 'link', 'public'],
      category: 'action',
      action: () => console.log('Share report')
    },
    
    // AI-powered
    {
      id: 'ai-chat',
      label: 'Ask AI Assistant',
      description: 'Get instant help from AI',
      icon: <Brain size={18} />,
      keywords: ['help', 'question', 'ai', 'ask'],
      category: 'ai',
      action: () => console.log('Open AI chat'),
      shortcut: '⌘ /'
    },
    {
      id: 'ai-analyze',
      label: 'AI Analysis',
      description: 'Get AI insights on your data',
      icon: <TrendingUp size={18} />,
      keywords: ['analyze', 'insights', 'ai', 'smart'],
      category: 'ai',
      action: () => console.log('AI analyze')
    },
    {
      id: 'ai-recommendations',
      label: 'AI Recommendations',
      description: 'Personalized action items',
      icon: <Award size={18} />,
      keywords: ['recommend', 'suggest', 'advice'],
      category: 'ai',
      action: () => console.log('AI recommendations')
    },
    
    // Search
    {
      id: 'search-competitor',
      label: 'Search Competitor',
      description: 'Find and track competitors',
      icon: <Search size={18} />,
      keywords: ['find', 'lookup', 'search'],
      category: 'search',
      action: () => console.log('Search competitor')
    },
    
    // Settings
    {
      id: 'settings',
      label: 'Settings',
      description: 'Configure your account',
      icon: <Settings size={18} />,
      keywords: ['config', 'preferences', 'account'],
      category: 'navigation',
      action: () => window.location.href = '/dash/settings',
      shortcut: '⌘ ,'
    },
    {
      id: 'help',
      label: 'Help Center',
      description: 'Get support and documentation',
      icon: <HelpCircle size={18} />,
      keywords: ['help', 'support', 'docs', 'faq'],
      category: 'help',
      action: () => window.location.href = '/help',
      shortcut: '?'
    }
  ];
  
  const commands = customCommands || defaultCommands;
  
  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        setOpen(false);
        setSearch('');
        setSelectedIndex(0);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);
  
  // Fuzzy search with scoring
  const fuzzyMatch = (text: string, query: string): number => {
    if (!query) return 1;
    
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Exact match = highest score
    if (textLower === queryLower) return 100;
    
    // Starts with = high score
    if (textLower.startsWith(queryLower)) return 80;
    
    // Contains = medium score
    if (textLower.includes(queryLower)) return 60;
    
    // Fuzzy match = low score
    let queryIndex = 0;
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
      if (textLower[i] === queryLower[queryIndex]) {
        queryIndex++;
      }
    }
    
    return queryIndex === queryLower.length ? 40 : 0;
  };
  
  // Filter and score commands
  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    
    return commands
      .map(cmd => {
        // Score against label, description, and keywords
        const labelScore = fuzzyMatch(cmd.label, search);
        const descScore = cmd.description ? fuzzyMatch(cmd.description, search) : 0;
        const keywordScore = Math.max(...cmd.keywords.map(k => fuzzyMatch(k, search)));
        
        const score = Math.max(labelScore, descScore, keywordScore);
        
        return { ...cmd, score };
      })
      .filter(cmd => cmd.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [search, commands]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, filteredCommands]);
  
  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);
  
  // Execute command
  const executeCommand = useCallback((cmd: Command) => {
    cmd.action();
    onExecute?.(cmd.id);
    setOpen(false);
    setSearch('');
    setSelectedIndex(0);
  }, [onExecute]);
  
  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, typeof filteredCommands> = {};
    
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    
    return groups;
  }, [filteredCommands]);
  
  if (!open) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setOpen(false)}
      />
      
      {/* Command palette */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <Search className="text-gray-400" size={20} />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 outline-none text-lg"
            />
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
              ESC
            </kbd>
          </div>
          
          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {Object.keys(groupedCommands).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No commands found
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category}>
                  {/* Category header */}
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                    {category}
                  </div>
                  
                  {/* Commands */}
                  {cmds.map((cmd, index) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => executeCommand(cmd)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition ${
                          isSelected ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="text-gray-600">{cmd.icon}</div>
                        
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">{cmd.label}</div>
                          {cmd.description && (
                            <div className="text-sm text-gray-500">{cmd.description}</div>
                          )}
                        </div>
                        
                        {cmd.shortcut && (
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                            {cmd.shortcut}
                          </kbd>
                        )}
                        
                        {isSelected && (
                          <ArrowRight size={16} className="text-blue-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>
                <kbd className="px-1.5 py-0.5 bg-white rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white rounded ml-1">↓</kbd>
                {' '}to navigate
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-white rounded">↵</kbd>
                {' '}to select
              </span>
            </div>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white rounded">ESC</kbd>
              {' '}to close
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Hook to programmatically open command palette
 */
export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  return { isOpen, open, close, toggle };
};

export default CommandPalette;