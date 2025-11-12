/**
 * Pulse Thread Drawer
 * Shows event history for a thread (incident/KPI/market)
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePulseStore } from '@/lib/store/pulse-store';
import PulseCardComponent from './PulseCard';

interface PulseThreadDrawerProps {
  threadId: string;
  onClose: () => void;
}

export default function PulseThreadDrawer({ threadId, onClose }: PulseThreadDrawerProps) {
  const { threads } = usePulseStore();
  const thread = threads[threadId];

  if (!thread) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-96 bg-gray-900 border-l border-gray-800 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="border-b border-gray-800 p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">Thread History</h3>
            <p className="text-sm text-gray-400">
              {thread.ref.type}: {thread.ref.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Events */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {thread.events.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>No events in this thread</p>
            </div>
          ) : (
            thread.events.map((card) => (
              <PulseCardComponent key={card.id} card={card} />
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

