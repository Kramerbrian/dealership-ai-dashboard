'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useHudStore } from '@/lib/store/hud';
import { TOKENS } from '@/styles/design-tokens';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useHudStore();

  const getIcon = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBorderColor = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return '#22c55e';
      case 'error':
        return '#ef4444';
      case 'info':
      default:
        return '#3b82f6';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast: { id: string; message: string; type: 'success' | 'error' | 'info' }) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto rounded-xl border px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-md"
            style={{
              background: TOKENS.color.surface.panel,
              borderColor: getBorderColor(toast.type),
              boxShadow: TOKENS.shadow.soft,
              backdropFilter: 'blur(12px)',
            }}
          >
            {getIcon(toast.type)}
            <div className="flex-1 text-sm" style={{ color: TOKENS.color.text.primary }}>
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-xs opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: TOKENS.color.text.secondary }}
              aria-label="Dismiss toast"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
