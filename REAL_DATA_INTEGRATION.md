# 🔌 Real Data Integration Guide

This guide shows you how to wire real data sources to your PLG and Fleet APIs.

---

## 🎯 **Overview**

Currently, your APIs return mock data. Here's how to connect them to real services:

1. **AI Visibility** → AI platform APIs (OpenAI, Anthropic, Perplexity, Gemini)
2. **Zero-Click** → Google Search Console API
3. **Schema Validator** → Custom crawler or third-party service
4. **UGC/Reviews** → Google Places, Yelp, Facebook APIs

---

## 1️⃣ **AI Visibility Integration** (`/api/ai/health`)

### **Current State:**
Returns mock AI visibility scores:
```typescript
// app/api/ai/health/route.ts
return NextResponse.json({
  aiHealth: [
    { platform: "ChatGPT", visibility: 0.88, latencyMs: 620 },
    { platform: "Claude", visibility: 0.84, latencyMs: 540 },
    { platform: "Perplexity", visibility: 0.81, latencyMs: 510 },
    { platform: "Gemini", visibility: 0.79, latencyMs: 580 },
  ],
});
```

### **Real Implementation:**

#### **Option A: Custom AI Testing (Recommended)**

Create `lib/ai-visibility.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function testAIVisibility(dealerName: string, location: string) {
  const testQuery = `Best ${dealerName} dealership in ${location} for used cars`;

  const results = await Promise.all([
    testChatGPT(testQuery, dealerName),
    testClaude(testQuery, dealerName),
    testPerplexity(testQuery, dealerName),
    testGemini(testQuery, dealerName),
  ]);

  return results;
}

async function testChatGPT(query: string, dealerName: string) {
  const startTime = Date.now();
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: query }],
  });

  const mentioned = response.choices[0]?.message?.content?.includes(dealerName) || false;
  return {
    platform: "ChatGPT",
    visibility: mentioned ? 1.0 : 0.0,
    latencyMs: Date.now() - startTime,
  };
}

async function testClaude(query: string, dealerName: string) {
  const startTime = Date.now();
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [{ role: "user", content: query }],
  });

  const mentioned =
    response.content[0]?.type === "text" &&
    response.content[0].text.includes(dealerName);

  return {
    platform: "Claude",
    visibility: mentioned ? 1.0 : 0.0,
    latencyMs: Date.now() - startTime,
  };
}

async function testPerplexity(query: string, dealerName: string) {
  const startTime = Date.now();
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [{ role: "user", content: query }],
    }),
  });

  const data = await response.json();
  const mentioned = data.choices[0]?.message?.content?.includes(dealerName) || false;

  return {
    platform: "Perplexity",
    visibility: mentioned ? 1.0 : 0.0,
    latencyMs: Date.now() - startTime,
  };
}

async function testGemini(query: string, dealerName: string) {
  const startTime = Date.now();
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: query }] }],
      }),
    }
  );

  const data = await response.json();
  const mentioned =
    data.candidates?.[0]?.content?.parts?.[0]?.text?.includes(dealerName) || false;

  return {
    platform: "Gemini",
    visibility: mentioned ? 1.0 : 0.0,
    latencyMs: Date.now() - startTime,
  };
}
```

Update API route:

```typescript
// app/api/ai/health/route.ts
import { NextResponse } from "next/server";
import { testAIVisibility } from "@/lib/ai-visibility";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dealer = url.searchParams.get("dealer") || "";

  // Extract dealer name and location from URL
  const dealerName = dealer.split(".")[0].replace(/-/g, " ");
  const location = "USA"; // TODO: Extract from dealer data

  try {
    const aiHealth = await testAIVisibility(dealerName, location);
    return NextResponse.json({ aiHealth });
  } catch (error: any) {
    console.error("[AI Health] Error:", error);
    return NextResponse.json(
      { error: "Failed to test AI visibility" },
      { status: 500 }
    );
  }
}
```

