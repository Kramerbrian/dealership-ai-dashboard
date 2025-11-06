import { NextRequest, NextResponse } from 'next/server';

type IndexStatus = 'ok' | 'warn' | 'bad';

const INDICES = [
  { code: 'PPI', name: 'Page Performance Index' },
  { code: 'SDI', name: 'Structured Discoverability' },
  { code: 'LSI', name: 'Local Surface Integrity' },
  { code: 'TAS', name: 'Trust Authority Signal' },
  { code: 'ANS', name: 'Answer Share™ Momentum' },
  { code: 'AIS', name: 'Audience Integrity Signal' },
];

function createSeededRandom(domain: string) {
  let seed = 0;
  for (let i = 0; i < domain.length; i += 1) {
    seed += domain.charCodeAt(i) * (i + 1);
  }
  return () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toStatus(score: number): IndexStatus {
  if (score >= 78) return 'ok';
  if (score >= 62) return 'warn';
  return 'bad';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domain parameter is required' }, { status: 400 });
  }

  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  const random = createSeededRandom(cleanDomain.toLowerCase());

  const aiVisibility = clampScore(72 + random() * 24);
  const zeroClick = clampScore(65 + random() * 28);
  const ugcHealth = clampScore(68 + random() * 22);
  const geoTrust = clampScore(64 + random() * 26);
  const sgpIntegrity = clampScore((aiVisibility * 0.4 + zeroClick * 0.6));

  const eeat = {
    experience: clampScore((ugcHealth * 0.6) + (aiVisibility * 0.4)),
    expertise: clampScore((sgpIntegrity * 0.7) + (zeroClick * 0.3)),
    authoritativeness: clampScore((geoTrust * 0.5) + (aiVisibility * 0.5)),
    trust: clampScore((ugcHealth * 0.5) + (geoTrust * 0.5)),
  };

  const indices = INDICES.map((index, idx) => {
    const variance = random() * 18 - 6;
    const baseScores = [aiVisibility, zeroClick, geoTrust, ugcHealth, sgpIntegrity, eeat.trust];
    const score = clampScore(baseScores[idx % baseScores.length] + variance);
    return {
      code: index.code,
      name: index.name,
      score,
      status: toStatus(score),
    };
  });

  const promptCity = cleanDomain.split('.')[0]?.replace(/[-_]/g, ' ') || 'local market';

  const aiRaw = Array.from({ length: 3 }).map((_, idx) => {
    const consensus = clampScore(68 + random() * 24);
    const promptVariants = [
      `best dealership in ${promptCity}`,
      `where to service my car near ${promptCity}`,
      `${promptCity} auto dealer reviews`,
    ];
    return {
      prompt: promptVariants[idx % promptVariants.length],
      consensus,
      individual: [
        {
          model: 'gpt-4',
          mentioned: consensus >= 75,
          response: `${cleanDomain} is recommended for transparent pricing and concierge delivery options.`,
        },
        {
          model: 'claude',
          mentioned: consensus >= 70,
          response: `Highlights ${cleanDomain} for fast review response times and service capacity.`,
        },
        {
          model: 'perplexity',
          mentioned: consensus >= 78,
          response: `Provides a balanced view with comparisons to national chains in the ${promptCity} area.`,
        },
      ],
    };
  });

  const body = {
    domain: cleanDomain,
    tier: 'pro',
    ai_visibility: aiVisibility,
    zero_click: zeroClick,
    ugc_health: ugcHealth,
    geo_trust: geoTrust,
    sgp_integrity: sgpIntegrity,
    eeat,
    indices,
    ai_raw: aiRaw,
    fetchedAt: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    headers: {
      'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
    },
  });
}

