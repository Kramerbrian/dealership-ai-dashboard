# API Reference - DealershipAI Platform

## Authentication

All API endpoints require authentication via Clerk. Include the authentication token in the Authorization header:

```
Authorization: Bearer <your_clerk_token>
```

## Base URL

- **Development:** `http://localhost:3001`
- **Production:** `https://your-domain.com`

---

## Dealerships API

### List Dealerships

**Endpoint:** `GET /api/dealerships`

**Description:** Get all dealerships for the authenticated user's tenant.

**Query Parameters:**
- None

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "name": "Downtown Honda",
      "domain": "downtownhonda.com",
      "location": {
        "address": "123 Main St",
        "city": "Boston",
        "state": "MA",
        "zip": "02101"
      },
      "contact_email": "info@downtownhonda.com",
      "status": "active",
      "settings": {},
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

**Permissions:**
- All authenticated users can list dealerships in their tenant

---

### Get Single Dealership

**Endpoint:** `GET /api/dealerships/:id`

**Description:** Get details for a specific dealership.

**Path Parameters:**
- `id` (string, required) - Dealership UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenant_id": "uuid",
    "name": "Downtown Honda",
    "domain": "downtownhonda.com",
    "location": {},
    "contact_email": "info@downtownhonda.com",
    "status": "active",
    "settings": {},
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

---

### Create Dealership

**Endpoint:** `POST /api/dealerships`

**Description:** Create a new dealership.

**Permissions:**
- `super_admin`, `enterprise_admin`, `dealership_admin`

**Request Body:**
```json
{
  "name": "Suburban Toyota",
  "domain": "suburbantoyota.com",
  "location": {
    "address": "456 Oak Ave",
    "city": "Cambridge",
    "state": "MA",
    "zip": "02139"
  },
  "contact_email": "contact@suburbantoyota.com",
  "settings": {
    "timezone": "America/New_York"
  }
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenant_id": "uuid",
    "name": "Suburban Toyota",
    ...
  }
}
```

---

### Update Dealership

**Endpoint:** `PATCH /api/dealerships/:id`

**Description:** Update an existing dealership.

**Permissions:**
- `super_admin`, `enterprise_admin`, `dealership_admin`

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "domain": "newdomain.com",
  "status": "inactive",
  "settings": {
    "timezone": "America/Los_Angeles"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    ...updated fields...
  }
}
```

---

### Delete Dealership

**Endpoint:** `DELETE /api/dealerships/:id`

**Description:** Delete a dealership.

**Permissions:**
- `super_admin`, `enterprise_admin`

**Response:**
```json
{
  "success": true,
  "message": "Dealership deleted successfully"
}
```

---

## Audits API

### List Audits

**Endpoint:** `GET /api/audits`

**Description:** Get AI visibility audits for the authenticated user's tenant.

**Query Parameters:**
- `dealership_id` (string, optional) - Filter by dealership
- `limit` (number, optional) - Results per page (default: 50)
- `offset` (number, optional) - Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "dealership_id": "uuid",
      "dealerships": {
        "name": "Downtown Honda",
        "domain": "downtownhonda.com"
      },
      "audit_type": "full",
      "scan_date": "2025-01-15T10:00:00Z",
      "ai_visibility_score": 85.5,
      "seo_score": 78.2,
      "search_performance": {
        "queries_found": 150,
        "avg_position": 3.2
      },
      "ai_mentions": [
        {
          "source": "ChatGPT",
          "query": "best honda dealer in boston",
          "mentioned": true
        }
      ],
      "citation_analysis": {},
      "competitor_comparison": {},
      "recommendations_summary": {
        "high_priority": 3,
        "medium_priority": 5,
        "low_priority": 2
      },
      "status": "completed",
      "metadata": {},
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "count": 1,
  "limit": 50,
  "offset": 0
}
```

---

### Get Single Audit

**Endpoint:** `GET /api/audits/:id`

