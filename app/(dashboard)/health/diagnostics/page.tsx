import HealthDiagnosticsModal from "@/app/modals/HealthDiagnosticsModal";

export const revalidate = 300;

async function getDiag() {
  const [crawlRes, scsRes, cwvRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/health/crawl`, { cache: "no-store" }),
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/schema/scs`, { cache: "no-store" }),
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/health/cwv`, { cache: "no-store" })
  ]);
  if (!crawlRes.ok || !scsRes.ok || !cwvRes.ok) throw new Error("Diagnostics fetch failed");
  return { crawl: await crawlRes.json(), scs: await scsRes.json(), cwv: await cwvRes.json() };
}

export default async function Page() {
  const { crawl, scs, cwv } = await getDiag();
  return (
    <div className="p-6">
      <HealthDiagnosticsModal
        crawlErrors={crawl.errors}
        missingFields={scs.missingFields}
        malformedFields={scs.malformedFields}
        cwv={cwv}
      />
    </div>
  );
}

