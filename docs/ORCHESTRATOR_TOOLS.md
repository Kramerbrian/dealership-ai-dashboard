# Orchestrator 3.0 Tool Definitions

This document defines all tools that Orchestrator 3.0 can call to gather signals and execute actions.

---

## 📊 Signal Gathering Tools (Read-Only)

### `tool:clarity_stack`

**Purpose**: Get SEO, AEO, GEO, and AVI scores for a domain.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "domain": {
      "type": "string",
      "description": "Dealership domain (e.g., naplestoyota.com)"
    }
  },
  "required": ["domain"]
}
```

**Output Schema**:
```json
{
  "seo": "number",      // 0-100
  "aeo": "number",      // 0-100
  "geo": "number",      // 0-100
  "avi": "number",      // 0-100 (composite)
  "evidence": {
    "seo_issues": ["string"],
    "aeo_issues": ["string"],
    "geo_issues": ["string"]
  }
}
```

**Example Call**:
```json
{
  "tool": "clarity_stack",
  "input": {
    "domain": "naplestoyota.com"
  }
}
```

---

### `tool:schema_health`

**Purpose**: Analyze schema coverage and identify missing structured data.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "domain": {
      "type": "string",
      "description": "Dealership domain"
    },
    "page_types": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Optional: filter by page types (VDP, SRP, Service, etc.)"
    }
  },
  "required": ["domain"]
}
```

**Output Schema**:
```json
{
  "score": "number",              // 0-100
  "coverage": {
    "AutoDealer": "number",        // % of pages with AutoDealer schema
    "Vehicle": "number",           // % of VDPs with Vehicle schema
    "LocalBusiness": "number",     // % of pages with LocalBusiness
    "FAQPage": "number",           // % of Service pages with FAQPage
    "Review": "number"             // % of pages with Review schema
  },
  "issues": [
    "Vehicle schema missing on 65% of VDPs",
    "FAQPage schema missing on Service pages"
  ],
  "recommendations": [
    "Generate Vehicle schema for 40 VDPs",
    "Add FAQPage schema to 8 Service pages"
  ]
}
```

---

### `tool:aim_valuation`

**Purpose**: Calculate Revenue at Risk (RaR) and Opportunity Cost Index (OCI).

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "domain": {
      "type": "string"
    },
    "tenant_id": {
      "type": "string",
      "description": "Optional: dealer/tenant ID for historical data"
    }
  },
  "required": ["domain"]
}
```

**Output Schema**:
```json
{
  "rar_monthly": "number",         // Revenue at Risk per month (USD)
  "rar_annual": "number",          // Revenue at Risk per year (USD)
  "oci_monthly": "number",         // Opportunity Cost Index per month (USD)
  "assumptions": {
    "monthly_opportunities": "number",
    "avg_gross_per_unit": "number",
    "ai_influence_rate": "number"  // 0-1, how much AI affects decisions
  },
  "breakdown": {
    "visibility_gap": "number",    // $ lost to low visibility
    "conversion_gap": "number",     // $ lost to poor conversion signals
    "trust_gap": "number"          // $ lost to low trust signals
  }
}
```

---

### `tool:gbp_health`

**Purpose**: Analyze Google Business Profile health and issues.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "domain": {
      "type": "string"
    },
    "place_id": {
      "type": "string",
      "description": "Optional: GBP Place ID if known"
    }
  },
  "required": ["domain"]
}
```

**Output Schema**:
```json
{
  "health_score": "number",        // 0-100
  "rating": "number",              // 0-5
  "review_count": "number",
  "photo_count": "number",
  "photo_freshness_days": "number", // Days since last photo update
  "issues": [
    "Photos older than 18 months",
    "Missing service categories",
    "Hours not updated in 90 days"
  ],
  "recommendations": [
    "Upload 10+ fresh photos",
    "Update service categories",
    "Verify hours match website"
  ]
}
```

---

### `tool:ugc_health`

**Purpose**: Analyze User-Generated Content (reviews, ratings, quotes).

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "domain": {
      "type": "string"
    }
  },
  "required": ["domain"]
}
```

**Output Schema**:
```json
{
  "score": "number",                // 0-100
  "recent_reviews_90d": "number",
  "review_velocity_vs_market": "number", // Ratio vs local competitors
  "review_usage_on_pages": "number",    // % of pages with review snippets
  "issues": [
    "Few reviews used on high-traffic pages",
    "Review velocity below market average"
  ],
  "recommendations": [
    "Add review snippets to top 20 VDPs",
    "Encourage recent customers to leave reviews"
  ]
}
```

---

### `tool:competitive_summary`

**Purpose**: Get competitive position and leader analysis.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "domain": {
      "type": "string"
    },
    "city": {
      "type": "string",
      "description": "Optional: city for local market"
    },
    "state": {
      "type": "string",
      "description": "Optional: state for local market"
    }
  },
  "required": ["domain"]
}
```

