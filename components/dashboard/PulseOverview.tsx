'use client';

type Scores = {
  seo: number;
  aeo: number;
  geo: number;
  avi: number;
};

type GBP = {
  health_score: number;
  review_count: number;
  average_rating: number;
};

type UGC = {
  score: number;
  recent_reviews_90d: number;
};

type Schema = {
  score: number;
};

type Competitive = {
  rank: number;
  total: number;
};

type PulseOverviewProps = {
  domain: string;
  scores: Scores;
  gbp: GBP;
  ugc: UGC;
  schema: Schema;
  competitive: Competitive;
  revenueMonthly: number;
};

export function PulseOverview({
  domain,
  scores,
  gbp,
  ugc,
  schema,
  competitive,
  revenueMonthly,
}: PulseOverviewProps) {
  const priorityActions = [
    {
      title: 'Improve GEO Visibility',
      description: `Your GEO score of ${scores.geo} is below optimal. Focus on local schema and GBP optimization.`,
      impact: 'High',
      effort: 'Medium',
    },
    {
      title: 'Boost AEO Presence',
      description: `AEO score of ${scores.aeo} needs work. Add FAQ schema and optimize for AI search.`,
      impact: 'High',
      effort: 'Low',
    },
    {
      title: 'Enhance Schema Coverage',
      description: `Schema score of ${schema.score} indicates missing structured data. Add LocalBusiness and Review schema.`,
      impact: 'Medium',
      effort: 'Low',
    },
  ];

  return (
    <div className="px-4 md:px-6 py-6 md:py-8 space-y-6">
      <section>
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">Pulse Overview</h1>
        <p className="text-sm text-white/60">
          Real-time visibility metrics for {domain}
        </p>
      </section>

      {/* Score Grid */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs text-white/60 uppercase tracking-[0.16em] mb-1">SEO</div>
          <div className="text-3xl font-mono tabular-nums font-semibold text-white mb-1">
            {scores.seo.toFixed(1)}%
          </div>
          <div className="text-xs text-white/50">Search visibility</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs text-white/60 uppercase tracking-[0.16em] mb-1">AEO</div>
          <div className="text-3xl font-mono tabular-nums font-semibold text-white mb-1">
            {scores.aeo.toFixed(1)}%
          </div>
          <div className="text-xs text-white/50">AI search presence</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs text-white/60 uppercase tracking-[0.16em] mb-1">GEO</div>
          <div className="text-3xl font-mono tabular-nums font-semibold text-white mb-1">
            {scores.geo.toFixed(1)}%
          </div>
          <div className="text-xs text-white/50">Local visibility</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs text-white/60 uppercase tracking-[0.16em] mb-1">AVI</div>
          <div className="text-3xl font-mono tabular-nums font-semibold text-white mb-1">
            {scores.avi.toFixed(1)}%
          </div>
          <div className="text-xs text-white/50">AI visibility index</div>
        </div>
      </section>

      {/* Revenue at Risk */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <div className="text-xs text-white/50 uppercase tracking-[0.16em] mb-2">
          Revenue at Risk
        </div>
        <div className="text-4xl font-mono tabular-nums font-semibold text-red-400 mb-1">
          ${(revenueMonthly / 1000).toFixed(0)}K/month
        </div>
        <div className="text-sm text-white/70">
          Estimated monthly revenue loss from poor AI visibility
        </div>
      </section>

      {/* GBP Health */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs text-white/60 uppercase tracking-[0.16em] mb-1">GBP Health</div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-white">
            {gbp.health_score}%
          </div>
          <div className="text-xs text-white/50 mt-1">
            {gbp.review_count} reviews • {gbp.average_rating.toFixed(1)}★
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs text-white/60 uppercase tracking-[0.16em] mb-1">UGC Score</div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-white">
            {ugc.score}%
          </div>
          <div className="text-xs text-white/50 mt-1">
            {ugc.recent_reviews_90d} reviews (90d)
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs text-white/60 uppercase tracking-[0.16em] mb-1">Schema</div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-white">
            {schema.score}%
          </div>
          <div className="text-xs text-white/50 mt-1">
            Structured data coverage
          </div>
        </div>
      </section>

      {/* Competitive Position */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <div className="text-xs text-white/50 uppercase tracking-[0.16em] mb-2">
          Competitive Position
        </div>
        <div className="text-3xl font-mono tabular-nums font-semibold text-white mb-1">
          #{competitive.rank} of {competitive.total}
        </div>
        <div className="text-sm text-white/70">
          Ranked in local market
        </div>
      </section>

      {/* Priority Actions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Priority Actions</h2>
        <div className="space-y-3">
          {priorityActions.map((action, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-white">{action.title}</h3>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    {action.impact}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {action.effort}
                  </span>
                </div>
              </div>
              <p className="text-sm text-white/70">{action.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

