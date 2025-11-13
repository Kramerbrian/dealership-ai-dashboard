'use client';
import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  timestamp: Date;
  read?: boolean;
}

interface NotificationSystemProps {
  maxNotifications?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoClose?: boolean;
  defaultDuration?: number;
}

export default function NotificationSystem({
  maxNotifications = 5,
  position = 'top-right',
  autoClose = true,
  defaultDuration = 5000
}: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Listen for custom notification events
  useEffect(() => {
    const handleNotification = (event: CustomEvent<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...event.detail,
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        duration: event.detail.duration || defaultDuration
      };

      setNotifications(prev => {
        const newNotifications = [notification, ...prev].slice(0, maxNotifications);
        return newNotifications;
      });

      // Auto-close notification
      if (autoClose && notification.duration) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
      }
    };

    window.addEventListener('show-notification', handleNotification as EventListener);
    return () => window.removeEventListener('show-notification', handleNotification as EventListener);
  }, [maxNotifications, autoClose, defaultDuration]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-50 space-y-2 max-w-sm`}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border shadow-lg transition-all duration-300 animate-slide-up ${getTypeStyles(notification.type)}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">
              {getTypeIcon(notification.type)}
            </span>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <p className="text-sm mt-1 opacity-90">{notification.message}</p>
              
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        action.variant === 'primary'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Hook for showing notifications
export function useNotifications() {
  const showNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const event = new CustomEvent('show-notification', { detail: notification });
    window.dispatchEvent(event);
  }, []);

  const showSuccess = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    showNotification({
      type: 'success',
      title,
      message,
      ...options
    });
  }, [showNotification]);

  const showError = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    showNotification({
      type: 'error',
      title,
      message,
      duration: 0, // Don't auto-close errors
      ...options
    });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    showNotification({
      type: 'warning',
      title,
      message,
      ...options
    });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    showNotification({
      type: 'info',
      title,
      message,
      ...options
    });
  }, [showNotification]);

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}

// Toast notification for quick messages
export function showToast(message: string, type: Notification['type'] = 'info') {
  const event = new CustomEvent('show-notification', {
    detail: {
      type,
      title: '',
      message,
      duration: 3000
    }
  });
  window.dispatchEvent(event);
}
