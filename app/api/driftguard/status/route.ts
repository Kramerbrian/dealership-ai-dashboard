import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type Snap = Record<string, { fieldCount: number }>;

function readSnap(name: "baseline"|"latest") {
  const p = path.join(process.cwd(), "public", "schema-snapshots", `${name}.json`);
  if (!fs.existsSync(p)) {
    // Return empty snap if file doesn't exist
    return {} as Snap;
  }
  return JSON.parse(fs.readFileSync(p, "utf8")) as Snap;
}

export async function GET() {
  try {
    const required = ["AutoDealer","Vehicle","Offer","FAQPage"];
    const base = readSnap("baseline");
    const curr = readSnap("latest");

    const missing = required.filter(k => !(k in curr));
    const regressions = required.flatMap(k => {
      const before = base[k]?.fieldCount ?? 0;
      const after  = curr[k]?.fieldCount ?? 0;
      return after < before ? [{ type:k, before, after }] : [];
    });

    return NextResponse.json({
      ok: true,
      summary: {
        missing,
        regressions,
        ok: missing.length===0 && regressions.length===0
      }
    });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e.message }, { status:500 });
  }
}
