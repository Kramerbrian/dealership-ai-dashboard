"use client";

type AutopilotPanelProps = {
  domain: string;
};

export function AutopilotPanel({ domain }: AutopilotPanelProps) {
  return (
    <div className="px-4 md:px-6 py-6 md:py-8 space-y-6">
      <section>
        <h1 className="text-2xl md:text-3xl font-semibold">
          Autopilot
        </h1>
        <p className="mt-2 text-sm text-white/60 max-w-xl">
          Autopilot can handle safe, repeatable fixes for {domain || 'your store'} so you spend less time on tune-ups and more time selling cars.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs text-white/60 uppercase tracking-[0.16em]">
            Schema
          </div>
          <p className="mt-1 text-sm text-white/80">
            Generate and update structured data on VDPs, Service pages, and key templates.
          </p>
        </div>
        <div className="rounded-2xl border borderWhite/10 bgWhite/[0.03] p-4">
          <div className="text-xs textWhite/60 uppercase tracking-[0.16em]">
            FAQs
          </div>
          <p className="mt-1 text-sm textWhite/80">
            Add clear answers to common shopper and service questions.
          </p>
        </div>
        <div className="rounded-2xl borderWhite/10 bgWhite/[0.03] p-4 border">
          <div className="text-xs textWhite/60 uppercase tracking-[0.16em]">
            Reviews & UGC
          </div>
          <p className="mt-1 text-sm textWhite/80">
            Suggest and place review quotes on high-traffic pages.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border borderWhite/10 bgWhite/[0.04] p-5">
        <p className="text-sm textWhite/80">
          When Autopilot is on, it will propose changes first. You decide what to approve. Over time, we can expand to fully automatic fixes on low-risk items.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="h-9 px-4 rounded-full bgWhite textBlack text-sm fontMedium hover:bgNeutral-100 transition">
            Enable Autopilot (Pro)
          </button>
          <button className="h-9 px-4 rounded-full border borderWhite/20 text-xs textWhite/70 hover:bgWhite/10 transition">
            View recent Autopilot suggestions
          </button>
        </div>
      </section>
    </div>
  );
}