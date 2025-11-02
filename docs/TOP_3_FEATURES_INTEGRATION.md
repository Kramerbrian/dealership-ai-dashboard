# Top 3 Priority Features - Integration Guide

This guide shows how to integrate the three highest-priority features into your dashboard:

1. **Dynamic Easter Eggs** - AI-generated contextual wit (Pro/Enterprise)
2. **AI Copilot** - Proactive recommendations with actionable insights
3. **Competitor Radar** - Real-time competitor tracking with alerts

## Quick Start

### 1. Import Components

```typescript
import { DynamicEasterEggEngine } from '@/app/components/dashboard/DynamicEasterEggEngine';
import { AICopilot } from '@/app/components/dashboard/AICopilot';
import { CompetitorRadar } from '@/app/components/dashboard/CompetitorRadar';
```

### 2. Basic Integration Example

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { DynamicEasterEggEngine } from '@/app/components/dashboard/DynamicEasterEggEngine';
import { AICopilot } from '@/app/components/dashboard/AICopilot';
import { CompetitorRadar } from '@/app/components/dashboard/CompetitorRadar';

export default function EnhancedDashboard() {
  const [trustScore, setTrustScore] = useState(75);
  const [scoreDelta, setScoreDelta] = useState(0);
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'enterprise'>('pro');
  
  // Mock data - replace with real API calls
  const dashboardState = {
    trustScore,
    scoreDelta,
    pillars: {
      seo: 78,
      aeo: 82,
      geo: 75,
      qai: 70
    },
    competitors: [
      {
        name: 'Competitor A',
        score: 85,
        scoreDelta: 3
      },
      {
        name: 'Competitor B',
        score: 72,
        scoreDelta: -2
      }
    ],
    criticalIssues: 2,
    recentActivity: ['Schema fixed', 'New review received']
  };

  const competitors = [
    {
      id: '1',
      name: 'Competitor A',
      trustScore: 85,
      scoreDelta: 3,
      distance: 5,
      city: 'Naples',
      recentActivity: 'Just improved SEO score by 5 points'
    },
    {
      id: '2',
      name: 'Competitor B',
      trustScore: 72,
      scoreDelta: -2,
      distance: 8,
      city: 'Fort Myers'
    }
  ];

  const easterEggContext = {
    trustScore,
    topIssue: dashboardState.criticalIssues > 0 ? 'Schema markup issues' : undefined,
    competitorName: dashboardState.competitors.find(c => c.score > trustScore)?.name,
    dealershipName: 'Your Dealership',
    currentTime: new Date(),
    recentAction: dashboardState.recentActivity[0]?.includes('Schema') ? 'fixed_schema' : undefined
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Main Dashboard Content */}
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
        
        {/* Trust Score Display */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="text-6xl font-bold text-purple-500">{trustScore}</div>
          <div className="text-gray-400">Trust Score</div>
        </div>

        {/* Competitor Radar Widget */}
        <div className="mb-6">
          <CompetitorRadar
            competitors={competitors}
            yourScore={trustScore}
            yourCity="Naples"
            onCompetitorClick={(competitor) => {
              console.log('Competitor clicked:', competitor);
              // Navigate to competitor detail page or show modal
            }}
          />
        </div>

        {/* Rest of your dashboard components */}
      </div>

      {/* Floating Components */}
      
      {/* AI Copilot - Bottom Left */}
      <AICopilot
        dashboardState={dashboardState}
        userTier={userTier}
      />

      {/* Dynamic Easter Eggs - Bottom Right */}
      <DynamicEasterEggEngine
        context={easterEggContext}
        userTier={userTier}
      />
    </div>
  );
}
```

## Feature Details

### Dynamic Easter Egg Engine

**Purpose**: Adds personality and delight with AI-generated witty one-liners triggered by specific events.

**Props**:
- `context`: Dashboard context (trustScore, topIssue, competitorName, dealershipName, currentTime, recentAction)
- `userTier`: 'free' | 'pro' | 'enterprise' (free tier shows static eggs only)

**Triggers**:
- Score milestones (42, 88, 100)
- Time-based (3am witching hour)
- Competitor alerts
- Action-based (schema fixes, etc.)

**Example Usage**:
```typescript
<DynamicEasterEggEngine
  context={{
    trustScore: 88,
    dealershipName: 'Toyota Naples',
    currentTime: new Date(),
    topIssue: 'Schema markup',
    recentAction: 'fixed_schema'
  }}
  userTier="pro"
