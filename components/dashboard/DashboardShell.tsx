"use client";

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { getActiveTiles, type TileConfig } from '@/lib/tiles';

type Props = {
  children: React.ReactNode;
  userTier?: 1 | 2 | 3; // Optional: user tier (Ignition=1, Momentum=2, Hyperdrive=3)
  userRole?: string; // Optional: user role (viewer, dealer_user, manager, marketing_director, admin, superadmin)
};

// Base navigation items (always visible)
const baseNavItems = [
  { href: '/dash', label: 'Pulse', key: 'pulse' },
  { href: '/dash/autopilot', label: 'Autopilot', key: 'autopilot' },
  { href: '/dash/insights/ai-story', label: 'AI Story', key: 'ai-story' }
];

// Tile-based navigation items (filtered by tier/role)
const tileNavItems: Record<string, { href: string; label: string; key: string }> = {
  intel: { href: '/dash/intel', label: 'Intelligence', key: 'intel' },
  site: { href: '/dash/site', label: 'Site Intelligence', key: 'site' },
  inventory: { href: '/dash/inventory', label: 'Inventory', key: 'inventory' },
  traffic: { href: '/dash/traffic', label: 'Traffic & Market', key: 'traffic' },
  agents: { href: '/dash/agents', label: 'dAI Agents', key: 'agents' },
  apis: { href: '/dash/apis', label: 'APIs & Exports', key: 'apis' },
  mystery: { href: '/dash/mystery', label: 'Mystery Shop', key: 'mystery' },
};

export function DashboardShell({ children, userTier = 1, userRole = 'viewer' }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Support both 'domain' and 'dealer' params for compatibility
  const domain = searchParams.get('domain') || undefined || searchParams.get('dealer') || undefined || '';

  // Get available tiles based on user tier and role
  const availableTiles = getActiveTiles(userTier, userRole);
  
  // Build navigation items from tiles
  const tileNav = availableTiles
    .filter(tile => tileNavItems[tile.key])
    .map(tile => ({
      ...tileNavItems[tile.key],
      tileKey: tile.key,
      beta: tile.beta,
    }));

  // Combine base nav items with tile-based nav items
  const allNavItems = [
    ...baseNavItems,
    ...tileNav.map(tile => ({
      href: tile.href,
      label: tile.label,
      key: tile.key,
      beta: tile.beta,
    })),
  ];

  return (
    <div className="min-h-dvh bg-neutral-950 text-white flex">
      <aside className="hidden md:flex md:flex-col w-52 border-r border-white/10 bg-black/40">
        <div className="px-5 py-4 border-b border-white/10">
          <div className="text-xs uppercase tracking-[0.16em] text-white/40">
            DealershipAI
          </div>
          <div className="mt-1 text-sm font-semibold truncate">
            {domain || 'Dashboard'}
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {allNavItems.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/');
            // Preserve domain parameter in navigation
            const currentDomain = searchParams.get('domain') || undefined || searchParams.get('dealer') || undefined || '';
            const href = currentDomain
              ? `${item.href}?domain=${encodeURIComponent(currentDomain)}`
              : item.href;
            return (
              <Link
                key={item.href}
                href={href}
                className={`block rounded-full px-3 py-2 text-sm ${
                  active
                    ? 'bg-white text-black'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-2">
                  {item.label}
                  {item.beta && (
                    <span className="text-[10px] uppercase tracking-wider text-white/40 bg-white/10 px-1.5 py-0.5 rounded">
                      Beta
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="md:hidden px-4 py-3 border-b border-white/10">
          <div className="text-xs uppercase tracking-[0.16em] text-white/40">
            DealershipAI
          </div>
          <div className="mt-1 text-sm font-semibold truncate">
            {domain || 'Dashboard'}
          </div>
        </header>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}