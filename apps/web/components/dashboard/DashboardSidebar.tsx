'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Target, 
  TrendingUp, 
  Zap, 
  UserCheck, 
  BarChart3,
  Settings,
  HelpCircle,
  Crown,
  Shield
} from 'lucide-react';
import { TierGate } from '@/components/TierGate';

const navigation = [
  {
    name: 'Executive Summary',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and key metrics'
  },
  {
    name: '5 Pillars',
    href: '/dashboard/pillars',
    icon: Target,
    description: 'AI Visibility, Zero-Click Shield, UGC Health, Geo Trust, SGP Integrity'
  },
  {
    name: 'Competitive Intelligence',
    href: '/dashboard/competitive',
    icon: TrendingUp,
    description: 'War room and competitor analysis',
    tier: 'PRO'
  },
  {
    name: 'Quick Wins',
    href: '/dashboard/quick-wins',
    icon: Zap,
    description: 'Actionable recommendations',
    tier: 'PRO'
  },
  {
    name: 'Mystery Shop',
    href: '/dashboard/mystery-shop',
    icon: UserCheck,
    description: 'Automated customer experience testing',
    tier: 'ENTERPRISE'
  }
];

const secondaryNavigation = [
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Performance metrics and insights'
  },
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

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const NavigationItem = ({ item, isSecondary = false }: { item: any; isSecondary?: boolean }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    const content = (
      <div className={`
        flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
        ${isActive 
          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
          : 'text-gray-700 hover:bg-gray-100'
        }
        ${isSecondary ? 'text-sm' : ''}
      `}>
        <Icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium truncate">{item.name}</span>
            {item.tier && (
              <span className={`
                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                ${item.tier === 'PRO' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-orange-100 text-orange-800'
                }
              `}>
                {item.tier === 'PRO' ? <Crown className="h-3 w-3 mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
                {item.tier}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <p className="text-xs text-gray-500 truncate">{item.description}</p>
          )}
        </div>
      </div>
    );

    if (item.tier) {
      return (
        <TierGate requiredTier={item.tier} feature={item.name}>
          <Link href={item.href}>
            {content}
          </Link>
        </TierGate>
      );
    }

    return (
      <Link href={item.href}>
        {content}
      </Link>
    );
  };

  return (
    <aside className={`
      fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 
      transform transition-transform duration-200 ease-in-out z-40
      ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
    `}>
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavigationItem key={item.name} item={item} />
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Secondary Navigation */}
          <div className="space-y-1">
            {secondaryNavigation.map((item) => (
              <NavigationItem key={item.name} item={item} isSecondary />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">DealershipAI</p>
              <p className="text-xs text-gray-500">v2.0</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
