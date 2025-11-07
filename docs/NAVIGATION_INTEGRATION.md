# Navigation Integration Guide

This guide shows how to integrate the new Visibility and Health dashboard routes into your existing navigation.

## Navigation Structure

The new routes are defined in `app/config/nav.additions.ts`:

```typescript
export const DASH_NAV_ADDITIONS = [
  { label: "Visibility", children: [
    { label: "Relevance Overlay", href: "/dashboard/visibility/relevance-overlay" },
    { label: "Marketplace Citations", href: "/dashboard/visibility/marketplaces" }
  ]},
  { label: "Health", children: [
    { label: "Core Web Vitals", href: "/dashboard/health/core-web-vitals" },
    { label: "Diagnostics", href: "/dashboard/health/diagnostics" }
  ]}
];
```

## Integration Options

### Option 1: TabbedDashboard Component

If you're using `components/dashboard/TabbedDashboard.tsx`, add new tabs:

```typescript
import { DASH_NAV_ADDITIONS } from "@/app/config/nav.additions";

// In TabbedDashboard.tsx, add to tabs array:
const tabs: TabData[] = [
  // ... existing tabs ...
  {
    id: 'visibility',
    label: 'Visibility',
    icon: <Eye className="w-4 h-4" />,
    component: <VisibilityTab />, // Create this component
    children: [
      { id: 'relevance-overlay', label: 'Relevance Overlay', href: '/dashboard/visibility/relevance-overlay' },
      { id: 'marketplaces', label: 'Marketplace Citations', href: '/dashboard/visibility/marketplaces' }
    ]
  },
  {
    id: 'health',
    label: 'Health',
    icon: <Activity className="w-4 h-4" />,
    component: <HealthTab />, // Create this component
    children: [
      { id: 'core-web-vitals', label: 'Core Web Vitals', href: '/dashboard/health/core-web-vitals' },
      { id: 'diagnostics', label: 'Diagnostics', href: '/dashboard/health/diagnostics' }
    ]
  }
];
```

### Option 2: Sidebar Navigation Component

If you have a dedicated sidebar component:

```typescript
import { DASH_NAV_ADDITIONS } from "@/app/config/nav.additions";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarNav() {
  const pathname = usePathname();
  
  return (
    <nav className="space-y-2">
      {/* Existing nav items */}
      
      {/* Add new sections */}
      {DASH_NAV_ADDITIONS.map((section) => (
        <div key={section.label} className="space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
            {section.label}
          </div>
          {section.children?.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-sm ${
                pathname === item.href
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
```

### Option 3: Layout-Based Navigation

If navigation is in `app/(dashboard)/layout.tsx`:

```typescript
import { DASH_NAV_ADDITIONS } from "@/app/config/nav.additions";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-900 text-white p-4">
        <nav>
          {/* Existing navigation */}
          
          {/* Add new sections */}
          {DASH_NAV_ADDITIONS.map((section) => (
            <div key={section.label} className="mt-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                {section.label}
              </h3>
              <ul className="space-y-1">
                {section.children?.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block px-3 py-2 rounded-md hover:bg-gray-800"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

### Option 4: Dropdown Menu

For a dropdown-style navigation:

```typescript
import { DASH_NAV_ADDITIONS } from "@/app/config/nav.additions";
import { ChevronDown } from "lucide-react";

export function DropdownNav() {
  return (
    <div className="flex gap-4">
      {DASH_NAV_ADDITIONS.map((section) => (
        <div key={section.label} className="relative group">
          <button className="flex items-center gap-1 px-4 py-2 hover:bg-gray-100 rounded">
            {section.label}
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
            {section.children?.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 hover:bg-gray-50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Feature Toggle Integration

Add feature toggle checks to navigation items:

```typescript
import toggles from "@/app/config/feature_toggles.json";

// Filter nav items based on feature toggles
const filteredNav = DASH_NAV_ADDITIONS.map(section => ({
  ...section,
  children: section.children?.filter(item => {
    // Map href to toggle key
    const toggleMap: Record<string, keyof typeof toggles> = {
      '/dashboard/visibility/relevance-overlay': 'relevance_overlay',
      '/dashboard/visibility/marketplaces': 'marketplace_suppression',
      '/dashboard/health/core-web-vitals': 'core_web_vitals_plain_english',
      '/dashboard/health/diagnostics': 'health_diagnostics_modal',
    };
    const toggleKey = toggleMap[item.href];
    return toggleKey ? toggles[toggleKey] : true;
  })
})).filter(section => section.children && section.children.length > 0);
```

## Icon Integration

Add icons to navigation items:

```typescript
import { 
  Eye, 
  ShoppingCart, 
  Activity, 
  AlertCircle 
} from "lucide-react";

const iconMap: Record<string, React.ComponentType> = {
  'Relevance Overlay': Eye,
  'Marketplace Citations': ShoppingCart,
  'Core Web Vitals': Activity,
  'Diagnostics': AlertCircle,
};

// Use in navigation:
{section.children?.map((item) => {
  const Icon = iconMap[item.label];
  return (
    <Link key={item.href} href={item.href}>
      {Icon && <Icon className="w-4 h-4" />}
      {item.label}
    </Link>
  );
})}
```

## Active State Styling

Highlight active navigation items:

```typescript
import { usePathname } from "next/navigation";

const pathname = usePathname();

// In your navigation component:
<Link
  href={item.href}
  className={pathname === item.href ? 'active' : ''}
>
  {item.label}
</Link>
```

## Mobile Navigation

For mobile-responsive navigation:

```typescript
'use client';

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { DASH_NAV_ADDITIONS } from "@/app/config/nav.additions";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setOpen(!open)} className="md:hidden">
        <Menu className="w-6 h-6" />
      </button>
      
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
          <div className="bg-white w-64 h-full p-4">
            <button onClick={() => setOpen(false)}>
              <X className="w-6 h-6" />
            </button>
            <nav>
              {DASH_NAV_ADDITIONS.map((section) => (
                <div key={section.label}>
                  <h3>{section.label}</h3>
                  {section.children?.map((item) => (
                    <Link key={item.href} href={item.href}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
```

## Testing Navigation

After integration, test:

1. ✅ All navigation links work
2. ✅ Active state highlights correctly
3. ✅ Feature toggles hide/show items correctly
4. ✅ Mobile navigation works
5. ✅ Icons display properly
6. ✅ Navigation persists across page loads

## Next Steps

1. Choose integration option that matches your dashboard structure
2. Add navigation items to your sidebar/nav component
3. Test all links work correctly
4. Add feature toggle filtering (optional)
5. Add icons (optional)
6. Test mobile responsiveness

