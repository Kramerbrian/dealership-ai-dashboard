# DealershipAI Dashboard - Technical Integration Guide

## 🏗️ Architecture Overview

The DealershipAI Dashboard is built with modern web technologies and follows enterprise-grade patterns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│  DealershipAIDashboard.jsx  │  dashboard.css  │  Examples  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│  /api/dashboard  │  /api/leaderboard  │  /api/community    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend Services                          │
├─────────────────────────────────────────────────────────────┤
│  AI Scanner  │  Batch Processor  │  Cost Monitor  │  RAG   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                              │
├─────────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL)  │  Redis Cache  │  Vector Store   │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Component Architecture

### Core Component Structure

```jsx
DealershipAIDashboard
├── DashboardHeader
│   ├── Title & Description
│   ├── Refresh Button
│   └── Export Button
├── NavigationTabs
│   ├── Overview Tab
│   ├── Leaderboard Tab
│   ├── Community Tab
│   └── Analytics Tab
├── DashboardFilters
│   ├── Timeframe Selector
│   ├── Brand Filter
│   └── State Filter
└── DashboardContent
    ├── OverviewTab
    │   ├── MetricCards
    │   ├── OverallScore
    │   ├── RecentActivity
    │   └── Recommendations
    ├── LeaderboardTab
    │   └── RankingsTable
    ├── CommunityTab
    │   ├── CommunityMetrics
    │   └── CommunityInsights
    └── AnalyticsTab
        ├── ScoreTrends
        └── PlatformPerformance
```

## 📊 Data Flow

### 1. Data Fetching
```javascript
// Dashboard data fetching flow
useEffect(() => {
  fetchDashboardData();
}, [dealershipId, filters]);

const fetchDashboardData = async () => {
  const params = new URLSearchParams({
    dealershipId,
    timeframe: filters.timeframe,
    ...(filters.brand && { brand: filters.brand }),
    ...(filters.state && { state: filters.state })
  });

  const response = await fetch(`${apiBaseUrl}/dashboard?${params}`);
  const data = await response.json();
  
  if (data.success) {
    setDashboardData(data.data);
  }
};
```

### 2. State Management
```javascript
// Component state structure
const [dashboardData, setDashboardData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [activeTab, setActiveTab] = useState('overview');
const [filters, setFilters] = useState({
  timeframe: '30d',
  brand: '',
  state: ''
});
```

### 3. Error Handling
```javascript
// Comprehensive error handling
try {
  const response = await fetch(`${apiBaseUrl}/dashboard?${params}`);
  const data = await response.json();
  
  if (data.success) {
    setDashboardData(data.data);
  } else {
    setError(data.error || 'Failed to fetch dashboard data');
  }
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
}
```

## 🎨 Styling System

### CSS Architecture
```css
/* CSS Custom Properties */
:root {
  --primary-color: #2563eb;
  --secondary-color: #7c3aed;
  --success-color: #059669;
  --warning-color: #d97706;
  --error-color: #dc2626;
  --background-color: #ffffff;
  --surface-color: #f8fafc;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

/* Dark theme variables */
.dark {
  --background-color: #111827;
  --surface-color: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --border-color: #374151;
}
```

### Component Styling
```css
/* Metric card styling */
.metric-card {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.metric-card:hover::before {
  transform: scaleX(1);
}
```

## 🔌 API Integration

