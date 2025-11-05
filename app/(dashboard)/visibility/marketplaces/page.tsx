import MarketplaceCitationsPanel from "@/app/components/MarketplaceCitationsPanel";

export const revalidate = 300;

export default function Page() {
  return (
    <div className="p-6">
      <MarketplaceCitationsPanel />
    </div>
  );
}

