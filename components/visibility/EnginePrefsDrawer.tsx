"use client";

import { useEffect, useState } from "react";

type EngineName = "ChatGPT" | "Perplexity" | "Gemini" | "Copilot";

export default function EnginePrefsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [engines, setEngines] = useState<Record<EngineName, boolean>>({
    ChatGPT: true,
    Perplexity: true,
    Gemini: true,
    Copilot: true
  });
  const [thr, setThr] = useState<Record<EngineName, { warn: number; critical: number }>>({
    ChatGPT: { warn: 80, critical: 70 },
    Perplexity: { warn: 75, critical: 65 },
    Gemini: { warn: 75, critical: 70 },
    Copilot: { warn: 72, critical: 65 }
  });

  useEffect(() => {
    // Fetch current prefs
    fetch("/api/admin/integrations/visibility")
      .then(r => r.json())
      .then(data => {
        if (data.enabled_engines) setEngines(prev => ({ ...prev, ...data.enabled_engines }));
        if (data.visibility_thresholds) setThr(prev => ({ ...prev, ...data.visibility_thresholds }));
      })
      .catch(() => {});
  }, []);

  async function savePrefs() {
    await fetch("/api/admin/integrations/visibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ engines })
    });
    await fetch("/api/admin/integrations/visibility-thresholds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thresholds: thr })
    });
    onClose();
  }

  if (!open) return null;

  return (
    <aside className="fixed right-0 top-0 h-full w-[480px] bg-black border-l border-white/10 p-5 z-50">
      <div className="flex items-center justify-between mb-6">
        <div className="text-lg font-semibold text-white">AI Engine Preferences</div>
        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
          ✕
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <div className="text-white/80 mb-3 font-medium">Enabled Engines</div>
          {(["ChatGPT", "Perplexity", "Gemini", "Copilot"] as EngineName[]).map((e) => (
            <label key={e} className="flex items-center justify-between py-2 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors px-2 rounded">
              <span className="text-white/90">{e}</span>
              <input
                type="checkbox"
                checked={!!engines[e]}
                onChange={(ev) => setEngines(prev => ({ ...prev, [e]: ev.target.checked }))}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500"
              />
            </label>
          ))}
        </div>

        <div>
          <div className="text-white/80 mb-3 font-medium">Thresholds (% presence)</div>
          {(["ChatGPT", "Perplexity", "Gemini", "Copilot"] as EngineName[]).map((e) => (
            <div key={e} className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-sm text-white/70 mb-2">{e}</div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-white/60 mb-1 block">Warn</label>
                  <input
                    type="number"
                    value={thr[e].warn}
                    onChange={(ev) => setThr(prev => ({ ...prev, [e]: { ...prev[e], warn: Number(ev.target.value) } }))}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-white/60 mb-1 block">Critical</label>
                  <input
                    type="number"
                    value={thr[e].critical}
                    onChange={(ev) => setThr(prev => ({ ...prev, [e]: { ...prev[e], critical: Number(ev.target.value) } }))}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={savePrefs}
          className="w-full px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-white/90 transition-colors"
        >
          Save Preferences
        </button>
      </div>
    </aside>
  );
}

