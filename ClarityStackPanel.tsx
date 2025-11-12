'use client';

type Scores = {
  seo: number;
  aeo: number;
  geo: number;
  avi: number;
};

type RevenueAtRisk = {
  monthly: number;
  annual: number;
};

type ClarityStackPanelProps = {
  domain: string;
  scores: Scores;
  revenue: RevenueAtRisk;
  onUnlockDashboard: () => void;
};

function barClass(score: number) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

function SummaryLine({ scores }: { scores: Scores }) {
  if (scores.avi >= 80) {
    return <span>AI already sees you. Now it needs reasons to pick you.</span>;
  }
  if (scores.geo <= 50) {
    return <span>Most AI answers don&apos;t see your offers or schema yet.</span>;
  }
  if (scores.aeo <= 50) {
    return <span>Answers live in walls of text, not in clear answer blocks.</span>;
  }
  return <span>You exist, but you&apos;re easy to skip in AI results.</span>;
}

export function ClarityStackPanel({ domain, scores, revenue, onUnlockDashboard }: ClarityStackPanelProps) {
  const rows = [
    {
      key: 'seo',
      label: 'SEO Health',
      value: scores.seo,
      note: 'Technical and on-page foundations.'
    },
    {
      key: 'aeo',
      label: 'AEO (Answer Engine)',
      value: scores.aeo,
      note: 'How easily you can be quoted as an answer.'
    },
    {
      key: 'geo',
      label: 'GEO (Generative)',
      value: scores.geo,
      note: 'How visible you are in AI-style results.'
    },
    {
      key: 'avi',
      label: 'AI Visibility Index',
      value: scores.avi,
      note: 'Your overall visibility score.'
    }
  ];

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-white">
      <div className="text-xs uppercase tracking-[0.16em] text-white/50">
        AI Clarity Stack
      </div>
      <div className="mt-1 text-sm text-white/70 truncate">
        {domain}
      </div>
      <div className="mt-4 text-xs text-white/60">
        <SummaryLine scores={scores} />
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.key}>
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>{row.label}</span>
              <span className="font-mono text-white/80">{row.value}/100</span>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full ${barClass(row.value)}`}
                style={{ width: `${Math.max(5, row.value)}%` }}
              />
            </div>
            <div className="mt-1 text-[11px] text-white/40">
              {row.note}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="text-xs text-white/60">
          Estimated revenue at risk from AI visibility gaps:
        </div>
        <div className="mt-1 text-lg font-semibold">
          ${revenue.monthly.toLocaleString()}/month
        </div>
        <div className="text-[11px] text-white/40">
          ~${revenue.annual.toLocaleString()} per year.
        </div>
      </div>

      <button
        onClick={onUnlockDashboard}
        className="mt-5 h-10 w-full rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-100 transition"
      >
        Unlock full dashboard (Free)
      </button>
      <div className="mt-1 text-[11px] text-white/40 text-center">
        No credit card. Just visibility.
      </div>
    </div>
  );
}
