# ChatGPT Custom GPT Setup Guide

## Overview

This guide walks you through creating a DealershipAI Custom GPT in ChatGPT that can analyze dealership AI visibility.

## Prerequisites

1. ChatGPT Plus or Enterprise account
2. Access to GPT Builder (https://chat.openai.com/gpts)
3. Your DealershipAI API endpoints deployed and accessible

## Step 1: Create New GPT

1. Go to https://chat.openai.com/gpts
2. Click **"Create"** or **"+"** button
3. Select **"Create a GPT"**

## Step 2: Configure GPT

### Basic Information

**Name:**
```
DealershipAI - Automotive AI Visibility Analyzer
```

**Description:**
```
Analyze automotive dealership visibility across AI search engines (ChatGPT, Claude, Perplexity, Gemini, Copilot). Get instant insights on revenue at risk, competitive positioning, and actionable fixes. Perfect for: Car dealers, automotive digital marketers, dealership GMs.
```

**Instructions (System Prompt):**
Copy the system prompt from `configs/ai-geo/gpt-config.yaml` and paste it into the "Instructions" field.

### Conversation Starters

Add these example queries:
- "Analyze my dealership's AI visibility"
- "How do I rank on ChatGPT compared to competitors?"
- "What's my AI search visibility score?"
- "Show me revenue at risk from poor AI visibility"

## Step 3: Add Actions (OpenAPI Schema)

1. Click **"Actions"** in the GPT builder
2. Click **"Create new action"**
3. Click **"Import from URL"** or **"Upload file"**
4. Upload `configs/ai-geo/openapi-schema.yaml`

### Configure Authentication

If your API requires authentication:

1. Select **"API Key"** or **"OAuth"**
2. For API Key:
   - Header name: `Authorization`
   - Value: `Bearer YOUR_API_KEY`
3. Save authentication

## Step 4: Test Your GPT

1. Click **"Preview"** in the GPT builder
2. Try these test queries:
   - "Analyze terryreidhyundai.com"
   - "What's my AI visibility score?"
   - "Compare my dealership to competitors"

3. Verify responses include:
   - Visibility scores
   - Revenue impact
   - Actionable recommendations

## Step 5: Publish

### For Personal Use
1. Click **"Save"**
2. Select **"Only me"** or **"Anyone with a link"**

### For GPT Store (Public)
1. Click **"Publish"**
2. Select **"Public"**
3. Add:
   - Category: Business Analysis
   - Tags: automotive, dealership, AI visibility, SEO
   - Icon: Upload DealershipAI logo
4. Submit for review

## Step 6: Share & Promote

Once published, share your GPT:

- **Direct Link:** `https://chat.openai.com/g/g/YOUR_GPT_ID`
- **Social Media:** "Check out DealershipAI GPT - analyze your dealership's AI visibility!"
- **Website:** Add GPT link to your landing page

## Troubleshooting

### API Not Responding
- Verify API endpoints are publicly accessible
- Check CORS settings
- Test endpoints manually with curl/Postman

### Authentication Errors
- Verify API key is correct
- Check token expiration
- Ensure header format matches API expectations

### Schema Validation Errors
- Validate OpenAPI schema at https://editor.swagger.io/
- Check for required fields
- Verify endpoint URLs are correct

## Example GPT Conversation

```
User: Analyze my dealership's AI visibility

GPT: I can analyze your dealership's AI visibility across ChatGPT, 
Claude, Perplexity, Gemini, and Copilot.

What's your dealership's website domain?

User: terryreidhyundai.com

GPT: [Analyzing Terry Reid Hyundai...]
[Progress: ████████░░ 80%]

🎯 AI Visibility Analysis - Terry Reid Hyundai

Overall Score: 82/100 ⭐
Market Position: #2 of 8 in Cape Coral

Platform Visibility:
• ChatGPT:    94% ✅ Excellent
• Claude:     89% ✅ Good
• Perplexity: 82% ⚠️  Good
• Gemini:     78% ⚠️  Fair
• Copilot:    71% ⚠️  Fair

🔍 Critical Issues Detected:

1. Missing AutoDealer Schema → $8.2K/mo at risk
   Fix: Add JSON-LD structured data (2 hours)

2. Low Review Response Rate → $3.1K/mo at risk
   Fix: Implement auto-response system (1 hour)

💰 Revenue Impact:
Monthly at risk: $13,700
Annual impact: $164,400
ROI vs DealershipAI: 138x

🎁 See Full Report + Auto-Fix Options
→ dealershipai.com/report/terry-reid-hyundai
```

## Next Steps

1. Monitor GPT usage in ChatGPT Analytics
2. Collect user feedback
3. Iterate on prompts based on common queries
4. Add more actions as features are built
5. Create specialized GPTs for different use cases (e.g., "DealershipAI - Schema Fixer")

## Resources

- GPT Builder: https://chat.openai.com/gpts
- OpenAPI Spec: `configs/ai-geo/openapi-schema.yaml`
- GPT Config: `configs/ai-geo/gpt-config.yaml`
- API Documentation: See `docs/API.md`

