/**
 * Pulse Inbox - Decision Inbox Component
 * Upgraded from ticker to actionable decision inbox
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Zap,
  Clock,
  Bell,
  Filter,
  Eye,
  Wrench,
  UserPlus,
  VolumeX,
  History,
} from 'lucide-react';
import { usePulseStore } from '@/lib/store/pulse-store';
import type { PulseCard, PulseFilter } from '@/lib/types/pulse';
import PulseCardComponent from './PulseCard';
import PulseThreadDrawer from './PulseThreadDrawer';
import PulseDigest from './PulseDigest';

const FILTERS: { id: PulseFilter; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: <Bell className="w-4 h-4" /> },
  { id: 'critical', label: 'Critical', icon: <AlertTriangle className="w-4 h-4" /> },
  { id: 'kpi_delta', label: 'KPI', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'incident', label: 'Incidents', icon: <XCircle className="w-4 h-4" /> },
  { id: 'market_signal', label: 'Market', icon: <TrendingDown className="w-4 h-4" /> },
  { id: 'system_health', label: 'System', icon: <CheckCircle className="w-4 h-4" /> },
];

export default function PulseInbox() {
  const {
    pulse,
    filter,
    digestMode,
    setFilter,
    setDigestMode,
    selectedThread,
    setSelectedThread,
  } = usePulseStore();

  const [keyboardMode, setKeyboardMode] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter cards
  const filteredCards = pulse.filter((card) => {
    if (filter === 'all') return true;
    if (filter === 'critical') return card.level === 'critical';
    if (filter === 'incident') return card.kind === 'incident_opened' || card.kind === 'incident_resolved';
    return card.kind === filter;
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?') {
        setKeyboardMode(!keyboardMode);
        return;
      }

      if (!keyboardMode) return;

      switch (e.key) {
        case 'j':
          setSelectedIndex((prev) => Math.min(prev + 1, filteredCards.length - 1));
          break;
        case 'k':
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          if (filteredCards[selectedIndex]) {
            handlePrimaryAction(filteredCards[selectedIndex]);
          }
          break;
        case 'm':
          if (filteredCards[selectedIndex]?.dedupe_key) {
            usePulseStore.getState().mute(filteredCards[selectedIndex].dedupe_key!, 24 * 60);
          }
          break;
        case 'h':
          if (filteredCards[selectedIndex]?.thread) {
            setSelectedThread(filteredCards[selectedIndex].thread!.id);
          }
          break;
        case 'Escape':
          setKeyboardMode(false);
          setSelectedThread(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [keyboardMode, selectedIndex, filteredCards]);

  const handlePrimaryAction = (card: PulseCard) => {
    if (card.actions?.includes('open')) {
      if (card.thread) {
        setSelectedThread(card.thread.id);
      }
    } else if (card.actions?.includes('fix')) {
      // Trigger auto-fix
      console.log('Triggering fix for:', card);
    }
  };

  // Calculate at-a-glance banner
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCards = pulse.filter((c) => new Date(c.ts) >= today);
  const aivDelta = todayCards
    .filter((c) => c.kind === 'kpi_delta' && c.context?.kpi === 'AIV')
    .reduce((sum, c) => {
      const delta = typeof c.delta === 'number' ? c.delta : parseFloat(String(c.delta || 0));
      return sum + delta;
    }, 0);
  const incidentsResolved = todayCards.filter((c) => c.kind === 'incident_resolved').length;
  const slaRisks = todayCards.filter((c) => c.kind === 'sla_breach').length;

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white">
      {/* Header with filters and digest toggle */}
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Pulse Inbox</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDigestMode(!digestMode)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                digestMode
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Digest Mode
            </button>
            {keyboardMode && (
              <span className="text-xs text-gray-400">Keyboard mode active (?)</span>
            )}
          </div>
        </div>

        {/* At-a-glance banner */}
        <div className="bg-gray-900 rounded-lg p-3 mb-4">
          <div className="text-sm text-gray-400 mb-1">Today</div>
          <div className="flex items-center gap-4 text-sm">
            <span className={aivDelta >= 0 ? 'text-green-400' : 'text-red-400'}>
              {aivDelta >= 0 ? '+' : ''}
              {aivDelta.toFixed(1)} AIV
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-green-400">{incidentsResolved} incidents resolved</span>
            <span className="text-gray-300">•</span>
            <span className={slaRisks > 0 ? 'text-red-400' : 'text-gray-400'}>
              {slaRisks} SLA risk{slaRisks !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filter === f.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {digestMode ? (
          <PulseDigest cards={filteredCards} />
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredCards.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pulse cards match the current filter</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PulseCardComponent
                      card={card}
                      isSelected={keyboardMode && index === selectedIndex}
                      onAction={handlePrimaryAction}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Thread Drawer */}
      {selectedThread && (
        <PulseThreadDrawer
          threadId={selectedThread}
          onClose={() => setSelectedThread(null)}
        />
      )}

      {/* Keyboard help */}
      {keyboardMode && (
        <div className="border-t border-gray-800 p-4 bg-gray-900">
          <div className="text-xs text-gray-400 space-y-1">
            <div>
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">J</kbd> /{' '}
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">K</kbd> = navigate •{' '}
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Enter</kbd> = action •{' '}
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">M</kbd> = mute •{' '}
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">H</kbd> = history •{' '}
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Esc</kbd> = close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

