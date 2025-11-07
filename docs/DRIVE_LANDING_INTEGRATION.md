# Drive & Landing Page Integration Guide

## AIV Strip & Composite Chip Integration

### Drive Page Integration

**File**: `app/dashboard/page.tsx` or create `app/drive/page.tsx`

```tsx
// Server component (top of file)
import { getVisibilityWeights, getVisibilityThresholds } from "@/lib/formulas/registry";
import DriveClient from "./DriveClient";

export default async function DrivePage() {
  const weights = await getVisibilityWeights();
  const thresholds = await getVisibilityThresholds();
  
  return <DriveClient weights={weights} thresholds={thresholds} />;
}
```

**File**: `app/drive/DriveClient.tsx` (or inline in page)

```tsx
"use client";

import { useState } from "react";
import AIVStrip from "@/components/visibility/AIVStrip";
import AIVCompositeChip from "@/components/visibility/AIVCompositeChip";
import EnginePrefsDrawer from "@/components/visibility/EnginePrefsDrawer";
import type { VisibilityWeights, VisibilityThresholds } from "@/lib/formulas/registry";

export default function DriveClient({ 
  weights, 
  thresholds 
}: { 
  weights: VisibilityWeights; 
  thresholds: VisibilityThresholds;
}) {
  const [prefsOpen, setPrefsOpen] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-white" />
          <span className="text-white/80">DealershipAI • Drive</span>
        </div>
        <div className="flex items-center gap-6">
          <AIVStrip thresholds={thresholds} />
          <AIVCompositeChip weights={weights} />
          <button 
            onClick={() => setPrefsOpen(true)} 
            className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
          >
            Engine Prefs
          </button>
        </div>
      </header>
      
      {/* Your existing Drive content */}
      
      {prefsOpen && (
        <EnginePrefsDrawer 
          open={prefsOpen} 
          onClose={() => setPrefsOpen(false)} 
        />
      )}
    </main>
  );
}
```

### Landing Page Integration

**File**: `components/landing/SimplifiedLandingPage.tsx`

Add to the results section (when `showResults && !analyzing`):

```tsx
import dynamic from "next/dynamic";

const AIVStrip = dynamic(() => import("@/components/visibility/AIVStrip"), { ssr: false });
const AIVCompositeChip = dynamic(() => import("@/components/visibility/AIVCompositeChip"), { ssr: false });

// Inside your results section:
{showResults && !analyzing && (
  <div className="mt-4 flex items-center justify-end gap-4">
    <AIVStrip domain={domain} />
    <AIVCompositeChip 
      domain={domain} 
      weights={{ ChatGPT: 0.35, Perplexity: 0.25, Gemini: 0.25, Copilot: 0.15 }} 
    />
  </div>
)}
```

## Features

- **AIV Strip**: Shows per-engine presence with color-coded status (good/warn/critical)
- **AIV Composite Chip**: Displays weighted composite score with hovercard explaining math
- **Engine Prefs Drawer**: Allows tenants to enable/disable engines and adjust thresholds
- **Tenant-scoped**: All preferences are stored per tenant in Supabase
- **Registry-driven**: Thresholds and weights come from `configs/formulas/registry.yaml`

## API Endpoints

- `GET /api/visibility/presence` - Returns engine presence (respects tenant prefs)
- `GET /api/admin/integrations/visibility` - Get tenant engine preferences
- `POST /api/admin/integrations/visibility` - Save engine preferences
- `POST /api/admin/integrations/visibility-thresholds` - Save threshold overrides

