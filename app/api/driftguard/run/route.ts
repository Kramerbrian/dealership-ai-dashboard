import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { postSlack } from '@/src/lib/notify/slack';

export const runtime = 'nodejs';

function loadJSON(p:string) {
  try { return JSON.parse(fs.readFileSync(p,'utf8')); } catch { return {}; }
}

export async function GET() {
  try {
    const root = path.join(process.cwd(), 'public', 'schema-snapshots');
    await fs.promises.mkdir(root, { recursive: true });
    
    const baseline = loadJSON(path.join(root,'baseline.json'));
    const latest   = loadJSON(path.join(root,'latest.json'));

    const required = ['AutoDealer','Vehicle','Offer','FAQPage'];
    const missing = required.filter(k => !(k in latest));

    const regressions: Array<{ type:string; before:number; after:number }> = [];
    for (const key of Object.keys(baseline)) {
      const b = baseline[key]?.fieldCount ?? 0;
      const c = latest[key]?.fieldCount ?? 0;
      if (c < b) regressions.push({ type: key, before: b, after: c });
    }

    const summary = { missing, regressions, ts: new Date().toISOString() };

    const histP = path.join(root, 'history.json');
    const prev = fs.existsSync(histP) ? JSON.parse(fs.readFileSync(histP,'utf8')) : [];
    prev.push({ ts: summary.ts, counts: { total: missing.length + regressions.length, missing: missing.length, regressions: regressions.length } });
    fs.writeFileSync(histP, JSON.stringify(prev.slice(-90), null, 2));

    if (missing.length || regressions.length) {
      await postSlack(`*Schema Drift Detected*\nMissing: ${missing.join(', ')||'—'}\nRegressions: ${regressions.map(r=>`${r.type} ${r.before}→${r.after}`).join(', ')||'—'}`);
    }

    return NextResponse.json({ ok:true, ...summary });
  } catch (e:any) {
    await postSlack(`DriftGuard run error: ${e.message}`);
    return NextResponse.json({ ok:false, error: e?.message || 'failed' }, { status:500 });
  }
}
