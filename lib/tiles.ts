/**
 * Dashboard Tiles Configuration
 * Defines which tiles are active, their tier requirements, and role gates
 */

export type Tier = 1 | 2 | 3; // Ignition | Momentum | Hyperdrive
export type TileKey = 'intel' | 'site' | 'inventory' | 'traffic' | 'agents' | 'apis' | 'mystery' | 'block' | 'fixed' | 'admin' | 'super';

export interface TileConfig {
  key: TileKey;
  title: string;
  href: string;
  active: boolean;
  requireTier?: Tier;
  requireRole?: string[];
  beta?: boolean;
}

/**
 * Tile configuration with tier gates and role requirements
 * Tier gates: Ignition=1, Momentum=2, Hyperdrive=3
 */
export const TILES: TileConfig[] = [
  {
    key: 'intel',
    title: 'Intelligence',
    href: '/dash/intel',
    active: true,
    requireTier: 1,
  },
  {
    key: 'site',
    title: 'Site Intelligence',
    href: '/dash/site',
    active: true, // ✅ Activated
    requireTier: 1,
  },
  {
    key: 'inventory',
    title: 'Inventory Optimization',
    href: '/dash/inventory',
    active: true, // ✅ Activated
    requireTier: 2,
  },
  {
    key: 'traffic',
    title: 'Traffic & Market',
    href: '/dash/traffic',
    active: true, // ✅ Activated
    requireTier: 2,
  },
  {
    key: 'agents',
    title: 'dAI Agents',
    href: '/dash/agents',
    active: true,
    requireTier: 3,
    requireRole: ['marketing_director', 'admin', 'superadmin'], // Gate to marketing_director+
    beta: true,
  },
  {
    key: 'apis',
    title: 'APIs & Exports',
    href: '/dash/apis',
    active: true,
    requireTier: 3,
    requireRole: ['marketing_director', 'admin', 'superadmin'], // Gate to marketing_director+
    beta: true,
  },
  {
    key: 'mystery',
    title: 'Mystery Shop',
    href: '/dash/mystery',
    active: true,
    requireTier: 3,
    beta: true,
  },
  {
    key: 'block',
    title: 'Block',
    href: '/dash/block',
    active: false, // Gated beta - requires data sources
    requireTier: 2,
    beta: true,
  },
  {
    key: 'fixed',
    title: 'Fixed',
    href: '/dash/fixed',
    active: false, // Gated beta - requires data sources
    requireTier: 2,
    beta: true,
  },
  {
    key: 'admin',
    title: 'Admin',
    href: '/dash/admin',
    active: true,
    requireRole: ['admin', 'superadmin'],
  },
  {
    key: 'super',
    title: 'Super Admin',
    href: '/dash/super',
    active: true,
    requireRole: ['superadmin'],
  },
];

/**
 * Get active tiles for a user based on tier and role
 */
export function getActiveTiles(userTier: Tier, userRole: string): TileConfig[] {
  return TILES.filter((tile) => {
    if (!tile.active) return false;
    if (tile.requireTier && userTier < tile.requireTier) return false;
    if (tile.requireRole && !tile.requireRole.includes(userRole)) return false;
    return true;
  });
}

/**
 * Check if user has access to a specific tile
 */
export function hasTileAccess(tileKey: TileKey, userTier: Tier, userRole: string): boolean {
  const tile = TILES.find((t) => t.key === tileKey);
  if (!tile || !tile.active) return false;
  if (tile.requireTier && userTier < tile.requireTier) return false;
  if (tile.requireRole && !tile.requireRole.includes(userRole)) return false;
  return true;
}