/>
```

### AI Copilot

**Purpose**: Provides proactive, actionable insights based on dashboard state.

**Props**:
- `dashboardState`: Object containing trustScore, scoreDelta, pillars, competitors, criticalIssues, recentActivity
- `userTier`: 'free' | 'pro' | 'enterprise' (free tier shows upgrade prompt)

**Features**:
- Auto-refreshes every 5 minutes
- Collapsible interface
- Rule-based fallbacks if API fails
- Priority-based styling (high/medium/low)

**Example Usage**:
```typescript
<AICopilot
  dashboardState={{
    trustScore: 75,
    scoreDelta: -5,
    pillars: { seo: 78, aeo: 82, geo: 75, qai: 70 },
    competitors: [...],
    criticalIssues: 2,
    recentActivity: ['Schema fixed']
  }}
  userTier="pro"
/>
```

### Competitor Radar

**Purpose**: Real-time tracking of nearby competitors with alerts for big moves.

**Props**:
- `competitors`: Array of competitor objects
- `yourScore`: Current trust score
- `yourCity`: City name for context
- `onCompetitorClick`: Callback when competitor is clicked

**Features**:
- 3 sort modes: closest, strongest, trending
- Pulsing animation for big movers (>5pt change)
- Detailed/compact view toggle
- Rank positioning and statistics

**Example Usage**:
```typescript
<CompetitorRadar
  competitors={[
    {
      id: '1',
      name: 'Toyota Fort Myers',
      trustScore: 85,
      scoreDelta: 3,
      distance: 12,
      city: 'Fort Myers',
      recentActivity: 'Just improved SEO score'
    }
  ]}
  yourScore={75}
  yourCity="Naples"
  onCompetitorClick={(comp) => console.log(comp)}
/>
```

## Environment Variables

Ensure these are set for full functionality:

```bash
# Required for Dynamic Easter Eggs & AI Copilot (Claude API)
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...

# Optional: For API routes (if using server-side generation)
ANTHROPIC_API_KEY=sk-ant-...
```

## Styling

All components use Tailwind CSS classes and follow the Cupertino design system:

- `glass-dark`: Glass morphism background
- `card-light`: Light card styling
- `border-medium`: Medium border color
- `text-primary`, `text-secondary`, `text-tertiary`: Text color hierarchy
- `signal-success`, `signal-warning`, `signal-critical`: Status colors

## Positioning

Components are positioned as floating widgets:

- **AI Copilot**: `fixed bottom-24 left-6` (bottom left corner)
- **Easter Eggs**: `fixed bottom-24 right-6` (bottom right corner)
- **Competitor Radar**: Regular component (can be placed anywhere in layout)

## Best Practices

1. **User Tier**: Always pass the actual user tier to enable proper PLG gating
2. **Data Freshness**: Update context/state regularly to trigger accurate insights
3. **Performance**: Components auto-manage their refresh intervals
4. **Error Handling**: Components include fallbacks if API calls fail
5. **Mobile**: Components are responsive and work on mobile devices

## Next Steps

After integrating these three features, consider:

1. **Tier 1 Polish**: Add PredictiveTrendArrow, SkeletonCard, SoundEngine
2. **Advanced Features**: Geographic Heatmap, Scatter Plot
3. **Gamification**: Achievement System, Leaderboard
4. **Enterprise**: Multi-User Collaboration, White-Label PDF Reports

See `COMPREHENSIVE_ENHANCEMENT_ROADMAP.md` for the full feature list.