**Output Schema**:
```json
{
  "rank": "number",                 // 1 = best, higher = worse
  "total": "number",                // Total competitors in market
  "avi": "number",                  // This dealer's AVI
  "leaders": [
    {
      "name": "string",
      "domain": "string",
      "avi": "number"
    }
  ],
  "gap_to_leader": "number",        // AVI points behind #1
  "recommendations": [
    "Focus on schema to close gap with Scanlon Hyundai",
    "Improve GBP photos to match Maxx Motors"
  ]
}
```

---

### `tool:location_resolve`

**Purpose**: Resolve domain to geographic location.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "domain": {
      "type": "string"
    }
  },
  "required": ["domain"]
}
```

**Output Schema**:
```json
{
  "lat": "number",
  "lng": "number",
  "city": "string",
  "state": "string",
  "zip": "string",
  "dma": "string",                  // Designated Market Area
  "confidence": "high|medium|low"
}
```

---

## 🔧 Action Tools (Write Operations)

### `tool:generate_schema_pack`

**Purpose**: Generate JSON-LD schema for a set of pages.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "domain": {
      "type": "string"
    },
    "page_types": {
      "type": "array",
      "items": { "type": "string" },
      "description": "VDP, SRP, Service, etc."
    },
    "count": {
      "type": "number",
      "description": "Number of pages to generate schema for"
    },
    "dry_run": {
      "type": "boolean",
      "description": "If true, return schema without deploying"
    }
  },
  "required": ["domain", "page_types"]
}
```

**Output Schema**:
```json
{
  "status": "success|error",
  "pages_processed": "number",
  "schema_generated": "number",
  "dry_run": "boolean",
  "preview": [
    {
      "url": "string",
      "schema_type": "string",
      "snippet": "string"
    }
  ]
}
```

---

### `tool:queue_refresh`

**Purpose**: Queue a refresh scan for a domain.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "domain": {
      "type": "string"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "normal", "high"],
      "default": "normal"
    }
  },
  "required": ["domain"]
}
```

**Output Schema**:
```json
{
  "status": "queued",
  "job_id": "string",
  "estimated_completion": "string"  // ISO timestamp
}
```

---

### `tool:site_inject`

**Purpose**: Inject HTML/JSON-LD into target pages.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "hosts": {
      "type": "array",
      "items": { "type": "string" },
      "description": "URLs or domains to inject into"
    },
    "head_html": {
      "type": "string",
      "description": "HTML to inject in <head>"
    },
    "footer_html": {
      "type": "string",
      "description": "Optional: HTML to inject before </body>"
    },
    "dry_run": {
      "type": "boolean",
      "default": true
    }
  },
  "required": ["hosts", "head_html"]
}
```

**Output Schema**:
```json
{
  "status": "success|error",
  "pages_updated": "number",
  "version_id": "string",
  "rollback_url": "string",
  "dry_run": "boolean"
}
```

---

## 🎯 Tool Usage Patterns

### Pattern 1: Full Clarity Stack Analysis
```json
{
  "tools": [
    "clarity_stack",
    "schema_health",
    "gbp_health",
    "ugc_health",
    "competitive_summary",
    "location_resolve"
  ],
  "input": {
    "domain": "naplestoyota.com"
  }
}
```

### Pattern 2: Pulse Snapshot
```json
{
  "tools": [
    "clarity_stack",
    "aim_valuation",
    "schema_health",
    "gbp_health",
    "ugc_health",
    "competitive_summary"
  ],
  "input": {
    "domain": "naplestoyota.com"
  },
  "format": "pulse"  // Request Pulse-formatted output
}
```

### Pattern 3: Autopilot Action
```json
{
  "tools": [
    "generate_schema_pack",
    "site_inject"
  ],
  "input": {
    "domain": "naplestoyota.com",
    "page_types": ["VDP", "Service"],
    "dry_run": false
  }
}
```

---

## 🔐 Tool Permissions

### Read-Only Tools (Safe)
- `clarity_stack`
- `schema_health`
- `aim_valuation`
- `gbp_health`
- `ugc_health`
- `competitive_summary`
- `location_resolve`

### Write Tools (Require Approval)
- `generate_schema_pack` (requires `dry_run: false` + approval)
- `site_inject` (requires `dry_run: false` + approval)
- `queue_refresh` (safe, but can be rate-limited)

---

## 📝 Implementation Notes

1. **Tool calls are idempotent** where possible (use `idempotency_key`)
2. **All write operations support `dry_run: true`** for safety
3. **Tool responses are cached** (TTL varies by tool)
4. **Rate limiting** applies per tenant/domain
5. **Error handling** returns structured errors, not exceptions

---

## 🚀 Next Steps

1. Implement tool handlers in `lib/engines/`
2. Wire tools into Orchestrator 3.0 system prompt
3. Add tool calling to `/api/agentic/assist`
4. Test with real domains
5. Monitor tool usage and costs

