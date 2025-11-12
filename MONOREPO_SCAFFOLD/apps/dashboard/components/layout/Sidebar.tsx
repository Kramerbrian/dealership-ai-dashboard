'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Lightbulb,
  TrendingUp,
  Target,
  Puzzle,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/competitive', label: 'Competitive', icon: TrendingUp },
  { href: '/priorities', label: 'Priorities', icon: Target },
  { href: '/integrations', label: 'Integrations', icon: Puzzle },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold">DealershipAI</h1>
        <p className="text-xs text-gray-500 mt-1">Cognitive Ops Platform</p>
      </div>

      <nav className="px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

