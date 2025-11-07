import CoreWebVitalsCard from "@/app/components/CoreWebVitalsCard";
import toggles from "@/app/config/feature_toggles.json";
import { redirect } from "next/navigation";

export const revalidate = 300;

async function getCWV() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/health/cwv`, { 
    cache: "no-store" 
  });
  if (!res.ok) throw new Error("Failed to load CWV");
  return res.json();
}

export default async function Page() {
  if (!toggles.core_web_vitals_plain_english) {
    redirect("/dashboard");
  }

  const data = await getCWV();
  return <CoreWebVitalsCard data={data} />;
}

