export type Metrics = { scsPct: number; topMissingField?: string; gcs?: { carmax?: number; yours?: number; segment?: string }; fiveXX24h?: number };
export type Alert = { id: string; when: (m: Metrics) => boolean; notify: string[]; message: (m: Metrics) => string };
export const rules: Alert[] = [
  { id: "scs_floor", when: (m)=> m.scsPct < 80, notify: ["#seo-ops@slack", "gm@dealer.com"], message: (m)=> `SCS dropped to ${m.scsPct}. Top fix: ${m.topMissingField ?? "unknown"}` },
  { id: "ai_visibility_gap", when: (m)=> (m.gcs?.carmax ?? 0) >= 2*(m.gcs?.yours ?? 1), notify: ["#ai-visibility@slack"], message: (m)=> `CarMax AI citation share (${m.gcs?.carmax ?? 0}%) is 2× yours (${m.gcs?.yours ?? 0}%) in ${m.gcs?.segment ?? "segment"}.` },
  { id: "serve_errors", when: (m)=> (m.fiveXX24h ?? 0) > 3, notify: ["#web-health@slack"], message: (m)=> `5xx errors > 3 in 24h. Investigate uptime and edge cache.` }
];
export function evaluateAlerts(metrics: Metrics){
  return rules.filter(r=> r.when(metrics)).map(r=> ({ id: r.id, notify: r.notify, text: r.message(metrics) }));
}

