export type WinInputs = { aiVisibility: number; reviewTrust: number; schemaCoverage: number; gbpHealth: number; zeroClick: number };
export function winProbability(x: WinInputs) {
  const clamp = (n:number)=>Math.max(0,Math.min(100,n));
  const w = 0.3*clamp(x.aiVisibility)/100 + 0.25*clamp(x.reviewTrust)/100 + 0.2*clamp(x.schemaCoverage)/100 + 0.15*clamp(x.gbpHealth)/100 + 0.1*clamp(x.zeroClick)/100;
  return Math.round(w*100);
}
