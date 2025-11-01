'use client';
import { useState, useEffect } from 'react';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  
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
    { label: 'Export Data', href: '/export' }
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
              <a 
                href={c.href} 
                className="block px-3 py-2 rounded hover:bg-blue-50 transition-colors"
                onClick={handleClose}
              >
                {c.label}
              </a>
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