# DealershipAI ADA API Demonstration

## 🚀 **ADA Job System Overview**

The DealershipAI ADA (Automated Data Analysis) system provides comprehensive job scheduling, monitoring, and management capabilities through a set of RESTful APIs.

## 📋 **Available API Endpoints**

### 1. **Trigger Manual Analysis**
**POST** `/api/ada/trigger`

Triggers a manual ADA analysis for a specific tenant and vertical.

**Request Body:**
```json
{
  "tenantId": "123e4567-e89b-12d3-a456-426614174000",
  "vertical": "sales",
  "priority": "high",
  "forceRefresh": true
}
```

**Response:**
```json
{
  "data": {
    "jobId": "manual-123e4567-e89b-12d3-a456-426614174000-sales-1704067200000",
    "tenantId": "123e4567-e89b-12d3-a456-426614174000",
    "vertical": "sales",
    "priority": "high",
    "forceRefresh": true,
    "status": "queued",
    "estimatedWaitTime": "2-5 minutes"
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "success"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/ada/trigger \
  -H "Content-Type: application/json" \
  -H "x-role: admin" \
  -d '{
    "tenantId": "123e4567-e89b-12d3-a456-426614174000",
    "vertical": "sales",
    "priority": "high",
    "forceRefresh": true
  }'
```

### 2. **Check Job Status**
**GET** `/api/ada/trigger?jobId={jobId}`

Retrieves the status of a specific ADA analysis job.

**Response:**
```json
{
  "data": {
    "jobId": "manual-123e4567-e89b-12d3-a456-426614174000-sales-1704067200000",
    "name": "manual-reanalysis",
    "state": "completed",
    "progress": 100,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "processedAt": "2024-01-01T12:00:30.000Z",
    "finishedAt": "2024-01-01T12:01:15.000Z",
    "result": {
      "tenantId": "123e4567-e89b-12d3-a456-426614174000",
      "vertical": "sales",
      "summaryScore": 85.5,
      "performanceDetractors": ["Low SEO score", "Missing schema markup"],
      "penalties": [
        {
          "metric": "seo",
          "penalty": 0.15,
          "reason": "Missing meta descriptions"
        }
      ],
      "enhancers": [
        {
          "action": "Add FAQ schema",
          "impact": 0.25,
          "effort": "low"
        }
      ],
      "processingTime": 45000,
      "dataPoints": 150
    },
    "error": null,
    "data": {
      "action": "reanalyze",
      "tenantId": "123e4567-e89b-12d3-a456-426614174000",
      "vertical": "sales",
      "priority": "high",
      "forceRefresh": true
    }
  },
  "timestamp": "2024-01-01T12:01:15.000Z",
  "status": "success"
}
```

**cURL Example:**
```bash
curl "http://localhost:3000/api/ada/trigger?jobId=manual-123e4567-e89b-12d3-a456-426614174000-sales-1704067200000" \
  -H "x-role: admin"
```

### 3. **Monitoring Dashboard**
**GET** `/api/ada/monitor`

Retrieves comprehensive monitoring data for the ADA system.

**Response:**
```json
{
  "data": {
    "overview": {
      "queueHealth": {
        "waiting": 5,
        "active": 2,
        "completed": 1247,
        "failed": 3,
        "stalled": 0
      },
      "performance": {
        "avgProcessingTime": 45000,
        "throughput": 12.5,
        "errorRate": 0.02
      },
      "schedules": {
        "active": 4,
        "total": 4,
        "nextRun": "2024-01-02T01:00:00.000Z"
      },
      "alerts": [
        {
          "type": "info",
          "message": "System running normally",
          "timestamp": "2024-01-01T12:00:00.000Z",
          "metadata": {}
        }
      ]
    },
    "statistics": {
      "recentJobs": [
        {
          "id": "job-123",
          "name": "reanalyze",
          "status": "completed",
          "createdAt": "2024-01-01T11:30:00.000Z",
          "processedAt": "2024-01-01T11:30:15.000Z",
          "finishedAt": "2024-01-01T11:31:00.000Z",
          "processingTime": 45000,
          "error": null
        }
      ],
      "performanceTrends": {
        "hourly": [
          {
            "hour": "2024-01-01T11",
            "completed": 3,
            "failed": 0
          }
        ],
        "daily": [
          {
            "day": "2024-01-01",
            "completed": 24,
            "failed": 1
          }
        ]
      }
    },
    "health": {
      "status": "healthy",
      "details": {
        "queueConnection": true,
        "schedulesActive": 4,
        "recentFailures": 3,
        "lastSuccessfulRun": "2024-01-01T11:30:00.000Z"
      }
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "success"
}
```

**cURL Example:**
```bash
curl "http://localhost:3000/api/ada/monitor" \
  -H "x-role: admin"
```

