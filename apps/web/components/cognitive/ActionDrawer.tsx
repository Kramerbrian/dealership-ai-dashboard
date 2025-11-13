'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import { useCognitiveStore } from '@/lib/store/cognitive';

interface ActionDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ActionDrawer({ open, onClose }: ActionDrawerProps) {
  const { drawerContent } = useCognitiveStore();

  return (
    <AnimatePresence>
      {open && drawerContent && (
        <motion.div
          className="fixed inset-0 z-40 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="relative m-4 w-full max-w-lg rounded-2xl border border-neural-800 bg-neural-900/90 p-6 backdrop-blur-xl shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-neural-400 transition-colors hover:bg-neural-800 hover:text-white"
              aria-label="Close action drawer"
            >
              <X size={18} />
            </button>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{drawerContent.title}</h3>
                {drawerContent.description && (
                  <p className="mt-2 text-sm text-neural-300">{drawerContent.description}</p>
                )}
              </div>

              {drawerContent.items && drawerContent.items.length > 0 && (
                <div className="space-y-3 rounded-xl border border-neural-800 bg-neural-950/60 p-4">
                  {drawerContent.items.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center justify-between text-sm ${
                        item.highlight ? 'text-white' : 'text-neural-300'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className={item.highlight ? 'font-semibold text-clarity-cyan' : ''}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {drawerContent.ctaLabel && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl bg-gradient-to-r from-clarity-blue to-clarity-cyan px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-clarity-blue/30 transition-transform hover:-translate-y-0.5"
                >
                  {drawerContent.ctaLabel}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
