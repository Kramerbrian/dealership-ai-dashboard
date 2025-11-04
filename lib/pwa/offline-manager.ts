'use client';

/**
 * Offline Manager
 * Handles offline functionality, background sync, and push notifications
 */

export class OfflineManager {
  private registration: ServiceWorkerRegistration | null = null;
  private pushSubscription: PushSubscription | null = null;

  /**
   * Register service worker
   */
  async registerServiceWorker(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      this.registration = registration;

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('New service worker available');
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return false;
    }
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  }

  /**
   * Request push notification permission
   */
  async requestPushPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    if (!this.registration || !('PushManager' in window)) {
      return null;
    }

    try {
      const permission = await this.requestPushPermission();
      if (!permission) {
        return null;
      }

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      });

      this.pushSubscription = subscription;

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.pushSubscription) {
      return false;
    }

    try {
      const unsubscribed = await this.pushSubscription.unsubscribe();
      if (unsubscribed) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: this.pushSubscription.endpoint })
        });
        this.pushSubscription = null;
      }
      return unsubscribed;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }

  /**
   * Queue request for background sync
   */
  async queueForBackgroundSync(tag: string, data: any): Promise<boolean> {
    if (!this.registration || !('sync' in this.registration)) {
      // Fallback: store in IndexedDB
      return this.storeOfflineRequest(tag, data);
    }

    try {
      await (this.registration.sync as any).register(tag);
      // Store data in IndexedDB for sync event
      await this.storeOfflineRequest(tag, data);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return this.storeOfflineRequest(tag, data);
    }
  }

  /**
   * Store request for offline processing
   */
  private async storeOfflineRequest(tag: string, data: any): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        // Fallback to localStorage
        const key = `offline_${tag}_${Date.now()}`;
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      }

      // Use IndexedDB in production
      // For now, use localStorage as fallback
      const key = `offline_${tag}_${Date.now()}`;
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to store offline request:', error);
      return false;
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Show install prompt
   */
  async showInstallPrompt(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return false;
    }

    // Check if browser supports install prompt
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      (window as any).deferredPrompt = null;
      return outcome === 'accepted';
    }

    return false;
  }
}

export const offlineManager = new OfflineManager();