#### **Option B: Use Existing Service (RankEmbed, etc.)**

If you have an existing AI visibility testing service:

```typescript
// lib/ai-visibility.ts
export async function testAIVisibility(dealer: string) {
  const response = await fetch(`${process.env.RANKEMBED_API}/test`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RANKEMBED_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dealer }),
  });

  return response.json();
}
```

---

## 2️⃣ **Zero-Click Integration** (`/api/zero-click`)

### **Current State:**
Returns mock zero-click data.

### **Real Implementation: Google Search Console API**

#### **Step 1: Set up Google Cloud Project**

1. Go to https://console.cloud.google.com
2. Create new project "DealershipAI-GSC"
3. Enable Google Search Console API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `https://yourdomain.com/api/auth/google/callback`

#### **Step 2: Get Refresh Token**

```bash
# Use this script to get refresh token
node scripts/get-google-refresh-token.js
```

Create `scripts/get-google-refresh-token.js`:

```javascript
// See: https://developers.google.com/identity/protocols/oauth2/web-server
console.log("1. Go to:", `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
  `redirect_uri=http://localhost:3000/oauth&` +
  `response_type=code&` +
  `scope=https://www.googleapis.com/auth/webmasters.readonly&` +
  `access_type=offline&` +
  `prompt=consent`
);
console.log("2. Authorize and copy the code");
console.log("3. Exchange code for refresh token");
```

#### **Step 3: Implement GSC Integration**

Create `lib/google-search-console.ts`:

```typescript
interface GSCQuery {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export async function getGSCData(siteUrl: string, startDate: string, endDate: string) {
  // Get access token from refresh token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  const { access_token } = await tokenResponse.json();

  // Query Search Analytics API
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
      siteUrl
    )}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ["query"],
        rowLimit: 1000,
      }),
    }
  );

  const data = await response.json();
  return data.rows as GSCQuery[];
}

export async function calculateZeroClickRate(siteUrl: string) {
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const queries = await getGSCData(siteUrl, startDate, endDate);

  let totalImpressions = 0;
  let totalClicks = 0;

  for (const query of queries) {
    totalImpressions += query.impressions;
    totalClicks += query.clicks;
  }

  const ctr = totalClicks / totalImpressions;
  const zeroClickRate = 1 - ctr; // Simplified calculation

  return {
    inclusionRate: ctr,
    zeroClickRate,
    totalImpressions,
    totalClicks,
    queries: queries.slice(0, 10), // Top 10 queries
  };
}
```

Update API route:

```typescript
// app/api/zero-click/route.ts
import { NextResponse } from "next/server";
import { calculateZeroClickRate } from "@/lib/google-search-console";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dealer = url.searchParams.get("dealer") || "demo";

  try {
    const data = await calculateZeroClickRate(`https://${dealer}`);

    return NextResponse.json({
      dealer,
      inclusionRate: data.inclusionRate,
      zeroClickRate: data.zeroClickRate,
      details: data.queries.map((q) => ({
        intent: q.keys[0],
        score: q.ctr,
        impressions: q.impressions,
        clicks: q.clicks,
      })),
    });
  } catch (error: any) {
    console.error("[Zero-Click] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch GSC data" },
      { status: 500 }
    );
  }
}
```

---

## 3️⃣ **Schema Validator Integration** (`/api/schema`)

### **Current State:**
Returns mock schema validation results.

### **Real Implementation: Custom Crawler**

Create `lib/schema-validator.ts`:

```typescript
import * as cheerio from "cheerio";

