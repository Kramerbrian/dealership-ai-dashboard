# AI Platform API Keys Setup Guide

This guide will help you configure API keys for the Monthly Scan feature, which tracks dealership visibility across major AI platforms.

## 🤖 Supported AI Platforms

The Monthly Scan system supports the following AI platforms:

1. **ChatGPT (OpenAI)** - `OPENAI_API_KEY`
2. **Claude (Anthropic)** - `ANTHROPIC_API_KEY`
3. **Gemini (Google)** - `GOOGLE_API_KEY`
4. **Google SGE** - Uses same `GOOGLE_API_KEY`
5. **Perplexity AI** - `PERPLEXITY_API_KEY`
6. **Grok (xAI)** - `XAI_API_KEY`

## 🔑 Getting API Keys

### 1. OpenAI (ChatGPT)
- **URL**: https://platform.openai.com/api-keys
- **Steps**:
  1. Sign up/Login to OpenAI
  2. Go to API Keys section
  3. Click "Create new secret key"
  4. Copy the key (starts with `sk-`)
- **Cost**: Pay-per-use, typically $0.002-0.02 per 1K tokens

### 2. Anthropic (Claude)
- **URL**: https://console.anthropic.com/
- **Steps**:
  1. Sign up/Login to Anthropic
  2. Go to API Keys section
  3. Create a new API key
  4. Copy the key (starts with `sk-ant-`)
- **Cost**: Pay-per-use, typically $0.008-0.024 per 1K tokens

### 3. Google (Gemini & SGE)
- **URL**: https://console.cloud.google.com/
- **Steps**:
  1. Create/Login to Google Cloud account
  2. Enable Generative AI API
  3. Create credentials (API Key)
  4. Copy the key
- **Cost**: Free tier available, then pay-per-use

### 4. Perplexity AI
- **URL**: https://www.perplexity.ai/settings/api
- **Steps**:
  1. Sign up/Login to Perplexity
  2. Go to Settings > API
  3. Generate API key
  4. Copy the key (starts with `pplx-`)
- **Cost**: Pay-per-use, typically $0.20 per 1K requests

### 5. xAI (Grok)
- **URL**: https://console.x.ai/
- **Steps**:
  1. Sign up/Login to xAI
  2. Go to API section
  3. Create API key
  4. Copy the key (starts with `xai-`)
- **Cost**: Pay-per-use, pricing varies

## 🚀 Quick Setup (Automated)

### Option 1: Use the Setup Script
```bash
# Make the script executable
chmod +x setup-ai-api-keys.sh

# Run the setup script
./setup-ai-api-keys.sh
```

This script will guide you through adding each API key to Vercel.

### Option 2: Manual Vercel Setup
```bash
# Add each API key manually
vercel env add OPENAI_API_KEY production
vercel env add ANTHROPIC_API_KEY production
vercel env add GOOGLE_API_KEY production
vercel env add PERPLEXITY_API_KEY production
vercel env add XAI_API_KEY production
```

## 🔧 Local Development Setup

### 1. Create .env file
```bash
# Copy the template
cp env-template.txt .env

# Edit with your actual API keys
nano .env
```

### 2. Add your API keys to .env
```env
# AI Platform API Keys
OPENAI_API_KEY=sk-your-actual-openai-key
ANTHROPIC_API_KEY=sk-ant-your-actual-anthropic-key
GOOGLE_API_KEY=your-actual-google-key
PERPLEXITY_API_KEY=pplx-your-actual-perplexity-key
XAI_API_KEY=xai-your-actual-xai-key
```

## 📊 Testing API Keys

### 1. Check API Keys Status
```bash
# Test the API endpoint
curl http://localhost:3002/api/monthly-scan/api-keys/status
```

### 2. Test Individual Platforms
```bash
# Test platforms endpoint
curl http://localhost:3002/api/monthly-scan/platforms
```

### 3. Start a Test Scan
```bash
# Start a small test scan
curl -X POST http://localhost:3002/api/monthly-scan/start \
  -H "Content-Type: application/json" \
  -d '{"dealers": [{"id": "test", "name": "Test Dealer", "address": "123 Test St", "website": "test.com"}]}'
```

## 💰 Cost Management

### Estimated Monthly Costs
- **Small Scale** (5 dealers, 50 queries): $10-50/month
- **Medium Scale** (20 dealers, 50 queries): $40-200/month
- **Large Scale** (100 dealers, 50 queries): $200-1000/month

### Cost Optimization Tips
1. **Start Small**: Begin with 1-2 platforms and expand
2. **Monitor Usage**: Set up billing alerts in each platform
3. **Batch Processing**: The system already optimizes for batch processing
4. **Query Selection**: Focus on high-value queries first

### Setting Up Billing Alerts
- **OpenAI**: Set usage limits in dashboard
- **Anthropic**: Configure spending limits
- **Google**: Set up billing alerts
- **Perplexity**: Monitor usage in dashboard
- **xAI**: Set spending limits

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit API keys to version control
- ✅ Use environment variables for all keys
- ✅ Rotate keys regularly
- ✅ Use different keys for dev/staging/production

### 2. Vercel Security
- ✅ Keys are encrypted at rest
- ✅ Only accessible to your team
- ✅ Can be scoped to specific environments

### 3. API Key Management
- ✅ Store keys securely
- ✅ Monitor usage regularly
- ✅ Revoke unused keys
- ✅ Use least-privilege access

## 🚨 Troubleshooting

### Common Issues

#### 1. "API key not found" Error
```bash
# Check if key is set
echo $OPENAI_API_KEY

# Verify in Vercel
vercel env ls
```

#### 2. "Rate limit exceeded" Error
- Wait before retrying
- Check your API usage limits
- Consider upgrading your plan

#### 3. "Invalid API key" Error
- Verify the key is correct
- Check if the key has expired
- Ensure the key has proper permissions

#### 4. "Timeout" Error
- Check your internet connection
- Verify the API endpoint is accessible
- Consider increasing timeout values

### Debug Mode
```bash
# Enable debug logging
DEBUG=monthly-scan node api-server.js
```

## 📈 Monitoring & Analytics

### 1. API Usage Tracking
- Monitor usage in each platform's dashboard
- Set up alerts for unusual usage patterns
- Track costs and optimize queries

### 2. Monthly Scan Analytics
- View scan results in the dashboard
- Track performance over time
- Identify trends and opportunities

### 3. Performance Metrics
- Response times
- Success rates
- Error rates
- Cost per scan

## 🎯 Next Steps

1. **Configure API Keys**: Use the setup script or manual process
2. **Test the System**: Run a small test scan
3. **Monitor Usage**: Set up billing alerts
4. **Scale Up**: Add more dealers and queries
5. **Optimize**: Fine-tune based on results

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review API platform documentation
3. Check Vercel environment variables
4. Test with a minimal configuration

---

**Ready to start?** Run `./setup-ai-api-keys.sh` to begin! 🚀
