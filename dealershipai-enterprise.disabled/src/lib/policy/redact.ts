export function redactPII(input: string): string {
  if (!input) return input;
  return input
    // phones
    .replace(/\b\+?1?[-.\s]?(\(?\d{3}\)?)[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "[redacted-phone]")
    // emails
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    // VIN (17 alphanum excluding I,O,Q)
    .replace(/\b[ABCDEFGHJKLMNPRSTUVWXYZ0-9]{17}\b/g, (m) => `[vin:${m.slice(0,8)}…]`);
}
