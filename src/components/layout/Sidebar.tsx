"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Star, 
  Brain, 
  Calculator, 
  Users, 
  BookOpen, 
  Settings,
  HelpCircle,
  Sparkles
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Overview and metrics'
  },
  {
    name: 'Reputation',
    href: '/dashboard/reputation',
    icon: Star,
    description: 'Review management'
  },
  {
    name: 'Insights',
    href: '/dashboard/insights',
    icon: Brain,
    description: 'AI-powered analytics'
  },
  {
    name: 'What-If Simulator',
    href: '/dashboard/simulator',
    icon: Calculator,
    description: 'Scenario planning'
  },
  {
    name: 'Team',
    href: '/dashboard/team',
    icon: Users,
    description: 'Team management'
  },
  {
    name: 'Learning Center',
    href: '/dashboard/learning',
    icon: BookOpen,
    description: 'Training and resources'
  }
];

const secondaryNavigation = [
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Account and preferences'
  },
  {
    name: 'Help & Support',
    href: '/dashboard/help',
    icon: HelpCircle,
    description: 'Documentation and support'
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">DealershipAI</h1>
            <p className="text-xs text-gray-500">AI-Powered Analytics</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Secondary Navigation */}
        <div className="space-y-1">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>DealershipAI v1.0.0</p>
          <p className="mt-1">© 2024 DealershipAI</p>
        </div>
      </div>
    </div>
  );
}
