'use client';
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

interface MicroFrontend {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'inactive' | 'loading' | 'error';
  url: string;
  scope: string;
  dependencies: string[];
  permissions: string[];
  lastUpdated: Date;
  size: number;
  performance: {
    loadTime: number;
    memoryUsage: number;
    errorRate: number;
  };
}

interface ModuleFederationConfig {
  name: string;
  filename: string;
  exposes: Record<string, string>;
  remotes: Record<string, string>;
  shared: Record<string, any>;
}

const MicroFrontendArchitecture: React.FC = () => {
  const [microFrontends, setMicroFrontends] = useState<MicroFrontend[]>([
    {
      id: 'mf-1',
      name: 'AI Analytics Module',
      description: 'Advanced AI analytics and machine learning components',
      version: '2.1.0',
      status: 'active',
      url: 'https://ai-analytics.example.com/remoteEntry.js',
      scope: 'aiAnalytics',
      dependencies: ['react', 'recharts', 'tensorflow'],
      permissions: ['data:read', 'ai:execute', 'export:pdf'],
      lastUpdated: new Date(),
      size: 2.4,
      performance: {
        loadTime: 1200,
        memoryUsage: 45,
        errorRate: 0.02
      }
    },
    {
      id: 'mf-2',
      name: '3D Visualization Engine',
      description: 'Three.js based 3D data visualization components',
      version: '1.8.3',
      status: 'active',
      url: 'https://3d-viz.example.com/remoteEntry.js',
      scope: 'threeDVisualization',
      dependencies: ['three', '@react-three/fiber', '@react-three/drei'],
      permissions: ['data:read', 'gpu:access'],
      lastUpdated: new Date(Date.now() - 86400000),
      size: 1.8,
      performance: {
        loadTime: 800,
        memoryUsage: 32,
        errorRate: 0.01
      }
    },
    {
      id: 'mf-3',
      name: 'Workflow Automation',
      description: 'Visual workflow builder and automation engine',
      version: '3.0.1',
      status: 'loading',
      url: 'https://workflow.example.com/remoteEntry.js',
      scope: 'workflowEngine',
      dependencies: ['reactflow', 'dagre', 'lodash'],
      permissions: ['workflow:create', 'workflow:execute', 'data:write'],
      lastUpdated: new Date(Date.now() - 172800000),
      size: 3.2,
      performance: {
        loadTime: 1500,
        memoryUsage: 58,
        errorRate: 0.05
      }
    },
    {
      id: 'mf-4',
      name: 'Real-time Collaboration',
      description: 'Live collaboration and annotation system',
      version: '1.5.2',
      status: 'inactive',
      url: 'https://collab.example.com/remoteEntry.js',
      scope: 'collaboration',
      dependencies: ['socket.io', 'yjs', 'quill'],
      permissions: ['collaborate:read', 'collaborate:write'],
      lastUpdated: new Date(Date.now() - 259200000),
      size: 1.2,
      performance: {
        loadTime: 600,
        memoryUsage: 28,
        errorRate: 0.03
      }
    }
  ]);

  const [selectedMF, setSelectedMF] = useState<MicroFrontend | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [moduleFederationConfig, setModuleFederationConfig] = useState<ModuleFederationConfig>({
    name: 'dealership-dashboard',
    filename: 'remoteEntry.js',
    exposes: {
      './Dashboard': './src/components/Dashboard',
      './KPICard': './src/components/KPICard',
      './Chart': './src/components/Chart'
    },
    remotes: {
      'aiAnalytics': 'aiAnalytics@https://ai-analytics.example.com/remoteEntry.js',
      'threeDVisualization': 'threeDVisualization@https://3d-viz.example.com/remoteEntry.js',
      'workflowEngine': 'workflowEngine@https://workflow.example.com/remoteEntry.js',
      'collaboration': 'collaboration@https://collab.example.com/remoteEntry.js'
    },
    shared: {
      'react': { singleton: true, requiredVersion: '^18.0.0' },
      'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
      'recharts': { singleton: true, requiredVersion: '^2.0.0' }
    }
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Simulate micro-frontend loading
  const loadMicroFrontend = async (mf: MicroFrontend) => {
    setIsLoading(true);
    setMicroFrontends(prev => 
      prev.map(m => m.id === mf.id ? { ...m, status: 'loading' } : m)
    );

    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMicroFrontends(prev => 
        prev.map(m => m.id === mf.id ? { ...m, status: 'active' } : m)
      );
      
      toast.success(`${mf.name} loaded successfully`);
    } catch (error) {
      setMicroFrontends(prev => 
        prev.map(m => m.id === mf.id ? { ...m, status: 'error' } : m)
      );
      toast.error(`Failed to load ${mf.name}`);
    } finally {
      setIsLoading(false);
    }
  };

  const unloadMicroFrontend = (mf: MicroFrontend) => {
    setMicroFrontends(prev => 
      prev.map(m => m.id === mf.id ? { ...m, status: 'inactive' } : m)
    );
    toast.success(`${mf.name} unloaded`);
  };

  const updateMicroFrontend = async (mf: MicroFrontend) => {
    setIsLoading(true);
    try {
      // Simulate update process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMicroFrontends(prev => 
        prev.map(m => m.id === mf.id ? { 
          ...m, 
          version: incrementVersion(m.version),
          lastUpdated: new Date(),
          status: 'active'
        } : m)
      );
      
      toast.success(`${mf.name} updated to version ${incrementVersion(mf.version)}`);
    } catch (error) {
      toast.error(`Failed to update ${mf.name}`);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementVersion = (version: string): string => {
    const parts = version.split('.');
    const patch = parseInt(parts[2]) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'loading': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'inactive': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅';
      case 'loading': return '⏳';
      case 'error': return '❌';
      case 'inactive': return '⏸️';
      default: return '❓';
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const formatLoadTime = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="micro-frontend-architecture">
      <h3>🏗️ Micro-Frontend Architecture</h3>
      <p>Modular, scalable architecture with independent micro-frontends for maximum flexibility.</p>

      {/* Architecture Overview */}
      <div className="architecture-overview">
        <h4>Architecture Overview</h4>
        <div className="architecture-diagram">
          <div className="host-app">
            <h5>Host Application</h5>
            <p>DealershipAI Dashboard</p>
            <div className="exposed-modules">
              <h6>Exposed Modules:</h6>
              <ul>
                {Object.entries(moduleFederationConfig.exposes).map(([key, value]) => (
                  <li key={key}><code>{key}</code> → <code>{value}</code></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="micro-frontends">
            <h5>Micro-Frontends</h5>
            <div className="mf-grid">
              {microFrontends.map(mf => (
                <div key={mf.id} className={`mf-card ${mf.status}`}>
                  <div className="mf-header">
                    <h6>{mf.name}</h6>
                    <span className="status-indicator" style={{ color: getStatusColor(mf.status) }}>
                      {getStatusIcon(mf.status)}
                    </span>
                  </div>
                  <p className="mf-version">v{mf.version}</p>
                  <p className="mf-description">{mf.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Micro-Frontend Management */}
      <div className="mf-management">
        <h4>Micro-Frontend Management</h4>
        <div className="mf-list">
          {microFrontends.map(mf => (
            <div key={mf.id} className={`mf-item ${mf.status} ${selectedMF?.id === mf.id ? 'selected' : ''}`}>
              <div className="mf-info">
                <div className="mf-header">
                  <h6>{mf.name}</h6>
                  <div className="mf-status">
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(mf.status) }}>
                      {mf.status.toUpperCase()}
                    </span>
                    <span className="version-badge">v{mf.version}</span>
                  </div>
                </div>
                <p className="mf-description">{mf.description}</p>
                <div className="mf-metrics">
                  <div className="metric">
                    <span className="metric-label">Size:</span>
                    <span className="metric-value">{formatFileSize(mf.size)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Load Time:</span>
                    <span className="metric-value">{formatLoadTime(mf.performance.loadTime)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Memory:</span>
                    <span className="metric-value">{mf.performance.memoryUsage}MB</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Error Rate:</span>
                    <span className="metric-value">{(mf.performance.errorRate * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="mf-dependencies">
                  <h6>Dependencies:</h6>
                  <div className="dependency-tags">
                    {mf.dependencies.map(dep => (
                      <span key={dep} className="dependency-tag">{dep}</span>
                    ))}
                  </div>
                </div>
                <div className="mf-permissions">
                  <h6>Permissions:</h6>
                  <div className="permission-tags">
                    {mf.permissions.map(perm => (
                      <span key={perm} className="permission-tag">{perm}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mf-actions">
                <button
                  onClick={() => setSelectedMF(mf)}
                  className="action-button select"
                >
                  View Details
                </button>
                {mf.status === 'active' ? (
                  <button
                    onClick={() => unloadMicroFrontend(mf)}
                    className="action-button unload"
                    disabled={isLoading}
                  >
                    Unload
                  </button>
                ) : (
                  <button
                    onClick={() => loadMicroFrontend(mf)}
                    className="action-button load"
                    disabled={isLoading}
                  >
                    Load
                  </button>
                )}
                <button
                  onClick={() => updateMicroFrontend(mf)}
                  className="action-button update"
                  disabled={isLoading}
                >
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Module Federation Configuration */}
      <div className="module-federation-config">
        <h4>Module Federation Configuration</h4>
        <div className="config-sections">
          <div className="config-section">
            <h5>Exposed Modules</h5>
            <div className="config-code">
              <pre>{JSON.stringify(moduleFederationConfig.exposes, null, 2)}</pre>
            </div>
          </div>
          <div className="config-section">
            <h5>Remote Modules</h5>
            <div className="config-code">
              <pre>{JSON.stringify(moduleFederationConfig.remotes, null, 2)}</pre>
            </div>
          </div>
          <div className="config-section">
            <h5>Shared Dependencies</h5>
            <div className="config-code">
              <pre>{JSON.stringify(moduleFederationConfig.shared, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Monitoring */}
      <div className="performance-monitoring">
        <h4>Performance Monitoring</h4>
        <div className="performance-grid">
          <div className="performance-card">
            <h5>Load Time Distribution</h5>
            <div className="load-time-chart">
              {microFrontends.map(mf => (
                <div key={mf.id} className="load-time-bar">
                  <span className="mf-name">{mf.name}</span>
                  <div className="bar-container">
                    <div 
                      className="bar" 
                      style={{ 
                        width: `${(mf.performance.loadTime / 2000) * 100}%`,
                        backgroundColor: getStatusColor(mf.status)
                      }}
                    />
                    <span className="bar-value">{formatLoadTime(mf.performance.loadTime)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="performance-card">
            <h5>Memory Usage</h5>
            <div className="memory-chart">
              {microFrontends.map(mf => (
                <div key={mf.id} className="memory-item">
                  <span className="mf-name">{mf.name}</span>
                  <div className="memory-bar">
                    <div 
                      className="memory-fill" 
                      style={{ 
                        width: `${(mf.performance.memoryUsage / 100) * 100}%`,
                        backgroundColor: getStatusColor(mf.status)
                      }}
                    />
                    <span className="memory-value">{mf.performance.memoryUsage}MB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Micro-Frontend Details Modal */}
      {selectedMF && (
        <div className="mf-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h4>{selectedMF.name} Details</h4>
              <button 
                onClick={() => setSelectedMF(null)}
                className="close-button"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h5>Basic Information</h5>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Version:</label>
                    <span>{selectedMF.version}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className="status-text" style={{ color: getStatusColor(selectedMF.status) }}>
                      {selectedMF.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Size:</label>
                    <span>{formatFileSize(selectedMF.size)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Updated:</label>
                    <span>{selectedMF.lastUpdated.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="detail-section">
                <h5>Performance Metrics</h5>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <h6>Load Time</h6>
                    <div className="metric-value">{formatLoadTime(selectedMF.performance.loadTime)}</div>
                  </div>
                  <div className="metric-card">
                    <h6>Memory Usage</h6>
                    <div className="metric-value">{selectedMF.performance.memoryUsage}MB</div>
                  </div>
                  <div className="metric-card">
                    <h6>Error Rate</h6>
                    <div className="metric-value">{(selectedMF.performance.errorRate * 100).toFixed(2)}%</div>
                  </div>
                </div>
              </div>
              <div className="detail-section">
                <h5>Dependencies</h5>
                <div className="dependency-list">
                  {selectedMF.dependencies.map(dep => (
                    <span key={dep} className="dependency-item">{dep}</span>
                  ))}
                </div>
              </div>
              <div className="detail-section">
                <h5>Permissions</h5>
                <div className="permission-list">
                  {selectedMF.permissions.map(perm => (
                    <span key={perm} className="permission-item">{perm}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MicroFrontendArchitecture;
