import CoreWebVitalsCard from "@/app/components/CoreWebVitalsCard";

export const revalidate = 300;

async function getCWV() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/health/cwv`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load CWV");
  return res.json();
}

export default async function Page() {
  const data = await getCWV();
  return (
    <div className="p-6">
      <CoreWebVitalsCard data={data} />
    </div>
  );
}

