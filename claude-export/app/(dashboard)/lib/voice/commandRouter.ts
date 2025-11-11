type Intent =
  | "open_rar"
  | "open_qai"
  | "open_eeat"
  | "scan_full"
  | "fix_schema";

type IntentHandler = (payload?: any) => void;

export function createVoiceCommandRouter(map: Record<Intent, IntentHandler>) {
  // Return a function to process recognized text and call appropriate handler
  return (spoken: string) => {
    const q = spoken.toLowerCase();

    if (/revenue at risk|open.*risk|open.*o\.?c\.?i/i.test(q)) {
      return map["open_rar"]?.();
    }
    if (/qai|quality.*authority/i.test(q)) {
      return map["open_qai"]?.();
    }
    if (/e\s*e\s*a\s*t|open.*e.*e.*a.*t/i.test(q)) {
      return map["open_eeat"]?.();
    }
    if (/full scan|run.*full/i.test(q)) {
      return map["scan_full"]?.();
    }
    if (/fix.*schema|deploy.*schema/i.test(q)) {
      return map["fix_schema"]?.();
    }
  };
}

