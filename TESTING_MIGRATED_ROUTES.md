# Testing Migrated API Routes

This document provides instructions for testing the routes that have been migrated to the new security middleware.

## Migration Status

**Total Routes:** 136  
**Migrated:** 19 (14.0%)  
**Remaining:** 117

## Migrated Routes to Test

### ✅ Public Routes (No Auth Required)

1. **`GET /api/health`**
   - Status: ✅ Migrated
   - Expected: 200 OK with health data
   - Test: `curl http://localhost:3000/api/health`

2. **`POST /api/analyze`**
   - Status: ✅ Migrated
   - Body: `{ revenue: 100000, marketSize: "medium", competition: "moderate", visibility: 75 }`
   - Expected: 200 OK with ROI analysis
   - Test: `curl -X POST http://localhost:3000/api/analyze -H "Content-Type: application/json" -d '{"revenue":100000,"marketSize":"medium","competition":"moderate","visibility":75}'`

3. **`POST /api/onboarding/analyze`**
   - Status: ✅ Migrated
   - Body: `{ domain: "test-dealership.com" }`
   - Expected: 200 OK with analysis data
   - Test: `curl -X POST http://localhost:3000/api/onboarding/analyze -H "Content-Type: application/json" -d '{"domain":"test-dealership.com"}'`

4. **`GET /api/ai/visibility-index?domain=test.com`**
   - Status: ✅ Migrated
   - Query: `domain` or `dealerId` (at least one required)
   - Expected: 200 OK with visibility data
   - Test: `curl "http://localhost:3000/api/ai/visibility-index?domain=test.com"`

5. **`POST /api/ai/visibility-index`**
   - Status: ✅ Migrated
   - Body: `{ domain: "test.com", action: "calculate" }`
   - Expected: 200 OK with job ID
   - Test: `curl -X POST http://localhost:3000/api/ai/visibility-index -H "Content-Type: application/json" -d '{"domain":"test.com","action":"calculate"}'`

6. **`POST /api/ai/analysis`**
   - Status: ✅ Migrated
   - Body: `{ domain: "test-dealership.com" }`
   - Expected: 200 OK with AI analysis
   - Test: `curl -X POST http://localhost:3000/api/ai/analysis -H "Content-Type: application/json" -d '{"domain":"test-dealership.com"}'`

7. **`GET /api/stripe/verify-session?session_id=test_session`**
   - Status: ✅ Migrated
   - Query: `session_id` (required)
   - Expected: 400/503 (if Stripe not configured) or 200 if valid
   - Test: `curl "http://localhost:3000/api/stripe/verify-session?session_id=test_session"`

### ✅ Authenticated Routes (Auth Required)

8. **`GET /api/user/profile`**
   - Status: ✅ Migrated
   - Auth: Required
   - Expected: 401 Unauthorized without auth, 200 OK with auth
   - Test with auth token: `curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/user/profile`

9. **`PUT /api/user/profile`**
   - Status: ✅ Migrated
   - Auth: Required
   - Body: `{ firstName: "Test", lastName: "User", email: "test@example.com" }`
   - Expected: 401 without auth, 200 with valid body
   - Test: `curl -X PUT http://localhost:3000/api/user/profile -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"firstName":"Test","lastName":"User","email":"test@example.com"}'`

10. **`GET /api/user/subscription`**
    - Status: ✅ Migrated
    - Auth: Required
    - Expected: 401 without auth, 200 with subscription data
    - Test: `curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/user/subscription`

11. **`POST /api/user/subscription`**
    - Status: ✅ Migrated
    - Auth: Required
    - Body: `{ plan: "professional" }`
    - Expected: 401 without auth, 200 with checkout URL
    - Test: `curl -X POST http://localhost:3000/api/user/subscription -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"plan":"professional"}'`

12. **`GET /api/user/usage?feature=analysis`**
    - Status: ✅ Migrated
    - Auth: Required
    - Query: `feature` (optional)
    - Expected: 401 without auth, 200 with usage stats
    - Test: `curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:3000/api/user/usage?feature=analysis"`

13. **`POST /api/user/usage`**
    - Status: ✅ Migrated
    - Auth: Required
    - Body: `{ feature: "analysis", metadata: {} }`
    - Expected: 401 without auth, 200 with remaining usage
    - Test: `curl -X POST http://localhost:3000/api/user/usage -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"feature":"analysis"}'`

14. **`GET /api/dashboard/overview?timeRange=30d`**
    - Status: ✅ Migrated
    - Auth: Required
    - Query: `timeRange` (optional: 7d, 30d, 90d, 1y)
    - Expected: 401 without auth, 200 with dashboard data
    - Test: `curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:3000/api/dashboard/overview?timeRange=30d"`

15. **`GET /api/dashboard/ai-health?timeRange=30d`**
    - Status: ✅ Migrated
    - Auth: Required
    - Query: `timeRange` (optional)
    - Expected: 401 without auth, 200 with AI health data
    - Test: `curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:3000/api/dashboard/ai-health?timeRange=30d"`

16. **`GET /api/dashboard/website?timeRange=30d`**
    - Status: ✅ Migrated
    - Auth: Required
    - Query: `domain` (optional), `timeRange` (optional)
    - Expected: 401 without auth, 200 with website data
    - Test: `curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:3000/api/dashboard/website?timeRange=30d"`

17. **`GET /api/dashboard/reviews?timeRange=30d`**
    - Status: ✅ Migrated
    - Auth: Required
    - Query: `timeRange` (optional), `source` (optional)
    - Expected: 401 without auth, 200 with reviews data
    - Test: `curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:3000/api/dashboard/reviews?timeRange=30d"`

