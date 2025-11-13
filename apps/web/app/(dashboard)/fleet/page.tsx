'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BulkUploadModal from './BulkUploadModal';
import EvidenceCard from '@/components/fleet/EvidenceCard';
import VerificationBadge from '@/components/fleet/VerificationBadge';

interface FleetRow {
  id: string;
  name: string;
  domain: string;
  tenant: string;
  evidence?: {
    schemaCount?: number;
    cwv?: { lcp?: number; cls?: number; fid?: number };
    robotsOk?: boolean;
    sitemapOk?: boolean;
    lastAeoProbe?: string;
    verifications?: { perplexity?: boolean; richResults?: boolean };
  };
}

type FleetPageState = FleetRow;

export default function FleetPage() {
  const [rows, setRows] = useState<FleetRow[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const res = await fetch('/api/origins');
    const json = await res.json();
    // Map to include faux evidence for demo; in your app, backend should send these fields
    const mapped: FleetRow[] = (json?.items || []).map((it: any) => ({
      id: it.id,
      name: it.name || it.origin || it.domain,
      domain: it.domain || it.origin,
      tenant: it.tenant || 'default',
      evidence: {
        schemaCount: it.evidence?.schemaCount ?? 12,
        cwv: it.evidence?.cwv ?? { lcp: 2.3, cls: 0.05, fid: 120 },
        robotsOk: it.evidence?.robotsOk ?? true,
        sitemapOk: it.evidence?.sitemapOk ?? true,
        lastAeoProbe: it.evidence?.lastAeoProbe ?? new Date().toISOString(),
        verifications: it.evidence?.verifications ?? { perplexity: false, richResults: false }
      }
    }));
    setRows(mapped);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Fleet</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load}>Refresh</Button>
          <Button onClick={() => setOpen(true)}>Bulk Upload CSV</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(row => (
          <Card key={row.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{row.name}</div>
                  <div className="text-sm text-slate-400">{row.domain}</div>
                </div>
                <VerificationBadge verified={(row.evidence?.verifications?.perplexity && row.evidence?.verifications?.richResults) || false} tenant={row.tenant} domain={row.domain} />
              </div>
              <EvidenceCard evidence={row.evidence} />
            </CardContent>
          </Card>
        ))}
      </div>

      <BulkUploadModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
