import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { user, note } = await req.json();
    const p = path.join(process.cwd(), "public", "schema-snapshots", "ack-log.json");
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const prev = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p,"utf8")) : [];
    prev.push({ ts: new Date().toISOString(), user, note });
    fs.writeFileSync(p, JSON.stringify(prev,null,2));
    return NextResponse.json({ ok:true });
  } catch (e: any) {
    return NextResponse.json({ ok:false, error: e.message }, { status:500 });
  }
}
