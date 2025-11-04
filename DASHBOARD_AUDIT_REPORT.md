# Dashboard End-to-End Audit Report

Generated: 2025-11-04T17:23:51.214Z

## Executive Summary

- **API Endpoints**: 12/12 connected
- **Components**: 6/6 working
- **Engines**: 5/5 connected

## API Endpoints Audit

| Endpoint | Method | Status | Used By |
|----------|--------|--------|---------|
| /api/dashboard/overview | GET | ✅ | lib/services/dashboard-data-service.ts |
| /api/dashboard/ai-health | GET | ✅ | lib/services/dashboard-data-service.ts |
| /api/dashboard/website | GET | ✅ | lib/services/dashboard-data-service.ts |
| /api/dashboard/reviews | GET | ✅ | lib/services/dashboard-data-service.ts |
| /api/visibility/seo | GET | ✅ | lib/services/dashboard-data-service.ts |
| /api/visibility/aeo | GET | ✅ | lib/services/dashboard-data-service.ts |
| /api/visibility/geo | GET | ✅ | lib/services/dashboard-data-service.ts |
| /api/ai/analysis | POST | ✅ | None |
| /api/ai/visibility-index | GET | ✅ | None |
| /api/user/profile | GET | ✅ | None |
| /api/user/subscription | GET | ✅ | None |
| /api/user/usage | GET | ✅ | None |

## Components Audit

| Component | Endpoints | Data Flow | Issues |
|-----------|-----------|-----------|--------|
| DealershipAIDashboardLA | None | ✅ | None |
| DAICognitiveDashboardModal | None | ✅ | None |
| HAL9000Chatbot | None | ✅ | None |
| CompetitiveComparisonWidget | /api/demo/competitor-comparison | ✅ | None |
| WhatIfRevenueCalculator | None | ✅ | None |
| QuickWinsWidget | None | ✅ | None |

## Engines Audit

| Engine | Status | Used In |
|--------|--------|---------|
| SecureScoringEngine | ✅ | lib/services/dashboard-data-service.ts |
| DTRIMaximusEngine | ✅ | lib/services/dashboard-data-service.ts |
| AlgorithmicFrameworkEngine | ✅ | None |
| ComprehensiveScoringEngine | ✅ | lib/services/dashboard-data-service.ts |
| calculateDealershipAIScore | ✅ | lib/services/dashboard-data-service.ts |

## Issues & Recommendations

⚠️ 5 endpoints are not being used
