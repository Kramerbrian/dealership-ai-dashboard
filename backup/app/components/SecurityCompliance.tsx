'use client';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

interface SecurityThreat {
  id: string;
  type: 'malware' | 'phishing' | 'ddos' | 'data_breach' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  timestamp: Date;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  affectedSystems: string[];
  mitigationActions: string[];
}

interface ComplianceCheck {
  id: string;
  framework: 'GDPR' | 'CCPA' | 'SOX' | 'HIPAA' | 'PCI-DSS';
  category: 'data_protection' | 'privacy' | 'security' | 'audit' | 'governance';
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'warning' | 'not_applicable';
  lastChecked: Date;
  nextCheck: Date;
  evidence: string[];
  remediationSteps: string[];
}

interface SecurityMetric {
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  target: number;
  unit: string;
}

const SecurityCompliance: React.FC = () => {
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Initialize security data
  useEffect(() => {
    const initializeSecurityData = () => {
      // Mock security threats
      const mockThreats: SecurityThreat[] = [
        {
          id: 'threat-1',
          type: 'phishing',
          severity: 'high',
          title: 'Suspicious Email Campaign Detected',
          description: 'Multiple phishing emails targeting dealership employees detected. Emails appear to be from fake automotive suppliers.',
          source: 'Email Security Gateway',
          timestamp: new Date(Date.now() - 3600000),
          status: 'investigating',
          affectedSystems: ['Email Server', 'User Workstations'],
          mitigationActions: [
            'Blocked suspicious email domains',
            'Updated email security rules',
            'Sent security awareness notification'
          ]
        },
        {
          id: 'threat-2',
          type: 'unauthorized_access',
          severity: 'medium',
          title: 'Unusual Login Activity',
          description: 'Multiple failed login attempts detected from IP address 192.168.1.100. Account locked after 5 attempts.',
          source: 'Authentication System',
          timestamp: new Date(Date.now() - 7200000),
          status: 'resolved',
          affectedSystems: ['User Portal', 'Admin Dashboard'],
          mitigationActions: [
            'Account automatically locked',
            'IP address temporarily blocked',
            'Security team notified'
          ]
        },
        {
          id: 'threat-3',
          type: 'ddos',
          severity: 'critical',
          title: 'DDoS Attack Mitigated',
          description: 'Large-scale DDoS attack targeting dealership website successfully mitigated. No service disruption occurred.',
          source: 'Web Application Firewall',
          timestamp: new Date(Date.now() - 1800000),
          status: 'resolved',
          affectedSystems: ['Website', 'API Endpoints'],
          mitigationActions: [
            'Traffic filtered through CDN',
            'Rate limiting activated',
            'Attack source blocked'
          ]
        }
      ];

      // Mock compliance checks
      const mockCompliance: ComplianceCheck[] = [
        {
          id: 'comp-1',
          framework: 'GDPR',
          category: 'data_protection',
          requirement: 'Data Processing Consent',
          status: 'compliant',
          lastChecked: new Date(Date.now() - 86400000),
          nextCheck: new Date(Date.now() + 7 * 86400000),
          evidence: [
            'Consent forms implemented',
            'Opt-out mechanisms active',
            'Data retention policies documented'
          ],
          remediationSteps: []
        },
        {
          id: 'comp-2',
          framework: 'CCPA',
          category: 'privacy',
          requirement: 'Consumer Rights Management',
          status: 'warning',
          lastChecked: new Date(Date.now() - 172800000),
          nextCheck: new Date(Date.now() + 5 * 86400000),
          evidence: [
            'Data request portal functional',
            'Response procedures documented'
          ],
          remediationSteps: [
            'Update privacy policy language',
            'Implement automated data deletion',
            'Enhance consumer notification system'
          ]
        },
        {
          id: 'comp-3',
          framework: 'PCI-DSS',
          category: 'security',
          requirement: 'Payment Card Data Protection',
          status: 'compliant',
          lastChecked: new Date(Date.now() - 259200000),
          nextCheck: new Date(Date.now() + 30 * 86400000),
          evidence: [
            'Encryption in transit and at rest',
            'Access controls implemented',
            'Regular security assessments'
          ],
          remediationSteps: []
        }
      ];

      // Mock security metrics
      const mockMetrics: SecurityMetric[] = [
        { name: 'Threats Blocked', value: 1247, trend: 'up', target: 1000, unit: 'count' },
        { name: 'Security Score', value: 92, trend: 'stable', target: 90, unit: '%' },
        { name: 'Compliance Rate', value: 87, trend: 'up', target: 85, unit: '%' },
        { name: 'Incident Response Time', value: 12, trend: 'down', target: 15, unit: 'minutes' },
        { name: 'Vulnerabilities Patched', value: 98, trend: 'up', target: 95, unit: '%' },
        { name: 'Security Training Completion', value: 94, trend: 'up', target: 90, unit: '%' }
      ];

      setThreats(mockThreats);
      setComplianceChecks(mockCompliance);
      setSecurityMetrics(mockMetrics);
    };

    initializeSecurityData();
  }, []);

  const runSecurityScan = async () => {
    setIsScanning(true);
    toast.loading('Running comprehensive security scan...', { id: 'security-scan' });
    
    // Simulate security scan
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    toast.success('Security scan complete! No critical issues found.', { id: 'security-scan' });
    setIsScanning(false);
  };

  const updateThreatStatus = (threatId: string, newStatus: SecurityThreat['status']) => {
    setThreats(prev => prev.map(threat => 
      threat.id === threatId ? { ...threat, status: newStatus } : threat
    ));
    toast.success('Threat status updated');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return '#10b981';
      case 'non_compliant': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'not_applicable': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'malware': return '🦠';
      case 'phishing': return '🎣';
      case 'ddos': return '⚡';
      case 'data_breach': return '💥';
      case 'unauthorized_access': return '🔓';
      default: return '⚠️';
    }
  };

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case 'GDPR': return '#2563eb';
      case 'CCPA': return '#dc2626';
      case 'SOX': return '#059669';
      case 'HIPAA': return '#7c3aed';
      case 'PCI-DSS': return '#ea580c';
      default: return '#6b7280';
    }
  };

  return (
    <div className="security-compliance">
      <h3>🔒 Security & Compliance Dashboard</h3>
      <p>Comprehensive security monitoring and compliance management for your dealership operations.</p>

      {/* Security Controls */}
      <div className="security-controls">
        <button 
          onClick={runSecurityScan}
          disabled={isScanning}
          className="scan-button"
        >
          {isScanning ? '🔄 Scanning...' : '🔍 Run Security Scan'}
        </button>
        <div className="security-status">
          <span className="status-indicator active">🟢 All Systems Secure</span>
          <span className="last-scan">Last scan: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="security-metrics">
        <h4>📊 Security Metrics</h4>
        <div className="metrics-grid">
          {securityMetrics.map((metric, index) => (
            <div key={index} className="metric-card">
              <div className="metric-header">
                <h5>{metric.name}</h5>
                <span className={`trend-indicator ${metric.trend}`}>
                  {metric.trend === 'up' ? '📈' : metric.trend === 'down' ? '📉' : '➡️'}
                </span>
              </div>
              <div className="metric-value">
                {metric.value} {metric.unit}
              </div>
              <div className="metric-target">
                Target: {metric.target} {metric.unit}
              </div>
              <div className="metric-bar">
                <div 
                  className="metric-fill" 
                  style={{ 
                    width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                    backgroundColor: metric.value >= metric.target ? '#10b981' : '#f59e0b'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Threats */}
      <div className="security-threats">
        <h4>🚨 Active Security Threats</h4>
        <div className="threats-list">
          {threats.map(threat => (
            <div key={threat.id} className={`threat-card ${threat.severity}`}>
              <div className="threat-header">
                <div className="threat-icon">{getThreatIcon(threat.type)}</div>
                <div className="threat-info">
                  <h5>{threat.title}</h5>
                  <div className="threat-meta">
                    <span 
                      className="severity-badge" 
                      style={{ backgroundColor: getSeverityColor(threat.severity) }}
                    >
                      {threat.severity.toUpperCase()}
                    </span>
                    <span className="threat-source">{threat.source}</span>
                    <span className="threat-time">
                      {threat.timestamp.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="threat-actions">
                  <select 
                    value={threat.status}
                    onChange={(e) => updateThreatStatus(threat.id, e.target.value as SecurityThreat['status'])}
                    className="status-select"
                  >
                    <option value="active">Active</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="false_positive">False Positive</option>
                  </select>
                </div>
              </div>
              
              <div className="threat-content">
                <p>{threat.description}</p>
                
                <div className="affected-systems">
                  <h6>Affected Systems:</h6>
                  <div className="system-tags">
                    {threat.affectedSystems.map(system => (
                      <span key={system} className="system-tag">{system}</span>
                    ))}
                  </div>
                </div>
                
                <div className="mitigation-actions">
                  <h6>Mitigation Actions:</h6>
                  <ul>
                    {threat.mitigationActions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Status */}
      <div className="compliance-status">
        <h4>📋 Compliance Status</h4>
        <div className="compliance-grid">
          {complianceChecks.map(check => (
            <div key={check.id} className={`compliance-card ${check.status}`}>
              <div className="compliance-header">
                <div className="framework-info">
                  <span 
                    className="framework-badge" 
                    style={{ backgroundColor: getFrameworkColor(check.framework) }}
                  >
                    {check.framework}
                  </span>
                  <span className="category-badge">{check.category}</span>
                </div>
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor(check.status) }}
                >
                  {check.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="compliance-content">
                <h5>{check.requirement}</h5>
                
                <div className="compliance-meta">
                  <div className="check-dates">
                    <span>Last Check: {check.lastChecked.toLocaleDateString()}</span>
                    <span>Next Check: {check.nextCheck.toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="evidence-section">
                  <h6>Evidence:</h6>
                  <ul>
                    {check.evidence.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                {check.remediationSteps.length > 0 && (
                  <div className="remediation-section">
                    <h6>Remediation Steps:</h6>
                    <ul>
                      {check.remediationSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Trends Chart */}
      <div className="security-trends">
        <h4>📈 Security Trends (Last 30 Days)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={[
            { day: '1', threats: 12, incidents: 2, compliance: 85 },
            { day: '5', threats: 8, incidents: 1, compliance: 87 },
            { day: '10', threats: 15, incidents: 3, compliance: 89 },
            { day: '15', threats: 6, incidents: 0, compliance: 91 },
            { day: '20', threats: 9, incidents: 1, compliance: 92 },
            { day: '25', threats: 11, incidents: 2, compliance: 90 },
            { day: '30', threats: 7, incidents: 1, compliance: 94 }
          ]}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="threats" stroke="#ef4444" name="Threats Detected" />
            <Line type="monotone" dataKey="incidents" stroke="#f59e0b" name="Security Incidents" />
            <Line type="monotone" dataKey="compliance" stroke="#10b981" name="Compliance Score" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Compliance Overview */}
      <div className="compliance-overview">
        <h4>🎯 Compliance Overview</h4>
        <div className="overview-grid">
          <div className="overview-card">
            <h5>Overall Compliance Score</h5>
            <div className="score-display">
              <div className="score-circle">
                <span className="score-value">87%</span>
              </div>
              <div className="score-details">
                <div className="score-breakdown">
                  <span>GDPR: 95%</span>
                  <span>CCPA: 78%</span>
                  <span>PCI-DSS: 92%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overview-card">
            <h5>Security Posture</h5>
            <div className="posture-indicators">
              <div className="indicator">
                <span className="indicator-label">Threat Detection</span>
                <div className="indicator-bar">
                  <div className="indicator-fill" style={{ width: '94%', backgroundColor: '#10b981' }} />
                </div>
                <span className="indicator-value">94%</span>
              </div>
              <div className="indicator">
                <span className="indicator-label">Incident Response</span>
                <div className="indicator-bar">
                  <div className="indicator-fill" style={{ width: '88%', backgroundColor: '#10b981' }} />
                </div>
                <span className="indicator-value">88%</span>
              </div>
              <div className="indicator">
                <span className="indicator-label">Vulnerability Management</span>
                <div className="indicator-bar">
                  <div className="indicator-fill" style={{ width: '91%', backgroundColor: '#10b981' }} />
                </div>
                <span className="indicator-value">91%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityCompliance;
