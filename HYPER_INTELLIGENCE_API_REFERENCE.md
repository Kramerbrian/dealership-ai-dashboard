# 🧠 DealershipAI Hyper-Intelligence System - API Reference

## Overview

The DealershipAI Hyper-Intelligence System provides a comprehensive set of APIs for advanced automotive intelligence, predictive analytics, and automated optimization. This reference covers all available endpoints, request/response formats, and integration examples.

## 🔗 Base URL

- **Local Development**: `http://localhost:3000`
- **Production**: `https://your-domain.vercel.app`

## 🔐 Authentication

All API endpoints require authentication via Clerk. Include the following headers:

```bash
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

## 📊 Core Intelligence APIs

### 1. AI Offer Validation

Validates AI-generated offers using machine learning models.

**Endpoint**: `POST /api/ai/offer/validate`

**Request Body**:
```json
{
  "vin": "1HGBH41JXMN109186",
  "offerData": {
    "price": 25000,
    "condition": "excellent",
    "mileage": 45000,
    "features": ["leather", "sunroof", "navigation"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "isValid": true,
  "score": 87.5,
  "confidence": 0.92,
  "recommendations": [
    {
      "type": "pricing",
      "action": "Consider reducing price by $500",
      "impact": "High",
      "confidence": 0.85
    }
  ],
  "timestamp": "2025-10-21T05:30:00Z"
}
```

### 2. Parity Ingestion

Ingests cross-channel data parity snapshots for analysis.

**Endpoint**: `POST /api/parity/ingest`

**Request Body**:
```json
{
  "snapshots": [
    {
      "vin": "1HGBH41JXMN109186",
      "source": "vdp",
      "sourceOfTruth": "dealer_system",
      "dealerId": "dealer_123",
      "data": {
        "price": 25000,
        "mileage": 45000,
        "condition": "excellent",
        "features": ["leather", "sunroof"]
      },
      "timestamp": "2025-10-21T05:30:00Z"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "results": [
    {
      "vin": "1HGBH41JXMN109186",
      "status": "processed",
      "parityScore": 0.95,
      "discrepancies": []
    }
  ],
  "totalProcessed": 1,
  "successful": 1,
  "failed": 0
}
```

### 3. Intelligence Simulation

Simulates intelligence scenarios and predicts outcomes.

**Endpoint**: `POST /api/intel/simulate`

**Request Body**:
```json
{
  "scenario": {
    "action": "republish",
    "vin": "1HGBH41JXMN109186",
    "parameters": {
      "priceAdjustment": -500,
      "marketingBoost": 0.2
    }
  }
}
```

**Response**:
```json
{
  "success": true,
  "impact": {
    "revenueIncrease": 2500,
    "leadIncrease": 15,
    "riskReduction": 0.12,
    "confidence": 0.78
  },
  "recommendations": [
    {
      "action": "Implement price adjustment",
      "expectedROI": 2.5,
      "risk": "Low",
      "timeline": "1-2 weeks"
    }
  ]
}
```

## 🎯 Advanced Analytics APIs

### 4. Predictive Analytics

Provides ML-driven predictive analytics for inventory and pricing.

**Endpoint**: `POST /api/ai/predictive-analytics`

**Request Body**:
```json
{
  "vin": "1HGBH41JXMN109186",
  "historicalData": {
    "currentPrice": 25000,
    "daysOnMarket": 15,
    "views": 45,
    "inquiries": 8
  },
  "marketConditions": {
    "season": "spring",
    "demand": "high",
    "competition": "medium"
  }
}
```

**Response**:
```json
{
  "success": true,
  "predictions": {
    "priceOptimization": {
      "currentPrice": 25000,
      "optimalPrice": 24500,
      "confidence": 0.85,
      "expectedDaysToSell": 12,
      "priceSensitivity": 0.15
    },
    "demandForecasting": {
      "next30Days": 8,
      "seasonalTrend": "increasing",
      "marketShare": 0.12,
      "competitorActivity": 0.25
    },
    "riskAssessment": {
      "depreciationRisk": 0.15,
      "marketVolatility": 0.22,
      "inventoryTurnover": 0.75,
      "creditRisk": 0.08
    },
    "recommendations": [
      {
        "type": "pricing",
        "priority": "high",
        "action": "Adjust price by -$500 to increase demand",
        "expectedImpact": "+15% faster sale",
        "confidence": 0.85
      }
    ]
  }
}
```

### 5. Competitor Intelligence

Analyzes competitive landscape and provides strategic insights.

**Endpoint**: `POST /api/ai/competitor-intelligence`

**Request Body**:
```json
{
  "vin": "1HGBH41JXMN109186",
  "make": "Honda",
  "model": "Civic",
  "year": 2022,
  "location": "San Francisco, CA"
}
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "marketPosition": {
      "rank": 2,
      "marketShare": 0.15,
      "pricePosition": 0.12,
      "inventoryLevel": 0.65
    },
    "competitorPricing": [
      {
        "competitor": "Dealer A",
        "price": 23500,
        "advantages": ["Lower price", "Better financing"],
        "disadvantages": ["Higher mileage", "Older model year"]
      }
    ],
    "marketInsights": {
      "averageDaysOnMarket": 18,
      "priceTrends": {
        "last30Days": 0.02,
        "last90Days": -0.05,
        "seasonalAdjustment": 0.03
      }
    },
    "strategicRecommendations": [
      {
        "category": "Pricing Strategy",
        "action": "Implement dynamic pricing based on market conditions",
        "expectedImpact": "+12% profit margin",
        "priority": "High",
        "timeline": "2 weeks"
      }
    ]
  }
}
```

### 6. Customer Behavior Analysis

Analyzes customer behavior patterns and provides engagement insights.

**Endpoint**: `POST /api/ai/customer-behavior`

**Request Body**:
```json
{
  "vin": "1HGBH41JXMN109186",
  "customerProfile": {
    "age": 35,
    "income": 75000,
    "location": "San Francisco, CA",
    "preferences": ["fuel_efficient", "reliable"]
  },
  "browsingHistory": {
    "pagesViewed": 5,
    "timeOnSite": 1200,
    "returnVisits": 2,
    "devices": ["mobile", "desktop"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "customerSegmentation": {
      "segment": "Quality Focused",
      "probability": 0.85,
      "characteristics": {
        "priceSensitivity": 0.65,
        "brandLoyalty": 0.78,
        "decisionSpeed": 0.45,
        "digitalEngagement": 0.82
      }
    },
    "purchaseIntent": {
      "likelihood": 0.75,
      "timeframe": 21,
      "factors": ["Price competitiveness", "Vehicle condition"],
      "barriers": ["Price too high"]
    },
    "engagementPatterns": {
      "preferredChannels": ["Website", "Email", "Phone"],
      "optimalTiming": {
        "dayOfWeek": "Saturday",
        "timeOfDay": "Afternoon",
        "frequency": 2
      }
    },
    "conversionOptimization": {
      "currentFunnelStage": "Consideration",
      "nextActions": [
        {
          "action": "Schedule test drive",
          "probability": 0.65,
          "impact": "High",
          "effort": "Medium"
        }
      ]
    }
  }
}
```

### 7. Market Trends Analysis

Analyzes market trends and provides strategic insights.

**Endpoint**: `POST /api/ai/market-trends`

**Request Body**:
```json
{
  "make": "Honda",
  "model": "Civic",
  "year": 2022,
  "location": "San Francisco, CA",
  "timeframe": "30d"
}
```

**Response**:
```json
{
  "success": true,
  "trends": {
    "priceTrends": {
      "current": 24500,
      "change30d": 0.02,
      "change90d": -0.03,
      "volatility": 0.15,
      "forecast": {
        "next30d": 0.01,
        "next90d": -0.02,
        "confidence": 0.82
      }
    },
    "demandIndicators": {
      "searchVolume": {
        "current": 0.65,
        "trend": 0.12,
        "seasonality": 0.25
      },
      "inventoryLevels": {
        "market": 0.55,
        "competitor": 0.35,
        "turnover": 0.78
      }
    },
    "actionableInsights": [
      {
        "insight": "Price optimization opportunity",
        "impact": "High",
        "action": "Adjust pricing by -$800 to increase competitiveness",
        "expectedResult": "+18% faster sale",
        "confidence": 0.82
      }
    ]
  }
}
```

## 🛡️ Compliance APIs

### 8. Google Policy Compliance Summary

Retrieves compliance summary data for Google Ads policies.

**Endpoint**: `GET /api/compliance/google-pricing/summary`

**Query Parameters**:
- `tenant_id` (optional): Tenant identifier
- `days` (optional): Number of days to analyze (default: 30)

**Response**:
```json
{
  "success": true,
  "data": {
    "tenant_id": "demo_tenant",
    "total_audits": 15,
    "compliant_audits": 12,
    "non_compliant_audits": 3,
    "compliance_rate": 80.0,
    "avg_risk_score": 35.5,
    "avg_jaccard_score": 0.85,
    "avg_disclosure_clarity": 78.2,
    "price_mismatch_count": 2,
    "hidden_fees_count": 1,
    "critical_violations": 1,
    "warning_violations": 4,
    "recent_trends": [
      {
        "day": "2025-10-14",
        "compliance_rate": 82.0,
        "avg_risk_score": 38.1
      }
    ]
  }
}
```

### 9. Compliance Export

Exports compliance data as CSV.

**Endpoint**: `GET /api/compliance/google-pricing/export`

**Query Parameters**:
- `tenant_id` (optional): Tenant identifier
- `days` (optional): Number of days to export (default: 30)

**Response**: CSV file download

## 🔧 System APIs

### 10. Health Check

Checks system health and status.

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-21T05:30:00Z",
  "version": "1.0.0",
  "environment": {
    "nodeVersion": "v22.19.0",
    "platform": "darwin"
  },
  "uptime": 3600,
  "database": {
    "connected": true,
    "latency": 95,
    "tables": {
      "users": 150,
      "dealerships": 25,
      "scores": 1250,
      "analytics": 5000
    }
  },
  "memory": {
    "used": 304,
    "total": 359,
    "external": 512
  }
}
```

## 📊 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-10-21T05:30:00Z"
}
```

### Common Error Codes
- `400`: Bad Request - Invalid request data
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Server error

## 🔄 Rate Limiting

- **Standard Endpoints**: 100 requests/minute
- **Analytics Endpoints**: 50 requests/minute
- **Compliance Endpoints**: 25 requests/minute

## 📈 Response Times

- **Standard APIs**: <200ms average
- **Analytics APIs**: <500ms average
- **Compliance APIs**: <300ms average
- **Health Check**: <50ms average

## 🔐 Security

### Authentication
- All endpoints require valid Clerk authentication
- JWT tokens are validated on each request
- Session management handled by Clerk

### Data Protection
- All data encrypted in transit (HTTPS)
- Sensitive data encrypted at rest
- GDPR compliant data handling
- SOC 2 Type II certified

### Rate Limiting
- IP-based rate limiting
- User-based rate limiting
- Endpoint-specific limits
- Automatic blocking for abuse

## 📚 SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @dealershipai/sdk
```

```javascript
import { DealershipAI } from '@dealershipai/sdk';

const client = new DealershipAI({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Use the client
const result = await client.ai.predictiveAnalytics({
  vin: '1HGBH41JXMN109186',
  historicalData: { currentPrice: 25000 }
});
```

### Python
```bash
pip install dealershipai
```

```python
from dealershipai import DealershipAI

client = DealershipAI(api_key='your-api-key')

result = client.ai.predictive_analytics(
    vin='1HGBH41JXMN109186',
    historical_data={'currentPrice': 25000}
)
```

## 🧪 Testing

### Postman Collection
Download our Postman collection for easy API testing:
- [Download Collection](https://api.dealershipai.com/postman/collection.json)
- [Import Instructions](https://docs.dealershipai.com/testing)

### cURL Examples
```bash
# Health Check
curl -X GET https://api.dealershipai.com/health

# Predictive Analytics
curl -X POST https://api.dealershipai.com/ai/predictive-analytics \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"vin":"1HGBH41JXMN109186","historicalData":{"currentPrice":25000}}'
```

## 📞 Support

### Documentation
- **API Reference**: This document
- **User Guide**: [Hyper-Intelligence User Guide](./HYPER_INTELLIGENCE_USER_GUIDE.md)
- **Integration Guide**: [Integration Documentation](./INTEGRATION_GUIDE.md)

### Support Channels
- **Email**: api-support@dealershipai.com
- **Documentation**: https://docs.dealershipai.com
- **Status Page**: https://status.dealershipai.com
- **Community**: https://community.dealershipai.com

---

**API Version**: 1.0.0  
**Last Updated**: October 21, 2025  
**Next Update**: November 21, 2025  

The DealershipAI Hyper-Intelligence API is ready to power your automotive intelligence needs! 🚀
