/**
 * OEM Model → Pulse Tile Transformer
 * Converts structured OEM JSON into Pulse inbox tiles with brand-aware routing
 */

import { OEMModelUpdate, OEMHeadlineChange } from './schema';
import { InboxTile } from '@/lib/pulse/inbox';

export type PulseTileIntent = 'MODEL_UPDATE' | 'MEDIA_UPDATE' | 'EQUIP_UPDATE' | 'POWERTRAIN_UPDATE' | 'PRICING_UPDATE';

export interface OEMToPulseTileOptions {
  brand: string; // e.g., "Toyota"
  oemModel: string; // e.g., "2026 Tacoma"
  intent: PulseTileIntent;
  headline: OEMHeadlineChange;
  powertrain?: { name: string; hp?: number; torque_lbft?: number };
  color?: { name: string; trim_limitation?: string };
  equipment?: { item: string; change: string };
  pricing?: { trim: string; msrp_delta?: number };
}

/**
 * Generate actionable Pulse tile from OEM update
 */
export function oemToPulseTile(options: OEMToPulseTileOptions): InboxTile {
  const { brand, oemModel, intent, headline, powertrain, color, equipment, pricing } = options;

  // Build title based on intent
  let title = '';
  let kpi = '';
  let delta = '';
  const actions: string[] = [];

  switch (intent) {
    case 'POWERTRAIN_UPDATE':
      if (powertrain) {
        const specs = [
          powertrain.hp && `${powertrain.hp} hp`,
          powertrain.torque_lbft && `${powertrain.torque_lbft} lb-ft`,
        ].filter(Boolean).join(' / ');
        title = `${oemModel}: ${powertrain.name}${specs ? ` now ${specs}` : ''}`;
        kpi = 'Powertrain headline';
        delta = '+ new drivetrain messaging';
        actions.push(
          `Update ${oemModel.split(' ')[1]} VDP hero bullets`,
          `Add ${powertrain.name} specs to SRP filters`,
          'Regenerate model-year walkaround script'
        );
      }
      break;

    case 'MEDIA_UPDATE':
      if (color) {
        title = `New ${oemModel} colors: ${color.name}${color.trim_limitation ? ` (${color.trim_limitation})` : ''}`;
        kpi = 'Color & media updates';
        delta = 'Photo set + filters';
        actions.push(
          'Add new color swatches to VDP',
          color.trim_limitation ? `Tag ${color.trim_limitation} photos with ${color.name}` : `Tag photos with ${color.name}`,
          'Update specials & banners for MY26 palette'
        );
      } else {
        title = `${oemModel}: ${headline.title}`;
        kpi = headline.detail;
        delta = headline.tag || 'media';
        actions.push('Update VDP photo sets', 'Refresh model gallery');
      }
      break;

    case 'EQUIP_UPDATE':
      if (equipment) {
        title = `${equipment.item} ${equipment.change}`;
        kpi = 'Equipment change';
        delta = equipment.change.includes('standard') ? 'Standard equipment' : 'Optional equipment';
        actions.push(
          `Update ${oemModel.split(' ')[1]} pricing & window labels`,
          `Update ${equipment.item.toLowerCase()} copy on ${oemModel.split(' ')[1]} landing page`,
          'Check inventory feed for correct option codes'
        );
      } else {
        title = `${oemModel}: ${headline.title}`;
        kpi = headline.detail;
        delta = headline.tag || 'equipment';
        actions.push('Review equipment lists', 'Update pricing sheets');
      }
      break;

    case 'PRICING_UPDATE':
      if (pricing) {
        const deltaText = pricing.msrp_delta
          ? (pricing.msrp_delta > 0 ? `+$${pricing.msrp_delta.toLocaleString()}` : `-$${Math.abs(pricing.msrp_delta).toLocaleString()}`)
          : 'updated';
        title = `${oemModel} ${pricing.trim}: MSRP ${deltaText}`;
        kpi = 'Pricing change';
        delta = deltaText;
        actions.push(
          `Update ${pricing.trim} MSRP in DMS`,
          'Refresh pricing on website',
          'Update special offers if applicable'
        );
      }
      break;

    case 'MODEL_UPDATE':
    default:
      title = `${oemModel}: ${headline.title}`;
      kpi = headline.detail;
      delta = headline.tag || 'update';
      actions.push(
        'Review model-year changes',
        'Update website content',
        'Notify sales team'
      );
      break;
  }

  // Fallback if title is empty
  if (!title) {
    title = `${oemModel}: ${headline.title}`;
    kpi = headline.detail;
    delta = headline.tag || 'update';
  }

  return {
    title,
    kpi,
    delta,
    actions,
    severity: headline.is_retail_relevant ? 'high' : 'medium',
    category: `oem_${intent.toLowerCase()}`,
    // Metadata for brand-aware filtering
    // @ts-ignore - allow additional metadata
    brand,
    oem_model: oemModel,
    intent,
  };
}

