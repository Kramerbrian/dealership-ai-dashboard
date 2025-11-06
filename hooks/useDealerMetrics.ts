import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '@/lib/apiConfig';

export type DealerIndexStatus = 'ok' | 'warn' | 'bad';

export interface DealerIndex {
  code: string;
  name: string;
  score: number;
  status: DealerIndexStatus;
}

export interface DealerAIResult {
  model: string;
  mentioned: boolean;
  response: string;
}

export interface DealerAIProbe {
  prompt?: string;
  consensus: number;
  individual: DealerAIResult[];
}

export interface DealerEeatBreakdown {
  experience: number;
  expertise: number;
  authoritativeness: number;
  trust: number;
}

export interface DealerMetrics {
  domain: string;
  tier: string;
  ai_visibility: number;
  zero_click: number;
  ugc_health: number;
  geo_trust: number;
  sgp_integrity: number;
  eeat: DealerEeatBreakdown;
  indices: DealerIndex[];
  ai_raw: DealerAIProbe[];
  fetchedAt: string;
  source: 'api' | 'fallback';
}

const FALLBACK_METRICS: DealerMetrics = {
  domain: 'evergreen-autogroup.com',
  tier: 'pro',
  ai_visibility: 87,
  zero_click: 74,
  ugc_health: 82,
  geo_trust: 79,
  sgp_integrity: 71,
  eeat: {
    experience: 86,
    expertise: 78,
    authoritativeness: 83,
    trust: 80,
  },
  indices: [
    { code: 'PPI', name: 'Page Performance Index', score: 84, status: 'ok' },
    { code: 'SDI', name: 'Structured Discoverability', score: 72, status: 'warn' },
    { code: 'LSI', name: 'Local Surface Integrity', score: 79, status: 'ok' },
    { code: 'TAS', name: 'Trust Authority Signal', score: 68, status: 'warn' },
    { code: 'ANS', name: 'Answer Share™ Momentum', score: 64, status: 'bad' },
    { code: 'AIS', name: 'Audience Integrity Signal', score: 81, status: 'ok' },
  ],
  ai_raw: [
    {
      prompt: 'Best luxury dealership in Cape Coral',
      consensus: 82,
      individual: [
        {
          model: 'gpt-4',
          mentioned: true,
          response: 'Evergreen Auto Group is highlighted for same-day concierge delivery and AI-powered sales follow-up.',
        },
        {
          model: 'claude',
          mentioned: true,
          response: 'Claude cites Evergreen Auto Group for transparent pricing and high-volume EV inventory availability.',
        },
        {
          model: 'perplexity',
          mentioned: false,
          response: 'Perplexity references national rankings but omits the Evergreen brand in the top recommendations.',
        },
      ],
    },
    {
      prompt: 'Where to service a Honda near Cape Coral',
      consensus: 76,
      individual: [
        {
          model: 'gpt-4',
          mentioned: true,
          response: 'Recommends Evergreen Auto Group for express service lanes and AI triaged maintenance.',
        },
        {
          model: 'claude',
          mentioned: true,
          response: 'Names Evergreen and two nearby independents, noting Evergreen’s Google response time under 25 minutes.',
        },
        {
          model: 'perplexity',
          mentioned: false,
          response: 'Suggests a branded national chain instead of the dealership, indicating schema gaps.',
        },
      ],
    },
  ],
  fetchedAt: new Date().toISOString(),
  source: 'fallback',
};

const STATUS_MAP: Record<string, DealerIndexStatus> = {
  ok: 'ok',
  warn: 'warn',
  warning: 'warn',
  good: 'ok',
  bad: 'bad',
  critical: 'bad',
};