**Description:** Get detailed information about a specific audit.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "dealership_id": "uuid",
    "dealerships": {
      "id": "uuid",
      "name": "Downtown Honda",
      "domain": "downtownhonda.com",
      "location": {},
      "contact_email": "info@downtownhonda.com"
    },
    "audit_type": "full",
    "scan_date": "2025-01-15T10:00:00Z",
    "ai_visibility_score": 85.5,
    ...full audit data...
  }
}
```

---

### Create Audit

**Endpoint:** `POST /api/audits`

**Description:** Create a new AI visibility audit.

**Permissions:**
- `super_admin`, `enterprise_admin`, `dealership_admin`

**Request Body:**
```json
{
  "dealership_id": "uuid",
  "audit_type": "full",
  "ai_visibility_score": 85.5,
  "seo_score": 78.2,
  "search_performance": {
    "queries_found": 150,
    "avg_position": 3.2
  },
  "ai_mentions": [
    {
      "source": "ChatGPT",
      "query": "best honda dealer in boston",
      "mentioned": true,
      "position": 2
    }
  ],
  "citation_analysis": {
    "total_citations": 25,
    "unique_sources": 8
  },
  "competitor_comparison": {
    "dealerships_analyzed": 5,
    "rank": 2
  },
  "recommendations_summary": {
    "high_priority": 3,
    "medium_priority": 5,
    "low_priority": 2
  },
  "metadata": {
    "scan_duration_seconds": 45
  }
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    ...audit data...
  }
}
```

---

### Update Audit

**Endpoint:** `PATCH /api/audits/:id`

**Description:** Update audit status or metadata.

**Permissions:**
- `super_admin`, `enterprise_admin`, `dealership_admin`

**Request Body:**
```json
{
  "status": "completed",
  "metadata": {
    "reviewed": true,
    "reviewer": "john@example.com"
  }
}
```

---

### Delete Audit

**Endpoint:** `DELETE /api/audits/:id`

**Description:** Delete an audit.

**Permissions:**
- `super_admin`, `enterprise_admin`

---

## Recommendations API

### List Recommendations

**Endpoint:** `GET /api/recommendations`

**Description:** Get optimization recommendations for the authenticated user's tenant.

**Query Parameters:**
- `dealership_id` (string, optional) - Filter by dealership
- `audit_id` (string, optional) - Filter by audit
- `category` (string, optional) - Filter by category (seo, content, technical, ai_optimization, citations)
- `priority` (string, optional) - Filter by priority (high, medium, low)
- `status` (string, optional) - Filter by status (pending, in_progress, completed, dismissed)
- `limit` (number, optional) - Results per page (default: 50)
- `offset` (number, optional) - Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "dealership_id": "uuid",
      "audit_id": "uuid",
      "dealerships": {
        "name": "Downtown Honda",
        "domain": "downtownhonda.com"
      },
      "category": "seo",
      "title": "Optimize title tags for AI search",
      "description": "Current title tags are not optimized for AI-powered search engines...",
      "priority": "high",
      "estimated_impact": {
        "visibility_increase": "15-20%",
        "time_to_implement": "2 hours"
      },
      "implementation_steps": [
        "Review current title tags",
        "Research AI-friendly title formats",
        "Update title tags on key pages",
        "Monitor AI mention rates"
      ],
      "resources": [
        {
          "type": "article",
          "title": "AI-Optimized Title Tags Guide",
          "url": "https://example.com/guide"
        }
      ],
      "status": "pending",
      "assigned_to": null,
      "due_date": null,
      "completed_at": null,
      "metadata": {},
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "count": 1,
  "limit": 50,
  "offset": 0
}
```

---

### Get Single Recommendation

**Endpoint:** `GET /api/recommendations/:id`

**Description:** Get detailed information about a specific recommendation.

---

### Create Recommendation

**Endpoint:** `POST /api/recommendations`

**Description:** Create a new optimization recommendation.

**Permissions:**
- `super_admin`, `enterprise_admin`, `dealership_admin`

**Request Body:**
```json
{
  "dealership_id": "uuid",
  "audit_id": "uuid",
  "category": "seo",
  "title": "Improve site speed for AI crawlers",
  "description": "Page load times are affecting AI crawler indexing...",
  "priority": "high",
  "estimated_impact": {
    "visibility_increase": "10-15%",
    "time_to_implement": "4 hours"
  },
  "implementation_steps": [
    "Analyze current page speed",
    "Optimize images",
    "Enable caching",
    "Minify CSS/JS"
  ],
  "resources": [
    {
      "type": "tool",
      "title": "PageSpeed Insights",
      "url": "https://pagespeed.web.dev"
    }
  ],
  "assigned_to": "john@example.com",
  "due_date": "2025-02-01T00:00:00Z"
}
```

**Response:** (201 Created)

---

### Update Recommendation

**Endpoint:** `PATCH /api/recommendations/:id`

**Description:** Update a recommendation (status, assignee, etc.).

**Request Body:**
```json
{
  "status": "in_progress",
  "assigned_to": "jane@example.com",
  "metadata": {
    "progress": "50%",
    "notes": "Working on image optimization"
  }
}
```

---

### Delete Recommendation

**Endpoint:** `DELETE /api/recommendations/:id`

**Description:** Delete a recommendation.

**Permissions:**
- `super_admin`, `enterprise_admin`, `dealership_admin`

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Authenticated requests:** 100 requests per 15 minutes
- **Unauthenticated requests:** 10 requests per 15 minutes

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1674567890
```

---

## Webhooks

The platform supports webhooks for real-time notifications:

### Available Events
- `audit.completed` - Fired when an audit completes
- `recommendation.created` - Fired when a new recommendation is created
- `dealership.created` - Fired when a new dealership is added

### Webhook Payload Example
```json
{
  "event": "audit.completed",
  "timestamp": "2025-01-15T10:00:00Z",
  "data": {
    "audit_id": "uuid",
    "dealership_id": "uuid",
    "ai_visibility_score": 85.5
  }
}
```

---

## Testing

### Using the Test Script

Run the automated test script:
```bash
./test-api-endpoints.sh
```

### Using cURL

```bash
# Get dealerships
curl -X GET http://localhost:3001/api/dealerships \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create an audit
curl -X POST http://localhost:3001/api/audits \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dealership_id": "uuid",
    "ai_visibility_score": 85.5
  }'
```

### Using Postman

Import the API collection:
1. Download the Postman collection (if available)
2. Import into Postman
3. Set the `base_url` variable to `http://localhost:3001`
4. Set the `auth_token` variable to your Clerk token

---

## Additional Resources

- **Setup Guide:** See `SUPABASE_SETUP_GUIDE.md`
- **RLS Testing:** See `test-rls-policies.ts`
- **Database Schema:** See `schema.sql`
