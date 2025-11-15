/**
 * Group Commerce Actions Helper
 * Converts OEM routing results into bulk CommerceActions for group-level execution
 */

import type { CommerceAction } from '@/models/CommerceAction';

// Import types from OEM router
import type {
  OEMModel,
  Dealer,
  DealerCoverage,
  RouteOemUpdateResult,
} from './route';

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Build CommerceActions for group-level OEM update application
 * 
 * @param oem - OEM model data
 * @param routingResult - Result from routeOemUpdate()
 * @param dealersById - Map of dealer ID to Dealer object
 * @param opts - Options for filtering (e.g., only high priority)
 * @returns Array of CommerceActions ready for batch execution
 */
export function buildGroupCommerceActions(
  oem: OEMModel,
  routingResult: RouteOemUpdateResult,
  dealersById: Record<string, Dealer>,
  opts?: { onlyHighPriority?: boolean }
): CommerceAction[] {
  const label = `${oem.model_year} ${oem.brand} ${oem.model}`;
  const actions: CommerceAction[] = [];

  for (const cov of routingResult.dealer_coverage) {
    if (opts?.onlyHighPriority && cov.priority_bucket !== 'P0') continue;

    const dealer = dealersById[cov.dealer_id];
    if (!dealer) continue;

    const tenant = dealer.id;
    const host = dealer.host || dealer.domain || `https://${dealer.domain}`;

    // Schema update action
    actions.push({
      id: `schema-${slug(label)}-${tenant}`,
      tenant,
      intent: 'PUSH_SCHEMA',
      confidence: cov.priority_score / 100,
      requires_approval: true,
      tool: 'site_inject',
      input: {
        hosts: [host],
        head_html: `<script type="application/ld+json">${JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Vehicle',
          'brand': oem.brand,
          'model': oem.model,
          'modelDate': oem.model_year,
          // Add more schema fields from OEM data
        })}</script>`,
        scope: {
          path_glob: `/new/${oem.model_year}-${slug(oem.brand)}-${slug(oem.model)}*`,
        },
        dry_run: false,
      },
      preview: {
        estimate_minutes: 5,
        affected_pages: 3,
      },
    });

    // Content / copy update
    actions.push({
      id: `copy-${slug(label)}-${tenant}`,
      tenant,
      intent: 'UPDATE_MODEL_COPY',
      confidence: cov.priority_score / 100,
      requires_approval: true,
      tool: 'auto_fix',
      input: {
        domain: dealer.domain || host,
        model_label: label,
        sections: ['landing_page_hero', 'srp_banner', 'vdps_bullets'],
      },
      preview: {
        estimate_minutes: 10,
        affected_pages: 5,
      },
    });

    // Optional: AI visibility refresh after changes
    actions.push({
      id: `refresh-${slug(label)}-${tenant}`,
      tenant,
      intent: 'RUN_REFRESH',
      confidence: 0.9,
      requires_approval: false,
      tool: 'queue_refresh',
      input: {
        origin: host,
      },
    });
  }

  return actions;
}

/**
 * Create a batch ID for group actions
 */
export function createActionBatchId(oem: OEMModel, groupId: string): string {
  const label = `${oem.model_year}-${slug(oem.brand)}-${slug(oem.model)}`;
  return `batch-${label}-${groupId}-${Date.now()}`;
}