### 4. **Schedule Management**
**GET** `/api/ada/schedule`

Retrieves the status of all ADA job schedules.

**Response:**
```json
{
  "data": {
    "schedules": [
      {
        "name": "nightly-bulk-reanalysis",
        "cron": "0 1 * * *",
        "enabled": true,
        "nextRun": "2024-01-02T01:00:00.000Z",
        "lastRun": "2024-01-01T01:00:00.000Z",
        "status": "completed"
      },
      {
        "name": "priority-reanalysis",
        "cron": "0 */6 * * *",
        "enabled": true,
        "nextRun": "2024-01-01T18:00:00.000Z",
        "lastRun": "2024-01-01T12:00:00.000Z",
        "status": "completed"
      }
    ],
    "queueStats": {
      "waiting": 5,
      "active": 2,
      "completed": 1247,
      "failed": 3
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "success"
}
```

**cURL Example:**
```bash
curl "http://localhost:3000/api/ada/schedule" \
  -H "x-role: admin"
```

### 5. **Schedule Actions**
**POST** `/api/ada/schedule`

Performs actions on ADA job schedules.

**Trigger Schedule:**
```json
{
  "action": "trigger",
  "scheduleName": "nightly-bulk-reanalysis"
}
```

**Toggle Schedule:**
```json
{
  "action": "toggle",
  "scheduleName": "priority-reanalysis",
  "enabled": false
}
```

**Cleanup Jobs:**
```json
{
  "action": "cleanup"
}
```

**cURL Examples:**

Trigger Schedule:
```bash
curl -X POST http://localhost:3000/api/ada/schedule \
  -H "Content-Type: application/json" \
  -H "x-role: admin" \
  -d '{
    "action": "trigger",
    "scheduleName": "nightly-bulk-reanalysis"
  }'
```

Toggle Schedule:
```bash
curl -X POST http://localhost:3000/api/ada/schedule \
  -H "Content-Type: application/json" \
  -H "x-role: admin" \
  -d '{
    "action": "toggle",
    "scheduleName": "priority-reanalysis",
    "enabled": false
  }'
```

Cleanup Jobs:
```bash
curl -X POST http://localhost:3000/api/ada/schedule \
  -H "Content-Type: application/json" \
  -H "x-role: admin" \
  -d '{
    "action": "cleanup"
  }'
```

## 🔐 **Authentication & Authorization**

All ADA API endpoints require proper authentication headers:

- **`x-role: admin`** - Full access to all endpoints
- **`x-role: manager`** - Can trigger jobs and view status
- **`x-role: viewer`** - Read-only access to monitoring data

## 📊 **Job Priorities**

- **`high`** - Processed immediately (priority 10)
- **`normal`** - Standard processing (priority 5)
- **`low`** - Background processing (priority 1)

## ⏰ **Scheduled Jobs**

1. **Nightly Bulk Re-analysis** - `0 1 * * *` (1 AM daily)
2. **Priority Re-analysis** - `0 */6 * * *` (Every 6 hours)
3. **Weekly Deep Analysis** - `0 2 * * 0` (2 AM Sundays)
4. **Monthly Trend Analysis** - `0 3 1 * *` (3 AM on 1st of month)

## 🚨 **Error Handling**

All endpoints return consistent error responses:

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

Common error codes:
- `PERMISSION_DENIED` - Insufficient permissions
- `VALIDATION_ERROR` - Invalid request parameters
- `JOB_NOT_FOUND` - Job ID not found
- `SCHEDULE_ERROR` - Schedule operation failed
- `MONITOR_ERROR` - Monitoring system error

## 🎯 **Usage Examples**

### Complete Workflow Example:

1. **Trigger Analysis:**
```bash
JOB_ID=$(curl -s -X POST http://localhost:3000/api/ada/trigger \
  -H "Content-Type: application/json" \
  -H "x-role: admin" \
  -d '{"tenantId":"123e4567-e89b-12d3-a456-426614174000","vertical":"sales","priority":"high"}' \
  | jq -r '.data.jobId')
```

2. **Check Status:**
```bash
curl "http://localhost:3000/api/ada/trigger?jobId=$JOB_ID" \
  -H "x-role: admin"
```

3. **View Results:**
```bash
curl "http://localhost:3000/api/ada/monitor" \
  -H "x-role: admin"
```

## 🔧 **Development Setup**

To run the ADA system locally:

```bash
# Start mock ADA jobs (for testing)
npm run ada:mock

# Start full ADA system (requires Redis/Supabase)
npm run ada:start

# Test API endpoints
npm run ada:test
```

## 📈 **Monitoring & Alerting**

The system provides real-time monitoring with:
- Queue health metrics
- Performance statistics
- Error rate tracking
- Schedule status
- Automated alerts for issues

Integration with Slack and email notifications is supported through environment variables.
