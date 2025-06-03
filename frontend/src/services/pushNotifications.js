// Push notification service for Dota 2 Companion
import { useState, useEffect } from 'react';
class PushNotificationService {
  constructor() {
    this.registration = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY';
    this.subscription = null;
  }

  // Initialize the service
  async init() {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      console.log('Push notification service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize push notification service:', error);
      return false;
    }
  }

  // Check if user has granted permission
  getPermissionStatus() {
    if (!this.isSupported) return 'unsupported';
    return Notification.permission;
  }

  // Request permission for notifications
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Push notifications are not supported');
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      return true;
    } else if (permission === 'denied') {
      console.log('Notification permission denied');
      return false;
    } else {
      console.log('Notification permission dismissed');
      return false;
    }
  }

  // Subscribe to push notifications
  async subscribe() {
    if (!this.registration) {
      await this.init();
    }

    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    try {
      // Check if already subscribed
      const existingSubscription = await this.registration.pushManager.getSubscription();
      if (existingSubscription) {
        this.subscription = existingSubscription;
        return existingSubscription;
      }

      // Create new subscription
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      this.subscription = subscription;
      
      // Store subscription locally
      localStorage.setItem('pushSubscription', JSON.stringify(subscription));
      
      console.log('Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    if (!this.subscription) {
      const existingSubscription = await this.registration?.pushManager.getSubscription();
      if (existingSubscription) {
        this.subscription = existingSubscription;
      }
    }

    if (this.subscription) {
      try {
        await this.subscription.unsubscribe();
        this.subscription = null;
        localStorage.removeItem('pushSubscription');
        console.log('Unsubscribed from push notifications');
        return true;
      } catch (error) {
        console.error('Failed to unsubscribe:', error);
        return false;
      }
    }

    return true;
  }

  // Check subscription status
  async isSubscribed() {
    if (!this.registration) return false;
    
    try {
      const subscription = await this.registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      return false;
    }
  }

  // Get current subscription
  async getSubscription() {
    if (!this.registration) {
      await this.init();
    }

    if (!this.registration) return null;

    try {
      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Failed to get subscription:', error);
      return null;
    }
  }

  // Send subscription to server (mock implementation)
  async sendSubscriptionToServer(subscription) {
    // In a real app, you would send this to your backend
    console.log('Sending subscription to server:', subscription);
    
    try {
      // Mock API call
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          userId: 'current-user-id', // Get from auth context
          topics: ['match-updates', 'hero-updates', 'meta-changes']
        })
      });

      if (!response.ok) {
        throw new Error('Failed to register subscription on server');
      }

      return await response.json();
    } catch (error) {
      // For demo purposes, just log and continue
      console.log('Server registration failed (expected in demo):', error.message);
      return { success: true, message: 'Demo mode - subscription stored locally' };
    }
  }

  // Show local notification (for testing)
  async showNotification(title, options = {}) {
    if (!this.registration) {
      await this.init();
    }

    const defaultOptions = {
      body: 'Dota 2 Companion notification',
      icon: '/icon-192.svg',
      badge: '/favicon.svg',
      tag: 'dota2-companion',
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: 'Open App'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      data: {
        url: '/',
        timestamp: Date.now()
      }
    };

    const notificationOptions = { ...defaultOptions, ...options };

    if (this.registration) {
      return this.registration.showNotification(title, notificationOptions);
    } else {
      // Fallback to browser notification
      return new Notification(title, notificationOptions);
    }
  }

  // Utility function to convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
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

  // Get notification preferences
  getNotificationPreferences() {
    const stored = localStorage.getItem('notificationPreferences');
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      matchUpdates: true,
      heroUpdates: true,
      metaChanges: false,
      weeklyDigest: true,
      majorUpdates: true
    };
  }

  // Update notification preferences
  updateNotificationPreferences(preferences) {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    
    // In a real app, you would also update the server
    console.log('Updated notification preferences:', preferences);
  }

  // Demo notifications for testing
  async sendDemoNotification(type = 'match') {
    const notifications = {
      match: {
        title: 'Match Update',
        body: 'Your recent match analysis is ready!',
        icon: '/icon-192.svg',
        data: { url: '/matches/recent' }
      },
      hero: {
        title: 'New Hero Recommendations',
        body: 'Check out heroes that match your playstyle',
        icon: '/icon-192.svg',
        data: { url: '/recommendations' }
      },
      meta: {
        title: 'Meta Update',
        body: 'Patch 7.35 brings new changes to the meta',
        icon: '/icon-192.svg',
        data: { url: '/heroes' }
      },
      weekly: {
        title: 'Weekly Digest',
        body: 'Your week in Dota 2: 5 matches played, 60% win rate',
        icon: '/icon-192.svg',
        data: { url: '/profile' }
      }
    };

    const notification = notifications[type] || notifications.match;
    return this.showNotification(notification.title, {
      body: notification.body,
      icon: notification.icon,
      data: notification.data
    });
  }
}

// Create singleton instance
export const pushNotificationService = new PushNotificationService();

// Helper hooks for React components
export const usePushNotifications = () => {
  const [isSupported] = useState(pushNotificationService.isSupported);
  const [permission, setPermission] = useState(pushNotificationService.getPermissionStatus());
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const subscribed = await pushNotificationService.isSubscribed();
      setIsSubscribed(subscribed);
    };
    
    checkStatus();
  }, []);

  const requestPermission = async () => {
    const granted = await pushNotificationService.requestPermission();
    setPermission(pushNotificationService.getPermissionStatus());
    return granted;
  };

  const subscribe = async () => {
    try {
      const subscription = await pushNotificationService.subscribe();
      await pushNotificationService.sendSubscriptionToServer(subscription);
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Subscription failed:', error);
      return false;
    }
  };

  const unsubscribe = async () => {
    const success = await pushNotificationService.unsubscribe();
    if (success) {
      setIsSubscribed(false);
    }
    return success;
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
    showDemo: pushNotificationService.sendDemoNotification.bind(pushNotificationService)
  };
};

export default pushNotificationService;