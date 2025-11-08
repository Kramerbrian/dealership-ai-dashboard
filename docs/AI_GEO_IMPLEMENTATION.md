# DealershipAI AI GEO Implementation Guide

## Overview

AI GEO (AI Search Engine Optimization) ensures your dealership appears when customers use AI assistants like ChatGPT, Claude, Perplexity, Gemini, and Copilot to research car purchases.

## Implementation Checklist

### Week 1: Foundation

#### ChatGPT Custom GPT
- [ ] Create GPT with optimized description (`configs/ai-geo/gpt-config.yaml`)
- [ ] Add OpenAPI schema (`configs/ai-geo/openapi-schema.yaml`)
- [ ] Test with target queries
- [ ] Publish to GPT Store
- [ ] Share URL on social media

#### Landing Page
- [x] Add comprehensive schema markup (`components/SEO/AIGEOSchema.tsx`)
- [x] Optimize meta tags (`components/SEO/LandingPageMeta.tsx`)
- [x] Implement FAQ schema
- [x] Add HowTo schema
- [ ] Create AI-friendly content
- [x] Allow AI crawlers in robots.txt

#### Dashboard
- [x] Add Organization schema
- [ ] Implement social sharing
- [ ] Create shareable report URLs
- [ ] Optimize for screenshots

### Week 2: Content Optimization

#### Create AI-Friendly Content
- [ ] 10 FAQ pages (one per common question)
- [ ] 5 comparison articles
- [ ] 3 how-to guides
- [ ] Location pages for each city you serve
- [ ] Brand pages for each manufacturer

#### Schema Deployment
- [ ] AutoDealer schema on homepage
- [ ] Product schema on all inventory
- [ ] Review schema aggregation
- [ ] FAQ schema on FAQ pages
- [ ] HowTo schema on guides

### Week 3: Technical Optimization

#### Performance
- [ ] Optimize images (WebP, lazy loading)
- [ ] Minify CSS/JS
- [ ] Enable CDN
- [ ] Achieve LCP < 2.5s
- [ ] Fix CLS issues

#### Crawlability
- [ ] Submit sitemap to search engines
- [ ] Fix broken links
- [ ] Add canonical URLs
- [ ] Implement breadcrumbs
- [ ] Create XML sitemap with AI hints

### Week 4: Trust Building

#### Reviews
- [ ] Import all reviews to site
- [ ] Respond to recent reviews
- [ ] Add review schema
- [ ] Create review testimonial page

#### Citations
- [ ] Claim GMB listing
- [ ] Update all directories
- [ ] Get manufacturer verification
- [ ] Add BBB accreditation

## AI GEO Success Formula

```
AI GEO Success = 
  (Schema Markup × 0.40) +
  (Content Quality × 0.30) +
  (Technical Performance × 0.20) +
  (Trust Signals × 0.10)
```

**Target Score:** 85+ (Top 10% of dealerships)

## Testing Queries

### ChatGPT
- "Best [brand] dealerships in [city]"
- "Where should I buy a car in [city]?"
- "Tell me about [your dealership name]"
- "Compare dealerships in [city] for [brand]"

### Claude
- "Research car dealerships in [city]"
- "What are the top-rated [brand] dealers?"
- "Help me find a reliable dealership"

### Perplexity
- "Best dealerships near me for [brand]"
- "[city] car dealership reviews"
- "Where to buy [model] in [city]"

### Gemini
- "Show me [brand] dealers in [city]"
- "Car dealership recommendations [city]"
- "Find certified [brand] service near me"

## Monitoring Metrics

Track these AI GEO metrics:

- `chatgpt_mentions`: Times mentioned in ChatGPT responses
- `claude_citations`: Times cited by Claude
- `perplexity_rankings`: Search result positions
- `gemini_knowledge_panel`: Knowledge panel presence
- `ai_referral_traffic`: Visitors from AI platforms
- `ai_assisted_conversions`: Conversions with AI attribution
- `schema_errors`: Schema validation errors
- `competitor_gap`: Visibility vs top competitor

## Priority Actions

1. **Schema Markup (40% impact)** - Implement all required schemas
2. **Content Quality (30% impact)** - Create entity-rich, Q&A format content
3. **Technical Performance (20% impact)** - Optimize Core Web Vitals
4. **Trust Signals (10% impact)** - Build reviews, citations, authority

## Resources

- Schema Markup Validator: https://validator.schema.org/
- Google Rich Results Test: https://search.google.com/test/rich-results
- ChatGPT GPT Store: https://chat.openai.com/gpts
- Claude API Documentation: https://docs.anthropic.com/

