export type Pulse = {
  id: string;
  title: string;
  diagnosis: string;
  prescription: string;
  impactMonthlyUSD: number;
  etaSeconds: number;
  confidenceScore: number;
  recencyMinutes: number;
  kind: 'schema' | 'faq';
};

export async function schemaToPulses(domainOrUrl?: string): Promise<Pulse[]> {
  try {
    const qs = domainOrUrl?.startsWith('http')
      ? `url=${encodeURIComponent(domainOrUrl)}`
      : `domain=${encodeURIComponent(domainOrUrl || '')}`;
    
    const res = await fetch(`/api/schema/validate?${qs}`, {cache: 'no-store'});
    if (!res.ok) return [];
    
    const audit = await res.json();
    const pulses: Pulse[] = [];
    
    const missingProduct = audit.issues?.some((i: any) => i.id === 'missing_product');
    const missingFAQ = audit.issues?.some((i: any) => i.id === 'missing_faqpage');
    const missingDealer = audit.issues?.some((i: any) => i.id === 'missing_autodealer');
    const invalidJSONLD = audit.issues?.some((i: any) => i.id === 'invalid_json_ld');
    
    if (missingProduct || missingDealer) {
      pulses.push({
        id: 'schema_missing_vdp',
        title: 'Missing Product/AutoDealer schema on key pages',
        diagnosis: 'AI engines can\'t reliably extract pricing/specs or entity identity.',
        prescription: 'Inject JSON-LD Product on VDPs and AutoDealer on homepage; revalidate via Rich Results.',
        impactMonthlyUSD: 8200,
        etaSeconds: 120,
        confidenceScore: 0.85,
        recencyMinutes: 6,
        kind: 'schema'
      });
    }
    
    if (missingFAQ) {
      pulses.push({
        id: 'faq_absent_service',
        title: 'No FAQPage schema on Service pages',
        diagnosis: 'Gemini and Perplexity rely on FAQ to cite exact answers.',
        prescription: 'Generate 6–10 Q&As; embed FAQPage JSON-LD on /service and index pages.',
        impactMonthlyUSD: 2400,
        etaSeconds: 150,
        confidenceScore: 0.75,
        recencyMinutes: 6,
        kind: 'faq'
      });
    }
    
    if (invalidJSONLD && pulses.length === 0) {
      pulses.push({
        id: 'jsonld_invalid_parse',
        title: 'Invalid JSON-LD detected',
        diagnosis: 'One or more JSON-LD blocks failed to parse.',
        prescription: 'Validate with Google\'s Rich Results; fix braces/quotes; re-deploy.',
        impactMonthlyUSD: 900,
        etaSeconds: 60,
        confidenceScore: 0.6,
        recencyMinutes: 6,
        kind: 'schema'
      });
    }
    
    return pulses;
  } catch {
    return [];
  }
}