function clampScore(value: unknown, defaultValue: number): number {
  const numeric = typeof value === 'number' && !Number.isNaN(value) ? value : Number(value);
  if (typeof numeric !== 'number' || Number.isNaN(numeric)) {
    return defaultValue;
  }
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

function normaliseIndices(data: any): DealerIndex[] {
  if (!Array.isArray(data)) {
    return FALLBACK_METRICS.indices;
  }

  const mapped = data
    .map((entry: any, idx: number) => {
      const code = entry?.code ?? entry?.c ?? `IDX-${idx + 1}`;
      const name = entry?.name ?? entry?.n ?? `Index ${idx + 1}`;
      const score = clampScore(entry?.score ?? entry?.s, FALLBACK_METRICS.indices[idx]?.score ?? 60);
      const statusKey = String(entry?.status ?? entry?.t ?? 'warn').toLowerCase();
      const status = STATUS_MAP[statusKey] ?? 'warn';
      return { code, name, score, status } satisfies DealerIndex;
    })
    .slice(0, 8);

  return mapped.length > 0 ? mapped : FALLBACK_METRICS.indices;
}

function normaliseAIProbes(data: any): DealerAIProbe[] {
  if (!Array.isArray(data)) {
    return FALLBACK_METRICS.ai_raw;
  }

  return data.map((probe: any) => {
    const consensus = clampScore(probe?.consensus, 70);
    const individual = Array.isArray(probe?.individual)
      ? probe.individual.map((item: any) => ({
          model: String(item?.model ?? 'model').toLowerCase(),
          mentioned: Boolean(item?.mentioned),
          response: String(item?.response ?? ''),
        }))
      : [];

    return {
      prompt: typeof probe?.prompt === 'string' ? probe.prompt : undefined,
      consensus,
      individual,
    } satisfies DealerAIProbe;
  });
}

function deriveEeat(base: any): DealerEeatBreakdown {
  if (base && typeof base === 'object' && base.experience) {
    return {
      experience: clampScore(base.experience, FALLBACK_METRICS.eeat.experience),
      expertise: clampScore(base.expertise, FALLBACK_METRICS.eeat.expertise),
      authoritativeness: clampScore(base.authoritativeness, FALLBACK_METRICS.eeat.authoritativeness),
      trust: clampScore(base.trust, FALLBACK_METRICS.eeat.trust),
    } satisfies DealerEeatBreakdown;
  }

  const currentScores = base?.currentScores;
  if (currentScores && typeof currentScores === 'object') {
    const qai = clampScore(currentScores.qai, FALLBACK_METRICS.eeat.experience);
    const vai = clampScore(currentScores.vai, FALLBACK_METRICS.eeat.authoritativeness);
    const dtri = clampScore(currentScores.dtri, FALLBACK_METRICS.eeat.trust);
    return {
      experience: clampScore(qai, FALLBACK_METRICS.eeat.experience),
      expertise: clampScore((qai + vai) / 2, FALLBACK_METRICS.eeat.expertise),
      authoritativeness: clampScore(vai, FALLBACK_METRICS.eeat.authoritativeness),
      trust: clampScore(dtri, FALLBACK_METRICS.eeat.trust),
    } satisfies DealerEeatBreakdown;
  }

  return FALLBACK_METRICS.eeat;
}

function normaliseDealerMetrics(payload: any, domain: string): DealerMetrics {
  const base = payload?.success ? payload.data : payload;
  const currentScores = base?.currentScores;

  const aiVisibility = clampScore(
    base?.ai_visibility ?? currentScores?.vai,
    FALLBACK_METRICS.ai_visibility,
  );
  const zeroClick = clampScore(
    base?.zero_click ?? currentScores?.ovi,
    FALLBACK_METRICS.zero_click,
  );
  const ugcHealth = clampScore(
    base?.ugc_health ?? (currentScores ? 100 - (currentScores.piqr ?? 35) : undefined),
    FALLBACK_METRICS.ugc_health,
  );
  const geoTrust = clampScore(
    base?.geo_trust ?? currentScores?.dtri,
    FALLBACK_METRICS.geo_trust,
  );
  const sgpIntegrity = clampScore(
    base?.sgp_integrity ?? Math.round((currentScores?.qai ?? FALLBACK_METRICS.sgp_integrity) * 0.9),
    FALLBACK_METRICS.sgp_integrity,
  );

  return {
    domain,
    tier: typeof base?.tier === 'string' ? base.tier : FALLBACK_METRICS.tier,
    ai_visibility: aiVisibility,
    zero_click: zeroClick,
    ugc_health: ugcHealth,
    geo_trust: geoTrust,
    sgp_integrity: sgpIntegrity,
    eeat: deriveEeat(base?.eeat ?? base),
    indices: normaliseIndices(base?.indices),
    ai_raw: normaliseAIProbes(base?.ai_raw),
    fetchedAt: new Date().toISOString(),
    source: 'api',
  } satisfies DealerMetrics;
}

export function useDealerMetrics(domain: string | null) {
  const [metrics, setMetrics] = useState<DealerMetrics>(FALLBACK_METRICS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refetch = useCallback(() => {
    setRefreshToken(Date.now());
  }, []);

  useEffect(() => {
    if (!domain) {
      setMetrics(FALLBACK_METRICS);
      return;
    }

    const controller = new AbortController();
    const url = `${API_BASE_URL.replace(/\/$/, '')}/ai-scores?domain=${encodeURIComponent(domain)}`;

    let isCancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Unable to load metrics (${response.status})`);
        }

        const json = await response.json();
        if (!isCancelled) {
          setMetrics(normaliseDealerMetrics(json, domain));
        }
      } catch (err) {
        if (controller.signal.aborted || isCancelled) {
          return;
        }
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setMetrics({
          ...FALLBACK_METRICS,
          domain,
          fetchedAt: new Date().toISOString(),
          source: 'fallback',
        });
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [domain, refreshToken]);

  const fallbackActive = useMemo(() => metrics.source === 'fallback', [metrics.source]);

  return {
    metrics,
    loading,
    error,
    isFallback: fallbackActive,
    refetch,
  };
}

export function buildDemoMetrics(overrides: Partial<DealerMetrics> = {}): DealerMetrics {
  return {
    ...FALLBACK_METRICS,
    ...overrides,
    eeat: {
      ...FALLBACK_METRICS.eeat,
      ...overrides.eeat,
    },
    indices: overrides.indices ?? FALLBACK_METRICS.indices,
    ai_raw: overrides.ai_raw ?? FALLBACK_METRICS.ai_raw,
    fetchedAt: overrides.fetchedAt ?? new Date().toISOString(),
  } satisfies DealerMetrics;
}

