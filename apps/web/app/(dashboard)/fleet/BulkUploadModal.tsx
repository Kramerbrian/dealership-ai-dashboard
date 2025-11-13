"use client";

import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function BulkUploadModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File|null>(null);
  const [result, setResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement|null>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const onUpload = async () => {
    if (!file) return;
    setBusy(true);
    setResult(null);
    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch('/api/origins/bulk-csv', {
      method: 'POST',
      headers: {
        'x-role': 'admin',
        'x-tenant': 'default'
      },
      body: fd
    });

    const json = await res.json();
    if (!res.ok) {
      setResult(`❌ ${json.error || 'Upload failed'}`);
    } else {
      setResult(`✓ Imported ${json.count} rows`);
    }
    setBusy(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Upload Origins (CSV)</DialogTitle>
          <DialogDescription>Upload a CSV with headers like: <code>name,domain,address,city,state,zip</code>. The API converts it to JSON and sends to <code>/api/origins/bulk</code>.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <input ref={inputRef} type="file" accept=".csv" onChange={onFile} />
          <div className="flex gap-2">
            <Button disabled={!file || busy} onClick={onUpload}>{busy ? 'Uploading…' : 'Upload'}</Button>
            <Button variant="outline" onClick={()=>{ setFile(null); onOpenChange(false); }}>Close</Button>
          </div>
          {result && <div className="text-sm text-slate-200">{result}</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
