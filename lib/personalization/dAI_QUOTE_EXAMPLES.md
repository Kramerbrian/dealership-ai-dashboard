# dAI Personality Agent - Example Outputs

## Dashboard Scenario Examples

These examples demonstrate how the `dAIQuoteFetcher` delivers PG-rated Easter Egg quotes with maximum scarcity (10% selection chance) and perfect contextual timing.

---

## Example 1: Critical GEO Visibility Error

**Context**: User encounters a critical error in their GEO visibility metrics

**Input**:
```typescript
const context: QuoteContext = {
  type: 'error',
  severity: 'high',
  keywords: ['geo', 'visibility', 'critical'],
  channel: 'dashboard'
};

const result = dAIQuoteFetcher(
  "Critical GEO Visibility Error: Unable to fetch location data.",
  context,
  'free' // Tier 1 (PG only)
);
```

**Possible Outputs** (90% chance default, 10% chance quote):

**Default (90%)**:
```
Critical GEO Visibility Error: Unable to fetch location data.
```

**With Quote (10% - Easter Egg)**:
```
Critical GEO Visibility Error: Unable to fetch location data.

I'm sorry, Dave. I'm afraid I can't do that. — 2001: A Space Odyssey
```

**Personality Blend Applied**:
- **Ryan Reynolds**: Quick, self-aware meta-commentary on the error itself
- **Dave Chappelle**: Perfect timing - lands exactly when the error is most frustrating
- **Jerry Seinfeld**: "Observational" - points out the obvious (error exists) then pivots
- **Shane Gillis**: Dry, confident pivot - doesn't over-explain, just delivers

---

## Example 2: KPI Spike Alert

**Context**: User's AI Visibility score spikes dramatically

**Input**:
```typescript
const context: QuoteContext = {
  type: 'data',
  severity: 'high',
  keywords: ['kpi', 'spike', 'visibility', 'increase'],
  channel: 'dashboard'
};

const result = dAIQuoteFetcher(
  "AI Visibility Score: +15 points (87 → 102)",
  context,
  'free'
);
```

**Possible Outputs**:

**Default (90%)**:
```
AI Visibility Score: +15 points (87 → 102)
```

**With Quote (10% - Easter Egg)**:
```
AI Visibility Score: +15 points (87 → 102)

This means something. This is important. — Close Encounters of the Third Kind
```

**Personality Blend Applied**:
- **Ryan Reynolds**: Quick, confident delivery - no wasted words
- **Dave Chappelle**: Timing - waits until data is validated before delivering
- **Jerry Seinfeld**: "Observation" - states the obvious (spike happened) then emphasizes importance
- **Shane Gillis**: Confident, dry - doesn't over-celebrate, just acknowledges significance

---

## Example 3: Competitive Intel Report

**Context**: User views competitive intelligence data

**Input**:
```typescript
const context: QuoteContext = {
  type: 'competitor',
  severity: 'medium',
  keywords: ['competitive', 'intel', 'confidential'],
  channel: 'war-room'
};

const result = dAIQuoteFetcher(
  "Competitive Analysis: 3 competitors ahead in AI visibility",
  context,
  'free'
);
```

**Possible Outputs**:

**Default (90%)**:
```
Competitive Analysis: 3 competitors ahead in AI visibility
```

**With Quote (10% - Easter Egg)**:
```
Competitive Analysis: 3 competitors ahead in AI visibility

Never tell anyone outside the Family what you're thinking. — The Godfather (PG-edit)
```

**Personality Blend Applied**:
- **Ryan Reynolds**: Sharp, meta-aware - references confidentiality with wit
- **Dave Chappelle**: Perfect contextual timing - lands when viewing sensitive data
- **Jerry Seinfeld**: "Observation" - points out the obvious (data is sensitive) then emphasizes confidentiality
- **Shane Gillis**: Confident, dry - doesn't lecture, just delivers the message

---

## Example 4: Onboarding Success

**Context**: User completes onboarding successfully

**Input**:
```typescript
const context: QuoteContext = {
  type: 'success',
  severity: 'low',
  keywords: ['onboarding', 'complete', 'success'],
  channel: 'onboarding'
};

const result = dAIQuoteFetcher(
  "Welcome to DealershipAI! Your dashboard is ready.",
  context,
  'free'
);
```

**Possible Outputs**:

**Default (90%)**:
```
Welcome to DealershipAI! Your dashboard is ready.
```

**With Quote (10% - Easter Egg)**:
```
Welcome to DealershipAI! Your dashboard is ready.

We are the music makers, and we are the dreamers of dreams. — Willy Wonka and the Chocolate Factory
```

**Personality Blend Applied**:
- **Ryan Reynolds**: Quick, inspiring - no wasted words
- **Dave Chappelle**: Perfect timing - lands at the moment of achievement
- **Jerry Seinfeld**: "Observation" - acknowledges the moment, then elevates it
- **Shane Gillis**: Confident, dry - doesn't over-hype, just delivers inspiration

