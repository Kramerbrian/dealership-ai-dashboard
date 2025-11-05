import RelevanceOverlay from "@/app/components/RelevanceOverlay";

export const revalidate = 300;

async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/visibility/relevance`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load relevance data");
  return res.json();
}

export default async function Page() {
  const { nodes } = await getData();
  return (
    <div className="p-6">
      <RelevanceOverlay nodes={nodes} />
    </div>
  );
}

