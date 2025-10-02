// @ts-nocheck
import React from "react";

type MarketingInfographicModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function MarketingInfographicModal({ open, onClose }: MarketingInfographicModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-6xl bg-[#009FCF] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Diagram Left */}
          <div className="w-full lg:w-1/2 p-6 lg:p-10">
            <div className="relative w-full aspect-[4/3] bg-[#009FCF] rounded-xl">
              {/* High-fidelity SVG at 3840px base width scaled to container */}
              <div className="absolute inset-0">
                <svg viewBox="0 0 3840 2560" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#2BB9E9" />
                      <stop offset="100%" stopColor="#009FCF" />
                    </linearGradient>
                    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="8" stdDeviation="24" floodColor="#000" floodOpacity="0.15" />
                    </filter>
                    <style>{`
                      .label { font-family: Inter, Avenir Next, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; font-weight: 600; letter-spacing: 0.4px; }
                      .small { font-size: 84px; fill: #ffffff; }
                      .medium { font-size: 96px; fill: #ffffff; }
                      .title { font-size: 64px; fill: #BFF0FF; font-weight: 700; letter-spacing: 3px; }
                      .headline { font-size: 160px; fill: #ffffff; font-weight: 800; }
                    `}</style>
                    <g id="roundedRect">
                      <rect x="0" y="0" rx="28" ry="28" width="960" height="200" fill="url(#nodeGrad)" stroke="#8BE2FF" strokeOpacity="0.25" strokeWidth="4" filter="url(#softShadow)" />
                    </g>
                    <g id="lightStrokeRect">
                      <rect x="0" y="0" rx="28" ry="28" width="540" height="200" fill="url(#nodeGrad)" stroke="#8BE2FF" strokeOpacity="0.25" strokeWidth="4" filter="url(#softShadow)" />
                    </g>
                    <g id="hubCircle">
                      <circle cx="0" cy="0" r="120" fill="url(#nodeGrad)" stroke="#8BE2FF" strokeOpacity="0.25" strokeWidth="4" filter="url(#softShadow)" />
                    </g>
                    <g id="gridLogo">
                      <rect x="-48" y="-48" width="96" height="96" rx="16" ry="16" fill="none" stroke="#ffffff" strokeWidth="12" opacity="0.9" />
                      <line x1="-48" y1="0" x2="48" y2="0" stroke="#ffffff" strokeWidth="12" opacity="0.9" />
                      <line x1="0" y1="-48" x2="0" y2="48" stroke="#ffffff" strokeWidth="12" opacity="0.9" />
                    </g>
                    <g id="perplexityIcon">
                      <circle cx="0" cy="0" r="36" fill="none" stroke="#ffffff" strokeWidth="10" />
                      <path d="M -20 -10 q 20 20 40 0" stroke="#ffffff" strokeWidth="10" fill="none" />
                    </g>
                    <g id="openaiIcon">
                      <g transform="scale(1.1)" fill="none" stroke="#ffffff" strokeWidth="10">
                        <path d="M0 -36 l31 18 l0 36 l-31 18 l-31 -18 l0 -36 z" opacity="0.95" />
                      </g>
                    </g>
                    <g id="geminiIcon">
                      <path d="M -40 0 a 40 40 0 1 0 80 0 a 40 40 0 1 0 -80 0" fill="none" stroke="#ffffff" strokeWidth="10" />
                      <circle cx="-20" cy="0" r="8" fill="#ffffff" />
                      <circle cx="20" cy="0" r="8" fill="#ffffff" />
                    </g>
                    <g id="copilotIcon">
                      <circle cx="0" cy="0" r="36" fill="none" stroke="#ffffff" strokeWidth="10" />
                      <circle cx="0" cy="0" r="16" fill="#ffffff" />
                    </g>
                    <marker id="dashDot" viewBox="0 0 4 4" refX="2" refY="2" markerWidth="4" markerHeight="4" orient="auto">
                      <circle cx="2" cy="2" r="1.2" fill="#ffffff" opacity="0.7" />
                    </marker>
                  </defs>

                  {/* Background rounded border for subtle definition */}
                  <rect x="40" y="40" width="3760" height="2480" rx="64" ry="64" fill="#009FCF" stroke="#8BE2FF" strokeOpacity="0.15" strokeWidth="8" />

                  {/* Left: YOUR DEALERSHIP */}
                  <g transform="translate(180, 560)">
                    <use href="#lightStrokeRect" />
                    <text className="label medium" x="270" y="126" textAnchor="middle">YOUR DEALERSHIP</text>
                  </g>

                  {/* Hub */}
                  <g transform="translate(980, 660)">
                    <use href="#hubCircle" />
                    <g transform="translate(0,0)">
                      <use href="#gridLogo" />
                    </g>
                  </g>

                  {/* Vertical stack of 4 AI nodes */}
                  <g transform="translate(1300, 360)">
                    {/* PERPLEXITY */}
                    <g transform="translate(0, 0)">
                      <use href="#roundedRect" />
                      <g transform="translate(80, 100)"><use href="#perplexityIcon" /></g>
                      <text className="label small" x="220" y="118">PERPLEXITY</text>
                    </g>
                    {/* OPENAI / CHATGPT */}
                    <g transform="translate(0, 300)">
                      <use href="#roundedRect" />
                      <g transform="translate(80, 100)"><use href="#openaiIcon" /></g>
                      <text className="label small" x="220" y="118">OPENAI / CHATGPT</text>
                    </g>
                    {/* GEMINI */}
                    <g transform="translate(0, 600)">
                      <use href="#roundedRect" />
                      <g transform="translate(80, 100)"><use href="#geminiIcon" /></g>
                      <text className="label small" x="220" y="118">GEMINI</text>
                    </g>
                    {/* COPILOT */}
                    <g transform="translate(0, 900)">
                      <use href="#roundedRect" />
                      <g transform="translate(80, 100)"><use href="#copilotIcon" /></g>
                      <text className="label small" x="220" y="118">COPILOT</text>
                    </g>
                  </g>

                  {/* Right: CONSUMERS */}
                  <g transform="translate(2920, 760)">
                    <use href="#lightStrokeRect" />
                    <text className="label medium" x="270" y="126" textAnchor="middle">CONSUMERS</text>
                  </g>

                  {/* Connectors: from hub to each AI node (vertical dashed) */}
                  <g stroke="#ffffff" strokeWidth="10" strokeDasharray="24 24" opacity="0.85">
                    <line x1="980" y1="660" x2="1300" y2="460" />
                    <line x1="980" y1="660" x2="1300" y2="760" />
                    <line x1="980" y1="660" x2="1300" y2="1060" />
                    <line x1="980" y1="660" x2="1300" y2="1360" />
                  </g>

                  {/* Connectors: rightward from each AI node to CONSUMERS */}
                  <g stroke="#ffffff" strokeWidth="10" strokeDasharray="24 24" opacity="0.85">
                    <line x1="2260" y1="460" x2="2920" y2="860" />
                    <line x1="2260" y1="760" x2="2920" y2="860" />
                    <line x1="2260" y1="1060" x2="2920" y2="860" />
                    <line x1="2260" y1="1360" x2="2920" y2="860" />
                  </g>

                  {/* Left dashed connector from DEALERSHIP to hub */}
                  <g stroke="#ffffff" strokeWidth="10" strokeDasharray="24 24" opacity="0.85">
                    <line x1="720" y1="660" x2="980" y2="660" />
                  </g>

                  {/* Typography block on right side of canvas */}
                  <g transform="translate(2100, 160)" opacity="0.98">
                    <text className="label title" x="1200" y="80" textAnchor="end">AI OPTIMIZATION</text>
                    <text className="label headline" x="1200" y="280" textAnchor="end">Influence how consumers</text>
                    <text className="label headline" x="1200" y="460" textAnchor="end">discover your products in AI</text>
                    {/* Bullets */}
                    <g className="label small" fill="#ffffff">
                      <text x="1040" y="640" textAnchor="end">→ Become a trusted "source of truth" for your brand</text>
                      <text x="1040" y="760" textAnchor="end">→ Syndicate "brand verified" data to AI providers</text>
                      <text x="1040" y="880" textAnchor="end">→ Optimize and tune your source data</text>
                    </g>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Text Right */}
          <div className="w-full lg:w-1/2 p-6 lg:p-10 bg-[#009FCF]">
            <div className="max-w-xl ml-auto text-white">
              <div className="uppercase tracking-[0.3em] text-[#BFF0FF] text-sm font-semibold">AI Optimization</div>
              <h2 className="text-3xl lg:text-5xl font-extrabold leading-tight mt-3">Influence how consumers discover your products in AI</h2>
              <ul className="mt-6 space-y-3 text-lg">
                <li>→ Become a trusted "source of truth" for your brand</li>
                <li>→ Syndicate "brand verified" data to AI providers</li>
                <li>→ Optimize and tune your source data</li>
              </ul>
              <div className="mt-8 flex gap-3">
                <button onClick={onClose} className="px-5 py-3 rounded-lg bg-white text-[#009FCF] font-semibold">Close</button>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    try {
                      const svgEl = (e.currentTarget.closest('[role="dialog"]') as HTMLElement)?.querySelector('svg');
                      if (!svgEl) return;
                      const serializer = new XMLSerializer();
                      const src = serializer.serializeToString(svgEl as Node);
                      const blob = new Blob([src], { type: 'image/svg+xml;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'dealershipAI_infographic_3840w.svg';
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(url);
                    } catch {}
                  }}
                  className="px-5 py-3 rounded-lg bg-slate-900/20 ring-1 ring-white/30 text-white font-semibold"
                >
                  Download SVG (3840w)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

