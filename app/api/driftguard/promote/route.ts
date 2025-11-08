import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { postSlack } from '@/src/lib/notify/slack';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const role = req.headers.get('x-role') || '';
  if (role !== 'admin') return NextResponse.json({ ok:false, error:'forbidden' }, { status:403 });
  
  const root = path.join(process.cwd(),'public','schema-snapshots');
  const latestP = path.join(root,'latest.json');
  const baseP   = path.join(root,'baseline.json');
  
  if (!fs.existsSync(latestP)) {
    return NextResponse.json({ ok:false, error:'latest snapshot missing' }, { status:400 });
  }
  
  try {
    const src = fs.readFileSync(latestP);
    if (fs.existsSync(baseP)) fs.copyFileSync(baseP, path.join(root,`baseline_${Date.now()}.bak.json`));
    fs.writeFileSync(baseP, src);
    await postSlack('✅ Baseline promoted from latest snapshot');
    return NextResponse.json({ ok:true });
  } catch(e:any){
    await postSlack(`Baseline promote failed: ${e.message}`);
    return NextResponse.json({ ok:false, error:e?.message || 'failed' }, { status:500 });
  }
}
