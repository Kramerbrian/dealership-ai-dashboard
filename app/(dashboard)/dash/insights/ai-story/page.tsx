import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

async function getAIStory(tenant: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai-story?tenant=${tenant}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return {
        tenant,
        current: 'Loading...',
        improved: 'Loading...',
        history: [],
      };
    }
    return res.json();
  } catch {
    return {
      tenant,
      current: 'Unable to load AI story.',
      improved: 'Unable to load improved version.',
      history: [],
    };
  }
}

export default async function AIStoryPage({ searchParams }: { searchParams: { tenant?: string } }) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const tenant = searchParams.tenant || userId;
  const data = await getAIStory(tenant);

  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-8">
      <h1 className="text-2xl font-semibold">How AI describes your dealership</h1>
      <p className="mt-2 text-sm text-white/60 max-w-xl">
        This shows how your online work changes the way AI talks about your store over time.
      </p>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs text-white/50 uppercase tracking-[0.16em]">Today</div>
          <p className="mt-2 text-sm text-white/80">"{data.current}"</p>

          <div className="mt-4 text-xs text-white/50 uppercase tracking-[0.16em]">Improved</div>
          <p className="mt-2 text-sm text-emerald-300">"{data.improved}"</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs text-white/50 uppercase tracking-[0.16em]">Timeline</div>
          <ul className="mt-3 space-y-3 text-sm text-white/75">
            {data.history && data.history.length > 0 ? (
              data.history.map((h: any, i: number) => (
                <li key={i}>
                  <div className="text-xs text-white/50">{new Date(h.as_of).toLocaleDateString()}</div>
                  <div className="mt-1 text-sm">"{h.intro}"</div>
                  {h.events && h.events.length > 0 && (
                    <ul className="mt-1 list-disc list-inside text-xs text-white/50">
                      {h.events.map((e: string, j: number) => <li key={j}>{e}</li>)}
                    </ul>
                  )}
                </li>
              ))
            ) : (
              <li className="text-xs text-white/50">No history yet. Start making improvements to see your AI story evolve.</li>
            )}
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
    </main>
  );
}

