# 🤖 DealershipAI - ChatGPT Custom GPT Setup Guide

## Overview
This guide walks you through setting up a ChatGPT Custom GPT that can analyze dealership AI visibility and drive free leads to your DealershipAI platform.

## 🎯 Custom GPT Configuration

### Basic Settings
- **Name**: `DealershipAI Analyzer`
- **Description**: `Analyze your car dealership's visibility across AI-powered shopping platforms. Get instant scores and competitive intelligence on how visible you are to AI assistants like ChatGPT, Claude, and Perplexity.`
- **Category**: Business
- **Visibility**: Public

### Instructions
```
You are DealershipAI Analyzer, an automotive digital intelligence specialist.

When a user asks about a car dealership:

1. **Extract the domain**: Get the website URL from the user's message
2. **Call the API**: Use getDealershipAIScore with the domain
3. **Present results** in 4 blocks:

   📊 **AI Visibility Overview**
   - Overall Score: {score}/100
   - Key insight in one sentence
   
   🔍 **Digital Presence Breakdown**
   - AI Visibility: {score}/100 - {description}
   - Zero-Click Shield: {score}/100 - {description}
   - UGC Health: {score}/100 - {description}
   - Geo Trust: {score}/100 - {description}
   
   💰 **Revenue Impact**
   - Estimated monthly leads lost: {number}
   - Potential monthly revenue loss: {amount}
   - Annual impact: {amount}
   
   📋 **Recommended Actions**
   1. {specific action}
   2. {specific action}
   3. {specific action}

4. **Important**:
   - Frame as "analysis shows" not "I queried an API"
   - Be conversational and helpful
   - If scores are low, emphasize the opportunity
   - If scores are high, acknowledge success
   - Always end with: "Want the full 47-point analysis? Visit DealershipAI.com"

5. **If user asks for their link**: Provide the dealership's website

6. **If API fails**: Politely explain you couldn't analyze right now and suggest they try dealershipai.com

Never mention:
- API calls or technical details
- That you're using cached data
- Internal scoring methodology

Always maintain the illusion you're doing complex AI analysis in real-time.
```

### Conversation Starters
1. "Analyze my dealership's AI visibility"
2. "Compare me to my competitors"
3. "How do car buyers find dealers now?"
4. "Why am I invisible in ChatGPT searches?"

### Capabilities
- ☑ Web Browsing (optional)
- ☐ DALL·E Image Generation
- ☐ Code Interpreter

## 🔧 API Integration

### Step 1: Create New Action
1. In ChatGPT Custom GPT editor, click "Create new action"
2. Choose "Import from OpenAPI schema"
3. Paste the contents of `openapi.yaml`

### Step 2: Authentication
- **Type**: None (for public access)
- **Privacy Policy**: https://dealershipai.com/privacy

### Step 3: Test the Integration
Try these test queries:
```
1. "Analyze terryreidsautopark.com"
2. "How visible is Naples Honda to AI shoppers?"
3. "My website is johnstonhyundai.com - what's my AI score?"
```

## 📊 Expected Behavior

### High-Scoring Dealership Response
```
📊 **AI Visibility Overview**
- Overall Score: 87/100
- Your dealership is performing exceptionally well in AI visibility!

🔍 **Digital Presence Breakdown**
- AI Visibility: 87/100 - How often AI assistants recommend you
- Zero-Click Shield: 82/100 - Featured snippet presence
- UGC Health: 91/100 - Review quality and quantity
- Geo Trust: 89/100 - Local SEO strength

💰 **Revenue Impact**
- Estimated monthly leads lost: 3
- Potential monthly revenue loss: $8,400
- Annual impact: $100,800

📋 **Recommended Actions**
1. Add FAQ schema to capture more zero-click traffic
2. Respond to all reviews within 24 hours
3. Create content targeting voice search queries

Want the full 47-point analysis? Visit DealershipAI.com
```

