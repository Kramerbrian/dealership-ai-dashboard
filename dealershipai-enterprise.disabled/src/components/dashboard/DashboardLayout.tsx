'use client'

import { useState } from 'react'
import { Menu, Bell, Search, ChevronDown } from 'lucide-react'
import Link from 'next/link'
// Removed Clerk UserButton - using simple user display

interface DashboardLayoutProps {
  children: React.ReactNode
  dealerName: string
  dealerId: string
}

export default function DashboardLayout({ children, dealerName, dealerId }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notifications, setNotifications] = useState(3)

  const navItems = [
    { icon: '📊', label: 'Overview', href: `/dashboard/${dealerId}` },
    { icon: '🎯', label: 'AI Visibility', href: `/dashboard/${dealerId}/visibility` },
    { icon: '⭐', label: 'Reviews', href: `/dashboard/${dealerId}/reviews` },
    { icon: '🏆', label: 'Competitors', href: `/dashboard/${dealerId}/competitors` },
    { icon: '📋', label: 'Action Items', href: `/dashboard/${dealerId}/actions` },
    { icon: '⚙️', label: 'Settings', href: `/dashboard/${dealerId}/settings` },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 fixed w-full top-0 z-50">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              DealershipAI
            </div>
          </div>

          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search dealerships, competitors..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                DU
              </div>
              <span className="text-sm font-medium text-slate-700">Demo User</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <div className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors group"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-600">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-4">
            <div className="text-xs text-slate-500 text-center">
              DealershipAI Enterprise
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
