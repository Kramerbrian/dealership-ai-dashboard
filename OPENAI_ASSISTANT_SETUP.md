# 🤖 OpenAI Assistant Setup Guide

## Step-by-Step Instructions

### 1. Go to OpenAI Platform
- **URL:** https://platform.openai.com/assistants
- **Login** with your OpenAI account

### 2. Create New Assistant
- **Click:** "Create Assistant" button
- **Fill in the details:**

**Name:**
```
DealershipAI AIV Calculator
```

**Model:**
```
gpt-4-turbo-preview
```

**Instructions:**
```
You are DealershipAI, an expert in automotive AI visibility analysis. 

When computing AIV metrics, always respond with valid JSON containing:
- aiv: Overall AI Visibility Score (0-100)
- ati: Answer Engine Intelligence Score (0-100) 
- crs: Citation Relevance Score (0-100)
- elasticity_usd_per_pt: Revenue impact per AIV point
- r2: Statistical confidence coefficient (0-1)
- recommendations: Array of 3 actionable insights

Example response:
{
  "aiv": 82,
  "ati": 78,
  "crs": 85,
  "elasticity_usd_per_pt": 156.30,
  "r2": 0.87,
  "recommendations": [
    "Improve local SEO citations",
    "Optimize for voice search queries", 
    "Enhance review response rate"
  ]
}

Always respond with valid JSON only. No additional text or explanations.
```

### 3. Save and Get Assistant ID
- **Click:** "Save" button
- **Copy the Assistant ID** (starts with `asst_`)
- **Example:** `asst_abc123def456ghi789`

### 4. Update Environment
Add the Assistant ID to your `.env.local`:

```bash
OPENAI_ASSISTANT_ID=asst_your-actual-assistant-id-here
```

## Testing the Assistant

You can test the Assistant directly in the OpenAI dashboard:

**Test Prompt:**
```
Compute AIV metrics for dealer "demo-dealer" in Naples, FL
```

**Expected Response:**
```json
{
  "aiv": 82,
  "ati": 78,
  "crs": 85,
  "elasticity_usd_per_pt": 156.30,
  "r2": 0.87,
  "recommendations": [
    "Improve local SEO citations",
    "Optimize for voice search queries",
    "Enhance review response rate"
  ]
}
```

## Troubleshooting

### If Assistant doesn't respond with JSON:
- Check the instructions are copied exactly
- Ensure the model is `gpt-4-turbo-preview`
- Try the test prompt above

### If you get errors:
- Verify your OpenAI account has credits
- Check the Assistant is saved and active
- Ensure the Assistant ID is correct

---

**Next Step:** After creating the Assistant, update your `.env.local` and run the integration tests!