export async function validateSchema(url: string) {
  try {
    // Fetch page HTML
    const response = await fetch(url, {
      headers: { "User-Agent": "DealershipAI Schema Validator/1.0" },
    });
    const html = await response.text();

    // Parse HTML
    const $ = cheerio.load(html);

    // Extract JSON-LD schemas
    const schemas: any[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const schema = JSON.parse($(el).html() || "");
        schemas.push(schema);
      } catch {}
    });

    // Check for specific schema types
    const types = {
      AutoDealer: schemas.some((s) => s["@type"] === "AutoDealer"),
      LocalBusiness: schemas.some((s) => s["@type"] === "LocalBusiness"),
      Vehicle: schemas.some((s) => s["@type"] === "Vehicle"),
      Offer: schemas.some((s) => s["@type"] === "Offer"),
      FAQPage: schemas.some((s) => s["@type"] === "FAQPage"),
      Review: schemas.some((s) => s["@type"] === "Review"),
    };

    // Validate schema completeness
    const errors: string[] = [];
    const recommendations: string[] = [];

    for (const schema of schemas) {
      if (schema["@type"] === "Offer" && !schema.price) {
        errors.push("Offer.price missing");
      }
      if (schema["@type"] === "Vehicle" && !schema["@id"]) {
        errors.push("Vehicle missing @id");
      }
      if (schema["@type"] === "FAQPage" && !schema.mainEntity) {
        errors.push("FAQPage missing mainEntity");
      }
    }

    if (!types.FAQPage) {
      recommendations.push("Add FAQPage schema for common questions");
    }
    if (!types.Offer) {
      recommendations.push("Add Offer schema for vehicle listings");
    }

    const coverage =
      Object.values(types).filter(Boolean).length / Object.keys(types).length;

    return {
      origin: url,
      coverage,
      types,
      errors,
      recommendations,
      schemasFound: schemas.length,
    };
  } catch (error: any) {
    console.error("[Schema Validator] Error:", error);
    return {
      origin: url,
      coverage: 0,
      types: {},
      errors: [error.message],
      recommendations: [],
      schemasFound: 0,
    };
  }
}
```

Update API route:

```typescript
// app/api/schema/route.ts
import { NextResponse } from "next/server";
import { validateSchema } from "@/lib/schema-validator";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.searchParams.get("origin") || "demo";

  const normalizedUrl = origin.startsWith("http") ? origin : `https://${origin}`;

  try {
    const result = await validateSchema(normalizedUrl);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Schema] Error:", error);
    return NextResponse.json(
      { error: "Failed to validate schema" },
      { status: 500 }
    );
  }
}
```

Install cheerio:
```bash
npm install cheerio
```

---

## 4️⃣ **UGC/Reviews Integration** (`/api/ugc`)

### **Current State:**
Returns mock reviews data.

### **Real Implementation: Multi-Platform Aggregation**

Create `lib/reviews-aggregator.ts`:

```typescript
// Google Places API
async function getGoogleReviews(placeId: string) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?` +
    `place_id=${placeId}&` +
    `fields=reviews,rating,user_ratings_total&` +
    `key=${process.env.GOOGLE_PLACES_API_KEY}`
  );

  const data = await response.json();
  return {
    platform: "google",
    reviews: data.result.user_ratings_total || 0,
    avgRating: data.result.rating || 0,
    recentReviews: data.result.reviews || [],
  };
}

// Yelp API
async function getYelpReviews(businessId: string) {
  const response = await fetch(
    `https://api.yelp.com/v3/businesses/${businessId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      },
    }
  );

  const data = await response.json();
  return {
    platform: "yelp",
    reviews: data.review_count || 0,
    avgRating: data.rating || 0,
  };
}

