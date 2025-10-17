"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Types
interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isOnline: boolean;
  lastSeen: Date;
  department: string;
  role: string;
}

interface Annotation {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userColor: string;
  content: string;
  position: { x: number; y: number };
  timestamp: Date;
  isResolved: boolean;
  replies: AnnotationReply[];
  chartElement?: string;
  dataPoint?: any;
}

interface AnnotationReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
}

interface CursorPosition {
  userId: string;
  userName: string;
  userColor: string;
  position: { x: number; y: number };
  timestamp: Date;
}

interface CollaborationSession {
  id: string;
  name: string;
  participants: User[];
  annotations: Annotation[];
  cursorPositions: CursorPosition[];
  isActive: boolean;
  createdAt: Date;
}

const TeamCollaboration = () => {
  const [currentUser, setCurrentUser] = useState<User>({
    id: '1',
    name: 'Brian Kramer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    color: '#3b82f6',
    isOnline: true,
    lastSeen: new Date(),
    department: 'Marketing',
    role: 'Manager'
  });

  const [teamMembers, setTeamMembers] = useState<User[]>([
    {
      id: '2',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      color: '#10b981',
      isOnline: true,
      lastSeen: new Date(),
      department: 'Sales',
      role: 'Director'
    },
    {
      id: '3',
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      color: '#f59e0b',
      isOnline: true,
      lastSeen: new Date(Date.now() - 5 * 60 * 1000),
      department: 'Marketing',
      role: 'Analyst'
    },
    {
      id: '4',
      name: 'Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      color: '#8b5cf6',
      isOnline: false,
      lastSeen: new Date(Date.now() - 30 * 60 * 1000),
      department: 'Operations',
      role: 'Coordinator'
    }
  ]);

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [cursorPositions, setCursorPositions] = useState<CursorPosition[]>([]);
  const [isCollaborationActive, setIsCollaborationActive] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [annotationPosition, setAnnotationPosition] = useState({ x: 0, y: 0 });

  const dashboardRef = useRef<HTMLDivElement>(null);
  const cursorTimeoutRef = useRef<NodeJS.Timeout>();

  // Mock data for charts
  const chartData = [
    { month: 'Jan', seo: 85, traffic: 1200, revenue: 45000 },
    { month: 'Feb', seo: 87, traffic: 1350, revenue: 52000 },
    { month: 'Mar', seo: 89, traffic: 1480, revenue: 58000 },
    { month: 'Apr', seo: 91, traffic: 1620, revenue: 65000 },
    { month: 'May', seo: 88, traffic: 1580, revenue: 62000 },
    { month: 'Jun', seo: 93, traffic: 1750, revenue: 72000 }
  ];

  // Simulate real-time cursor tracking
  useEffect(() => {
    if (!isCollaborationActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dashboardRef.current) return;

      const rect = dashboardRef.current.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      // Update current user's cursor position
      const newCursorPosition: CursorPosition = {
        userId: currentUser.id,
        userName: currentUser.name,
        userColor: currentUser.color,
        position,
        timestamp: new Date()
      };

      setCursorPositions(prev => {
        const filtered = prev.filter(cursor => cursor.userId !== currentUser.id);
        return [...filtered, newCursorPosition];
      });

      // Clear timeout and set new one
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }

      cursorTimeoutRef.current = setTimeout(() => {
        setCursorPositions(prev => prev.filter(cursor => cursor.userId !== currentUser.id));
      }, 2000);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }
    };
  }, [isCollaborationActive, currentUser]);

  // Simulate other users' cursor movements
  useEffect(() => {
    if (!isCollaborationActive) return;

    const interval = setInterval(() => {
      const onlineUsers = teamMembers.filter(user => user.isOnline && user.id !== currentUser.id);
      
      onlineUsers.forEach(user => {
        if (Math.random() > 0.7) { // 30% chance to move cursor
          const position = {
            x: Math.random() * (dashboardRef.current?.clientWidth || 800),
            y: Math.random() * (dashboardRef.current?.clientHeight || 600)
          };

          const newCursorPosition: CursorPosition = {
            userId: user.id,
            userName: user.name,
            userColor: user.color,
            position,
            timestamp: new Date()
          };

          setCursorPositions(prev => {
            const filtered = prev.filter(cursor => cursor.userId !== user.id);
            return [...filtered, newCursorPosition];
          });

          // Remove cursor after 2 seconds
          setTimeout(() => {
            setCursorPositions(prev => prev.filter(cursor => cursor.userId !== user.id));
          }, 2000);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCollaborationActive, teamMembers, currentUser]);

  const handleDashboardClick = (e: React.MouseEvent) => {
    if (!isCollaborationActive) return;

    const rect = dashboardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    setAnnotationPosition(position);
    setShowAnnotationForm(true);
  };

  const addAnnotation = () => {
    if (!newAnnotation.trim()) return;

    const annotation: Annotation = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userColor: currentUser.color,
      content: newAnnotation,
      position: annotationPosition,
      timestamp: new Date(),
      isResolved: false,
      replies: []
    };

    setAnnotations(prev => [...prev, annotation]);
    setNewAnnotation('');
    setShowAnnotationForm(false);
  };

  const addReply = (annotationId: string, content: string) => {
    if (!content.trim()) return;

    const reply: AnnotationReply = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      timestamp: new Date()
    };

    setAnnotations(prev => prev.map(annotation => 
      annotation.id === annotationId 
        ? { ...annotation, replies: [...annotation.replies, reply] }
        : annotation
    ));
  };

  const resolveAnnotation = (annotationId: string) => {
    setAnnotations(prev => prev.map(annotation => 
      annotation.id === annotationId 
        ? { ...annotation, isResolved: true }
        : annotation
    ));
  };

  const renderLiveCursors = () => {
    return cursorPositions.map(cursor => (
      <div
        key={cursor.userId}
        className="live-cursor"
        style={{
          left: cursor.position.x,
          top: cursor.position.y,
          '--cursor-color': cursor.userColor
        } as React.CSSProperties}
      >
        <div className="cursor-pointer" style={{ backgroundColor: cursor.userColor }}></div>
        <div className="cursor-label" style={{ backgroundColor: cursor.userColor }}>
          {cursor.userName}
        </div>
      </div>
    ));
  };

  const renderAnnotations = () => {
    return annotations.map(annotation => (
      <div
        key={annotation.id}
        className={`annotation-marker ${annotation.isResolved ? 'resolved' : ''}`}
        style={{
          left: annotation.position.x,
          top: annotation.position.y,
          '--annotation-color': annotation.userColor
        } as React.CSSProperties}
        onClick={() => setSelectedAnnotation(annotation)}
      >
        <div className="annotation-icon" style={{ backgroundColor: annotation.userColor }}>
          💬
        </div>
        {!annotation.isResolved && <div className="annotation-pulse"></div>}
      </div>
    ));
  };

  const renderAnnotationModal = () => {
    if (!selectedAnnotation) return null;

    return (
      <div className="annotation-modal-overlay" onClick={() => setSelectedAnnotation(null)}>
        <div className="annotation-modal" onClick={(e) => e.stopPropagation()}>
          <div className="annotation-header">
            <div className="annotation-user">
              <img src={selectedAnnotation.userAvatar} alt={selectedAnnotation.userName} />
              <div>
                <h4>{selectedAnnotation.userName}</h4>
                <span>{selectedAnnotation.timestamp.toLocaleString()}</span>
              </div>
            </div>
            <div className="annotation-actions">
              {!selectedAnnotation.isResolved && (
                <button 
                  onClick={() => resolveAnnotation(selectedAnnotation.id)}
                  className="resolve-button"
                >
                  Mark Resolved
                </button>
              )}
              <button onClick={() => setSelectedAnnotation(null)} className="close-button">
                ×
              </button>
            </div>
          </div>
          
          <div className="annotation-content">
            <p>{selectedAnnotation.content}</p>
          </div>

          <div className="annotation-replies">
            <h5>Replies ({selectedAnnotation.replies.length})</h5>
            {selectedAnnotation.replies.map(reply => (
              <div key={reply.id} className="reply">
                <img src={reply.userAvatar} alt={reply.userName} />
                <div className="reply-content">
                  <div className="reply-header">
                    <span className="reply-user">{reply.userName}</span>
                    <span className="reply-time">{reply.timestamp.toLocaleString()}</span>
                  </div>
                  <p>{reply.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="annotation-reply-form">
            <input
              type="text"
              placeholder="Add a reply..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addReply(selectedAnnotation.id, e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderAnnotationForm = () => {
    if (!showAnnotationForm) return null;

    return (
      <div className="annotation-form-overlay" onClick={() => setShowAnnotationForm(false)}>
        <div 
          className="annotation-form"
          style={{
            left: annotationPosition.x,
            top: annotationPosition.y
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <textarea
            value={newAnnotation}
            onChange={(e) => setNewAnnotation(e.target.value)}
            placeholder="Add an annotation..."
            autoFocus
            rows={3}
          />
          <div className="annotation-form-actions">
            <button onClick={addAnnotation} className="add-button">
              Add Annotation
            </button>
            <button onClick={() => setShowAnnotationForm(false)} className="cancel-button">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="team-collaboration">
      <div className="collaboration-header">
        <h2>👥 Team Collaboration</h2>
        <p>Real-time collaboration with annotations and live cursors</p>
      </div>

      {/* Collaboration Controls */}
      <div className="collaboration-controls">
        <div className="collaboration-toggle">
          <button
            className={`toggle-button ${isCollaborationActive ? 'active' : ''}`}
            onClick={() => setIsCollaborationActive(!isCollaborationActive)}
          >
            {isCollaborationActive ? '🟢 Collaboration Active' : '🔴 Start Collaboration'}
          </button>
        </div>

        <div className="team-status">
          <h4>Team Members</h4>
          <div className="team-list">
            <div className="team-member current-user">
              <img src={currentUser.avatar} alt={currentUser.name} />
              <div className="member-info">
                <span className="member-name">{currentUser.name} (You)</span>
                <span className="member-role">{currentUser.role}</span>
              </div>
              <div className="status-indicator online"></div>
            </div>
            {teamMembers.map(member => (
              <div key={member.id} className="team-member">
                <img src={member.avatar} alt={member.name} />
                <div className="member-info">
                  <span className="member-name">{member.name}</span>
                  <span className="member-role">{member.role}</span>
                </div>
                <div className={`status-indicator ${member.isOnline ? 'online' : 'offline'}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Collaborative Dashboard */}
      <div 
        ref={dashboardRef}
        className="collaborative-dashboard"
        onClick={handleDashboardClick}
      >
        <div className="dashboard-content">
          <h3>Performance Analytics</h3>
          
          <div className="charts-grid">
            <div className="chart-container">
              <h4>SEO Score Trend</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="seo" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h4>Traffic Growth</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="traffic" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h4>Revenue Performance</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="kpi-grid">
            <div className="kpi-card">
              <h4>Current SEO Score</h4>
              <div className="kpi-value">93.2%</div>
              <div className="kpi-change positive">+2.1%</div>
            </div>
            <div className="kpi-card">
              <h4>Monthly Traffic</h4>
              <div className="kpi-value">1,750</div>
              <div className="kpi-change positive">+12.3%</div>
            </div>
            <div className="kpi-card">
              <h4>Revenue</h4>
              <div className="kpi-value">$72,000</div>
              <div className="kpi-change positive">+8.7%</div>
            </div>
          </div>
        </div>

        {/* Live Cursors */}
        {renderLiveCursors()}

        {/* Annotations */}
        {renderAnnotations()}

        {/* Annotation Form */}
        {renderAnnotationForm()}

        {/* Annotation Modal */}
        {renderAnnotationModal()}
      </div>

      {/* Collaboration Stats */}
      <div className="collaboration-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{teamMembers.filter(m => m.isOnline).length + 1}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-value">{annotations.length}</div>
            <div className="stat-label">Annotations</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{annotations.filter(a => a.isResolved).length}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <div className="stat-value">{annotations.reduce((sum, a) => sum + a.replies.length, 0)}</div>
            <div className="stat-label">Replies</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCollaboration;
