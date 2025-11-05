export type AiScoreUpdateEvent = {
  vin: string;
  dealerId?: string;
  reason: string;
  avi: number;
  ati: number;
  cis: number;
  ts: string;
};

export type MSRPChangeEvent = {
  vin: string;
  old?: number | null;
  new: number;
  deltaPct?: number | null;
  ts: string;
};

