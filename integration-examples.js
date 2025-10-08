/**
 * DealershipAI Dashboard Integration Examples
 * 8 ready-to-use patterns for different scenarios
 */

import DealershipAIDashboard from './DealershipAIDashboard.jsx';

// Example 1: Basic Integration
export const BasicIntegration = () => {
  return (
    <DealershipAIDashboard 
      dealershipId="demo-dealer"
      dealershipName="Demo Dealership"
    />
  );
};

// Example 2: Custom API Endpoint
export const CustomAPIEndpoint = () => {
  return (
    <DealershipAIDashboard 
      dealershipId="custom-dealer"
      dealershipName="Custom Dealership"
      apiBaseUrl="https://api.yourdomain.com"
    />
  );
};

// Example 3: Dark Theme
export const DarkTheme = () => {
  return (
    <DealershipAIDashboard 
      dealershipId="dark-dealer"
      dealershipName="Dark Theme Dealership"
      theme="dark"
    />
  );
};

// Example 4: Minimal Features
export const MinimalFeatures = () => {
  return (
    <DealershipAIDashboard 
      dealershipId="minimal-dealer"
      dealershipName="Minimal Dealership"
      showLeaderboard={false}
      showCommunity={false}
      showAnalytics={false}
    />
  );
};

// Example 5: Full Features with Custom Styling
export const FullFeaturesCustom = () => {
  return (
    <div className="custom-dashboard-wrapper">
      <style jsx>{`
        .custom-dashboard-wrapper {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 2rem;
        }
      `}</style>
      <DealershipAIDashboard 
        dealershipId="full-dealer"
        dealershipName="Full Features Dealership"
        showLeaderboard={true}
        showCommunity={true}
        showAnalytics={true}
      />
    </div>
  );
};

// Example 6: Embedded in Existing Layout
export const EmbeddedLayout = () => {
  return (
    <div className="existing-layout">
      <header className="site-header">
        <h1>My Dealership Website</h1>
        <nav>...</nav>
      </header>
      
      <main className="site-main">
        <aside className="sidebar">
          <h2>Navigation</h2>
          <ul>
            <li>Dashboard</li>
            <li>Inventory</li>
            <li>Services</li>
          </ul>
        </aside>
        
        <section className="content">
          <DealershipAIDashboard 
            dealershipId="embedded-dealer"
            dealershipName="Embedded Dealership"
          />
        </section>
      </main>
      
      <footer className="site-footer">
        <p>&copy; 2024 My Dealership</p>
      </footer>
    </div>
  );
};

// Example 7: Multi-Dealership Dashboard
export const MultiDealershipDashboard = () => {
  const [selectedDealer, setSelectedDealer] = useState('dealer-1');
  
  const dealers = [
    { id: 'dealer-1', name: 'Downtown Toyota' },
    { id: 'dealer-2', name: 'Suburban Honda' },
    { id: 'dealer-3', name: 'Mall Ford' },
  ];
  
  const currentDealer = dealers.find(d => d.id === selectedDealer);
  
  return (
    <div className="multi-dealership">
      <div className="dealer-selector">
        <h2>Select Dealership</h2>
        <select 
          value={selectedDealer} 
          onChange={(e) => setSelectedDealer(e.target.value)}
        >
          {dealers.map(dealer => (
            <option key={dealer.id} value={dealer.id}>
              {dealer.name}
            </option>
          ))}
        </select>
      </div>
      
      <DealershipAIDashboard 
        dealershipId={selectedDealer}
        dealershipName={currentDealer?.name || 'Unknown Dealership'}
      />
    </div>
  );
};

// Example 8: Real-time Updates with WebSocket
export const RealTimeDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // WebSocket connection for real-time updates
    const ws = new WebSocket('wss://api.yourdomain.com/ws');
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setDashboardData(data);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };
    
    return () => ws.close();
  }, []);
  
  return (
    <div className="realtime-dashboard">
      <div className="connection-status">
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>
      
      <DealershipAIDashboard 
        dealershipId="realtime-dealer"
        dealershipName="Real-time Dealership"
        dashboardData={dashboardData}
      />
    </div>
  );
};

