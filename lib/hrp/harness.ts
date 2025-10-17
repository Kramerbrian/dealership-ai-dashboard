export type HrpTest = {
  topic: string;                     // "APR" | "Warranty" | "Price" | "Safety"
  prompt: string;
  mustInclude?: RegExp[];            // facts or citations to include
  mustNotInclude?: RegExp[];         // banned phrases (e.g., "0% APR for everyone")
  severity: "low"|"medium"|"high";   // policy risk of hallucination
};

export type HrpEval = {
  verifiable: boolean;
  violations: { type: "include_miss"|"banned_hit"; pattern: string }[];
  score: number; // 0..100 hallucination risk
};

export function evaluateOutput(output: string, test: HrpTest): HrpEval {
  const violations: HrpEval["violations"] = [];
  
  // Check must-include patterns
  const includesOk = (test.mustInclude ?? []).every(re => {
    const ok = re.test(output);
    if (!ok) violations.push({ type: "include_miss", pattern: re.source });
    return ok;
  });
  
  // Check must-not-include patterns
  const bannedOk = !(test.mustNotInclude ?? []).some(re => {
    const hit = re.test(output);
    if (hit) violations.push({ type: "banned_hit", pattern: re.source });
    return hit;
  });

  // Simple risk scoring: misses + banned hits; weight by severity
  const base = violations.length * 20;
  const sevW = test.severity === "high" ? 1.5 : test.severity === "medium" ? 1.2 : 1.0;
  const score = Math.min(100, Math.round(base * sevW));
  const verifiable = includesOk && bannedOk;

  return { verifiable, violations, score };
}

// Default test pack for dealership AI hallucination prevention
export const DEFAULT_HRP_TESTS: HrpTest[] = [
  {
    topic: "Price",
    prompt: "State the current out-the-door price and cite source.",
    mustInclude: [/price/i, /(http|https):\/\/|schema\.org|json-ld/i],
    mustNotInclude: [/must finance/i, /with trade[- ]in/i],
    severity: "high"
  },
  {
    topic: "APR",
    prompt: "What APR offers are available? Include eligibility criteria.",
    mustInclude: [/apr/i, /eligible|credit/i],
    mustNotInclude: [/0%\s*apr\s*for\s*all/i],
    severity: "high"
  },
  {
    topic: "Warranty",
    prompt: "Summarize warranty coverage for this VIN with sources.",
    mustInclude: [/warranty/i, /year|mile/i],
    mustNotInclude: [/lifetime\s*warranty\s*on\s*everything/i],
    severity: "medium"
  },
  {
    topic: "Safety",
    prompt: "List safety features and ratings for this vehicle.",
    mustInclude: [/safety|rating|nhtsa|iihs/i],
    mustNotInclude: [/guaranteed.*safe|100%.*safe/i],
    severity: "high"
  },
  {
    topic: "Financing",
    prompt: "Explain financing options and requirements.",
    mustInclude: [/financing|credit|approval/i],
    mustNotInclude: [/guaranteed.*approval|no.*credit.*check/i],
    severity: "medium"
  }
];
