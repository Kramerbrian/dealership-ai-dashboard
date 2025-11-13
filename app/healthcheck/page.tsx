/**
 * /healthcheck
 * Human-readable healthcheck page
 */

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

async function getHealth() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || '';
    const healthUrl = base ? `${base}/api/health` : '/api/health';
    
    const res = await fetch(healthUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await res.json();
    return { status: res.status, data };
  } catch (err: any) {
    return {
      status: 500,
      data: { 
        ok: false, 
        error: String(err?.message || err),
        checks: {},
      },
    };
  }
}

export default async function HealthcheckPage() {
  const { status, data } = await getHealth();

  const color = status === 200 && data.ok ? 'text-emerald-400' : 'text-red-400';
  const bgColor = status === 200 && data.ok ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-4 py-8">
      <div className={`w-full max-w-2xl rounded-3xl border ${bgColor} p-6 md:p-8`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${status === 200 && data.ok ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
          <h1 className="text-2xl font-semibold">Healthcheck</h1>
        </div>
        
        <p className="text-sm text-white/60 mb-6">
          Simple status for landing and clarity API. Use this to verify deployment sanity.
        </p>

        <div className="space-y-4">
          {/* Overall Status */}
          <div className={`p-4 rounded-xl bg-black/40 border ${status === 200 && data.ok ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/80">Overall Status</span>
              <span className={`text-lg font-bold ${color}`}>
                {data.ok ? 'OK' : 'BROKEN'}
              </span>
            </div>
            {data.timestamp && (
              <p className="text-xs text-white/40 mt-2">
                Checked: {new Date(data.timestamp).toLocaleString()}
              </p>
            )}
          </div>

          {/* Environment Variables */}
          {data.checks?.env && (
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <h2 className="text-sm font-semibold text-white/90 mb-3">Environment Variables</h2>
              <div className="space-y-2">
                {Object.entries(data.checks.env).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-white/60 font-mono">{key}</span>
                    <span className={value ? 'text-emerald-400' : 'text-red-400'}>
                      {value ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clarity API */}
          {data.checks?.clarity && (
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <h2 className="text-sm font-semibold text-white/90 mb-3">Clarity API</h2>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Status</span>
                  <span className={data.checks.clarity.ok ? 'text-emerald-400' : 'text-red-400'}>
                    {data.checks.clarity.ok ? 'OK' : 'FAILED'}
                  </span>
                </div>
                {data.checks.clarity.status && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">HTTP Status</span>
                    <span className="text-white/80">{data.checks.clarity.status}</span>
                  </div>
                )}
                {data.checks.clarity.hasScores !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Has Scores</span>
                    <span className={data.checks.clarity.hasScores ? 'text-emerald-400' : 'text-yellow-400'}>
                      {data.checks.clarity.hasScores ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
                {data.checks.clarity.error && (
                  <div className="mt-2 p-2 bg-red-500/10 rounded text-red-400">
                    {data.checks.clarity.error}
                  </div>
                )}
                {data.checks.clarity.note && (
                  <div className="mt-2 p-2 bg-yellow-500/10 rounded text-yellow-400 text-xs">
                    {data.checks.clarity.note}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trust API */}
          {data.checks?.trust_api && (
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <h2 className="text-sm font-semibold text-white/90 mb-3">Trust API</h2>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Endpoint Exists</span>
                  <span className={data.checks.trust_api.exists ? 'text-emerald-400' : 'text-yellow-400'}>
                    {data.checks.trust_api.exists ? 'Yes' : 'No'}
                  </span>
                </div>
                {data.checks.trust_api.status && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">HTTP Status</span>
                    <span className="text-white/80">{data.checks.trust_api.status}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assistant API */}
          {data.checks?.assistant_api && (
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <h2 className="text-sm font-semibold text-white/90 mb-3">Assistant API</h2>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Endpoint Exists</span>
                  <span className={data.checks.assistant_api.exists ? 'text-emerald-400' : 'text-yellow-400'}>
                    {data.checks.assistant_api.exists ? 'Yes' : 'No'}
                  </span>
                </div>
                {data.checks.assistant_api.status && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">HTTP Status</span>
                    <span className="text-white/80">{data.checks.assistant_api.status}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Raw JSON */}
          <details className="mt-6">
            <summary className="text-sm font-medium text-white/60 cursor-pointer hover:text-white/80">
              Raw JSON Response
            </summary>
            <pre className="mt-3 text-xs text-white/60 bg-black/60 rounded-xl p-4 overflow-x-auto border border-white/10">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </main>
  );
}
