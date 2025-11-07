'use client';
import { useState, useEffect, useMemo } from 'react';
import { getEasterEggQuote } from '@/lib/agent/quoteEngine';

// Simple notification system (can be replaced with toast system)
function addPulse({ level, title, detail }: { level: 'low' | 'medium' | 'high'; title: string; detail?: string }) {
  // Create a simple notification
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg bg-white border-l-4 ${
    level === 'high' ? 'border-red-500' : level === 'medium' ? 'border-yellow-500' : 'border-blue-500'
  }`;
  notification.innerHTML = `
    <div class="font-semibold text-gray-900">${title}</div>
    ${detail ? `<div class="text-sm text-gray-600 mt-1">${detail}</div>` : ''}
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

interface Cmd {
  id: string;
  label: string;
  href?: string;
  run?: () => void;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  
  const commands: Cmd[] = useMemo(() => [
    { id: 'playbooks', label: 'Run Playbook: Recover AI Citations', href: '/playbooks' },
    { id: 'content', label: 'Open Content Optimizer', href: '/content' },
    { id: 'refresh', label: 'Refresh Data', href: '/api/refresh' },
    { id: 'insights', label: 'View Insights Canvas', href: '/insights' },
    { id: 'fixed-ops', label: 'Open Fixed Ops Dashboard', href: '/stubs/fixed-ops' },
    { id: 'dealer-gpt', label: 'Ask DealerGPT', href: '/intelligence#dealer-gpt' },
    { id: 'ai-answer', label: 'View AI Answer Intelligence', href: '/intelligence' },
    { id: 'bot-parity', label: 'Check Bot Parity Monitor', href: '/intelligence#bot-parity' },
    { id: 'data-quality', label: 'Open Data Quality Dashboard', href: '/intelligence#data-quality' },
    { id: 'reports', label: 'Generate Executive Report', href: '/reports' },
    { id: 'anomalies', label: 'View Anomaly Feed', href: '/intelligence#anomalies' },
    { id: 'settings', label: 'Open Settings', href: '/settings' },
    { id: 'locations', label: 'Switch Location', href: '/locations' },
    { id: 'api-keys', label: 'View API Keys', href: '/settings/api-keys' },
    { id: 'export', label: 'Export Data', href: '/export' },
    { 
      id: 'surprise', 
      label: 'Surprise me (PG easter egg)', 
      run: () => {
        const q = getEasterEggQuote();
        addPulse({
          level: 'low',
          title: q ? `"${q.quote}" — ${q.source}` : 'Keeping it classy. No quote this time.',
          detail: 'PG-safe, scarce, and fresh.',
        });
      } 
    },
  ], []);

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

  const results = commands.filter(c => 
    c.label.toLowerCase().includes(q.toLowerCase())
  );
  
  const handleCommand = (cmd: Cmd) => {
    if (cmd.run) {
      cmd.run();
      setOpen(false);
    } else if (cmd.href) {
      window.location.href = cmd.href;
      setOpen(false);
    }
  };

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
            <li key={c.id}>
              <button
                onClick={() => {
                  handleCommand(c);
                  handleClose();
                }}
                className="w-full text-left block px-3 py-2 rounded hover:bg-blue-50 transition-colors"
              >
                {c.label}
              </button>
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