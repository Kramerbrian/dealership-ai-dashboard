'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Compass,
  Gauge,
  Loader2,
  Radar,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';

import { OrchestratorDocsModal } from '@/components/OrchestratorDocsModal';
import OrchestratorSchema from '@/components/SEO/OrchestratorSchema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useDealerMetrics } from '@/hooks/useDealerMetrics';
import { cn } from '@/lib/utils';

const DEFAULT_DEALER_NAME = 'Evergreen Auto Group';
const DEFAULT_DOMAIN = 'evergreen-autogroup.com';

type MetricKey = 'ai_visibility' | 'ugc_health' | 'zero_click' | 'geo_trust';

const METRIC_CARDS: Array<{
  key: MetricKey;
  label: string;
  description: string;
  gradient: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    key: 'ai_visibility',
    label: 'AI Visibility Index',
    description: 'Share of conversational AI answers that cite your store.',
    gradient: 'from-sky-500/70 via-cyan-400/50 to-emerald-400/60',
    icon: Radar,
  },
  {
    key: 'zero_click',
    label: 'Zero-Click Coverage',
    description: 'Structured data strength powering instant answers.',
    gradient: 'from-amber-400/80 via-orange-400/60 to-rose-400/60',
    icon: Sparkles,
  },
  {
    key: 'ugc_health',
    label: 'UGC Health Score',
    description: 'Review velocity, sentiment, and response discipline.',
    gradient: 'from-violet-500/60 via-indigo-400/60 to-blue-500/60',
    icon: ShieldCheck,
  },
  {
    key: 'geo_trust',
    label: 'Geo Trust Signal',
    description: 'Local authority across maps, navigation, and service queries.',
    gradient: 'from-emerald-500/60 via-teal-400/60 to-sky-500/60',
    icon: Compass,
  },
];

