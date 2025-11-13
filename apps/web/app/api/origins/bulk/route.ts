import { NextRequest, NextResponse } from 'next/server';
import { requireRoleAndTenant } from '@/lib/auth/roles';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

// Simple stub to persist uploaded origins to a json file; in prod, forward to backend orchestrator.
export async function POST(req: NextRequest) {
  try {
    const { role, tenant } = requireRoleAndTenant(req, ['admin', 'manager']);
    const body = await req.json();
    const items = Array.isArray(body?.origins) ? body.origins : [];
    if (!items.length) return NextResponse.json({ ok:false, error:'No origins provided' }, { status:400 });

    const targetDir = path.join(process.cwd(), 'public', 'data');
    const targetFile = path.join(targetDir, `origins_${tenant || 'default'}.json`);
    await fs.promises.mkdir(targetDir, { recursive: true });

    let prev: any[] = [];
    if (fs.existsSync(targetFile)) {
      try { prev = JSON.parse(fs.readFileSync(targetFile,'utf8')); } catch { /* ignore */ }
    }

    const merged = [...prev, ...items];
    await fs.promises.writeFile(targetFile, JSON.stringify(merged, null, 2));

    return NextResponse.json({ ok: true, saved: items.length, total: merged.length, tenant });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || 'failed' }, { status: 500 });
  }
}
