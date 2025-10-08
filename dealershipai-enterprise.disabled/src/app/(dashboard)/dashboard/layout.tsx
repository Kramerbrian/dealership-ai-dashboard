'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/dashboard/ai-health', label: '🤖 AI Health' },
  { href: '/dashboard/gpt',       label: '🧠 GPT Assistant' },
  { href: '/dashboard/realtime',  label: '🎤 Voice Assistant' },
  { href: '/dashboard/website',   label: '🌐 Website' },
  { href: '/dashboard/schema',    label: '🔍 Schema' },
  { href: '/dashboard/reviews',   label: '⭐ Reviews' },
  { href: '/dashboard/war-room',  label: '⚔️ War Room' },
  { href: '/dashboard/settings',  label: '⚙️ Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="p-6">
      <nav className="flex gap-2 mb-6">
        {tabs.map(t => {
          const active = pathname?.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
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