const STATUS_BADGE_CLASSES: Record<'ok' | 'warn' | 'bad', string> = {
  ok: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
  warn: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
  bad: 'border-rose-400/40 bg-rose-400/10 text-rose-200',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function sanitizeDomain(value: string) {
  return value.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
}

export default function DealershipAIOrchestratorDashboard() {
  const [dealerName, setDealerName] = useState(DEFAULT_DEALER_NAME);
  const [dealerDraft, setDealerDraft] = useState(DEFAULT_DEALER_NAME);
  const [domainDraft, setDomainDraft] = useState(DEFAULT_DOMAIN);
  const [activeDomain, setActiveDomain] = useState(DEFAULT_DOMAIN);

  const { metrics, loading, error, isFallback, refetch } = useDealerMetrics(activeDomain);

  const revenueAtRisk = useMemo(() => {
    const visibilityGap = Math.max(0, 100 - metrics.ai_visibility);
    return Math.round(visibilityGap * 420);
  }, [metrics.ai_visibility]);

  const aiConsensusAverage = useMemo(() => {
    if (!metrics.ai_raw.length) return metrics.ai_visibility;
    const total = metrics.ai_raw.reduce((acc, probe) => acc + probe.consensus, 0);
    return Math.round(total / metrics.ai_raw.length);
  }, [metrics.ai_raw, metrics.ai_visibility]);

  const mentionRate = useMemo(() => {
    const totals = metrics.ai_raw.reduce(
      (acc, probe) => {
        acc.total += probe.individual.length;
        acc.mentions += probe.individual.filter((entry) => entry.mentioned).length;
        return acc;
      },
      { total: 0, mentions: 0 }
    );
    if (!totals.total) return 0;
    return Math.round((totals.mentions / totals.total) * 100);
  }, [metrics.ai_raw]);

  const blockers = useMemo(
    () => metrics.indices.filter((index) => index.status !== 'ok').slice(0, 3),
    [metrics.indices]
  );

  const handleDomainSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextDomain = sanitizeDomain(domainDraft);
    if (!nextDomain) return;
    setActiveDomain(nextDomain);
  };

  const handleDealerSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updated = dealerDraft.trim();
    setDealerName(updated ? updated : DEFAULT_DEALER_NAME);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%)]"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-16">
        <OrchestratorSchema
          dealerName={dealerName}
          domain={metrics.domain}
          aiVisibility={metrics.ai_visibility}
          ugcHealth={metrics.ugc_health}
          zeroClickRate={metrics.zero_click}
          revenueRisk={revenueAtRisk}
        />

        <header className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-200/70">
                DealershipAI Orchestrator
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Unified Visibility & Trust Control Center
              </h1>
              <p className="mt-4 max-w-2xl text-base text-slate-300">
                Live AI coverage intelligence, zero-click schema health, and trust diagnostics built to close
                $499/mo retainers in a single walkthrough.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border border-emerald-500/40 bg-emerald-500/10 text-emerald-200">
                {metrics.tier.toUpperCase()} PLAN
              </Badge>
              <Badge className="border border-cyan-400/40 bg-cyan-400/10 text-cyan-100">
                Consensus {aiConsensusAverage}%
              </Badge>
              <Badge className="border border-purple-400/40 bg-purple-400/10 text-purple-100">
                Mention Rate {mentionRate}%
              </Badge>
              {isFallback && (
                <Badge className="border border-amber-400/40 bg-amber-400/10 text-amber-100">
                  Demo metrics loaded
                </Badge>
              )}
            </div>
          </div>

          <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Dealer Identity</h2>
              <p className="mt-1 text-xs text-slate-400">Update the display name used across schema and reports.</p>
              <form onSubmit={handleDealerSubmit} className="mt-3 flex gap-2">
                <Input
                  value={dealerDraft}
                  onChange={(event) => setDealerDraft(event.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none"
                  placeholder="Dealer name"
                />
                <Button type="submit" variant="secondary" className="rounded-xl bg-white/90 text-slate-900">
                  Save
                </Button>
              </form>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Scan Domain</h2>
              <p className="mt-1 text-xs text-slate-400">Pull orchestrator metrics by domain in seconds.</p>
              <form onSubmit={handleDomainSubmit} className="mt-3 flex gap-2">
                <Input
                  value={domainDraft}
                  onChange={(event) => setDomainDraft(event.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none"
                  placeholder="e.g. fastlaneauto.com"
                />
                <Button type="submit" className="rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white">
                  Launch
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </form>
            </div>

            <div className="flex flex-wrap justify-between gap-3 border-t border-white/10 pt-4 text-xs text-slate-400">
              <span>Tracking {metrics.domain}</span>
              <span>Updated {new Date(metrics.fetchedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </header>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            Failed to refresh live metrics — showing cached demo values. ({error})
          </div>
        )}

        <section className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {METRIC_CARDS.map((card) => {
            const Icon = card.icon;
            const value = metrics[card.key];
            return (
              <div
                key={card.key}
                className={cn(
                  'group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all duration-200 hover:border-white/30 hover:bg-white/10',
                  'shadow-[0_30px_80px_rgba(56,189,248,0.08)]'
                )}
              >
                <div className={cn('absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100', `bg-gradient-to-br ${card.gradient}`)} />
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-300/80">{card.label}</p>
                      <h3 className="mt-2 text-4xl font-semibold tracking-tight text-white">{value}</h3>
                    </div>
                    <span className="rounded-2xl border border-white/20 bg-white/10 p-3 text-cyan-100">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="text-sm text-slate-200/80">{card.description}</p>
                  <Progress
                    value={value}
                    className="h-2 overflow-hidden rounded-full bg-white/10"
                  />
                </div>
              </div>
            );
          })}
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[3fr,2fr]">
          <Card className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur">
            <CardHeader className="flex flex-col gap-2 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">Orchestrator Opportunity Lens</CardTitle>
                <Button
                  variant="ghost"
                  className="rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-slate-100 hover:bg-white/20"
                  onClick={refetch}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  <span className="ml-2">Refresh</span>
                </Button>
              </div>
              <p className="text-sm text-slate-300/80">
                Revenue impact modelling blended with structured data diagnostics so reps can narrate {dealerName}'s AI footprint in under 90 seconds.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
                  <span className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-100">
                    <CheckCircle2 className="h-4 w-4" />
                    Revenue Defended
                  </span>
                  <p className="mt-3 text-2xl font-semibold text-emerald-50">{formatCurrency(125000 - revenueAtRisk)}</p>
                  <p className="mt-1 text-xs text-emerald-100/80">Projected monthly revenue retained with current visibility.</p>
                </div>

                <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4">
                  <span className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-rose-100">
                    <AlertTriangle className="h-4 w-4" />
                    Revenue at Risk
                  </span>
                  <p className="mt-3 text-2xl font-semibold text-rose-50">{formatCurrency(revenueAtRisk)}</p>
                  <p className="mt-1 text-xs text-rose-100/80">Visibility gaps causing lost hand-raisers or call deflection.</p>
                </div>

                <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4">
                  <span className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-cyan-100">
                    <Target className="h-4 w-4" />
                    Priority Plays
                  </span>
                  <p className="mt-3 text-2xl font-semibold text-cyan-50">{blockers.length}</p>
                  <p className="mt-1 text-xs text-cyan-100/80">Critical orchestrations ready to launch this call.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-200/90">
                  <Gauge className="h-4 w-4" />
                  EEAT Heat Signature
                </span>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {Object.entries(metrics.eeat).map(([key, score]) => (
                    <div key={key} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-300/80">
                        <span>{key}</span>
                        <span>{score}</span>
                      </div>
                      <Progress value={score} className="mt-2 h-2 rounded-full bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-200/90">
                  <Activity className="h-4 w-4" />
                  Zero-Click Activation Path
                </span>
                <div className="mt-4 space-y-3 text-sm text-slate-200/80">
                  {blockers.length === 0 && (
                    <p className="text-emerald-200">All orchestrator modules are green. Shift the narrative to conquest plays.</p>
                  )}
                  {blockers.map((blocker) => (
                    <div
                      key={blocker.code}
                      className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3 text-xs"
                    >
                      <Badge className={cn('border px-2 py-1 text-[11px]', STATUS_BADGE_CLASSES[blocker.status])}>
                        {blocker.code}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium text-white">{blocker.name}</p>
                        <p className="mt-1 text-slate-300/80">
                          Score {blocker.score}. Launch Schema Sprint™ and Review Surge™ flows to unlock Tier-1 placement.
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        className="rounded-lg border border-white/10 bg-transparent px-2 py-1 text-[11px] text-cyan-100 hover:bg-white/10"
                      >
                        Auto-Fix
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-white">
                  <Bot className="h-5 w-5 text-cyan-200" />
                  AI Field Coverage
                </CardTitle>
                <p className="text-sm text-slate-300/80">
                  Track which frontier models surface your store in natural language answers.
                </p>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-200/80">
                {metrics.ai_raw.slice(0, 3).map((probe, index) => (
                  <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-300/70">
                        {probe.prompt ?? `Prompt ${index + 1}`}
                      </span>
                      <Badge className="border border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
                        Consensus {probe.consensus}%
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-2">
                      {probe.individual.map((agent, idx) => (
                        <div key={idx} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                          <span className={cn('mt-1 h-2 w-2 rounded-full', agent.mentioned ? 'bg-emerald-400' : 'bg-rose-400')} />
                          <div className="flex-1">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-300/80">{agent.model}</p>
                            <p className="mt-1 text-slate-100">{agent.response}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Tier Coverage</span>
                  <span>{mentionRate}% mention rate • {metrics.ai_raw.length} prompt clusters</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-xl font-semibold">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-200" />
                    Deployment Shortcuts
                  </span>
                  <OrchestratorDocsModal
                    trigger={
                      <Button variant="ghost" className="rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-slate-100 hover:bg-white/20">
                        Docs
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                      </Button>
                    }
                  />
                </CardTitle>
                <p className="text-sm text-slate-300/80">
                  Pre-baked orchestrations reps can trigger in one click during demos.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-200/80">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <Sparkles className="h-5 w-5 text-cyan-200" />
                  <div className="flex-1">
                    <p className="font-medium text-white">Schema Sprint™</p>
                    <p className="text-xs text-slate-300/80">Auto-publishes JSON-LD bundles across site + GMB to remove zero-click gaps.</p>
                  </div>
                  <Button variant="secondary" className="rounded-xl bg-white/90 text-slate-900">Launch</Button>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <Activity className="h-5 w-5 text-emerald-200" />
                  <div className="flex-1">
                    <p className="font-medium text-white">Review Surge™</p>
                    <p className="text-xs text-slate-300/80">Routes negative UGC to trust ops and spins up AI-guided response ladder.</p>
                  </div>
                  <Button variant="ghost" className="rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20">
                    Queue
                  </Button>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <Target className="h-5 w-5 text-amber-200" />
                  <div className="flex-1">
                    <p className="font-medium text-white">Conquest Pulse™</p>
                    <p className="text-xs text-slate-300/80">Deploys conquest prompts to Claude / Perplexity and tracks uplift.</p>
                  </div>
                  <Button variant="ghost" className="rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20">
                    Run
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {loading && (
          <div className="pointer-events-none fixed inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/90 px-5 py-3 text-sm text-slate-200">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
              Syncing orchestrator metrics…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

