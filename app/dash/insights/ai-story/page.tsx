import { DashboardShell } from '@/components/dashboard/DashboardShell';

async function fetchAIStory(tenant?: string) {
  const qs = new URLSearchParams();
  if (tenant) qs.set('tenant', tenant);
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const url = base
    ? `${base}/api/ai-story?${qs.toString()}`
    : `/api/ai-story?${qs.toString()}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to load AI story');
  }
  return res.json();
}

export default async function AIStoryPage({ searchParams }: { searchParams?: { tenant?: string } }) {
  const tenant = searchParams?.tenant || 'dlr_example';
  const data = await fetchAIStory(tenant);

  return (
    <DashboardShell>
      <main className="min-h-dvh bg-neutral-950 text-white">
        <div className="px-4 md:px-6 py-6 md:py-8 max-w-5xl">
          <h1 className="text-2xl md:text-3xl font-semibold">
            How AI describes your dealership
          </h1>
          <p className="mt-2 text-sm text-white/60 max-w-xl">
            This shows how your online work changes the way AI talks about your store over time.
          </p>

          <section className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="text-xs text-white/50 uppercase tracking-[0.16em]">
                Today
              </div>
              <p className="mt-2 text-sm text-white/80">
                "{data.current}"
              </p>

              <div className="mt-4 text-xs text-white/50 uppercase tracking-[0.16em]">
                Improved
              </div>
              <p className="mt-2 text-sm text-emerald-300">
                "{data.improved}"
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="text-xs text-white/50 uppercase tracking-[0.16em]">
                Timeline
              </div>
              <ul className="mt-3 space-y-3 text-sm text-white/75">
                {data.history?.map((h: any, i: number) => (
                  <li key={i}>
                    <div className="text-xs text-white/50">
                      {new Date(h.as_of).toLocaleDateString()}
                    </div>
                    <div className="mt-1 text-sm">
                      "{h.intro}"
                    </div>
                    {h.events?.length > 0 && (
                      <ul className="mt-1 list-disc list-inside text-xs text-white/50">
                        {h.events.map((e: string, j: number) => (
                          <li key={j}>{e}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-white/80">
              Want to move faster? Autopilot can handle safe fixes for schema, FAQs, and basic content so AI gets a clearer story about your store.
            </p>
            <button className="mt-4 h-9 px-4 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-100 transition">
              Turn on Autopilot
            </button>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}
