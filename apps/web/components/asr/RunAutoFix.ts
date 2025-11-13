"use client";

import { dai } from "@/lib/dai/client";

export async function runAutoFixJSONLD(domain: string, jsonld: object) {
  // 1) register origin (safe-idempotent)
  await dai.putOrigin({ origin: `https://${domain}`, refresh: false });

  // 2) inject JSON-LD
  const res = await dai.postSiteInject({
    hosts: [`https://${domain}`],
    head_html: `<script type="application/ld+json">${JSON.stringify(
      jsonld
    )}</script>`,
  });

  // 3) queue a refresh scan
  await dai.postRefresh(`https://${domain}`);

  return res; // { status: 'queued', verification: { rich_results_pass: true, perplexity_check: 'pass' } }
}

