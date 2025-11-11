import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET(){
  const p = path.join(process.cwd(), 'public', 'schema-snapshots', 'history.json');
  const items = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p,'utf8')) : [];
  return NextResponse.json({ ok:true, items });
}
