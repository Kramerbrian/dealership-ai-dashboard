'use client';

import { X, FileText, Send } from 'lucide-react';
import { useCognitiveStore } from '@/lib/store/cognitive';

export function ActionDrawer() {
  const { drawerOpen, drawerContent, closeDrawer, incidents } = useCognitiveStore();

  const renderBody = () => {
    if (!drawerContent) return null;

    // Legacy format support
    if (drawerContent.type === 'legacy' || !drawerContent.type) {
      return (
        <div className="space-y-4">
          {drawerContent.title && (
            <h3 className="text-xl font-semibold">{drawerContent.title}</h3>
          )}
          {drawerContent.description && (
            <p className="text-neural-300">{drawerContent.description}</p>
          )}
          {drawerContent.items && drawerContent.items.length > 0 && (
            <div className="space-y-2">
              {drawerContent.items.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-neural-800 p-3 flex items-center justify-between"
                >
                  <span className="text-sm text-neural-400">{item.label}</span>
                  <span
                    className={`text-sm font-semibold ${
                      item.highlight ? 'text-clarity-blue' : 'text-white'
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (drawerContent.type === 'howto') {
      const inc = incidents.find((x) => x.id === drawerContent.incidentId);
      if (!inc) {
        return (
          <div className="text-neural-400">
            Incident not found. It may have been resolved.
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-clarity-blue to-clarity-cyan">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{inc.title}</h3>
              <p className="text-xs text-neural-500 mt-1 capitalize">
                {inc.category.replace('_', ' ')} • {inc.urgency} urgency
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-neural-800 bg-neural-900/50 p-4">
            <div className="text-sm font-semibold mb-2">Why This Matters</div>
            <p className="text-sm text-neural-300">{inc.reason}</p>
          </div>

          {inc.receipts && inc.receipts.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-semibold">Data Receipts</div>
              {inc.receipts.map((r, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-neural-800 bg-neural-900/30 p-3"
                >
                  <div className="text-sm text-neural-400 mb-1">{r.label}</div>
                  {r.kpi && (
                    <div className="text-xs font-mono text-clarity-blue">
                      KPI: {r.kpi}
                    </div>
                  )}
                  {(r.before || r.after) && (
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      {r.before && (
                        <div>
                          <div className="text-neural-500">Before</div>
                          <div className="text-red-400 font-mono">
                            {JSON.stringify(r.before)}
                          </div>
                        </div>
                      )}
                      {r.after && (
                        <div>
                          <div className="text-neural-500">After</div>
                          <div className="text-emerald-400 font-mono">
                            {JSON.stringify(r.after)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-neural-800 bg-neural-900/50 p-4">
            <div className="text-sm font-semibold mb-2">Fix Options</div>
            <div className="space-y-2 text-xs text-neural-400">
              {inc.fix_tiers.includes('tier1_diy') && (
                <div>
                  • <span className="text-neutral-300">Tier 1 (DIY)</span>: Review
                  data, apply manual fix
                </div>
              )}
              {inc.fix_tiers.includes('tier2_guided') && (
                <div>
                  • <span className="text-neutral-300">Tier 2 (Auto-Fix)</span>: One-tap
                  deploy
                </div>
              )}
              {inc.fix_tiers.includes('tier3_dfy') && (
                <div>
                  • <span className="text-neutral-300">Tier 3 (DFY)</span>: Assign to
                  dAI Team
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (drawerContent.type === 'assign') {
      const inc = incidents.find((x) => x.id === drawerContent.incidentId);
      return (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-clarity-blue to-clarity-cyan">
              <Send size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Assign to dAI Team</h3>
              <p className="text-xs text-neural-500 mt-1">Done-For-You Service</p>
            </div>
          </div>

          <div className="rounded-xl border border-neural-800 bg-neural-900/50 p-4">
            <p className="text-sm text-neural-300">
              We'll scope, deploy, and confirm remediation for this incident. You'll see
              a Pulse update when complete.
            </p>
          </div>

          {inc && (
            <div className="rounded-xl border border-neural-800 p-3">
              <div className="text-xs text-neural-500 mb-1">Incident</div>
              <div className="text-sm font-semibold">{inc.title}</div>
              <div className="text-xs text-neural-400 mt-1">
                Est. resolution: {Math.ceil(inc.time_to_fix_min * 1.5)} min
              </div>
            </div>
          )}

          <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-clarity-blue to-clarity-cyan text-white hover:shadow-lg hover:shadow-clarity-blue/40 font-medium transition-all">
            Confirm Assignment
          </button>

          <p className="text-xs text-neural-500 text-center">
            Enterprise tier required for DFY services
          </p>
        </div>
      );
    }

    if (drawerContent.type === 'kpi') {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">KPI Detail</h3>
          <div className="rounded-xl border border-neural-800 bg-neural-900/50 p-4">
            <div className="text-sm text-neural-400 mb-1">Focused KPI</div>
            <p className="font-mono text-clarity-blue">{drawerContent.kpi}</p>
          </div>
          <p className="text-sm text-neural-400">
            Deep-dive KPI analysis coming soon. Switch to Insights mode for full history
            and trends.
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={`fixed inset-0 z-40 transition-opacity duration-300 ${
        drawerOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!drawerOpen}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm ${
          drawerOpen ? 'opacity-100' : 'opacity-0'
        } transition-opacity`}
        onClick={closeDrawer}
      />

      {/* Drawer Panel */}
      <div
        className={`
          absolute right-0 top-0 h-full w-full max-w-xl
          bg-neural-900 border-l border-neural-800
          transition-transform duration-300 ease-out
          ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}
          p-6 overflow-y-auto
        `}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-neural-400 font-medium">Action Drawer</div>
          <button
            className="p-2 rounded-lg hover:bg-neural-800 transition-colors"
            onClick={closeDrawer}
          >
            <X size={18} className="text-neutral-300" />
          </button>
        </div>

        {renderBody()}
      </div>
    </div>
  );
}
