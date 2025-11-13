import { NextRequest, NextResponse } from 'next/server';
import { requireRoleAndTenant } from '@/lib/auth/roles';

export const runtime = 'nodejs';

// Accepts multipart/form-data with a file field named "file"
export async function POST(req: NextRequest) {
  try {
    const { role, tenant } = requireRoleAndTenant(req, ['admin', 'manager']);

    const form = await req.formData();
    const file = form.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'Missing file' }, { status: 400 });
    }

    const csvText = await file.text();
    const lines = csvText.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) {
      return NextResponse.json({ ok: false, error: 'Empty CSV' }, { status: 400 });
    }

    // Simple CSV parser (comma-delimited, no embedded commas). Adjust if needed.
    const headers = lines[0].split(',').map(h => h.trim());
    const records = lines.slice(1).map((line) => {
      const cols = line.split(',');
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = (cols[i] ?? '').trim(); });
      return obj;
    }).filter(r => Object.values(r).some(Boolean));

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/origins/bulk`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-role': role,
        'x-tenant': tenant
      },
      body: JSON.stringify({ origins: records })
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ ok: false, error: `Upstream error: ${txt}` }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ ok: true, count: records.length, upstream: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 });
  }
}