18. **`GET /api/onboarding/status`**
    - Status: ✅ Migrated
    - Auth: Required
    - Expected: 401 without auth, 200 with onboarding status
    - Test: `curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/onboarding/status`

19. **`GET /api/onboarding/session?session_id=test_session`**
    - Status: ✅ Migrated
    - Auth: Required
    - Query: `session_id` (required)
    - Expected: 401 without auth, 400 if session invalid, 200 if valid
    - Test: `curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:3000/api/onboarding/session?session_id=test_session"`

20. **`POST /api/ai/predictive-analytics`**
    - Status: ✅ Migrated
    - Auth: Required
    - Body: `{ vin: "TEST123", historicalData: {}, marketConditions: {} }`
    - Expected: 401 without auth, 200 with predictions
    - Test: `curl -X POST http://localhost:3000/api/ai/predictive-analytics -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"vin":"TEST123"}'`

### ✅ Webhook Routes (Signature Verification)

21. **`POST /api/stripe/webhook`**
    - Status: ✅ Migrated
    - Headers: `stripe-signature` (required)
    - Expected: 400 if signature invalid, 200 if valid
    - Note: Requires Stripe webhook secret configured

22. **`POST /api/webhooks/clerk`**
    - Status: ✅ Migrated
    - Headers: `svix-id`, `svix-timestamp`, `svix-signature` (required)
    - Expected: 400 if signature invalid, 200 if valid
    - Note: Requires Clerk webhook secret configured

### ✅ Automation Routes (Dynamic Params)

23. **`POST /api/automation/tasks/{id}/execute`**
    - Status: ✅ Migrated
    - Auth: Required
    - Params: `id` (task ID)
    - Expected: 401 without auth, 404 if task not found, 200 if executed
    - Test: `curl -X POST http://localhost:3000/api/automation/tasks/test-task-id/execute -H "Authorization: Bearer YOUR_TOKEN"`

24. **`POST /api/automation/tasks/{id}/reject`**
    - Status: ✅ Migrated
    - Auth: Required
    - Params: `id` (task ID)
    - Expected: 401 without auth, 404 if task not found, 200 if rejected
    - Test: `curl -X POST http://localhost:3000/api/automation/tasks/test-task-id/reject -H "Authorization: Bearer YOUR_TOKEN"`

## Testing Checklist

### ✅ Validation Testing

- [ ] Test routes with missing required fields → Should return 400
- [ ] Test routes with invalid data types → Should return 400
- [ ] Test routes with invalid enum values → Should return 400
- [ ] Test routes with malformed JSON → Should return 400

### ✅ Authentication Testing

- [ ] Test authenticated routes without auth token → Should return 401
- [ ] Test authenticated routes with invalid token → Should return 401
- [ ] Test authenticated routes with valid token → Should return 200/expected status

### ✅ Rate Limiting Testing

- [ ] Test rapid requests to same endpoint → Should return 429 after limit
- [ ] Test different endpoints → Should not affect each other
- [ ] Test after rate limit window expires → Should work again

### ✅ Error Handling Testing

- [ ] Test routes that throw errors → Should return 500 with structured error
- [ ] Test routes with database errors → Should handle gracefully
- [ ] Test routes with missing dependencies → Should return 503

### ✅ Performance Testing

- [ ] Check response times are reasonable (< 1s for most routes)
- [ ] Check Server-Timing headers are present
- [ ] Check performance monitoring is active

### ✅ Caching Testing

- [ ] Test GET routes return cache headers
- [ ] Test cache invalidation works
- [ ] Test stale-while-revalidate behavior

## Quick Test Script

Run this to test all migrated routes:

```bash
# Test public routes
curl http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/analyze -H "Content-Type: application/json" -d '{"revenue":100000,"marketSize":"medium","competition":"moderate","visibility":75}'

# Test authenticated routes (replace YOUR_TOKEN with actual token)
export TOKEN="YOUR_TOKEN"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/user/profile
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3000/api/dashboard/overview?timeRange=30d"

# Test validation errors
curl -X POST http://localhost:3000/api/analyze -H "Content-Type: application/json" -d '{"revenue":-100}'  # Should return 400
curl -X POST http://localhost:3000/api/user/usage -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}'  # Should return 400
```

## Expected Behaviors

### ✅ Success Responses
- Should include `success: true` in response body
- Should have appropriate status codes (200, 201, etc.)
- Should include request metadata when applicable

### ✅ Error Responses
- Should include `success: false` in response body
- Should have structured error messages
- Should include `requestId` for tracking
- Should have appropriate status codes (400, 401, 403, 404, 429, 500, 503)

### ✅ Headers
- Should include `X-Request-ID` in responses
- Should include `Server-Timing` for performance monitoring
- Should include cache headers for GET requests
- Should include `Content-Type: application/json`

## Notes

1. **Authentication**: In development, you may need to mock auth tokens or use Clerk's test tokens
2. **Stripe/Clerk Webhooks**: These require proper webhook secrets configured
3. **Database**: Some routes require database connection (Prisma)
4. **Rate Limiting**: Uses Upstash Redis - ensure Redis is configured
5. **Performance Monitoring**: Should log to your monitoring service

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check auth token is valid and properly formatted
2. **400 Bad Request**: Check request body matches schema requirements
3. **429 Too Many Requests**: Rate limit exceeded - wait and retry
4. **500 Internal Server Error**: Check server logs for detailed error
5. **503 Service Unavailable**: Check if required services (Redis, DB) are running

### Debug Mode

Enable debug logging by setting:
```bash
export DEBUG=true
export LOG_LEVEL=debug
```

Then check logs for detailed request/response information.

