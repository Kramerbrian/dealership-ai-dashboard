# Audit Report Viewer System

## Overview

The **Audit Report Viewer System** displays, compares, and downloads post-deploy A/B performance data (PDF + CSV) directly inside your marketing or admin dashboard.

## Components

### 1. AuditReportViewer Component

**Location**: `/app/components/AuditReportViewer.tsx`

**Features**:
- Live metric table (CWV, CTR, Conversion, Lighthouse)
- CSV/PDF download buttons
- Trend chart (CTR vs Conversion Rate)
- Historical audit timeline
- Best performing variant highlight
- Color-coded performance indicators

**Usage**:
```tsx
import AuditReportViewer from '@/app/components/AuditReportViewer';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <AuditReportViewer />
    </div>
  );
}
```

### 2. API Routes

#### `/api/audit-history`

Returns the last 5 audit reports from `/public/audit-reports/`

**Response**:
```json
{
  "audits": [
    {
      "file": "abtest_metrics.csv",
      "modified": "2024-11-04T12:00:00.000Z",
      "url": "/audit-reports/abtest_metrics.csv"
    }
  ],
  "count": 5
}
```

## Routes

### Admin Audit Page
- **Route**: `/admin/audit`
- **Component**: `AuditReportViewer`
- **Access**: Admin dashboard

### Integration Options

#### Option 1: Standalone Admin Page (✅ Created)
```tsx
// app/admin/audit/page.tsx
import AuditReportViewer from '@/app/components/AuditReportViewer';

export default function AuditAdminPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <AuditReportViewer />
    </div>
  );
}
```

#### Option 2: Integrate into Main Dashboard
Add to `DealershipAIDashboardLA.tsx` in Settings tab or create new "Audit Reports" tab.

#### Option 3: Marketing Dashboard Integration
Add to marketing/admin dashboard if you have one.

## File Structure

```
public/
└── audit-reports/
    ├── abtest_metrics.csv      # Latest CSV report
    ├── abtest_report.pdf        # Latest PDF report
    └── [historical reports]     # Previous reports

app/
├── components/
│   └── AuditReportViewer.tsx   # Main component
├── admin/
│   └── audit/
│       └── page.tsx            # Admin audit page
└── api/
    └── audit-history/
        └── route.ts            # History API
```

## Data Format

### CSV Format (abtest_metrics.csv)
```csv
Variant,LCP(s),CLS,INP(s),PerfScore,CTR,ConversionRate
fear,2.3,0.05,180,95,0.08,0.04
power,2.1,0.03,165,97,0.12,0.06
innovate,2.4,0.04,190,93,0.09,0.05
boardroom,2.2,0.03,170,96,0.11,0.07
```

### Metrics Explained

- **LCP (Largest Contentful Paint)**: < 2.5s (good), < 4s (needs improvement), > 4s (poor)
- **CLS (Cumulative Layout Shift)**: < 0.1 (good), < 0.25 (needs improvement), > 0.25 (poor)
- **INP (Interaction to Next Paint)**: < 200ms (good), < 500ms (needs improvement), > 500ms (poor)
- **Perf Score**: Lighthouse performance score (0-100)
- **CTR**: Click-through rate (0-1, displayed as percentage)
- **Conversion Rate**: Conversion rate (0-1, displayed as percentage)

## Workflow Integration

### 1. CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/abtest-deploy.yml`) generates reports automatically:

```yaml
- name: Generate Audit Report
  run: node scripts/generate-report.js
```

### 2. Report Generation

The `scripts/generate-report.js` script:
1. Fetches metrics from Google PageSpeed Insights
2. Generates CSV file
3. Generates PDF report
4. Saves to `/public/audit-reports/`

### 3. Viewing Reports

Users can access reports via:
- **Admin Dashboard**: `/admin/audit`
- **Direct URLs**: `/audit-reports/abtest_metrics.csv` or `/audit-reports/abtest_report.pdf`

## Features

### Visual Indicators

- **Color-coded metrics**: Green (good), Yellow (needs improvement), Red (poor)
- **Best variant highlight**: Shows which variant performed best
- **Trend visualization**: Line chart comparing CTR vs Conversion Rate

### Download Options

- **CSV Download**: Raw data for analysis
- **PDF Download**: Formatted report for sharing
- **Historical Reports**: Access to previous audit reports

### Performance

- **Automatic refresh**: Reloads data when component mounts
- **Error handling**: Graceful fallbacks for missing data
- **Loading states**: User-friendly loading indicators

## Security Considerations

- Reports are stored in `/public/audit-reports/` (publicly accessible)
- Consider adding authentication for admin routes
- API routes should validate admin access
- Consider rate limiting for report generation

## Future Enhancements

1. **Slack Notifications**: Alert when variant outperforms by >10%
2. **Email Reports**: Automated email delivery
3. **Real-time Updates**: WebSocket integration for live metrics
4. **Comparison Tools**: Compare multiple audit periods
5. **Export Formats**: Additional formats (JSON, Excel)
6. **Analytics Integration**: Track report views and downloads

## Testing

1. Generate a test report: `node scripts/generate-report.js`
2. Visit `/admin/audit` to view the report
3. Test CSV/PDF downloads
4. Verify historical reports load correctly

## Notes

- The component uses `recharts` for chart visualization
- Styled with Tailwind CSS and shadcn/ui components
- Responsive design for mobile and desktop
- Accessible with proper ARIA labels

