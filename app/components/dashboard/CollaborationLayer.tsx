/**
 * Multi-User Collaboration Layer
 * 
 * Shows active users, cursors, and annotations
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Users, MessageCircle, Eye, X } from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  cursor?: { x: number; y: number };
  color: string;
}

interface Annotation {
  id: string;
  x: number;
  y: number;
  userId: string;
  message: string;
  timestamp: Date;
}

interface CollaborationLayerProps {
  roomId?: string;
  currentUserId: string;
  currentUserName: string;
  enabled?: boolean;
}

export const CollaborationLayer: React.FC<CollaborationLayerProps> = ({
  roomId = 'default',
  currentUserId,
  currentUserName,
  enabled = true
}) => {
  const [activeUsers, setActiveUsers] = useState<Collaborator[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [showUsers, setShowUsers] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock data for demo - in production, use WebSocket/PartyKit/Ably
  useEffect(() => {
    if (!enabled) return;

    // Simulate other users
    const mockUsers: Collaborator[] = [
      {
        id: 'user-2',
        name: 'Sarah Johnson',
        avatar: 'https://i.pravatar.cc/150?img=1',
        status: 'online',
        color: '#8b5cf6'
      },
      {
        id: 'user-3',
        name: 'Mike Chen',
        avatar: 'https://i.pravatar.cc/150?img=2',
        status: 'online',
        color: '#10b981'
      }
    ];

    setActiveUsers(mockUsers);

    // Simulate cursor movements
    const interval = setInterval(() => {
      setActiveUsers(prev => prev.map(user => ({
        ...user,
        cursor: {
          x: Math.random() * (containerRef.current?.clientWidth || 1200),
          y: Math.random() * (containerRef.current?.clientHeight || 800)
        }
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, [enabled, roomId]);

  if (!enabled) return null;

  return (
    <>
      {/* Active Users Bar */}
      {showUsers && (
        <div className="fixed top-20 right-6 z-50">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-900/95 backdrop-blur-sm border border-gray-700">
            <Eye className="w-4 h-4 text-gray-400" />
            <div className="flex -space-x-2">
              {activeUsers.map(user => (
                <div
                  key={user.id}
                  className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden cursor-pointer"
                  title={user.name}
                >
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-full h-full object-cover" 
                  />
                  <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${
                    user.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                </div>
              ))}
              {activeUsers.length === 0 && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border-2 border-white">
                  <span className="text-xs text-gray-400">1</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowUsers(false)}
              className="ml-2 p-1 rounded hover:bg-gray-800"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {!showUsers && (
        <button
          onClick={() => setShowUsers(true)}
          className="fixed top-20 right-6 z-50 p-2 rounded-lg bg-gray-900/95 backdrop-blur-sm border border-gray-700 hover:bg-gray-800"
        >
          <Users className="w-4 h-4 text-gray-400" />
        </button>
      )}

      {/* Remote Cursors */}
      <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[60]">
        {activeUsers.map(user => user.cursor && (
          <div
            key={user.id}
            className="absolute transition-all duration-100"
            style={{ 
              left: `${user.cursor.x}px`, 
              top: `${user.cursor.y}px` 
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path 
                d="M0 0 L0 16 L6 10 L10 16 L12 14 L8 8 L16 6 Z" 
                fill={user.color} 
                stroke="white"
                strokeWidth="1"
              />
            </svg>
            <span 
              className="ml-2 text-xs bg-gray-900 text-white px-2 py-1 rounded shadow-lg whitespace-nowrap"
              style={{ borderLeft: `3px solid ${user.color}` }}
            >
              {user.name}
            </span>
          </div>
        ))}
      </div>

      {/* Annotations */}
      {annotations.map(annotation => (
        <div
          key={annotation.id}
          className="fixed z-[60] pointer-events-none"
          style={{ left: `${annotation.x}px`, top: `${annotation.y}px` }}
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-purple-500 animate-bounce" />
            <div className="absolute top-8 left-0 w-48 p-2 rounded-lg bg-gray-900 border border-gray-700 text-xs text-white shadow-lg">
              <p className="font-semibold mb-1">{annotation.message}</p>
              <p className="text-gray-400 text-xs">
                {annotation.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

