# 🤖 AI API Configuration Guide

This guide will help you configure AI API keys for your DealershipAI Enterprise application.

## 🔑 Required API Keys

### 1. Anthropic (Claude)
- **Purpose**: Primary AI engine for dealership queries
- **Model**: Claude-3.5-Sonnet
- **Cost**: ~$0.003/1K input tokens, ~$0.015/1K output tokens

**Setup:**
1. Go to https://console.anthropic.com/
2. Create account or sign in
3. Navigate to API Keys
4. Create new key
5. Copy the key (starts with `sk-ant-`)

**Environment Variable:**
```bash
ANTHROPIC_API_KEY="sk-ant-..."
```

### 2. OpenAI (GPT-4)
- **Purpose**: Secondary AI engine for comparison
- **Model**: GPT-4o
- **Cost**: ~$0.005/1K input tokens, ~$0.015/1K output tokens

**Setup:**
1. Go to https://platform.openai.com/
2. Create account or sign in
3. Navigate to API Keys
4. Create new key
5. Copy the key (starts with `sk-`)

**Environment Variable:**
```bash
OPENAI_API_KEY="sk-..."
```

### 3. Google AI (Gemini)
- **Purpose**: Third AI engine for comprehensive coverage
- **Model**: Gemini-1.5-Pro
- **Cost**: ~$0.00125/1K input tokens, ~$0.005/1K output tokens

**Setup:**
1. Go to https://aistudio.google.com/
2. Create account or sign in
3. Navigate to API Keys
4. Create new key
5. Copy the key

**Environment Variable:**
```bash
GOOGLE_AI_API_KEY="..."
```

## 🚀 Quick Setup

### Option 1: Interactive Setup
```bash
npm run setup:ai-apis
```

### Option 2: Manual Setup
1. Add API keys to your `.env.local` file:
```bash
# AI API Keys
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."
GOOGLE_AI_API_KEY="..."

# Optional: Override default models
ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
OPENAI_MODEL="gpt-4o"
GOOGLE_MODEL="gemini-1.5-pro"
```

2. Test the configuration:
```bash
curl "http://localhost:3000/api/ai/test?test=true"
```

## 🧪 Testing AI APIs

### Test All APIs
```bash
curl "http://localhost:3000/api/ai/test?test=true"
```

**Expected Response:**
```json
{
  "success": true,
  "connectivity": {
    "anthropic": true,
    "openai": true,
    "google": true
  },
  "message": "AI API connectivity test completed"
}
```

### Test Individual API
```bash
curl -X POST "http://localhost:3000/api/ai/test" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What are the top car dealerships in Miami, FL?",
    "engine": "anthropic"
  }'
```

## 💰 Cost Management

### Estimated Monthly Costs (per 1,000 queries)
- **Anthropic**: ~$15-30
- **OpenAI**: ~$20-40  
- **Google**: ~$5-15
- **Total**: ~$40-85

### Cost Optimization Tips
1. **Use Anthropic as primary** (best value)
2. **Batch queries** when possible
3. **Cache responses** for repeated queries
4. **Set usage limits** in API dashboards
5. **Monitor costs** regularly

## 🔧 Configuration Options

### Model Selection
```bash
# Anthropic Models
ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"  # Recommended
ANTHROPIC_MODEL="claude-3-opus-20240229"      # More capable, more expensive

# OpenAI Models  
OPENAI_MODEL="gpt-4o"           # Recommended
OPENAI_MODEL="gpt-4-turbo"      # Alternative

# Google Models
GOOGLE_MODEL="gemini-1.5-pro"   # Recommended
GOOGLE_MODEL="gemini-1.5-flash" # Faster, cheaper
```

### Token Limits
```bash
# Set maximum tokens per query
ANTHROPIC_MAX_TOKENS="4000"
OPENAI_MAX_TOKENS="4000"
GOOGLE_MAX_TOKENS="4000"
```

### Temperature Settings
```bash
# Control creativity (0.0 = deterministic, 1.0 = creative)
AI_TEMPERATURE="0.7"
```

## 🛡️ Security Best Practices

### 1. Environment Variables
- ✅ Store keys in `.env.local` (never commit)
- ✅ Use Vercel environment variables for production
- ✅ Rotate keys regularly
- ✅ Use different keys for dev/staging/prod

### 2. API Key Management
- ✅ Set usage limits in API dashboards
- ✅ Monitor usage daily
- ✅ Set up billing alerts
- ✅ Use least privilege access

### 3. Data Privacy
- ✅ Don't send PII in prompts
- ✅ Use data anonymization
- ✅ Review API data retention policies
- ✅ Implement audit logging

## 📊 Monitoring & Analytics

### Usage Tracking
The system automatically tracks:
- API calls per engine
- Token usage
- Response times
- Costs per query
- Error rates

### View Analytics
```bash
# Get AI usage stats
curl "http://localhost:3000/api/ai/analytics"
```

### Database Queries
```sql
-- View AI query history
SELECT 
  engine,
  COUNT(*) as query_count,
  SUM(cost_cents) as total_cost_cents,
  AVG(latency_ms) as avg_latency_ms
FROM ai_query_results 
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY engine;
```

## 🚨 Troubleshooting

### Common Issues

#### 1. API Key Not Working
```bash
# Check if key is set
echo $ANTHROPIC_API_KEY

# Test connectivity
curl "http://localhost:3000/api/ai/test?test=true"
```

#### 2. Rate Limiting
- Check API dashboard for rate limits
- Implement exponential backoff
- Use multiple API keys if needed

#### 3. High Costs
- Review query patterns
- Implement caching
- Use cheaper models for simple queries
- Set daily/monthly limits

#### 4. Slow Responses
- Check network connectivity
- Use faster models (Gemini Flash)
- Implement response caching
- Optimize prompt length

### Debug Commands

```bash
# Test all APIs
npm run test:ai-apis

# Check environment variables
npm run check:env

# View API logs
npm run logs:ai

# Reset API configuration
npm run reset:ai-config
```

## 🔄 Production Deployment

### Vercel Environment Variables
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all AI API keys
5. Deploy

### Environment Variables to Set:
```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
OPENAI_MODEL=gpt-4o
GOOGLE_MODEL=gemini-1.5-pro
```

### Supabase Vault (Optional)
For additional security, store API keys in Supabase Vault:

```sql
-- Store in Supabase Vault
INSERT INTO vault.secrets (name, secret) VALUES 
('anthropic_api_key', 'sk-ant-...'),
('openai_api_key', 'sk-...'),
('google_ai_api_key', '...');
```

## 📈 Scaling Considerations

### High Volume Usage
- Implement request queuing
- Use multiple API keys
- Cache common responses
- Consider dedicated AI infrastructure

### Cost Optimization
- Use cheaper models for simple tasks
- Implement smart caching
- Batch similar queries
- Monitor and alert on costs

### Performance
- Use CDN for static responses
- Implement response streaming
- Optimize prompt engineering
- Use async processing

## 🎯 Next Steps

1. ✅ **Set up API keys** using this guide
2. ✅ **Test connectivity** with provided commands
3. ✅ **Configure monitoring** and alerts
4. ✅ **Deploy to production** with environment variables
5. ✅ **Monitor usage** and optimize costs

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review API documentation
3. Check system logs
4. Contact support with specific error messages

---

**Need Help?** Check the troubleshooting section or create an issue in the repository.
