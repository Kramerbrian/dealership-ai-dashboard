# ChatGPT Custom GPT Setup Guide

This guide explains how to create a Custom GPT for DealershipAI using the provided configuration files.

## Prerequisites

1. ChatGPT Plus or Enterprise subscription
2. Access to OpenAI's GPT Builder
3. The configuration files from `configs/ai-geo/`

## Step 1: Create a New Custom GPT

1. Go to [chat.openai.com](https://chat.openai.com)
2. Click on your profile → "My GPTs"
3. Click "Create a GPT"
4. Choose "Configure" tab

## Step 2: Configure Basic Settings

### Name
```
DealershipAI Visibility Analyzer
```

### Description
```
Expert AI visibility analyst for automotive dealerships. Analyzes ChatGPT, Claude, Perplexity, Gemini, and Copilot visibility. Provides actionable insights on schema, E-E-A-T, zero-click coverage, and revenue at risk.
```

### Instructions
Copy the contents from `configs/ai-geo/gpt-config.yaml` into the Instructions field.

## Step 3: Configure Actions (Optional)

If you want the GPT to interact with the DealershipAI API:

1. Click "Add Action"
2. Import the OpenAPI schema from `public/orchestrator-openapi.json`
3. Configure authentication (Bearer token)
4. Set the base URL to your production API endpoint

## Step 4: Conversation Starters

Add these conversation starters:

- "Analyze my dealership's AI visibility"
- "What's my Quality Authority Index?"
- "Show me zero-click opportunities"
- "How can I improve my E-E-A-T scores?"

## Step 5: Knowledge Base (Optional)

Upload the following files to enhance the GPT's knowledge:

- `docs/COGNITIVE_OPS_DOCTRINE.md`
- `docs/AI_GEO_OPTIMIZATION.md`
- Any additional documentation about your KPIs

## Step 6: Capabilities

Enable:
- ✅ Web Browsing (for real-time data)
- ✅ Code Interpreter (for calculations)
- ✅ DALL·E (optional, for visualizations)

## Step 7: Save and Publish

1. Click "Save"
2. Choose visibility:
   - **Only me**: Private testing
   - **Anyone with a link**: Share with specific users
   - **Public**: Available to all ChatGPT users

3. Click "Confirm"

## Step 8: Test Your GPT

Try these test queries:

```
"Analyze dealershipai.com for AI visibility"
"What are the top 3 opportunities for improving AI search visibility?"
"Explain the difference between VAI and QAI"
```

## Advanced Configuration

### Custom Actions

If you want to connect to your API, configure actions using the OpenAPI spec:

```yaml
# Example action configuration
servers:
  - url: https://dealership-ai-dashboard.vercel.app/api
security:
  - bearerAuth: []
```

### Environment Variables

For production, set these in your API:
- `OPENAI_API_KEY`: For GPT actions
- `ORCHESTRATOR_TOKEN`: For API authentication

## Troubleshooting

### GPT Not Responding Correctly

1. Check that instructions are properly formatted
2. Verify conversation starters are set
3. Test with simple queries first

### API Integration Issues

1. Verify OpenAPI schema is valid
2. Check authentication tokens
3. Test API endpoints directly

### Knowledge Base Not Loading

1. Ensure files are under 512MB each
2. Check file formats (PDF, TXT, MD supported)
3. Wait a few minutes for processing

## Best Practices

1. **Start Simple**: Begin with basic instructions, add complexity gradually
2. **Test Thoroughly**: Try various query types before publishing
3. **Iterate**: Update instructions based on user feedback
4. **Monitor**: Track usage and refine responses

## Example Prompts

### For Dealership Owners
```
"I own a Toyota dealership in Miami. How can I improve my visibility on ChatGPT?"
```

### For Marketing Teams
```
"Show me a comparison of our AI visibility vs competitors"
```

### For SEO Specialists
```
"What schema markup should I add to improve AEO visibility?"
```

## Support

For issues or questions:
- Check the [DealershipAI Documentation](../README.md)
- Review the [AI GEO Optimization Guide](./AI_GEO_OPTIMIZATION.md)
- Contact support@dealershipai.com
