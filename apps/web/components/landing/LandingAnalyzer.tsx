'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DealerFlyInMap } from './DealerFlyInMap';
import { ClarityStackPanel } from './ClarityStackPanel';
import { AIIntroCard } from './AIIntroCard';
import { MapStyleToggle } from './MapStyleToggle';
import { MAPBOX_STYLES } from '@/lib/config/mapbox-styles';

type Scores = { seo: number; aeo: number; geo: number; avi: number };
type Revenue = { monthly: number; annual: number };
type Location = { lat: number; lng: number; city?: string; state?: string };

export function LandingAnalyzer() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<Scores | null>(null);
  const [revenue, setRevenue] = useState<Revenue | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [introCurrent, setIntroCurrent] = useState<string | null>(null);
  const [introImproved, setIntroImproved] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'night' | 'day'>('night');
  const router = useRouter();

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/clarity/stack?domain=${encodeURIComponent(domain.trim())}`, {
        cache: 'no-store'
      });
      const data = await res.json();
      setScores(data.scores);
      setRevenue(data.revenue_at_risk);
      if (data.location?.lat && data.location?.lng) {
        setLocation({
          lat: data.location.lat,
          lng: data.location.lng,
          city: data.location.city,
          state: data.location.state
        });
      }
      setIntroCurrent(data.ai_intro_current || null);
      setIntroImproved(data.ai_intro_improved || null);
    } finally {
      setLoading(false);
    }
  }

  function handleUnlockDashboard() {
    const q = new URLSearchParams({ domain: domain.trim() }).toString();
    router.push(`/dash?${q}`);
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <form onSubmit={handleAnalyze} className="max-w-2xl">
        <label className="block text-sm text-white/70 mb-1">
          Dealership website
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="naplestoyota.com"
            autoComplete="off"
            className="flex-1 h-11 rounded-full bg-white/5 border border-white/15 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-11 px-5 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-100 disabled:opacity-60"
          >
            {loading ? 'Analyzing…' : 'Analyze my visibility'}
          </button>
        </div>
        <p className="mt-2 text-xs text-white/40">
          We&apos;ll run a light AI visibility scan. Full details unlock in the free dashboard.
        </p>
      </form>

      {scores && revenue && (
        <>
          <div className="mt-10 grid gap-6 md:grid-cols-2 items-start">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs text-white/50">
                  {location
                    ? <>Found your dealership near {location.city}, {location.state}</>
                    : <>We&apos;ll locate your dealership on the map.</>}
                </div>
                <MapStyleToggle mode={mapMode} onToggle={setMapMode} />
              </div>

              {location ? (
                <DealerFlyInMap
                  lat={location.lat}
                  lng={location.lng}
                  mode={mapMode}
                  nightStyleUrl={MAPBOX_STYLES.dark}
                  dayStyleUrl={MAPBOX_STYLES.light}
                />
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] h-[320px] flex items-center justify-center text-white/40 text-sm">
                  Map preview will appear here when we detect your location.
                </div>
              )}
            </div>

            <ClarityStackPanel
              domain={domain.trim()}
              scores={scores}
              revenue={revenue}
              onUnlockDashboard={handleUnlockDashboard}
            />
          </div>

          {introCurrent && introImproved && (
            <AIIntroCard
              domain={domain.trim()}
              currentIntro={introCurrent}
              improvedIntro={introImproved}
              onUnlockDashboard={handleUnlockDashboard}
            />
          )}
        </>
      )}
    </section>
  );
}