### Dashboard API Endpoint
```javascript
// GET /api/dashboard
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dealershipId = searchParams.get('dealershipId');
  const timeframe = searchParams.get('timeframe') || '30d';
  
  try {
    // Fetch dashboard data
    const dashboardData = await getDashboardData(dealershipId, timeframe);
    
    return NextResponse.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

### Data Structure
```javascript
// Dashboard data structure
const dashboardData = {
  metrics: {
    ai_visibility_trend: 5.2,
    zero_click_trend: -2.1,
    ugc_health_trend: 8.7,
    geo_trust_trend: 3.4
  },
  scores: {
    ai_visibility: 85,
    zero_click: 78,
    ugc_health: 92,
    geo_trust: 88,
    overall: 86
  },
  recent_activity: [
    {
      type: 'scan',
      message: 'Monthly AI visibility scan completed',
      timestamp: '2024-01-15T10:30:00Z'
    }
  ],
  recommendations: [
    {
      title: 'Improve FAQ Content',
      description: 'Add more detailed FAQ sections to increase zero-click visibility',
      priority: 'high'
    }
  ],
  leaderboard: [
    {
      id: 'dealer-1',
      name: 'Premier Toyota Sacramento',
      brand: 'Toyota',
      city: 'Sacramento',
      state: 'CA',
      visibility_score: 92,
      total_mentions: 45
    }
  ],
  community: {
    total_posts: 25,
    avg_sentiment: 0.7,
    engagement_rate: 0.15,
    insights: [
      {
        type: 'positive',
        title: 'Excellent Service Feedback',
        description: 'Customers consistently praise the service quality',
        confidence: 0.9
      }
    ]
  },
  analytics: {
    platforms: [
      { name: 'chatgpt', mentions: 15 },
      { name: 'claude', mentions: 12 },
      { name: 'perplexity', mentions: 8 }
    ]
  }
};
```

## 🚀 Performance Optimization

### 1. Lazy Loading
```javascript
// Lazy load dashboard components
const OverviewTab = lazy(() => import('./OverviewTab'));
const LeaderboardTab = lazy(() => import('./LeaderboardTab'));
const CommunityTab = lazy(() => import('./CommunityTab'));
const AnalyticsTab = lazy(() => import('./AnalyticsTab'));

// Use Suspense for loading states
<Suspense fallback={<div>Loading...</div>}>
  {activeTab === 'overview' && <OverviewTab data={dashboardData} />}
  {activeTab === 'leaderboard' && <LeaderboardTab data={dashboardData} />}
  {activeTab === 'community' && <CommunityTab data={dashboardData} />}
  {activeTab === 'analytics' && <AnalyticsTab data={dashboardData} />}
</Suspense>
```

### 2. Memoization
```javascript
// Memoize expensive calculations
const processedData = useMemo(() => {
  return processDashboardData(dashboardData);
}, [dashboardData]);

// Memoize components
const MetricCard = memo(({ title, value, max, icon: Icon, color, trend }) => {
  // Component implementation
});
```

### 3. Virtual Scrolling
```javascript
// For large leaderboard tables
import { FixedSizeList as List } from 'react-window';

const LeaderboardTable = ({ data }) => (
  <List
    height={600}
    itemCount={data.length}
    itemSize={60}
    itemData={data}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <LeaderboardRow dealer={data[index]} />
      </div>
    )}
  </List>
);
```

## 🔒 Security Implementation

### 1. Authentication
```javascript
// Check authentication before rendering
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const userData = await response.json();
      
      if (userData.success) {
        setUser(userData.user);
      } else {
        // Redirect to login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  checkAuth();
}, []);

if (loading) return <div>Loading...</div>;
if (!user) return <div>Unauthorized</div>;
```

### 2. Data Validation
```javascript
// Validate dashboard data
const validateDashboardData = (data) => {
  const schema = {
    metrics: {
      ai_visibility_trend: 'number',
      zero_click_trend: 'number',
      ugc_health_trend: 'number',
      geo_trust_trend: 'number'
    },
    scores: {
      ai_visibility: 'number',
      zero_click: 'number',
      ugc_health: 'number',
      geo_trust: 'number',
      overall: 'number'
    }
  };
  
  return validateSchema(data, schema);
};
```

### 3. XSS Protection
```javascript
// Sanitize user input
import DOMPurify from 'dompurify';

const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input);
};

