'use client';
import { useEffect, useState } from 'react';

export default function DealerGPTPanel() {
  const [q, setQ] = useState('');
  const [a, setA] = useState<string | null>(null);
  const [pb, setPb] = useState<{ id: string; title: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const h = (e: Event) => { // receive anomaly→why event
      const detail = (e as CustomEvent).detail as { 
        metric: string; 
        delta: number; 
        dir: 'up' | 'down'; 
        week: number 
      };
      setQ(`Why did ${detail.metric} go ${detail.dir} ${Math.abs(detail.delta)}%?`);
      setLoading(true);
      
      fetch('/api/explain', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(detail)
      })
        .then(r => r.json())
        .then(x => { 
          setA(x.summary + (x.causes?.length ? `\n\n• ${x.causes.join('\n• ')}` : '')); 
          setPb(x.playbook); 
          setLoading(false);
        })
        .catch(() => {
          setA('Sorry, I couldn\'t analyze that anomaly right now. Please try again.');
          setLoading(false);
        });
    };
    
    window.addEventListener('dealergpt:why', h as EventListener);
    return () => window.removeEventListener('dealergpt:why', h as EventListener);
  }, []);

  const runPlaybook = () => {
    if (!pb) return;
    setA(`✅ Queued: "${pb.title}" will run in Safe Mode (preview only, no changes yet).\n\nYou'll receive a notification when the preview is ready for review.`);
  };

  const testExplain = () => {
    setLoading(true);
    fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metric: 'AI Visibility', delta: 6, dir: 'down', week: 7 })
    })
      .then(r => r.json())
      .then(x => { 
        setA(x.summary + `\n\n• ${x.causes.join('\n• ')}`); 
        setPb(x.playbook); 
        setLoading(false);
      })
      .catch(() => {
        setA('Sorry, I couldn\'t analyze that anomaly right now. Please try again.');
        setLoading(false);
      });
  };

  return (
    <div id="dealer-gpt" className="rounded-2xl border p-4 bg-white/70 shadow space-y-3">
      <div className="font-semibold flex items-center gap-2">
        <span>🤖</span>
        DealerGPT (Preview)
        <span className="text-xs font-normal text-gray-500">
          AI-powered insights & fixes
        </span>
      </div>
      
      <textarea 
        className="w-full rounded border p-2 bg-white text-sm" 
        rows={3} 
        value={q} 
        onChange={e => setQ(e.target.value)} 
        placeholder="Ask why something changed, or describe a problem you're seeing..."
      />
      
      <div className="flex gap-2">
        <button 
          onClick={() => {
            if (!q.trim()) return;
            setLoading(true);
            fetch('/api/explain', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ metric: q, delta: 0, dir: 'down', week: 1 })
            })
              .then(r => r.json())
              .then(x => { 
                setA(x.summary + (x.causes?.length ? `\n\n• ${x.causes.join('\n• ')}` : '')); 
                setPb(x.playbook); 
                setLoading(false);
              })
              .catch(() => {
                setA('Sorry, I couldn\'t analyze that question right now. Please try again.');
                setLoading(false);
              });
          }}
          disabled={loading || !q.trim()}
          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? 'Analyzing...' : 'Explain'}
        </button>
        
        <button 
          onClick={testExplain}
          disabled={loading}
          className="px-3 py-1 rounded bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 text-sm"
        >
          Test
        </button>
        
        {pb && (
          <button 
            onClick={runPlaybook} 
            className="px-3 py-1 rounded bg-gray-900 text-white hover:bg-gray-800 text-sm"
          >
            Run: {pb.title}
          </button>
        )}
      </div>
      
      {a && (
        <div className="rounded border bg-white p-3 text-sm whitespace-pre-wrap">
          {a}
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        💡 Tip: Click "Why?" on any anomaly to get instant analysis
      </div>
    </div>
  );
}