import HealthDiagnosticsModal from "@/app/modals/HealthDiagnosticsModal";
import toggles from "@/app/config/feature_toggles.json";
import { redirect } from "next/navigation";

export const revalidate = 300;

async function getDiag() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const [crawlRes, scsRes, cwvRes] = await Promise.all([
    fetch(`${baseUrl}/api/health/crawl`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/schema/scs`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/health/cwv`, { cache: "no-store" })
  ]);
  if (!crawlRes.ok || !scsRes.ok || !cwvRes.ok) throw new Error("Diagnostics fetch failed");
  return { crawl: await crawlRes.json(), scs: await scsRes.json(), cwv: await cwvRes.json() };
}

export default async function Page() {
  if (!toggles.health_diagnostics_modal) {
    redirect("/dashboard");
  }

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

