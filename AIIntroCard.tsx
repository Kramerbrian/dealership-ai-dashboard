'use client';

type AIIntroCardProps = {
  domain: string;
  currentIntro: string;
  improvedIntro: string;
  onUnlockDashboard: () => void;
};

export function AIIntroCard({
  domain,
  currentIntro,
  improvedIntro,
  onUnlockDashboard
}: AIIntroCardProps) {
  return (
    <section className="mt-8 w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-white">
      <div className="text-xs uppercase tracking-[0.16em] text-white/50">
        How AI sees you today
      </div>
      <div className="mt-1 text-sm text-white/70 truncate">
        {domain}
      </div>

      <h2 className="mt-4 text-sm font-semibold text-white">
        How AI would introduce your dealership today
      </h2>
      <p className="mt-2 text-sm text-white/80">
        “{currentIntro}”
      </p>

      <p className="mt-4 text-xs text-white/60">
        Or, DealershipAI can help you make it sound more like this:
      </p>
      <p className="mt-1 text-sm text-emerald-300">
        “{improvedIntro}”
      </p>

      <button
        onClick={onUnlockDashboard}
        className="mt-6 h-10 w-full rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-100 transition"
      >
        Want to make the better version real? → Unlock dashboard
      </button>

      <p className="mt-1 text-[11px] text-white/40 text-center">
        No credit card. Just a clearer story in AI search.
      </p>
    </section>
  );
}