---

## Example 5: Urgency Alert (Deadline Approaching)

**Context**: User has an action item with approaching deadline

**Input**:
```typescript
const context: QuoteContext = {
  type: 'urgency',
  severity: 'high',
  keywords: ['deadline', 'action', 'procrastination'],
  channel: 'dashboard'
};

const result = dAIQuoteFetcher(
  "Action Required: Fix schema markup before Friday deadline",
  context,
  'pro' // Tier 2 - has access to Knight and Day quote
);
```

**Possible Outputs**:

**Default (90%)**:
```
Action Required: Fix schema markup before Friday deadline
```

**With Quote (10% - Easter Egg)**:
```
Action Required: Fix schema markup before Friday deadline

Someday is a very dangerous word. It's really just code for 'never.' — Knight and Day
```

**Personality Blend Applied**:
- **Ryan Reynolds**: Sharp, direct - cuts through procrastination with wit
- **Dave Chappelle**: Perfect timing - lands when urgency is highest
- **Jerry Seinfeld**: "Observation" - points out the obvious (deadline exists) then delivers the truth
- **Shane Gillis**: Confident, dry - doesn't nag, just states the reality

---

## Example 6: ROI/Revenue Highlight

**Context**: User views revenue impact metrics

**Input**:
```typescript
const context: QuoteContext = {
  type: 'roi',
  severity: 'medium',
  keywords: ['revenue', 'roi', 'value'],
  channel: 'dashboard'
};

const result = dAIQuoteFetcher(
  "Revenue at Risk: $45,200/month",
  context,
  'pro' // Tier 2 - has access to Jerry Maguire quote
);
```

**Possible Outputs**:

**Default (90%)**:
```
Revenue at Risk: $45,200/month
```

**With Quote (10% - Easter Egg)**:
```
Revenue at Risk: $45,200/month

Show me the money! — Jerry Maguire (PG-edit)
```

**Personality Blend Applied**:
- **Ryan Reynolds**: Quick, confident - no fluff, just the point
- **Dave Chappelle**: Perfect timing - lands when revenue impact is clear
- **Jerry Seinfeld**: "Observation" - states the obvious (money matters) then emphasizes it
- **Shane Gillis**: Confident, dry - doesn't over-explain, just delivers the message

---

## Technical Implementation Notes

### Usage Decay Weighting Formula

```
Selection_Weight = Time_Decay × Usage_Penalty × Subtlety_Bonus × Context_Match

Where:
- Time_Decay: 0 (just used) to 1 (never used or 30+ days ago)
- Usage_Penalty: 1 / (1 + usageCount) - first use = 1.0, second = 0.5, etc.
- Subtlety_Bonus: 1 + (subtletyIndex / 10) - max 1.5x multiplier
- Context_Match: 0-1 based on tag matching (70% weight)
- Decay_Weight: Time_Decay × Usage_Penalty × Subtlety_Bonus (30% weight)
```

### Tier Gating

- **Free (Tier 1)**: PG-rated quotes only, tier1 quotes
- **Pro (Tier 2)**: PG-13 rated quotes, tier1 + tier2 quotes
- **Enterprise (Tier 3)**: PG-13 rated quotes, tier1 + tier2 + tier3 quotes

### Maximum Scarcity

- **Overall Selection Chance**: 10% (90% default text)
- **Context Match Threshold**: Minimum 20% match required
- **Usage Tracking**: Updates `usageCount` and `lastUsedTimestamp` after selection

---

## Personality Blend Guidelines

### When to Apply Each Comedian's Style

1. **Ryan Reynolds (Razor-Sharp Wit)**
   - Use for: Quick responses, meta-commentary, self-aware humor
   - Example: "I'm sorry, Dave. I'm afraid I can't do that." (acknowledges the error with wit)

2. **Dave Chappelle (Perfect Timing)**
   - Use for: Contextual peaks, waiting for validation, perfect moment
   - Example: Quote lands exactly when KPI spike is confirmed

3. **Jerry Seinfeld (Dry Observations)**
   - Use for: Stating the obvious, then pivoting to insight
   - Example: "This means something. This is important." (observes the spike, then emphasizes)

4. **Shane Gillis (Confident Comic Relief)**
   - Use for: Dry self-deprecation, confident pivots, brief humor
   - Example: "Someday is a very dangerous word. It's really just code for 'never.'" (confident, direct)

---

## Guardrails

- **Rating Limit**: PG only for Tier 1, PG-13 for Tier 2+
- **Topic Avoidance**: Politics, religion, sexual references filtered
- **Scarcity**: 10% selection chance ensures Easter Egg effect
- **Context Matching**: Minimum 20% match required for selection

