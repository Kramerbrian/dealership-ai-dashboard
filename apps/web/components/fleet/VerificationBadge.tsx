'use client';

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerificationBadge({ verified, tenant, domain }: { verified: boolean; tenant?: string; domain?: string }) {
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<boolean>(verified);

  const runVerify = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/probe/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-role': 'admin', 'x-tenant': String(tenant || 'default') },
        body: JSON.stringify({ domain })
      });
      const json = await res.json();
      if (json?.ok) {
        setOk(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {ok ? (
        <span className="inline-flex items-center gap-1 text-green-400 text-sm">
          <ShieldCheck className="w-4 h-4" /> Verified
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-yellow-400 text-sm">
          <ShieldAlert className="w-4 h-4" /> Pending
        </span>
      )}
      <Button size="sm" variant="ghost" onClick={runVerify} disabled={busy}>
        <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}

