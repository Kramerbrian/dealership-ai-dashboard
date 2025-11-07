# dAI Personality Agent - Implementation Summary

## Overview

The dAI Personality Agent delivers **PG-rated Easter Egg quotes** with maximum scarcity (10% selection chance) and perfect contextual timing. The system blends the comedic styles of Ryan Reynolds, Dave Chappelle, Jerry Seinfeld, and Shane Gillis into a confident coach persona.

---

## Files Structure

```
lib/personalization/
├── QuoteMatrix.ts              # Core quote database with tier gating
├── dAIQuoteFetcher.ts          # Main component with Usage Decay Weighting
├── createWittyWrapper.ts       # Simplified wrapper (legacy, use dAIQuoteFetcher)
├── dai-personality-agent-export.json  # Full JSON export structure
├── dAI_QUOTE_EXAMPLES.md       # Example outputs for dashboard scenarios
└── README.md                    # This file
```

---

## Quick Start

### Basic Usage

```typescript
import { dAIQuoteFetcher, formatQuote } from '@/lib/personalization/dAIQuoteFetcher';

const context = {
  type: 'error',
  severity: 'high',
  keywords: ['geo', 'visibility'],
  channel: 'dashboard'
};

const result = dAIQuoteFetcher(
  "Critical GEO Visibility Error: Unable to fetch location data.",
  context,
  'free' // User tier: 'free' | 'pro' | 'enterprise'
);

if (result.wasSelected && result.quote) {
  const message = formatQuote(result.quote);
  console.log(message); // "I'm sorry, Dave. I'm afraid I can't do that. — 2001: A Space Odyssey"
} else {
  console.log("Default message"); // 90% of the time
}
```

### Dashboard Integration

```typescript
import { createDashboardMessage } from '@/lib/personalization/dAIQuoteFetcher';

const message = createDashboardMessage(
  "AI Visibility Score: +15 points (87 → 102)",
  {
    type: 'data',
    severity: 'high',
    keywords: ['kpi', 'spike'],
    channel: 'dashboard'
  },
  'free'
);
```

---

## Tier Gating

| Tier | Max Rating | Available Quote Tiers | Style |
|------|------------|------------------------|-------|
| **Free** | PG | tier1 only | Wholesome, foundational coach |
| **Pro** | PG-13 | tier1 + tier2 | Sharp, high-stakes, competitive coach |
| **Enterprise** | PG-13 | tier1 + tier2 + tier3 | Highest density/frequency, philosophical coach |

---

## Tier 1 PG-Rated Baseline Quotes

These 6 quotes are available to all tiers (Free, Pro, Enterprise):

1. **"We are the music makers, and we are the dreamers of dreams."** - *Willy Wonka*
   - Context: Vision, Introduction, Opportunity, Ambition
   - Channel: Onboarding Header, Landing Page

2. **"I'm sorry, Dave. I'm afraid I can't do that."** - *2001: A Space Odyssey*
   - Context: Error/Failure, System Limitation, Unmet Request
   - Channel: Chatbot (System Message), Error Toast

3. **"Phone home."** - *E.T.*
   - Context: Call to Action, Support, Connectivity, Contact Us
   - Channel: Footer, Support Section

4. **"This means something. This is important."** - *Close Encounters*
   - Context: Data Insight, KPI Spike, Validation, Discovery
   - Channel: Dashboard Alert (Metric Spike)

5. **"Never tell anyone outside the Family what you're thinking."** - *The Godfather (PG-edit)*
   - Context: Confidentiality, Strategy, Competitive Intel, Internal Process
   - Channel: War Room Tab, Competitive Intel Report

6. **"You will ride eternal, shiny and chrome!"** - *Mad Max: Fury Road (Conceptual)*
   - Context: Endurance, Long-Term Strategy, Motivation
   - Channel: Onboarding Success, Executive Summary

---

## Usage Decay Weighting Formula

```
Selection_Weight = Time_Decay × Usage_Penalty × Subtlety_Bonus × Context_Match

Components:
- Time_Decay: 0 (just used) to 1 (never used or 30+ days ago)
- Usage_Penalty: 1 / (1 + usageCount) - first use = 1.0, second = 0.5, etc.
- Subtlety_Bonus: 1 + (subtletyIndex / 10) - max 1.5x multiplier
- Context_Match: 0-1 based on tag matching (70% weight)
- Decay_Weight: Time_Decay × Usage_Penalty × Subtlety_Bonus (30% weight)
```