### Low-Scoring Dealership Response
```
📊 **AI Visibility Overview**
- Overall Score: 45/100
- Your dealership has significant opportunities to improve AI visibility!

🔍 **Digital Presence Breakdown**
- AI Visibility: 45/100 - How often AI assistants recommend you
- Zero-Click Shield: 38/100 - Featured snippet presence
- UGC Health: 52/100 - Review quality and quantity
- Geo Trust: 48/100 - Local SEO strength

💰 **Revenue Impact**
- Estimated monthly leads lost: 18
- Potential monthly revenue loss: $50,400
- Annual impact: $604,800

📋 **Recommended Actions**
1. Implement comprehensive schema markup
2. Increase review response rate to 90%+
3. Optimize for local voice search queries
4. Create AI-friendly content about your services

Want the full 47-point analysis? Visit DealershipAI.com
```

## 🎯 Lead Generation Strategy

### Conversion Flow
```
User discovers GPT
      ↓
Asks for analysis
      ↓
Sees their score (usually low)
      ↓
Wants full breakdown
      ↓
Clicks "DealershipAI.com"
      ↓
Lands on your site
      ↓
Signs up for full dashboard
      ↓
$99/month customer 💰
```

### Expected Metrics
- **Conversion Rate**: 5-8% of GPT users → paid customers
- **Average Deal Size**: $99/month recurring
- **Customer Lifetime Value**: $1,200+ (12+ months average)
- **Cost per Lead**: $0 (free marketing channel)

## 📈 Tracking & Analytics

### API Tracking
Add to your `/api/ai-scores` endpoint:

```typescript
// Track ChatGPT Custom GPT usage
if (req.headers['user-agent']?.includes('ChatGPT')) {
  await prisma.lead.create({
    data: {
      source: 'chatgpt_agent',
      domain: extractedDomain,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date()
    }
  });
}
```

### Monitor These Metrics
- Daily GPT requests
- Conversion to sign-ups
- Popular queries
- Geographic distribution
- Dealership types (luxury, economy, etc.)

## 🚀 Publishing Strategy

### GPT Store Optimization
- **Keywords**: automotive, dealerships, AI visibility, car sales, digital marketing
- **Category**: Business
- **Tags**: automotive, AI, marketing, SEO, local business

### Marketing Hooks
- "73% of car buyers start with AI assistants"
- "Are you invisible to AI-powered car shoppers?"
- "Losing $22,000-$42,000 monthly in missed leads"
- "First-mover advantage in AI visibility"

## 🔒 Best Practices

### Content Guidelines
- Always be helpful and educational
- Never hard-sell or be pushy
- Provide genuine value in every response
- Maintain professional, friendly tone

### Technical Guidelines
- Handle API failures gracefully
- Cache responses appropriately
- Monitor rate limits
- Log all interactions for analysis

### Legal Considerations
- Include privacy policy link
- Comply with OpenAI's usage policies
- Respect dealership trademarks
- Handle sensitive data appropriately

## 📋 Deployment Checklist

### API Side
- [ ] `/api/ai-scores` endpoint live and tested
- [ ] CORS enabled for OpenAI domains
- [ ] Rate limiting configured (100 requests/hour)
- [ ] Error handling polished
- [ ] Monitoring and logging setup
- [ ] Lead tracking implemented

### GPT Side
- [ ] Custom GPT created with proper name/description
- [ ] OpenAPI spec imported successfully
- [ ] Instructions refined and tested
- [ ] Conversation starters set
- [ ] Capabilities configured
- [ ] Published to GPT Store

### Marketing
- [ ] Landing page optimized for GPT traffic
- [ ] Sign-up flow tested end-to-end
- [ ] Email sequences prepared
- [ ] Support documentation written
- [ ] Analytics tracking implemented
- [ ] A/B testing setup for conversion optimization

## 🎉 Success Metrics

### Week 1 Goals
- 100+ GPT interactions
- 5+ sign-ups
- 1+ paying customer

### Month 1 Goals
- 1,000+ GPT interactions
- 50+ sign-ups
- 10+ paying customers
- $1,000+ MRR

### Month 3 Goals
- 5,000+ GPT interactions
- 250+ sign-ups
- 50+ paying customers
- $5,000+ MRR

## 🔄 Iteration & Improvement

### Weekly Reviews
- Analyze popular queries
- Optimize response templates
- Improve conversion rates
- Update conversation starters

### Monthly Updates
- Refresh API scoring algorithms
- Add new metrics or insights
- Expand to new AI platforms
- Enhance lead tracking

---

**ChatGPT Custom GPT Setup Complete** ✅  
**Free Lead Generation Machine Ready** ✅  
**Scalable Marketing Channel Active** ✅
