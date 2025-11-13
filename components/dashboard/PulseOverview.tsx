'use client';

type Scores = { seo: number; aeo: number; geo: number; avi: number };
type Gbp = { health_score: number; rating?: number; review_count?: number };
type Ugc = { score: number; recent_reviews_90d: number };
type Schema = { score: number };
type Competitive = { rank: number; total: number };

type Props = {
  domain: string;
  scores: Scores;
  gbp: Gbp;
  ugc: Ugc;
  schema: Schema;
  competitive: Competitive;
  revenueMonthly: number;
};

function statusColor(score: number) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

function pillBg(score: number) {
  if (score >= 80) return 'bg-emerald-500/15 border-emerald-500/40';
  if (score >= 60) return 'bg-amber-500/15 border-amber-500/40';
  return 'bg-red-500/15 border-red-500/40';
}

type PriorityItem = {
  id: string;
  label: string;
  reason: string;
  estImpact: string;
};

function buildPriorityStack(scores: Scores, schema: Schema, ugc: Ugc, gbp: Gbp): PriorityItem[] {
  const items: PriorityItem[] = [];

  if (schema.score < 80) {
    items.push({
      id: 'schema',
      label: 'Fix missing schema on key pages',
      reason: 'Your schema score is low. AI cannot clearly read many pages.',
      estImpact: '+4–8 points in AI visibility'
    });
  }

  if (scores.aeo < 75) {
    items.push({
      id: 'aeo',
      label: 'Add clear answers to Service pages',
      reason: 'Your answer score is weak. Service pages are missing FAQs.',
      estImpact: '+3–5 points in answer visibility'
    });
  }

  if (ugc.score < 80) {
    items.push({
      id: 'ugc',
      label: 'Boost fresh reviews and add quotes',
      reason: 'Your review content is under-used on key shopping pages.',
      estImpact: '+2–4 points in trust and engagement'
    });
  }

  if (gbp.health_score < 80) {
    items.push({
      id: 'gbp',
      label: 'Refresh Google Business Profile details',
      reason: 'Your GBP data and photos could be stronger than they are today.',
      estImpact: '+2–4 points in local visibility'
    });
  }

  if (!items.length) {
    items.push({
      id: 'default',
      label: 'Fine-tune content on your most visited pages',
      reason: 'You are in a good spot. Now we focus on small, high-leverage gains.',
      estImpact: '+1–3 points with focused tweaks'
    });
  }

  return items.slice(0, 4);
}

export function PulseOverview({
  domain,
  scores,
  gbp,
  ugc,
  schema,
  competitive,
  revenueMonthly
}: Props) {
  const priorities = buildPriorityStack(scores, schema, ugc, gbp);

  return (
    <div className="space-y-8 px-4 md:px-6 py-6 md:py-8">
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">
            Pulse overview
          </h1>
          <p className="mt-2 text-sm text-white/60">
            This is how AI sees <span className="font-mono text-white/80">{domain}</span> right now.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/50 uppercase tracking-[0.16em]">
            Revenue at risk
          </div>
          <div className="text-lg font-semibold">
            ${revenueMonthly.toLocaleString()}/month
          </div>
          <div className="text-[11px] text-white/40">
            From AI visibility gaps.
          </div>
        </div>
      </section>

      <section>
        <div className="text-xs text-white/50 uppercase tracking-[0.16em] mb-2">
          Clarity stack
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { key: 'SEO', value: scores.seo, desc: 'How easy your site is to read.' },
            { key: 'AEO', value: scores.aeo, desc: 'How well you answer shopper questions.' },
            { key: 'GEO', value: scores.geo, desc: 'How visible you are in AI answers.' },
            { key: 'AVI', value: scores.avi, desc: 'Your overall AI visibility score.' }
          ].map((tile) => (
            <div
              key={tile.key}
              className={`rounded-2xl border px-4 py-3 ${pillBg(tile.value)}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">{tile.key}</span>
                <span className={`text-sm font-semibold ${statusColor(tile.value)}`}>
                  {tile.value}/100
                </span>
              </div>
              <div className="mt-1 text-[11px] text-white/50">
                {tile.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="text-xs text-white/50 uppercase tracking-[0.16em] mb-2">
          System & local signals
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">GBP health</span>
              <span className={`text-sm font-semibold ${statusColor(gbp.health_score)}`}>
                {gbp.health_score}/100
              </span>
            </div>
            <div className="mt-1 text-[11px] text-white/50">
              Rating {gbp.rating?.toFixed(1) ?? '–'} with {gbp.review_count ?? 0} reviews.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">UGC & reviews</span>
              <span className={`text-sm font-semibold ${statusColor(ugc.score)}`}>
                {ugc.score}/100
              </span>
            </div>
            <div className="mt-1 text-[11px] text-white/50">
              {ugc.recent_reviews_90d} reviews in the last 90 days.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Schema coverage</span>
              <span className={`text-sm font-semibold ${statusColor(schema.score)}`}>
                {schema.score}/100
              </span>
            </div>
            <div className="mt-1 text-[11px] text-white/50">
              How clearly your pages are marked up for AI.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Competitive position</span>
              <span className="text-sm font-semibold text-white/80">
                #{competitive.rank} of {competitive.total}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-white/50">
              Your spot in the local AI field.
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="text-xs text-white/50 uppercase tracking-[0.16em] mb-2">
          Priority actions
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <ul className="space-y-3 text-sm text-white/80">
            {priorities.map((p) => (
              <li key={p.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                <div>
                  <div className="font-medium">{p.label}</div>
                  <div className="text-xs text-white/50">{p.reason}</div>
                </div>
                <div className="text-xs text-emerald-300 md:text-right">
                  {p.estImpact}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
