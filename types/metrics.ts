export type CoreWebVitals = { lcp_ms: number; cls: number; inp_ms: number; lcp_delta_ms?: number };
export type SCSInput = { parsedFields: number; expectedFields: number; validationHealth: number; sourceTrust: number };
export type SCSScore = { scsPct: number; errorsDetected: number; authorityWeight: number };
export type RelevanceInputs = { visibility: number; proximity: number; authority: number; scsPct: number };
export type RelevanceIndex = { ri: number; visibility: number; proximity: number; authority: number; scsWeight: number };