// Facebook Graph API
async function getFacebookReviews(pageId: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}?` +
    `fields=ratings,overall_star_rating&` +
    `access_token=${process.env.FACEBOOK_ACCESS_TOKEN}`
  );

  const data = await response.json();
  return {
    platform: "facebook",
    reviews: data.ratings?.data?.length || 0,
    avgRating: data.overall_star_rating || 0,
  };
}

export async function aggregateReviews(dealer: {
  googlePlaceId?: string;
  yelpBusinessId?: string;
  facebookPageId?: string;
}) {
  const results = await Promise.allSettled([
    dealer.googlePlaceId ? getGoogleReviews(dealer.googlePlaceId) : null,
    dealer.yelpBusinessId ? getYelpReviews(dealer.yelpBusinessId) : null,
    dealer.facebookPageId ? getFacebookReviews(dealer.facebookPageId) : null,
  ]);

  const platforms: Record<string, any> = {};
  let mentions7d = 0;
  let totalPositive = 0;
  let totalReviews = 0;

  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      const { platform, reviews, avgRating } = result.value;
      platforms[platform] = { reviews, avgRating };

      // Simplified calculations
      mentions7d += Math.floor(reviews * 0.05); // Estimate 5% in last 7 days
      totalPositive += avgRating >= 4.0 ? reviews : Math.floor(reviews * 0.7);
      totalReviews += reviews;
    }
  }

  return {
    summary: {
      mentions7d,
      positive: totalPositive / totalReviews,
      avgResponseHrs: 16, // TODO: Calculate from review response times
      platforms,
    },
  };
}
```

Update API route:

```typescript
// app/api/ugc/route.ts
import { NextResponse } from "next/server";
import { aggregateReviews } from "@/lib/reviews-aggregator";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dealer = url.searchParams.get("dealer") || "";

  // TODO: Get dealer platform IDs from database
  const dealerData = {
    googlePlaceId: "ChIJ...", // TODO: Lookup from DB
    yelpBusinessId: "toyota-...",
    facebookPageId: "123456789",
  };

  try {
    const result = await aggregateReviews(dealerData);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[UGC] Error:", error);
    return NextResponse.json(
      { error: "Failed to aggregate reviews" },
      { status: 500 }
    );
  }
}
```

---

## 📦 **Required NPM Packages**

```bash
npm install cheerio  # For schema validation
npm install openai @anthropic-ai/sdk  # For AI testing (already installed)
```

---

## 🔑 **Environment Variables**

Add to `.env.local` and Vercel:

```bash
# AI Platform APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...
GOOGLE_AI_API_KEY=AI...

# Google Search Console
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REFRESH_TOKEN=1//...

# Reviews APIs
GOOGLE_PLACES_API_KEY=AIza...
YELP_API_KEY=Bearer ...
FACEBOOK_ACCESS_TOKEN=...
```

---

## 🧪 **Testing Real Data**

### **Test AI Visibility:**
```bash
curl "http://localhost:3000/api/ai/health?dealer=germaintoyota.com"
```

### **Test Zero-Click:**
```bash
curl "http://localhost:3000/api/zero-click?dealer=germaintoyota.com"
```

### **Test Schema:**
```bash
curl "http://localhost:3000/api/schema?origin=https://germaintoyota.com"
```

### **Test Reviews:**
```bash
curl "http://localhost:3000/api/ugc?dealer=germain-toyota"
```

---

## 🚨 **Important Notes**

1. **Rate Limits:** All third-party APIs have rate limits. Implement caching!
2. **Costs:** AI API calls cost money. Cache results for 24 hours.
3. **Errors:** Always handle API failures gracefully with fallbacks.
4. **Privacy:** Don't store personal data from reviews without consent.

---

## 💾 **Caching Strategy**

Create `lib/cache.ts`:

```typescript
const cache = new Map<string, { data: any; expires: number }>();

export function cacheGet(key: string) {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) {
    return entry.data;
  }
  return null;
}

export function cacheSet(key: string, data: any, ttlMs: number) {
  cache.set(key, { data, expires: Date.now() + ttlMs });
}
```

Use in API routes:

```typescript
const cached = cacheGet(`ai-health:${dealer}`);
if (cached) return NextResponse.json(cached);

const result = await testAIVisibility(dealer);
cacheSet(`ai-health:${dealer}`, result, 24 * 60 * 60 * 1000); // 24h cache
```

---

**That's it! Your APIs are now wired to real data sources.** 🎉
