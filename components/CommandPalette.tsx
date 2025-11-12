'use client';
import { useState, useEffect } from 'react';
import { getEasterEggQuote, getNeutralCoachLine } from '@/lib/agent/quoteEngine';
import { usePrefsStore } from '@/lib/store/prefs';
import { showToast } from '@/lib/store/toast';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const { agentEnabled } = usePrefsStore();
  
  const cmds = [
    { label: 'Run Playbook: Recover AI Citations', href: '/playbooks' },
    { label: 'Open Content Optimizer', href: '/content' },
    { label: 'Refresh Data', href: '/api/refresh' },
    { label: 'View Insights Canvas', href: '/insights' },
    { label: 'Open Fixed Ops Dashboard', href: '/stubs/fixed-ops' },
    { label: 'Ask DealerGPT', href: '/intelligence#dealer-gpt' },
    { label: 'View AI Answer Intelligence', href: '/intelligence' },
    { label: 'Check Bot Parity Monitor', href: '/intelligence#bot-parity' },
    { label: 'Open Data Quality Dashboard', href: '/intelligence#data-quality' },
    { label: 'Generate Executive Report', href: '/reports' },
    { label: 'View Anomaly Feed', href: '/intelligence#anomalies' },
    { label: 'Open Settings', href: '/settings' },
    { label: 'Switch Location', href: '/locations' },
    { label: 'View API Keys', href: '/settings/api-keys' },
    { label: 'Export Data', href: '/export' },
    { 
      label: 'Surprise me (PG easter egg)', 
      href: '#',
      action: () => {
        if (agentEnabled) {
          const q = getEasterEggQuote();
          if (q) {
            showToast({
              level: 'success',
              title: 'Coach Boost',
              message: `"${q.quote}" — ${q.source}`,
            });
          } else {
            const line = getNeutralCoachLine();
            showToast({
              level: 'info',
              title: 'Coach',
              message: line,
            });
          }
        } else {
          showToast({
            level: 'info',
            title: 'Easter Eggs Disabled',
            message: 'Enable PG Easter Eggs in Settings to see quotes.',
          });
        }
        setOpen(false);
      }
    }
  ];

  useEffect(() => {
    const k = (e: KeyboardEvent) => { 
      if (e.metaKey && e.key.toLowerCase() === 'k') { 
        e.preventDefault(); 
        setOpen(o => !o); 
      } 
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  useEffect(() => {
    if (open) {
      setQ('');
    }
  }, [open]);

  if (!open) return null;

  const results = cmds.filter(c => 
    c.label.toLowerCase().includes(q.toLowerCase())
  );

  const handleClose = () => setOpen(false);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-24"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-lg rounded-2xl bg-white/90 backdrop-blur p-4 shadow-xl space-y-2"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus 
          value={q} 
          onChange={e => setQ(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command or search..."
          className="w-full rounded-md border border-gray-200 p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <ul className="max-h-60 overflow-auto">
          {results.map((c, i) => (
            <li key={i}>
              {c.action ? (
                <button
                  onClick={() => {
                    c.action?.();
                    handleClose();
                  }}
                  className="block w-full text-left px-3 py-2 rounded hover:bg-blue-50 transition-colors"
                >
                  {c.label}
                </button>
              ) : (
                <a 
                  href={c.href} 
                  className="block px-3 py-2 rounded hover:bg-blue-50 transition-colors"
                  onClick={handleClose}
                >
                  {c.label}
                </a>
              )}
            </li>
          ))}
          {!results.length && (
            <li className="text-sm text-gray-400 px-3 py-2">No results</li>
          )}
        </ul>
        <div className="text-xs text-gray-500 px-3 py-1 border-t">
          Press ⌘K to toggle • Esc to close
        </div>
      </div>
    </div>
  );
}