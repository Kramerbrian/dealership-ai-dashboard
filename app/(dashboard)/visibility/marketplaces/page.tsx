import MarketplaceCitationsPanel from "@/app/components/MarketplaceCitationsPanel";
import toggles from "@/app/config/feature_toggles.json";
import { redirect } from "next/navigation";

export const revalidate = 300;

export default function Page() {
  if (!toggles.marketplace_suppression) {
    redirect("/dashboard");
  }

  return <MarketplaceCitationsPanel />;
}

