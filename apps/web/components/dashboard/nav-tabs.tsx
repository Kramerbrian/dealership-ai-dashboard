import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { 
  Home, 
  BarChart3, 
  Target, 
  Lightbulb, 
  ShoppingCart 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavTabsProps {
  activeTab: string
  onChange: (tab: string) => void
}

export function NavTabs({ activeTab, onChange }: NavTabsProps) {
  const tabs = [
    { id: 'executive', name: 'Executive Summary', icon: Home },
    { id: 'pillars', name: '5 Pillars Deep Dive', icon: BarChart3 },
    { id: 'competitive', name: 'Competitive Intelligence', icon: Target },
    { id: 'quick-wins', name: 'Quick Wins', icon: Lightbulb },
    { id: 'mystery-shop', name: 'Mystery Shop', icon: ShoppingCart },
  ]

  return (
    <div className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/dashboard?tab=${tab.id}`}
              className={cn(
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center space-x-2'
              )}
              onClick={() => onChange(tab.id)}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