/**
 * Transform full OEM model update into multiple Pulse tiles
 */
export function oemUpdateToPulseTiles(update: OEMModelUpdate): InboxTile[] {
  const tiles: InboxTile[] = [];
  const oemModel = `${update.year} ${update.model}`;

  // Process headline changes
  for (const headline of update.headline_changes) {
    if (!headline.is_retail_relevant) continue;

    // Determine intent from tag
    let intent: PulseTileIntent = 'MODEL_UPDATE';
    if (headline.tag === 'powertrain') intent = 'POWERTRAIN_UPDATE';
    else if (headline.tag === 'color' || headline.tag === 'styling') intent = 'MEDIA_UPDATE';
    else if (headline.tag === 'equipment') intent = 'EQUIP_UPDATE';
    else if (headline.tag === 'pricing') intent = 'PRICING_UPDATE';

    // Find related powertrain/color/equipment data
    const powertrain = update.powertrains?.find((p) =>
      headline.title.toLowerCase().includes(p.name.toLowerCase())
    );
    const color = update.colors?.find((c) =>
      headline.title.toLowerCase().includes(c.name.toLowerCase())
    );
    const equipment = update.equipment_changes?.find((e) =>
      headline.title.toLowerCase().includes(e.item.toLowerCase())
    );
    const pricing = update.pricing_changes?.find((p) =>
      headline.title.toLowerCase().includes(p.trim.toLowerCase())
    );

    const tile = oemToPulseTile({
      brand: update.oem,
      oemModel,
      intent,
      headline,
      powertrain,
      color,
      equipment,
      pricing,
    });

    tiles.push(tile);
  }

  // Add dedicated powertrain tiles if not already covered
  if (update.powertrains) {
    for (const powertrain of update.powertrains) {
      const alreadyCovered = tiles.some((t) =>
        t.kpi?.toLowerCase().includes(powertrain.name.toLowerCase())
      );
      if (!alreadyCovered) {
        tiles.push(
          oemToPulseTile({
            brand: update.oem,
            oemModel,
            intent: 'POWERTRAIN_UPDATE',
            headline: {
              title: `${powertrain.name} powertrain`,
              detail: `${powertrain.name} specifications`,
              is_retail_relevant: true,
              tag: 'powertrain',
            },
            powertrain,
          })
        );
      }
    }
  }

  // Add dedicated color tiles if not already covered
  if (update.colors) {
    for (const color of update.colors) {
      const alreadyCovered = tiles.some((t) =>
        t.title?.toLowerCase().includes(color.name.toLowerCase())
      );
      if (!alreadyCovered) {
        tiles.push(
          oemToPulseTile({
            brand: update.oem,
            oemModel,
            intent: 'MEDIA_UPDATE',
            headline: {
              title: `New color: ${color.name}`,
              detail: color.trim_limitation || 'Available across trims',
              is_retail_relevant: true,
              tag: 'color',
            },
            color,
          })
        );
      }
    }
  }

  return tiles;
}

