// analytics.ts
type EventName =
  | 'lp_view'
  | 'cta_primary_click'
  | 'url_valid'
  | 'url_invalid'
  | 'scan_start'
  | 'scan_redirect'
  | 'exit_intent_modal_open'
  | 'download_sample_report';

type Payload = Record<string, string | number | boolean | null | undefined>;

const sink = (...args: any[]) =>
  (window as any).dataLayer?.push({ event: args[0], ...args[1] }) ||
  (window as any).gtag?.('event', args[0], args[1]) ||
  console.info('[analytics]', ...args);

export function track(event: EventName, payload: Payload = {}) {
  sink(event, payload);
}

// map for consistent props
export const Events = {
  lpView: () => track('lp_view'),
  ctaPrimaryClick: (variant: string) => track('cta_primary_click', { variant }),
  urlValid: (url: string) => track('url_valid', { url }),
  urlInvalid: (url: string) => track('url_invalid', { url }),
  scanStart: (url: string, city?: string) => track('scan_start', { url, city }),
  scanRedirect: (url: string, variant: string) => track('scan_redirect', { url, variant }),
  exitIntentOpen: () => track('exit_intent_modal_open'),
  downloadSample: () => track('download_sample_report')
};
