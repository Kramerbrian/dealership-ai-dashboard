// @ts-nocheck
import React from "react";
import MarketingInfographicModal from "./MarketingInfographicModal";

export default function MarketingLanding() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg grid place-items-center font-bold">dAI</div>
            <div>
              <div className="text-lg font-bold">dealershipAI</div>
              <div className="text-xs text-slate-400">Marketing</div>
            </div>
          </div>
          <button onClick={() => setOpen(true)} className="bg-[#009FCF] text-white px-4 py-2 rounded-lg font-semibold hover:brightness-110">
            Open Infographic Modal
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="uppercase tracking-widest text-sm text-slate-400 mb-3">AI Optimization</div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">Influence how consumers discover your products in AI</h1>
          <p className="text-slate-300 mb-8">Add our high-fidelity SaaS infographic to your marketing page. Clean vector lines, perfect alignment, bright cyan canvas, and exportable at 3840px wide.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setOpen(true)} className="bg-white text-[#009FCF] px-5 py-3 rounded-lg font-semibold">Preview Infographic</button>
            <a href="#" onClick={(e) => { e.preventDefault(); setOpen(true); }} className="px-5 py-3 rounded-lg bg-slate-800 text-white ring-1 ring-slate-700">Download SVG</a>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-800 p-8">
          <div className="text-slate-300 mb-3">Includes:</div>
          <ul className="space-y-2 text-slate-200">
            <li>→ Clean teal background #009FCF</li>
            <li>→ Rounded nodes with subtle shadow</li>
            <li>→ Minimal icons for Perplexity, OpenAI, Gemini, Copilot</li>
            <li>→ Dashed connectors, perfect spacing</li>
            <li>→ Right-side heading and bullets in white</li>
            <li>→ One-click SVG export (3840w)</li>
          </ul>
        </div>
      </main>

      <MarketingInfographicModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

