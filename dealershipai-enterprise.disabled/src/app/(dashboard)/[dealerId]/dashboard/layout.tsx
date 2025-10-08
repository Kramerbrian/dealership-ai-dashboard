'use client';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';

const tabs = [
  { href: '/dashboard/ai-health', label: '🤖 AI Health' },
  { href: '/dashboard/website',   label: '🌐 Website' },
  { href: '/dashboard/schema',    label: '🔍 Schema' },
  { href: '/dashboard/reviews',   label: '⭐ Reviews' },
  { href: '/dashboard/war-room',  label: '⚔️ War Room' },
  { href: '/dashboard/settings',  label: '⚙️ Settings' },
];

export default function DealerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const dealerId = params.dealerId;
  
  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Dealership: {dealerId}</h1>
      </div>
      
      <nav className="flex gap-2 mb-6">
        {tabs.map(t => {
          const active = pathname?.startsWith(`/${dealerId}/dashboard${t.href.replace('/dashboard', '')}`);
          return (
            <Link
              key={t.href}
              href={`/${dealerId}/dashboard${t.href.replace('/dashboard', '')}`}
              className={`px-3 py-2 rounded-xl text-sm ${active ? 'bg-black text-white' : 'bg-neutral-100'}`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
