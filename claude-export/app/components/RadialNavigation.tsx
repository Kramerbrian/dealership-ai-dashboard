'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  FileText, 
  Target, 
  MessageSquare, 
  Zap, 
  Settings,
  Search,
  X,
  Command
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
  color: string;
  description: string;
}

export default function RadialNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'intelligence',
      label: 'Intelligence',
      icon: <BarChart3 className="w-6 h-6" />,
      shortcut: '⌘I',
      color: 'from-blue-500 to-cyan-500',
      description: 'Sales Intelligence Dashboard'
    },
    {
      id: 'content',
      label: 'Content',
      icon: <FileText className="w-6 h-6" />,
      shortcut: '⌘C',
      color: 'from-emerald-500 to-teal-500',
      description: 'Content optimization and management'
    },
    {
      id: 'acquisition',
      label: 'Acquisition',
      icon: <Target className="w-6 h-6" />,
      shortcut: '⌘A',
      color: 'from-purple-500 to-pink-500',
      description: 'Lead generation and conversion'
    },
    {
      id: 'ugc',
      label: 'UGC',
      icon: <MessageSquare className="w-6 h-6" />,
      shortcut: '⌘U',
      color: 'from-amber-500 to-orange-500',
      description: 'User-generated content management'
    },
    {
      id: 'agents',
      label: 'Agents',
      icon: <Zap className="w-6 h-6" />,
      shortcut: '⌘G',
      color: 'from-red-500 to-rose-500',
      description: 'AI agents and automation'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-6 h-6" />,
      shortcut: '⌘,',
      color: 'from-slate-500 to-gray-500',
      description: 'System configuration'
    }
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setShowSearch(true);
            break;
          case 'i':
            e.preventDefault();
            handleNavClick('intelligence');
            break;
          case 'c':
            e.preventDefault();
            handleNavClick('content');
            break;
          case 'a':
            e.preventDefault();
            handleNavClick('acquisition');
            break;
          case 'u':
            e.preventDefault();
            handleNavClick('ugc');
            break;
          case 'g':
            e.preventDefault();
            handleNavClick('agents');
            break;
          case ',':
            e.preventDefault();
            handleNavClick('settings');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavClick = (itemId: string) => {
    console.log(`Navigating to: ${itemId}`);
    setIsOpen(false);
    setShowSearch(false);
  };

  const filteredItems = navItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* DealershipAI Logo - Radial Menu Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-50 flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900">DealershipAI</span>
      </motion.button>

      {/* Radial Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Radial Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed top-20 left-6 z-50 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 p-6 min-w-[320px]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Quick Navigation</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="space-y-2">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4, backgroundColor: 'rgba(148, 163, 184, 0.1)' }}
                  onClick={() => handleNavClick(item.id)}
                  className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-slate-900">{item.label}</div>
                    <div className="text-sm text-slate-600">{item.description}</div>
                  </div>
                  <div className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">
                    {item.shortcut}
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-500 text-center">
                Press <kbd className="px-2 py-1 bg-slate-100 rounded text-slate-700">⌘K</kbd> for search
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-start justify-center pt-32"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-4 mb-6">
                <Search className="w-6 h-6 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search metrics, dealers, insights, playbooks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-lg bg-transparent border-0 focus:outline-none placeholder-slate-400"
                  autoFocus
                />
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {searchQuery && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(148, 163, 184, 0.1)' }}
                      onClick={() => handleNavClick(item.id)}
                      className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} text-white`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-slate-900">{item.label}</div>
                        <div className="text-sm text-slate-600">{item.description}</div>
                      </div>
                      <div className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">
                        {item.shortcut}
                      </div>
                    </motion.button>
                  ))}
                  
                  {filteredItems.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Search className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p>No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}

              {!searchQuery && (
                <div className="text-center py-8 text-slate-500">
                  <Command className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Start typing to search...</p>
                  <div className="mt-4 text-sm text-slate-400">
                    Try: "AI visibility", "content optimization", "lead generation"
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
