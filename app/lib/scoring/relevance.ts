import type { RelevanceInputs, RelevanceIndex } from "@/types/metrics";

export function computeRI({ visibility, proximity, authority, scsPct }: RelevanceInputs): RelevanceIndex {
  const scsWeight = Math.max(0, Math.min(1, scsPct / 100));
  const ri = visibility * proximity * authority * scsWeight;
  return { ri, visibility, proximity, authority, scsWeight };
}


