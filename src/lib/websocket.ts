/**
 * WebSocket Manager for Real-time Updates
 * Handles real-time security event updates and other live data
 */

interface WebSocketMessage {
  type: 'security_event' | 'analytics_update' | 'system_alert' | 'heartbeat';
  data: any;
  timestamp: string;
  tenantId?: string;
}

interface WebSocketManager {
  connect: () => void;
  disconnect: () => void;
  subscribe: (type: string, callback: (data: any) => void) => void;
  unsubscribe: (type: string, callback: (data: any) => void) => void;
  isConnected: () => boolean;
}

class RealTimeWebSocketManager implements WebSocketManager {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private tenantId: string | null = null;

  constructor(tenantId?: string) {
    this.tenantId = tenantId || null;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // In production, this would connect to your WebSocket server
      // For now, we'll simulate the connection
      console.log('WebSocket connection established (simulated)');
      
      // Simulate connection success
      this.ws = {
        readyState: WebSocket.OPEN,
        send: (data: string) => {
          console.log('WebSocket message sent:', data);
        },
        close: () => {
          console.log('WebSocket connection closed');
        }
      } as WebSocket;

      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.simulateRealTimeEvents();

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe(type: string, callback: (data: any) => void): void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type)!.add(callback);
  }

  unsubscribe(type: string, callback: (data: any) => void): void {
    const callbacks = this.subscribers.get(type);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.subscribers.delete(type);
      }
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.sendMessage({
          type: 'heartbeat',
          data: { timestamp: new Date().toISOString() },
          timestamp: new Date().toISOString(),
          tenantId: this.tenantId
        });
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private sendMessage(message: WebSocketMessage): void {
    if (this.isConnected()) {
      this.ws!.send(JSON.stringify(message));
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private simulateRealTimeEvents(): void {
    // Simulate real-time security events
    setInterval(() => {
      if (this.isConnected() && Math.random() > 0.7) { // 30% chance every interval
        const eventTypes = ['auth.login', 'api.call', 'security.alert.suspicious_activity', 'data.export'];
        const severities = ['low', 'medium', 'high', 'critical'];
        const sources = ['authentication', 'api', 'security_monitor', 'data_access'];

        const mockEvent = {
          id: Date.now(),
          event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          actor_id: `user-${Math.floor(Math.random() * 1000)}`,
          payload: {
            endpoint: '/api/analyze',
            method: 'POST',
            statusCode: 200,
            responseTime: Math.floor(Math.random() * 1000)
          },
          occurred_at: new Date().toISOString(),
          tenant_id: this.tenantId,
          severity: severities[Math.floor(Math.random() * severities.length)],
          source: sources[Math.floor(Math.random() * sources.length)],
          ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.notifySubscribers('security_event', mockEvent);
      }
    }, 5000); // Check every 5 seconds

    // Simulate analytics updates
    setInterval(() => {
      if (this.isConnected() && Math.random() > 0.8) { // 20% chance every interval
        const mockAnalyticsUpdate = {
          dealershipId: 'deal-001',
          metrics: {
            aiVisibility: {
              score: 85 + Math.floor(Math.random() * 10),
              trend: Math.random() > 0.5 ? 'up' : 'down',
              change: (Math.random() - 0.5) * 5
            },
            marketShare: {
              percentage: 20 + Math.random() * 10,
              trend: Math.random() > 0.5 ? 'up' : 'down',
              change: (Math.random() - 0.5) * 2
            }
          },
          timestamp: new Date().toISOString()
        };

        this.notifySubscribers('analytics_update', mockAnalyticsUpdate);
      }
    }, 10000); // Check every 10 seconds
  }

  private notifySubscribers(type: string, data: any): void {
    const callbacks = this.subscribers.get(type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket subscriber callback:', error);
        }
      });
    }
  }
}

// Singleton instance
let wsManager: RealTimeWebSocketManager | null = null;

export function getWebSocketManager(tenantId?: string): WebSocketManager {
  if (!wsManager) {
    wsManager = new RealTimeWebSocketManager(tenantId);
  }
  return wsManager;
}

export function connectWebSocket(tenantId?: string): WebSocketManager {
  const manager = getWebSocketManager(tenantId);
  manager.connect();
  return manager;
}

export function disconnectWebSocket(): void {
  if (wsManager) {
    wsManager.disconnect();
    wsManager = null;
  }
}

// React hook for WebSocket integration
export function useWebSocket(type: string, callback: (data: any) => void, deps: any[] = []) {
  const [manager] = React.useState(() => getWebSocketManager());
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    manager.connect();
    setIsConnected(manager.isConnected());

    manager.subscribe(type, callback);

    return () => {
      manager.unsubscribe(type, callback);
    };
  }, deps);

  React.useEffect(() => {
    const checkConnection = setInterval(() => {
      setIsConnected(manager.isConnected());
    }, 1000);

    return () => clearInterval(checkConnection);
  }, [manager]);

  return { isConnected, manager };
}

// Import React for the hook
import React from 'react';
