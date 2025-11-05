import React from "react";
import marketplaceData from "@/data/marketplaces.json";

export default function MarketplaceCitationsPanel() {
  const groups: Array<[string, string[]]> = [
    ["Retail Listing Surfaces", marketplaceData.retail_listings],
    ["Valuation & Appraisal Anchors", marketplaceData.valuation_anchors],
    ["Data & Trust Authorities", marketplaceData.data_authorities],
    ["Service & Parts", marketplaceData.service_parts]
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Marketplace Generative Citations</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {groups.map(([title, items]) => (
          <div key={title} className="border border-gray-200 rounded-xl p-4 bg-white/50">
            <div className="text-sm font-semibold mb-2 text-gray-900">{title}</div>
            <ul className="text-sm list-disc list-inside text-gray-700 space-y-1">
              {items.map(x => (<li key={x}>{x}</li>))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
