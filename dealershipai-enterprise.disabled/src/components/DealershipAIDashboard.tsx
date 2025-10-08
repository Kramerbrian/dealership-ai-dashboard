import React, { useState, useEffect } from 'react';

// This component implements the Dealership AI Dashboard UI. It maintains
// local state for the selected tab, modal dialogs, profile details, and
// E‑E‑A‑T scoring. It includes stylised cards and action plans.
// To hydrate it with real data, call your backend endpoints
// (/api/ai-scores, /api/chat, /api/mystery-shop) via fetch inside
// useEffect or event handlers as appropriate.

interface DealershipAIDashboardProps {
  dealershipId?: string;
  dealershipName?: string;
  apiBaseUrl?: string;
  theme?: string;
  showLeaderboard?: boolean;
  showCommunity?: boolean;
  showAnalytics?: boolean;
  onDealerSelect?: (dealerId: string) => void;
  onFilterChange?: (filters: any) => void;
  onExport?: (data: any) => void;
}

const DealershipAIDashboard: React.FC<DealershipAIDashboardProps> = ({
  dealershipId = 'demo-dealer',
  dealershipName = 'Premium Auto Dealership',
  apiBaseUrl = '/api',
  theme = 'light',
  showLeaderboard = true,
  showCommunity = true,
  showAnalytics = true,
  onDealerSelect,
  onFilterChange,
  onExport
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<any>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profileMethod, setProfileMethod] = useState('manual');
  const [profileData, setProfileData] = useState({
    name: dealershipName,
    location: 'Cape Coral, FL'
  });
  const [formInputs, setFormInputs] = useState({
    name: '',
    location: '',
    url: '',
    gbp: ''
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const openModal = (id: string, title?: string, score?: number, color?: string) => {
    if (title && score) {
      setModalContent({ title, score, color });
    }
    setActiveModal(id);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalContent({});
  };

  const saveProfile = () => {
    if (!formInputs.name || !formInputs.location) {
      alert('Fill required fields');
      return;
    }
    setProfileData({
      name: formInputs.name,
      location: formInputs.location
    });
    closeModal();
    alert('Profile updated!');
  };

  const importURL = () => {
    setFormInputs({
      ...formInputs,
      name: 'Premium Auto Dealership',
      location: 'Cape Coral, FL'
    });
  };

  const importGBP = () => {
    setFormInputs({
      ...formInputs,
      name: 'Premium Auto Dealership',
      location: 'Cape Coral, FL'
    });
  };

  const openEEAT = (factor: string, score: number, color: string) => {
    const data: any = {
      'Experience': {
        desc: 'First-hand expertise and real-world knowledge',
        gaps: [
          { name: 'Customer story videos', impact: '+8 pts', effort: '4h' },
          { name: 'Behind-the-scenes content', impact: '+6 pts', effort: '6h' },
          { name: 'Staff certifications', impact: '+4 pts', effort: '2h' }
        ]
      },
      'Expertise': {
        desc: 'Technical knowledge and qualifications',
        gaps: [
          { name: 'Advanced diagnostics', impact: '+5 pts', effort: '8h' },
          { name: 'Industry trends', impact: '+4 pts', effort: '6h' },
          { name: 'How-to guides', impact: '+3 pts', effort: '4h' }
        ]
      },
      'Authority': {
        desc: 'Recognition in automotive industry',
        gaps: [
          { name: 'Partnership content', impact: '+9 pts', effort: '3h' },
          { name: 'Award showcase', impact: '+7 pts', effort: '2h' },
          { name: 'Expert quotes', impact: '+5 pts', effort: '5h' }
        ]
      },
      'Trust': {
        desc: 'Reliability and customer confidence',
        gaps: [
          { name: 'Price transparency', impact: '+3 pts', effort: '2h' },
          { name: 'Process docs', impact: '+2 pts', effort: '3h' },
          { name: 'Guarantees', impact: '+2 pts', effort: '1h' }
        ]
      }
    };
    const info = data[factor];
    setModalContent({
      title: `${factor} Score: ${score}`,
      factor,
      score,
      color,
      info
    });
    openModal('eeat-modal');
  };

  const styles = {
    container: { maxWidth: '1400px', margin: '0 auto', padding: '20px' },
    header: {
      background: 'white',
      border: '2px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '20px',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold'
    },
    navTabs: {
      background: 'white',
      border: '2px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px',
      display: 'flex',
      gap: '10px',
      overflowX: 'auto'
    },
    tab: {
      padding: '10px 20px',
      background: '#f5f5f5',
      border: '2px solid #ddd',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer',
      whiteSpace: 'nowrap' as const,
      transition: 'all 0.3s'
    },
    tabActive: {
      background: '#2196F3',
      color: 'white',
      borderColor: '#1976D2'
    },
    card: {
      background: 'white',
      border: '2px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '20px',
      transition: 'transform 0.3s, box-shadow 0.3s'
    },
    mainContent: {
      background: 'white',
      border: '2px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '30px',
      minHeight: '600px'
    },
    modal: {
      display: 'flex',
      position: 'fixed' as const,
      zIndex: 1000,
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(5px)',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalContent: {
      background: 'white',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '900px',
      maxHeight: '90vh',
      overflowY: 'auto' as const,
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    },
    modalHeader: {
      padding: '25px 30px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '12px 12px 0 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    btn: {
      padding: '8px 16px',
      border: '2px solid #ddd',
      borderRadius: '6px',
      background: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.3s',
      textAlign: 'center' as const
    }
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: '#f5f5f5', color: '#333', minHeight: '100vh' }}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={styles.logo}>dAI</div>
            <div>
              <h1 style={{ fontSize: '24px', margin: 0 }}>DealershipAI</h1>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Algorithmic Trust Dashboard</p>
            </div>
            <div style={{ padding: '8px 16px', background: '#f9f9f9', border: '1px dashed #999', borderRadius: '4px', fontSize: '14px' }}>
              {profileData.name} | {profileData.location}
            </div>
            <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', background: '#e3f2fd', color: '#1565c0', border: '1px solid #2196f3' }}>PRO PLAN</span>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '14px', color: '#666' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ width: '8px', height: '8px', background: '#4CAF50', borderRadius: '50%' }}></div>
              <span>Live</span>
            </div>
            <span>{formatTime(currentTime)}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={styles.navTabs}>
          {['overview', 'ai-health', 'website', 'schema', 'reviews', 'war-room', 'settings'].map((tab) => (
            <div
              key={tab}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.tabActive : {})
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'ai-health' && '🤖 AI Health'}
              {tab === 'website' && '🌐 Website'}
              {tab === 'schema' && '🔍 Schema'}
              {tab === 'reviews' && '⭐ Reviews'}
              {tab === 'war-room' && '⚔️ War Room'}
              {tab === 'settings' && '⚙️ Settings'}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
                AI Visibility Overview
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={styles.card}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#2196F3' }}>SEO Score</h3>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#4CAF50', marginBottom: '10px' }}>87</div>
                  <p style={{ color: '#666', fontSize: '14px' }}>Search Engine Optimization</p>
                  <button 
                    style={{ ...styles.btn, marginTop: '15px', background: '#4CAF50', color: 'white', borderColor: '#388E3C' }}
                    onClick={() => openModal('detail-modal', 'SEO', 87, '#4CAF50')}
                  >
                    View Details
                  </button>
                </div>
                <div style={styles.card}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#FF9800' }}>AEO Score</h3>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#FF9800', marginBottom: '10px' }}>72</div>
                  <p style={{ color: '#666', fontSize: '14px' }}>AI Engine Optimization</p>
                  <button 
                    style={{ ...styles.btn, marginTop: '15px', background: '#FF9800', color: 'white', borderColor: '#F57C00' }}
                    onClick={() => openModal('detail-modal', 'AEO', 72, '#FF9800')}
                  >
                    View Details
                  </button>
                </div>
                <div style={styles.card}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#9C27B0' }}>GEO Score</h3>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#9C27B0', marginBottom: '10px' }}>65</div>
                  <p style={{ color: '#666', fontSize: '14px' }}>Geographic Optimization</p>
                  <button 
                    style={{ ...styles.btn, marginTop: '15px', background: '#9C27B0', color: 'white', borderColor: '#7B1FA2' }}
                    onClick={() => openModal('detail-modal', 'GEO', 65, '#9C27B0')}
                  >
                    View Details
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div style={styles.card}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#E91E63' }}>E-E-A-T Analysis</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <button 
                      style={{ ...styles.btn, padding: '10px', fontSize: '12px', background: '#E91E63', color: 'white', borderColor: '#C2185B' }}
                      onClick={() => openEEAT('Experience', 78, '#E91E63')}
                    >
                      Experience: 78
                    </button>
                    <button 
                      style={{ ...styles.btn, padding: '10px', fontSize: '12px', background: '#E91E63', color: 'white', borderColor: '#C2185B' }}
                      onClick={() => openEEAT('Expertise', 82, '#E91E63')}
                    >
                      Expertise: 82
                    </button>
                    <button 
                      style={{ ...styles.btn, padding: '10px', fontSize: '12px', background: '#E91E63', color: 'white', borderColor: '#C2185B' }}
                      onClick={() => openEEAT('Authority', 75, '#E91E63')}
                    >
                      Authority: 75
                    </button>
                    <button 
                      style={{ ...styles.btn, padding: '10px', fontSize: '12px', background: '#E91E63', color: 'white', borderColor: '#C2185B' }}
                      onClick={() => openEEAT('Trust', 88, '#E91E63')}
                    >
                      Trust: 88
                    </button>
                  </div>
                </div>
                <div style={styles.card}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#607D8B' }}>Quick Actions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button 
                      style={{ ...styles.btn, background: '#2196F3', color: 'white', borderColor: '#1976D2' }}
                      onClick={() => openModal('edit-profile-modal')}
                    >
                      Edit Profile
                    </button>
                    <button 
                      style={{ ...styles.btn, background: '#4CAF50', color: 'white', borderColor: '#388E3C' }}
                      onClick={() => alert('Generating report...')}
                    >
                      Generate Report
                    </button>
                    <button 
                      style={{ ...styles.btn, background: '#FF9800', color: 'white', borderColor: '#F57C00' }}
                      onClick={() => alert('Starting optimization...')}
                    >
                      Start Optimization
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* AI Health Tab */}
          {activeTab === 'ai-health' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
                AI Health Metrics
              </h2>
              <p style={{ textAlign: 'center', color: '#999', fontSize: '16px' }}>
                AI health metrics and real-time monitoring will appear here...
              </p>
            </div>
          )}
          
          {/* Other tabs */}
          {activeTab === 'website' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
                Website Analysis
              </h2>
              <p style={{ textAlign: 'center', color: '#999', fontSize: '16px' }}>
                Website performance and optimization insights...
              </p>
            </div>
          )}
          
          {activeTab === 'schema' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
                Schema Markup
              </h2>
              <p style={{ textAlign: 'center', color: '#999', fontSize: '16px' }}>
                Schema markup analysis and recommendations...
              </p>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
                Review Analysis
              </h2>
              <p style={{ textAlign: 'center', color: '#999', fontSize: '16px' }}>
                Review sentiment and reputation management...
              </p>
            </div>
          )}
          
          {activeTab === 'war-room' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
                War Room
              </h2>
              <p style={{ textAlign: 'center', color: '#999', fontSize: '16px' }}>
                Competitive analysis and market intelligence...
              </p>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
                Settings
              </h2>
              <p style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
                Dashboard preferences and configuration options...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'detail-modal' && (
        <div style={styles.modal} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>{modalContent.title} Health Score</h2>
              <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '28px', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={closeModal}>&times;</button>
            </div>
            <div style={{ padding: '30px' }}>
              <div style={{ marginBottom: '20px', padding: '20px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: modalContent.color, marginBottom: '10px' }}>{modalContent.score}</div>
                <p style={{ color: '#666' }}>{modalContent.title} Performance Analysis</p>
              </div>
              <button style={{ ...styles.btn, width: '100%', background: '#4CAF50', color: 'white', borderColor: '#388E3C' }} onClick={() => alert('Generating report...')}>Generate Full Report</button>
            </div>
          </div>
        </div>
      )}
      
      {activeModal === 'eeat-modal' && modalContent.info && (
        <div style={styles.modal} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>{modalContent.title}</h2>
              <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '28px', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={closeModal}>&times;</button>
            </div>
            <div style={{ padding: '30px' }}>
              <div style={{ marginBottom: '20px', padding: '20px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: modalContent.color }}>{modalContent.score}</div>
                <p style={{ color: '#666' }}>{modalContent.info.desc}</p>
              </div>
              <h3 style={{ marginBottom: '15px' }}>Improvement Opportunities</h3>
              {modalContent.info.gaps.map((gap: any, idx: number) => (
                <div key={idx} style={{ padding: '15px', background: '#fff8e1', border: '1px solid #ffd54f', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>{gap.name}</strong>
                    <div>
                      <span style={{ background: '#e8f5e9', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', marginRight: '5px' }}>{gap.impact}</span>
                      <span style={{ background: '#e3f2fd', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>{gap.effort}</span>
                    </div>
                  </div>
                  <button style={{ ...styles.btn, padding: '4px 12px', fontSize: '12px', background: '#4CAF50', color: 'white', borderColor: '#388E3C' }} onClick={() => alert(`Deploying ${gap.name}...`)}>Deploy</button>
                </div>
              ))}
              <button style={{ ...styles.btn, width: '100%', marginTop: '15px', background: '#2196F3', color: 'white', borderColor: '#1976D2' }} onClick={() => alert(`Auto-implementing all ${modalContent.factor} improvements...`)}>Auto-Implement All</button>
            </div>
          </div>
        </div>
      )}
      
      {activeModal === 'edit-profile-modal' && (
        <div style={styles.modal} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Edit Profile</h2>
              <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '28px', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={closeModal}>&times;</button>
            </div>
            <div style={{ padding: '30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
                <button style={{ ...styles.btn, ...(profileMethod === 'manual' ? { background: '#2196F3', color: 'white', borderColor: '#1976D2' } : {}) }} onClick={() => setProfileMethod('manual')}>Manual</button>
                <button style={{ ...styles.btn, ...(profileMethod === 'url' ? { background: '#2196F3', color: 'white', borderColor: '#1976D2' } : {}) }} onClick={() => setProfileMethod('url')}>URL</button>
                <button style={{ ...styles.btn, ...(profileMethod === 'gbp' ? { background: '#2196F3', color: 'white', borderColor: '#1976D2' } : {}) }} onClick={() => setProfileMethod('gbp')}>GBP</button>
              </div>
              {profileMethod === 'manual' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Name</label>
                      <input type="text" style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '6px', fontSize: '14px' }} placeholder="Premium Auto Dealership" value={formInputs.name} onChange={(e) => setFormInputs({ ...formInputs, name: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Location</label>
                      <input type="text" style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '6px', fontSize: '14px' }} placeholder="Cape Coral, FL" value={formInputs.location} onChange={(e) => setFormInputs({ ...formInputs, location: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}
              {profileMethod === 'url' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Website URL</label>
                  <input type="url" style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '6px', fontSize: '14px' }} value={formInputs.url} onChange={(e) => setFormInputs({ ...formInputs, url: e.target.value })} />
                  <button style={{ ...styles.btn, marginTop: '15px', background: '#2196F3', color: 'white', borderColor: '#1976D2' }} onClick={importURL}>Analyze</button>
                </div>
              )}
              {profileMethod === 'gbp' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>GBP URL</label>
                  <input type="url" style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '6px', fontSize: '14px' }} value={formInputs.gbp} onChange={(e) => setFormInputs({ ...formInputs, gbp: e.target.value })} />
                  <button style={{ ...styles.btn, marginTop: '15px', background: '#2196F3', color: 'white', borderColor: '#1976D2' }} onClick={importGBP}>Import</button>
                </div>
              )}
              <button style={{ ...styles.btn, marginTop: '20px', background: '#4CAF50', color: 'white', borderColor: '#388E3C' }} onClick={saveProfile}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealershipAIDashboard;