// Example 9: Custom Data Provider
export const CustomDataProvider = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Custom data fetching logic
    const fetchCustomData = async () => {
      try {
        const response = await fetch('/api/custom-dashboard-data');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomData();
  }, []);
  
  if (loading) {
    return <div>Loading custom data...</div>;
  }
  
  return (
    <DealershipAIDashboard 
      dealershipId="custom-data-dealer"
      dealershipName="Custom Data Dealership"
      dashboardData={data}
    />
  );
};

// Example 10: Conditional Rendering Based on User Role
export const RoleBasedDashboard = () => {
  const [userRole, setUserRole] = useState('user');
  
  // Simulate user role detection
  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'user';
    setUserRole(role);
  }, []);
  
  const getDashboardConfig = (role) => {
    switch (role) {
      case 'admin':
        return {
          showLeaderboard: true,
          showCommunity: true,
          showAnalytics: true,
        };
      case 'manager':
        return {
          showLeaderboard: true,
          showCommunity: true,
          showAnalytics: false,
        };
      case 'user':
      default:
        return {
          showLeaderboard: false,
          showCommunity: false,
          showAnalytics: false,
        };
    }
  };
  
  const config = getDashboardConfig(userRole);
  
  return (
    <div className="role-based-dashboard">
      <div className="user-info">
        <p>Logged in as: <strong>{userRole}</strong></p>
      </div>
      
      <DealershipAIDashboard 
        dealershipId="role-based-dealer"
        dealershipName="Role-based Dealership"
        {...config}
      />
    </div>
  );
};

// Example 11: Mobile-Optimized Dashboard
export const MobileOptimized = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div className={`mobile-dashboard ${isMobile ? 'mobile' : 'desktop'}`}>
      <DealershipAIDashboard 
        dealershipId="mobile-dealer"
        dealershipName="Mobile Dealership"
        showLeaderboard={!isMobile} // Hide leaderboard on mobile
        showCommunity={true}
        showAnalytics={!isMobile} // Hide analytics on mobile
      />
    </div>
  );
};

// Example 12: Dashboard with Custom Event Handlers
export const CustomEventHandlers = () => {
  const handleDealerSelect = (dealerId) => {
    console.log('Dealer selected:', dealerId);
    // Custom logic for dealer selection
  };
  
  const handleFilterChange = (filters) => {
    console.log('Filters changed:', filters);
    // Custom logic for filter changes
  };
  
  const handleExport = (data) => {
    console.log('Export requested:', data);
    // Custom export logic
  };
  
  return (
    <DealershipAIDashboard 
      dealershipId="event-handler-dealer"
      dealershipName="Event Handler Dealership"
      onDealerSelect={handleDealerSelect}
      onFilterChange={handleFilterChange}
      onExport={handleExport}
    />
  );
};

// Export all examples
export const examples = {
  BasicIntegration,
  CustomAPIEndpoint,
  DarkTheme,
  MinimalFeatures,
  FullFeaturesCustom,
  EmbeddedLayout,
  MultiDealershipDashboard,
  RealTimeDashboard,
  CustomDataProvider,
  RoleBasedDashboard,
  MobileOptimized,
  CustomEventHandlers,
};

// Usage instructions
export const usageInstructions = `
DealershipAI Dashboard Integration Examples

1. Basic Integration:
   - Simple drop-in component
   - Uses default settings
   - Perfect for quick setup

2. Custom API Endpoint:
   - Point to your own API
   - Custom data source
   - Full control over data

3. Dark Theme:
   - Dark mode styling
   - Better for low-light environments
   - Modern appearance

4. Minimal Features:
   - Hide unnecessary tabs
   - Focus on core functionality
   - Cleaner interface

5. Full Features Custom:
   - All features enabled
   - Custom styling wrapper
   - Maximum functionality

6. Embedded Layout:
   - Integrate into existing site
   - Maintain site structure
   - Seamless integration

7. Multi-Dealership:
   - Switch between dealers
   - Manage multiple locations
   - Centralized dashboard

8. Real-time Updates:
   - WebSocket integration
   - Live data updates
   - Connection status

9. Custom Data Provider:
   - Custom data fetching
   - External data sources
   - Flexible data handling

10. Role-based Dashboard:
    - User permission system
    - Feature access control
    - Security-focused

11. Mobile Optimized:
    - Responsive design
    - Mobile-specific features
    - Touch-friendly interface

12. Custom Event Handlers:
    - Custom event handling
    - Integration hooks
    - Advanced customization

Choose the example that best fits your use case and customize as needed!
`;
