# DealershipAI Premium Backend

**90% Real Data AI Visibility Platform**

This Express.js backend provides real-time AI visibility scoring by querying ChatGPT, Claude, and Perplexity APIs to determine how often dealerships are mentioned in AI responses.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set environment variables
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key"
export PERPLEXITY_API_KEY="your-perplexity-key"
export REDIS_URL="redis://localhost:6379"

# Start the server
npm start
```

## 📊 Features

### AI Query Engine
- **90% Real Data**: Queries actual AI models (GPT-4, Claude-3.5-Sonnet, Perplexity)
- **Smart Caching**: Redis-based caching to reduce API costs
- **Consensus Scoring**: Combines results from multiple AI models

### Scoring System
- **AI Visibility Score**: How often your dealership is mentioned
- **Zero-Click Ready**: Structured data and schema markup analysis
- **UGC Health**: User-generated content and review analysis
- **Geo Trust**: Local SEO and Google My Business presence
- **SGP Integrity**: Search engine optimization fundamentals

### Pricing Tiers
- **Basic**: $0/month (10 queries, 168h cache)
- **Pro**: $499/month (500 queries, 24h cache)
- **Ultra**: $999/month (2000 queries, 1h cache)

## 🔧 API Endpoints

### GET /api/ai-scores
Get AI visibility scores for a domain.

**Parameters:**
- `domain` (required): Domain to analyze (e.g., heritagetoyota.com)
- `tier` (optional): Pricing tier (basic, pro, ultra)

**Response:**
```json
{
  "ai_visibility": 75,
  "zero_click": 68,
  "ugc_health": 82,
  "geo_trust": 71,
  "sgp_integrity": 65,
  "eeat": {
    "experience": 78,
    "expertise": 72,
    "authoritativeness": 69,
    "trust": 74
  },
  "indices": [
    {
      "c": "PPI",
      "n": "Page Performance",
      "s": 73,
      "t": "OK"
    }
  ],
  "ai_raw": [...],
  "tier": "pro"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "ok": true
}
```

## 🛠️ Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | Yes |
| `PERPLEXITY_API_KEY` | Perplexity API key | Yes |
| `REDIS_URL` | Redis connection URL | No (defaults to localhost) |
| `PORT` | Server port | No (defaults to 3001) |

## 📈 How It Works

1. **Domain Analysis**: Extracts city/region from domain name
2. **Query Generation**: Creates 5 relevant prompts for the location
3. **AI Queries**: Sends prompts to GPT-4, Claude, and Perplexity
4. **Consensus Scoring**: Calculates mention percentage across models
5. **Signal Analysis**: Analyzes schema, GMB, and review data
6. **Score Calculation**: Combines AI results with SEO signals
7. **Caching**: Stores results in Redis for cost optimization

## 🔍 Example Queries

For domain `heritagetoyota.com`:
- "Best car dealership in heritage"
- "Where to service Honda near heritage"
- "Sell my car heritage FL"
- "heritage auto dealer reviews"
- "Trusted car dealer heritage"

## 💡 Optimization Tips

1. **Use Pro/Ultra Tiers**: Faster cache refresh for real-time monitoring
2. **Batch Analysis**: Analyze multiple domains in sequence
3. **Monitor Costs**: Track API usage and optimize cache settings
4. **Health Checks**: Monitor backend status for reliability

## 🚨 Error Handling

- **API Rate Limits**: Automatic retry with exponential backoff
- **Network Issues**: Graceful degradation with cached results
- **Invalid Domains**: Clear error messages and validation
- **Backend Offline**: Frontend fallback to mock data

## 🔒 Security

- **API Key Protection**: Environment variables only
- **Rate Limiting**: Built-in request throttling
- **Input Validation**: Domain format validation
- **Error Sanitization**: No sensitive data in error responses

## 📊 Monitoring

- **Health Endpoint**: `/health` for uptime monitoring
- **Logging**: Structured logging for debugging
- **Metrics**: Request count, response time, error rate
- **Alerts**: Integration with monitoring services

## 🚀 Deployment

### Docker
```bash
docker build -t dealershipai-backend .
docker run -p 3001:3001 dealershipai-backend
```

### PM2
```bash
pm2 start server.js --name dealershipai-backend
```

### Vercel
```bash
vercel --prod
```

## 📞 Support

- **Documentation**: [docs.dealershipai.com](https://docs.dealershipai.com)
- **API Reference**: [api.dealershipai.com](https://api.dealershipai.com)
- **Support**: support@dealershipai.com
- **Status**: [status.dealershipai.com](https://status.dealershipai.com)

---

**DealershipAI Premium** - The platform 240+ dealerships use to control their AI visibility across ChatGPT, Claude, and Perplexity.