### Example Calculation

For a quote with:
- Never used (lastUsedTimestamp = 0)
- usageCount = 0
- subtletyIndex = 4
- contextMatch = 0.8

```
Time_Decay = 1.0 (never used)
Usage_Penalty = 1.0 (first use)
Subtlety_Bonus = 1.4 (1 + 4/10)
Decay_Weight = 1.0 × 1.0 × 1.4 = 1.4

Final_Score = (0.8 × 0.7) + (1.4 × 0.3) = 0.56 + 0.42 = 0.98
```

---

## Maximum Scarcity

- **Overall Selection Chance**: 10% (90% default text)
- **Context Match Threshold**: Minimum 20% match required
- **Usage Tracking**: Updates `usageCount` and `lastUsedTimestamp` after selection

This ensures quotes feel like rare Easter Eggs rather than frequent occurrences.

---

## Personality Blend

### Ryan Reynolds (Razor-Sharp Wit)
- Quick, self-aware responses
- Meta-commentary on the situation
- Never wastes time

### Dave Chappelle (Perfect Timing)
- Quotes land at exact contextual peaks
- Waits for validation before delivering
- Perfect moment selection

### Jerry Seinfeld (Dry Observations)
- States the obvious, then pivots to insight
- "Observational" humor leading to action
- Points out facts before delivering message

### Shane Gillis (Confident Comic Relief)
- Brief, confident pivots
- Dry self-deprecation when appropriate
- Doesn't over-explain, just delivers

---

## Guardrails

- **Rating Limit**: PG only for Tier 1, PG-13 for Tier 2+
- **Topic Avoidance**: Politics, religion, sexual references filtered
- **Scarcity**: 10% selection chance ensures Easter Egg effect
- **Context Matching**: Minimum 20% match required for selection

---

## Context Types

Supported context types for quote matching:

- `error` - System errors, failures, limitations
- `success` - Achievements, breakthroughs, conversions
- `warning` - Urgency, scaling issues, capacity problems
- `info` - Data insights, KPI spikes, discoveries
- `action` - Action items, delegation, task management
- `data` - Data insights, KPI spikes, validation
- `competitor` - Competitive intelligence, market share
- `urgency` - Deadlines, procrastination, action needed
- `vision` - Introduction, opportunity, ambition
- `roi` - Revenue, value proposition, negotiation
- `introduction` - Onboarding, welcome messages
- `endurance` - Long-term strategy, motivation

---

## Example Outputs

See `dAI_QUOTE_EXAMPLES.md` for comprehensive examples showing:
- Critical GEO Visibility Error
- KPI Spike Alert
- Competitive Intel Report
- Onboarding Success
- Urgency Alert
- ROI/Revenue Highlight

---

## JSON Export Structure

The full export structure is available in `dai-personality-agent-export.json`, including:
- Project metadata
- Guardrails configuration
- Persona profile with wit blend
- Movie references list
- Tier gating logic
- Selection mechanism details
- Tier 1 PG quotes baseline

---

## Production Considerations

### Persistence

Currently, quote usage tracking is in-memory. For production:

1. **Database Storage**: Store `usageCount` and `lastUsedTimestamp` in database
2. **Redis Caching**: Cache quote selections for performance
3. **Analytics**: Track quote selection rates and context matches

### Performance

- Quote selection is O(n) where n = number of available quotes
- For large quote matrices, consider pre-filtering by tier
- Cache tier-filtered quotes for faster lookups

### Monitoring

Track:
- Selection rate (should be ~10%)
- Context match scores
- Quote usage distribution
- Tier-specific selection rates

---

## Future Enhancements

1. **PG-13 Quotes**: Add Tier 2 and Tier 3 quotes for Pro/Enterprise users
2. **A/B Testing**: Test different personality blends
3. **User Preferences**: Allow users to opt-in/out of quotes
4. **Analytics Dashboard**: Track quote performance and user engagement
5. **Dynamic Quotes**: Add quotes based on seasonal events or trends

---

## References

- **QuoteMatrix.ts**: Core quote database
- **dAIQuoteFetcher.ts**: Main implementation
- **dAI_QUOTE_EXAMPLES.md**: Example outputs
- **dai-personality-agent-export.json**: Full JSON structure

