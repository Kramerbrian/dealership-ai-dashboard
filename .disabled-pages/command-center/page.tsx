"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import SchemaKingPanel from "@/components/dashboard/SchemaKingPanel";
import AgenticCommercePanel from "@/components/dashboard/AgenticCommercePanel";
import CognitiveControlCenter from "./cognitive-control-center";

export const dynamic = "force-dynamic";

interface RemoteFlags {
  schema_king_panel?: { enabled: boolean };
  agentic_commerce_panel?: { enabled: boolean };
}

export default function CommandCenterPage() {
  const { user, isLoaded } = useUser();
  const [flags, setFlags] = useState<RemoteFlags>({});
  const [loading, setLoading] = useState(true);

  // Demo dealer data - in production, fetch from user's dealers
  const dealerId = "toyota-naples";
  const domain = "https://www.germaintoyotaofnaples.com";

  useEffect(() => {
    async function loadFlags() {
      try {
        const response = await fetch("/remote-config/flags.json");
        if (response.ok) {
          const data = await response.json();
          setFlags(data.flags || {});
        }
      } catch (error) {
        console.warn("Failed to load remote flags, using defaults:", error);
        // Default flags if fetch fails
        setFlags({
          schema_king_panel: { enabled: true },
          agentic_commerce_panel: { enabled: true },
        });
      } finally {
        setLoading(false);
      }
    }

    loadFlags();
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const showSchemaKing = flags.schema_king_panel?.enabled !== false;
  const showAgenticCommerce = flags.agentic_commerce_panel?.enabled !== false;
  const showCognitiveControl = flags.cognitive_control_center?.enabled !== false;

  // If cognitive control center is enabled, show that instead
  if (showCognitiveControl) {
    return <CognitiveControlCenter />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Command Center</h1>
          <p className="text-slate-400">
            Schema King orchestration and Agentic Commerce metrics
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {showSchemaKing && (
              <SchemaKingPanel dealerId={dealerId} domain={domain} />
            )}
            {showAgenticCommerce && (
              <AgenticCommercePanel dealerId={dealerId} />
            )}
          </div>
        )}

        {!showSchemaKing && !showAgenticCommerce && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400">
              No panels enabled. Update <code className="text-slate-300">/remote-config/flags.json</code> to enable features.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

