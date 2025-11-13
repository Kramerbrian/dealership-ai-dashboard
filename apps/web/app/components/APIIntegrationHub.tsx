'use client';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

interface APIConnection {
  id: string;
  name: string;
  type: 'dms' | 'crm' | 'marketing' | 'analytics' | 'inventory' | 'finance';
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync: Date;
  dataPoints: number;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  apiKey?: string;
  endpoint?: string;
  health: 'healthy' | 'warning' | 'critical';
  features: string[];
}

interface DataMapping {
  id: string;
  sourceField: string;
  targetField: string;
  transformation: 'direct' | 'format' | 'calculate' | 'lookup';
  status: 'active' | 'inactive' | 'error';
}

interface SyncJob {
  id: string;
  connectionId: string;
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  startTime: Date;
  endTime?: Date;
  recordsProcessed: number;
  recordsFailed: number;
  errorMessage?: string;
}

const APIIntegrationHub: React.FC = () => {
  const [connections, setConnections] = useState<APIConnection[]>([]);
  const [dataMappings, setDataMappings] = useState<DataMapping[]>([]);
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [newConnection, setNewConnection] = useState({
    name: '',
    type: 'dms' as APIConnection['type'],
    provider: '',
    apiKey: '',
    endpoint: ''
  });

  useEffect(() => {
    initializeAPIData();
  }, []);

  const initializeAPIData = () => {
    // Mock API connections
    const mockConnections: APIConnection[] = [
      {
        id: 'conn-1',
        name: 'DealerSocket DMS',
        type: 'dms',
        provider: 'DealerSocket',
        status: 'connected',
        lastSync: new Date(Date.now() - 3600000),
        dataPoints: 15420,
        syncFrequency: 'realtime',
        health: 'healthy',
        features: ['Sales Data', 'Inventory', 'Customer Records', 'Service Appointments']
      },
      {
        id: 'conn-2',
        name: 'Salesforce CRM',
        type: 'crm',
        provider: 'Salesforce',
        status: 'connected',
        lastSync: new Date(Date.now() - 1800000),
        dataPoints: 8930,
        syncFrequency: 'hourly',
        health: 'healthy',
        features: ['Lead Management', 'Opportunities', 'Customer History', 'Campaigns']
      },
      {
        id: 'conn-3',
        name: 'Google Ads',
        type: 'marketing',
        provider: 'Google',
        status: 'connected',
        lastSync: new Date(Date.now() - 900000),
        dataPoints: 5670,
        syncFrequency: 'hourly',
        health: 'warning',
        features: ['Campaign Performance', 'Keywords', 'Ad Groups', 'Conversions']
      },
      {
        id: 'conn-4',
        name: 'Facebook Marketing',
        type: 'marketing',
        provider: 'Meta',
        status: 'disconnected',
        lastSync: new Date(Date.now() - 86400000),
        dataPoints: 0,
        syncFrequency: 'daily',
        health: 'critical',
        features: ['Ad Performance', 'Audience Insights', 'Engagement', 'Reach']
      },
      {
        id: 'conn-5',
        name: 'Google Analytics',
        type: 'analytics',
        provider: 'Google',
        status: 'connected',
        lastSync: new Date(Date.now() - 300000),
        dataPoints: 23400,
        syncFrequency: 'realtime',
        health: 'healthy',
        features: ['Website Traffic', 'User Behavior', 'Conversions', 'Goals']
      }
    ];

    // Mock data mappings
    const mockMappings: DataMapping[] = [
      { id: 'map-1', sourceField: 'customer_id', targetField: 'customerId', transformation: 'direct', status: 'active' },
      { id: 'map-2', sourceField: 'sale_date', targetField: 'purchaseDate', transformation: 'format', status: 'active' },
      { id: 'map-3', sourceField: 'vehicle_vin', targetField: 'vin', transformation: 'direct', status: 'active' },
      { id: 'map-4', sourceField: 'sale_price', targetField: 'revenue', transformation: 'calculate', status: 'active' }
    ];

    // Mock sync jobs
    const mockSyncJobs: SyncJob[] = [
      {
        id: 'job-1',
        connectionId: 'conn-1',
        status: 'completed',
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() - 3500000),
        recordsProcessed: 15420,
        recordsFailed: 0
      },
      {
        id: 'job-2',
        connectionId: 'conn-2',
        status: 'running',
        startTime: new Date(Date.now() - 1800000),
        recordsProcessed: 8930,
        recordsFailed: 0
      },
      {
        id: 'job-3',
        connectionId: 'conn-3',
        status: 'failed',
        startTime: new Date(Date.now() - 900000),
        endTime: new Date(Date.now() - 800000),
        recordsProcessed: 5670,
        recordsFailed: 120,
        errorMessage: 'API rate limit exceeded'
      }
    ];

    setConnections(mockConnections);
    setDataMappings(mockMappings);
    setSyncJobs(mockSyncJobs);
  };

  const connectAPI = async () => {
    if (!newConnection.name || !newConnection.provider || !newConnection.apiKey) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsConnecting(true);
    toast.loading('Connecting to API...', { id: 'api-connect' });

    // Simulate API connection
    await new Promise(resolve => setTimeout(resolve, 3000));

    const newConn: APIConnection = {
      id: `conn-${Date.now()}`,
      name: newConnection.name,
      type: newConnection.type,
      provider: newConnection.provider,
      status: 'connected',
      lastSync: new Date(),
      dataPoints: Math.floor(Math.random() * 10000) + 1000,
      syncFrequency: 'hourly',
      health: 'healthy',
      features: getDefaultFeatures(newConnection.type),
      apiKey: newConnection.apiKey,
      endpoint: newConnection.endpoint
    };

    setConnections(prev => [...prev, newConn]);
    setNewConnection({ name: '', type: 'dms', provider: '', apiKey: '', endpoint: '' });
    
    toast.success(`Successfully connected to ${newConnection.name}!`, { id: 'api-connect' });
    setIsConnecting(false);
  };

  const disconnectAPI = async (connectionId: string) => {
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId ? { ...conn, status: 'disconnected', health: 'critical' } : conn
    ));
    toast.success('API connection disconnected');
  };

  const syncData = async (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return;

    toast.loading(`Syncing data from ${connection.name}...`, { id: 'sync-data' });

    // Simulate sync job
    const syncJob: SyncJob = {
      id: `job-${Date.now()}`,
      connectionId,
      status: 'running',
      startTime: new Date(),
      recordsProcessed: 0,
      recordsFailed: 0
    };

    setSyncJobs(prev => [syncJob, ...prev]);

    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Update sync job as completed
    setSyncJobs(prev => prev.map(job => 
      job.id === syncJob.id ? {
        ...job,
        status: 'completed',
        endTime: new Date(),
        recordsProcessed: Math.floor(Math.random() * 10000) + 1000,
        recordsFailed: Math.floor(Math.random() * 10)
      } : job
    ));

    // Update connection last sync
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId ? { ...conn, lastSync: new Date() } : conn
    ));

    toast.success(`Data sync completed for ${connection.name}`, { id: 'sync-data' });
  };

  const getDefaultFeatures = (type: APIConnection['type']) => {
    switch (type) {
      case 'dms': return ['Sales Data', 'Inventory', 'Customer Records', 'Service Appointments'];
      case 'crm': return ['Lead Management', 'Opportunities', 'Customer History', 'Campaigns'];
      case 'marketing': return ['Campaign Performance', 'Keywords', 'Ad Groups', 'Conversions'];
      case 'analytics': return ['Website Traffic', 'User Behavior', 'Conversions', 'Goals'];
      case 'inventory': return ['Vehicle Data', 'Pricing', 'Availability', 'Specifications'];
      case 'finance': return ['Financial Reports', 'Revenue', 'Expenses', 'Profitability'];
      default: return [];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return '#10b981';
      case 'disconnected': return '#ef4444';
      case 'error': return '#f59e0b';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'dms': return '🏢';
      case 'crm': return '👥';
      case 'marketing': return '📢';
      case 'analytics': return '📊';
      case 'inventory': return '🚗';
      case 'finance': return '💰';
      default: return '🔌';
    }
  };

  const getProviderLogo = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'dealersocket': return '🏢';
      case 'salesforce': return '☁️';
      case 'google': return '🔍';
      case 'meta': return '📘';
      case 'microsoft': return '🪟';
      default: return '🔌';
    }
  };

  const connectionStats = {
    total: connections.length,
    connected: connections.filter(c => c.status === 'connected').length,
    disconnected: connections.filter(c => c.status === 'disconnected').length,
    errors: connections.filter(c => c.status === 'error').length,
    totalDataPoints: connections.reduce((sum, c) => sum + c.dataPoints, 0)
  };

  const syncStats = {
    total: syncJobs.length,
    completed: syncJobs.filter(j => j.status === 'completed').length,
    running: syncJobs.filter(j => j.status === 'running').length,
    failed: syncJobs.filter(j => j.status === 'failed').length,
    totalRecords: syncJobs.reduce((sum, j) => sum + j.recordsProcessed, 0)
  };

  return (
    <div className="api-integration-hub">
      <h3>🔌 API Integration Hub</h3>
      <p>Connect to real dealership systems, marketing platforms, and data sources for comprehensive insights.</p>

      {/* Connection Statistics */}
      <div className="connection-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Total Connections</h4>
            <div className="stat-value">{connectionStats.total}</div>
            <div className="stat-label">APIs</div>
          </div>
          <div className="stat-card">
            <h4>Active Connections</h4>
            <div className="stat-value">{connectionStats.connected}</div>
            <div className="stat-label">Online</div>
          </div>
          <div className="stat-card">
            <h4>Data Points</h4>
            <div className="stat-value">{connectionStats.totalDataPoints.toLocaleString()}</div>
            <div className="stat-label">Synced</div>
          </div>
          <div className="stat-card">
            <h4>Sync Jobs</h4>
            <div className="stat-value">{syncStats.total}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
      </div>

      {/* Add New Connection */}
      <div className="add-connection">
        <h4>🔗 Add New API Connection</h4>
        <div className="connection-form">
          <div className="form-row">
            <div className="form-group">
              <label>Connection Name</label>
              <input
                type="text"
                value={newConnection.name}
                onChange={(e) => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., My DMS System"
              />
            </div>
            <div className="form-group">
              <label>Provider</label>
              <input
                type="text"
                value={newConnection.provider}
                onChange={(e) => setNewConnection(prev => ({ ...prev, provider: e.target.value }))}
                placeholder="e.g., DealerSocket, Salesforce"
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                value={newConnection.type}
                onChange={(e) => setNewConnection(prev => ({ ...prev, type: e.target.value as APIConnection['type'] }))}
              >
                <option value="dms">DMS (Dealer Management)</option>
                <option value="crm">CRM (Customer Relationship)</option>
                <option value="marketing">Marketing Platform</option>
                <option value="analytics">Analytics</option>
                <option value="inventory">Inventory Management</option>
                <option value="finance">Financial System</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>API Key</label>
              <input
                type="password"
                value={newConnection.apiKey}
                onChange={(e) => setNewConnection(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter your API key"
              />
            </div>
            <div className="form-group">
              <label>Endpoint URL (Optional)</label>
              <input
                type="url"
                value={newConnection.endpoint}
                onChange={(e) => setNewConnection(prev => ({ ...prev, endpoint: e.target.value }))}
                placeholder="https://api.example.com"
              />
            </div>
            <div className="form-group">
              <button
                onClick={connectAPI}
                disabled={isConnecting}
                className="connect-button"
              >
                {isConnecting ? 'Connecting...' : 'Connect API'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* API Connections */}
      <div className="api-connections">
        <h4>🔗 Connected APIs</h4>
        <div className="connections-grid">
          {connections.map(connection => (
            <div key={connection.id} className="connection-card">
              <div className="connection-header">
                <div className="connection-info">
                  <div className="connection-icon">
                    {getTypeIcon(connection.type)}
                  </div>
                  <div className="connection-details">
                    <h5>{connection.name}</h5>
                    <div className="provider-info">
                      <span className="provider-logo">{getProviderLogo(connection.provider)}</span>
                      <span className="provider-name">{connection.provider}</span>
                    </div>
                  </div>
                </div>
                <div className="connection-status">
                  <span 
                    className="status-indicator" 
                    style={{ backgroundColor: getStatusColor(connection.status) }}
                  >
                    {connection.status}
                  </span>
                  <span 
                    className="health-indicator" 
                    style={{ backgroundColor: getHealthColor(connection.health) }}
                  >
                    {connection.health}
                  </span>
                </div>
              </div>

              <div className="connection-metrics">
                <div className="metric">
                  <span className="metric-label">Data Points</span>
                  <span className="metric-value">{connection.dataPoints.toLocaleString()}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Last Sync</span>
                  <span className="metric-value">{connection.lastSync.toLocaleTimeString()}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Frequency</span>
                  <span className="metric-value">{connection.syncFrequency}</span>
                </div>
              </div>

              <div className="connection-features">
                <h6>Available Features:</h6>
                <div className="features-list">
                  {connection.features.map((feature, index) => (
                    <span key={index} className="feature-tag">{feature}</span>
                  ))}
                </div>
              </div>

              <div className="connection-actions">
                <button
                  onClick={() => syncData(connection.id)}
                  className="sync-button"
                  disabled={connection.status !== 'connected'}
                >
                  🔄 Sync Now
                </button>
                <button
                  onClick={() => disconnectAPI(connection.id)}
                  className="disconnect-button"
                >
                  {connection.status === 'connected' ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Mappings */}
      <div className="data-mappings">
        <h4>🗺️ Data Field Mappings</h4>
        <div className="mappings-table">
          <table>
            <thead>
              <tr>
                <th>Source Field</th>
                <th>Target Field</th>
                <th>Transformation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dataMappings.map(mapping => (
                <tr key={mapping.id}>
                  <td>{mapping.sourceField}</td>
                  <td>{mapping.targetField}</td>
                  <td>
                    <span className={`transformation-badge ${mapping.transformation}`}>
                      {mapping.transformation}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${mapping.status}`}>
                      {mapping.status}
                    </span>
                  </td>
                  <td>
                    <button className="edit-button">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync Jobs History */}
      <div className="sync-jobs">
        <h4>📋 Sync Jobs History</h4>
        <div className="jobs-list">
          {syncJobs.map(job => {
            const connection = connections.find(c => c.id === job.connectionId);
            return (
              <div key={job.id} className={`job-card ${job.status}`}>
                <div className="job-header">
                  <div className="job-info">
                    <h6>{connection?.name || 'Unknown Connection'}</h6>
                    <span className="job-time">
                      {job.startTime.toLocaleString()}
                    </span>
                  </div>
                  <span className={`job-status ${job.status}`}>
                    {job.status}
                  </span>
                </div>
                <div className="job-metrics">
                  <div className="metric">
                    <span>Processed: {job.recordsProcessed.toLocaleString()}</span>
                  </div>
                  <div className="metric">
                    <span>Failed: {job.recordsFailed}</span>
                  </div>
                  {job.endTime && (
                    <div className="metric">
                      <span>Duration: {Math.round((job.endTime.getTime() - job.startTime.getTime()) / 1000)}s</span>
                    </div>
                  )}
                </div>
                {job.errorMessage && (
                  <div className="job-error">
                    <strong>Error:</strong> {job.errorMessage}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Integration Analytics */}
      <div className="integration-analytics">
        <h4>📊 Integration Performance</h4>
        <div className="analytics-charts">
          <div className="chart-container">
            <h5>Data Sync Volume (Last 7 Days)</h5>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[
                { day: 'Mon', records: 12000, errors: 50 },
                { day: 'Tue', records: 15000, errors: 30 },
                { day: 'Wed', records: 18000, errors: 20 },
                { day: 'Thu', records: 16000, errors: 40 },
                { day: 'Fri', records: 20000, errors: 25 },
                { day: 'Sat', records: 8000, errors: 15 },
                { day: 'Sun', records: 6000, errors: 10 }
              ]}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="records" stroke="#3b82f6" name="Records Synced" />
                <Line type="monotone" dataKey="errors" stroke="#ef4444" name="Errors" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h5>Connection Health Distribution</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Healthy', value: connectionStats.connected, color: '#10b981' },
                    { name: 'Warning', value: connectionStats.errors, color: '#f59e0b' },
                    { name: 'Critical', value: connectionStats.disconnected, color: '#ef4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {[
                    { name: 'Healthy', value: connectionStats.connected, color: '#10b981' },
                    { name: 'Warning', value: connectionStats.errors, color: '#f59e0b' },
                    { name: 'Critical', value: connectionStats.disconnected, color: '#ef4444' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIIntegrationHub;
