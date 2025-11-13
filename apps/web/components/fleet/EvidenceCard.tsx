import React from 'react';
import { Badge } from '@/components/ui/badge';

export default function EvidenceCard({
  evidence
}: {
  evidence?: {
    schemaCount?: number;
    cwv?: { lcp?: number; cls?: number; fid?: number };
    robotsOk?: boolean;
    sitemapOk?: boolean;
    lastAeoProbe?: string;
    verifications?: { perplexity?: boolean; richResults?: boolean };
  };
}) {
  if (!evidence) return null;
  const { schemaCount, cwv, robotsOk, sitemapOk, lastAeoProbe } = evidence;
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="space-y-1">
        <div>Schema fields</div>
        <div className="text-slate-200 font-medium">{schemaCount ?? '—'}</div>
      </div>
      <div className="space-y-1">
        <div>Core Web Vitals</div>
        <div className="text-slate-200">
          LCP: {cwv?.lcp ?? '—'}s · CLS: {cwv?.cls ?? '—'} · FID: {cwv?.fid ?? '—'}ms
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span>robots.txt</span>
        <Badge variant={robotsOk ? 'default' : 'destructive'}>{robotsOk ? 'OK' : 'Missing'}</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span>sitemap.xml</span>
        <Badge variant={sitemapOk ? 'default' : 'destructive'}>{sitemapOk ? 'OK' : 'Missing'}</Badge>
      </div>
      <div className="col-span-2 text-xs text-slate-400">
        Last AEO Probe: {lastAeoProbe ? new Date(lastAeoProbe).toLocaleString() : '—'}
      </div>
    </div>
  );
}
