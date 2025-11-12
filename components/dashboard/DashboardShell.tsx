'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

type Props = {
  children: React.ReactNode;
};

const navItems = [
  { href: '/dash', label: 'Pulse' },
  { href: '/dash/autopilot', label: 'Autopilot' },
  { href: '/dash/insights/ai-story', label: 'AI Story' }
];

export function DashboardShell({ children }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const domain = searchParams.get('domain') || '';

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
          {navItems.map((item) => {
            const active = pathname === item.href;
            const href = domain
              ? `${item.href}?domain=${encodeURIComponent(domain)}`
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
                {item.label}
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

