# Endpoint Migration Plan

## Overview

This document outlines the migration strategy for legacy scoring endpoints to use the new `lib/scoring.ts` functions.

## Endpoint Analysis

### 1. `/api/ai/compute` 

**Current State:**
- Uses `lib/score/formulas` (different scoring system)
- Inputs: Technical metrics (CWV, crawl index, content quality)
- Outputs: SEO, AEO, GEO, QAI, Trust Score (0-1 scale)
- Purpose: Technical SEO scoring

**New System:**
- Uses `lib/scoring.ts` (AI visibility focused)
- Inputs: Mentions, citations, sentiment, share of voice
- Outputs: SEO, AEO, GEO, AI Visibility (0-100 scale)
- Purpose: AI visibility scoring

**Decision:** 
- These are **different scoring systems** serving different purposes
- `/api/ai/compute` is for technical SEO analysis
- `lib/scoring.ts` is for AI visibility analysis
- **Action:** Keep both systems, add compatibility layer if needed

---

### 2. `/api/ai-visibility/score`

**Current State:**
- Uses `quickAIVisibilityTest` service
- Tests actual AI platforms (Perplexity, ChatGPT, Gemini, Claude)
- Returns real-time test results

**New System:**
- `scoreAIVisibility()` calculates from engine coverage data
- Requires pre-computed coverage percentages

**Decision:**
- These serve **different purposes**:
  - `/api/ai-visibility/score` = Live testing service
  - `scoreAIVisibility()` = Calculation from existing data
- **Action:** Keep service, optionally add `scoreAIVisibility()` as fallback

---

### 3. `/api/calculator/ai-scores`

**Current State:**
- Uses various calculators (QAI, PIQR, DTRI, etc.)
- Different scoring system entirely
- Purpose: Comprehensive AI scores calculator

**Decision:**
- This is a **different calculator system**
- Not directly related to `lib/scoring.ts`
- **Action:** No migration needed

---

## Migration Strategy

### Option 1: Keep Both Systems (Recommended)
- Maintain `lib/score/formulas` for technical SEO
- Use `lib/scoring.ts` for AI visibility
- Document the difference clearly

### Option 2: Add Compatibility Layer
- Create adapter functions to bridge the two systems
- Map technical metrics to AI visibility metrics
- More complex, but provides unified interface

### Option 3: Deprecate Legacy System
- Migrate all endpoints to new system
- Risk: Breaking changes for existing integrations
- Requires careful migration plan

---

## Recommended Actions

1. **Document the difference** between the two scoring systems
2. **Add compatibility notes** to endpoints
3. **Consider deprecation** only if endpoints are unused
4. **Keep both systems** if they serve different purposes

---

## Next Steps

1. Verify if `/api/ai/compute` is actively used
2. If unused, mark for deprecation
3. If used, add documentation explaining the difference
4. Consider creating a unified scoring interface in the future