// Use in components
const safeContent = sanitizeInput(userContent);
```

## 📱 Responsive Design

### Breakpoint System
```css
/* Mobile first approach */
.dashboard-container {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .dashboard-container {
    padding: 2rem;
  }
  
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .dashboard-container {
    padding: 3rem;
  }
  
  .metric-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Mobile Optimizations
```javascript
// Mobile-specific features
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };
  
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  return () => window.removeEventListener('resize', checkMobile);
}, []);

// Conditional rendering for mobile
{!isMobile && <LeaderboardTab data={dashboardData} />}
```

## 🧪 Testing Strategy

### 1. Unit Tests
```javascript
// Component testing
import { render, screen } from '@testing-library/react';
import DealershipAIDashboard from './DealershipAIDashboard';

test('renders dashboard with correct title', () => {
  render(
    <DealershipAIDashboard 
      dealershipId="test-dealer"
      dealershipName="Test Dealership"
    />
  );
  
  expect(screen.getByText('DealershipAI Dashboard')).toBeInTheDocument();
  expect(screen.getByText('AI Visibility Analytics for Test Dealership')).toBeInTheDocument();
});
```

### 2. Integration Tests
```javascript
// API integration testing
test('fetches dashboard data successfully', async () => {
  const mockData = {
    success: true,
    data: {
      scores: { overall: 85 },
      metrics: { ai_visibility_trend: 5.2 }
    }
  };
  
  global.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve(mockData)
  });
  
  render(<DealershipAIDashboard dealershipId="test-dealer" />);
  
  await waitFor(() => {
    expect(screen.getByText('85')).toBeInTheDocument();
  });
});
```

### 3. E2E Tests
```javascript
// End-to-end testing with Playwright
import { test, expect } from '@playwright/test';

test('dashboard loads and displays data', async ({ page }) => {
  await page.goto('/dashboard');
  
  await expect(page.locator('h1')).toContainText('DealershipAI Dashboard');
  await expect(page.locator('.metric-card')).toHaveCount(4);
  
  await page.click('[data-testid="leaderboard-tab"]');
  await expect(page.locator('.leaderboard-table')).toBeVisible();
});
```

## 🔧 Customization Guide

### 1. Theme Customization
```javascript
// Custom theme configuration
const customTheme = {
  colors: {
    primary: '#your-primary-color',
    secondary: '#your-secondary-color',
    success: '#your-success-color',
    warning: '#your-warning-color',
    error: '#your-error-color'
  },
  fonts: {
    primary: 'Your Custom Font',
    secondary: 'Your Secondary Font'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  }
};

// Apply custom theme
<DealershipAIDashboard 
  dealershipId="custom-dealer"
  dealershipName="Custom Dealership"
  theme={customTheme}
/>
```

### 2. Custom Components
```javascript
// Custom metric card component
const CustomMetricCard = ({ title, value, max, icon: Icon, color }) => {
  return (
    <div className="custom-metric-card">
      <div className="custom-metric-header">
        <Icon className="custom-metric-icon" />
        <h3 className="custom-metric-title">{title}</h3>
      </div>
      <div className="custom-metric-value">
        <span className="custom-metric-number">{value}</span>
        <span className="custom-metric-max">/{max}</span>
      </div>
      <div className="custom-metric-progress">
        <div 
          className="custom-metric-progress-bar"
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};
```

### 3. Custom API Integration
```javascript
// Custom data provider
const CustomDataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCustomData = async () => {
      try {
        // Your custom API call
        const response = await fetch('/api/custom-dashboard-data');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch custom data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomData();
  }, []);
  
  return (
    <DashboardContext.Provider value={{ data, loading }}>
      {children}
    </DashboardContext.Provider>
  );
};
```

## 📊 Monitoring & Analytics

### 1. Performance Monitoring
```javascript
// Performance tracking
const trackPerformance = (componentName, startTime) => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Send to analytics
  analytics.track('component_render_time', {
    component: componentName,
    duration: duration,
    timestamp: new Date().toISOString()
  });
};

// Use in components
const OverviewTab = ({ data }) => {
  const startTime = performance.now();
  
  useEffect(() => {
    trackPerformance('OverviewTab', startTime);
  }, []);
  
  // Component implementation
};
```

### 2. Error Tracking
```javascript
// Error boundary for dashboard
class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('Dashboard error:', error, errorInfo);
    
    // Send to error tracking service
    errorTracking.captureException(error, {
      extra: errorInfo,
      tags: {
        component: 'DealershipAIDashboard'
      }
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong with the dashboard.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] API keys validated
- [ ] Database schema updated
- [ ] Performance optimized
- [ ] Security reviewed

### Deployment
- [ ] Build successful
- [ ] Static assets optimized
- [ ] CDN configured
- [ ] SSL certificate valid
- [ ] Monitoring enabled
- [ ] Error tracking active

### Post-deployment
- [ ] Health checks passing
- [ ] API endpoints responding
- [ ] Dashboard loading correctly
- [ ] Real-time updates working
- [ ] Performance metrics normal
- [ ] User feedback collected

---

**Ready to integrate? Start with the basic example and customize as needed! 🚀**
