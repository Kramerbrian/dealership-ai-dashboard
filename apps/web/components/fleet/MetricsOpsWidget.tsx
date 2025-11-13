'use client';

export default function MetricsOpsWidget() {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-800/70 backdrop-blur p-6 shadow">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-neutral-400">Automation</div>
          <div className="text-2xl font-semibold">
            42 <span className="text-neutral-400 text-sm">skill runs (7d)</span>
          </div>
        </div>
        <div>
          <div className="text-sm text-neutral-400">AI Visibility</div>
          <div className="text-2xl font-semibold text-blue-400">+6.8%</div>
        </div>
        <div>
          <div className="text-sm text-neutral-400">OCI risk</div>
          <div className="text-2xl font-semibold text-red-400">$39k</div>
        </div>
      </div>
    </div>
  );
}

