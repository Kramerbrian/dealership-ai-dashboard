'use client';

import { useRef, useState } from 'react';
// Toast notifications - using fallback if sonner not available
let toast: any = null;
try {
  toast = require('sonner').toast;
} catch {
  toast = {
    success: (msg: string) => alert(`✓ ${msg}`),
    error: (msg: string) => alert(`✗ ${msg}`),
    info: (msg: string) => alert(`ℹ ${msg}`),
  };
}

export default function BulkUpload() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Array<any>>([]);
  const [counts, setCounts] = useState({ parsed: 0, unique: 0, invalid: 0 });
  const [invalid, setInvalid] = useState<Array<any>>([]);
  const [committing, setCommitting] = useState(false);

  const onFile = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/origins/bulk-csv', {
        method: 'POST',
        body: fd,
      });
      const json = await res.json();
      if (!json.ok) {
        toast.error(json.error || 'Upload failed');
        return;
      }
      setPreview(json.preview || []);
      setCounts(json.counts || { parsed: 0, unique: 0, invalid: 0 });
      setInvalid(json.invalid || []);
      toast.success(`Parsed ${json.counts?.parsed || 0} rows`);
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    }
  };

  const onCommit = async () => {
    setCommitting(true);
    try {
      const res = await fetch('/api/origins/bulk-csv/commit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rows: preview }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Commit failed');
      const total = json.results?.reduce((a: number, b: any) => a + (b.count || 0), 0) || 0;
      toast.success(`Committed ${total} origins`);
      setPreview([]);
      setCounts({ parsed: 0, unique: 0, invalid: 0 });
      setInvalid([]);
      if (fileRef.current) {
        fileRef.current.value = '';
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-800/70 backdrop-blur p-6 shadow">
      <div className="flex items-center gap-3 mb-6">
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          className="hidden"
        />
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition" onClick={() => fileRef.current?.click()}>
          Choose CSV
        </button>
        <span className="text-sm text-neutral-400">
          Upload CSV with <code className="bg-neutral-900 px-1 rounded">origin,tenant</code> columns
        </span>
      </div>

      {counts.parsed > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex gap-4 text-sm">
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-900/30 text-green-300 ring-1 ring-green-700/50">Parsed: {counts.parsed}</span>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-neutral-700/50 text-neutral-300">Unique: {counts.unique}</span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${counts.invalid ? 'bg-red-900/30 text-red-300 ring-1 ring-red-700/50' : 'bg-green-900/30 text-green-300 ring-1 ring-green-700/50'}`}>
              Invalid: {counts.invalid}
            </span>
          </div>
          {invalid.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-neutral-300 hover:text-white">
                View invalid rows ({invalid.length})
              </summary>
              <ul className="mt-2 space-y-1 text-sm max-h-60 overflow-y-auto">
                {invalid.slice(0, 50).map((e, i) => (
                  <li key={i} className="text-red-300">
                    Line {e.line}: {e.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-700/40">
                <tr>
                  <th className="text-left p-2">Origin</th>
                  <th className="text-left p-2">Tenant</th>
                  <th className="text-left p-2">Checksum</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r: any, idx: number) => (
                  <tr key={r.checksum || idx} className="border-t border-white/10">
                    <td className="p-2">{r.origin}</td>
                    <td className="p-2">{r.tenant}</td>
                    <td className="p-2 text-xs text-neutral-400">
                      {r.checksum?.slice(0, 10)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!preview.length || committing}
              onClick={onCommit}
            >
              {committing ? 'Committing…' : 'Commit Import'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

