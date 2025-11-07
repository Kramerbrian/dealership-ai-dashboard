import React from "react";
import hero from "@/app/pages/landing/hero.json" assert { type: "json" };

export default function Page() {
  return (
    <main 
      className="min-h-screen bg-[var(--bg)] text-[var(--text)]" 
      style={{
        ['--bg' as any]: '#0B0C0F', 
        ['--text' as any]: '#E8ECF2'
      }}
    >
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">{hero.headline}</h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-8">{hero.subhead}</p>
        <div className="flex gap-3">
          <a 
            href="/dashboard/visibility/relevance-overlay" 
            className="px-5 py-3 rounded-xl bg-white text-black text-sm font-semibold"
          >
            {hero.cta}
          </a>
          <a 
            href="/dashboard/visibility/ri-simulator" 
            className="px-5 py-3 rounded-xl border border-gray-600 text-sm"
          >
            Try RI Simulator
          </a>
        </div>
      </section>
    </main>
  );
}

