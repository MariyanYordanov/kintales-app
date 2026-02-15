import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useAuth } from '../auth/authContext';
import {
  registerPushToken,
  removePushToken,
  getNotifications,
} from '../../services/notifications.service';
import {
  getNotificationsEnabled,
  setNotificationsEnabled as saveEnabled,
  getPushTokenId,
  setPushTokenId,
  clearPushTokenId,
} from './notificationStorage';

// Show notification as alert when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NotificationContext = createContext(null);

const UNREAD_POLL_INTERVAL = 60_000;

function getDeviceInfo() {
  const brand = Constants.deviceName || 'Unknown';
  const os = Platform.OS === 'ios' ? `iOS ${Platform.Version}` : `Android ${Platform.Version}`;
  return `${brand}, ${os}`;
}

async function getExpoPushToken() {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn('Push notifications: No EAS projectId configured. Skipping token registration.');
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const responseListenerRef = useRef(null);
  const registrationLockRef = useRef(false);
  const intervalRef = useRef(null);

  // Load saved preference on mount
  useEffect(() => {
    getNotificationsEnabled().then(setIsEnabled);
  }, []);

  // Register/deregister token when user or isEnabled changes
  useEffect(() => {
    if (!user) {
      // User logged out — deregister token
      const deregister = async () => {
        const tokenId = await getPushTokenId();
        if (tokenId) {
          try {
            await removePushToken(tokenId);
            await clearPushTokenId();
          } catch (err) {
            const status = err?.response?.status;
            if (status === 401 || status === 404) {
              await clearPushTokenId();
            }
            // Otherwise keep tokenId in storage — retry on next login
          }
        }
        setUnreadCount(0);
      };
      deregister();
      return;
    }

    if (!isEnabled) return;

    let isCancelled = false;

    const register = async () => {
      if (registrationLockRef.current) return;
      registrationLockRef.current = true;

      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (isCancelled) return;

        if (status !== 'granted') {
          setPermissionStatus('denied');
          return;
        }

        setPermissionStatus('granted');

        const deviceToken = await getExpoPushToken();
        if (!deviceToken || isCancelled) return;

        // Double-check after async operations
        const existingId = await getPushTokenId();
        if (existingId || isCancelled) return;

        const { data } = await registerPushToken(
          deviceToken,
          Platform.OS,
          getDeviceInfo(),
        );
        if (!isCancelled) {
          await setPushTokenId(data.data.id);
        }
      } catch (err) {
        console.warn('Push token registration failed:', err.message);
      } finally {
        registrationLockRef.current = false;
      }
    };

    register();

    return () => {
      isCancelled = true;
      registrationLockRef.current = false;
    };
  }, [user, isEnabled]);

  // Fetch unread count when user is available
  useEffect(() => {
    if (!user) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    let isCancelled = false;

    const fetchUnread = async () => {
      try {
        const { data } = await getNotifications({ page: 1, limit: 1 });
        if (!isCancelled) {
          setUnreadCount(data.meta?.unreadCount ?? 0);
        }
      } catch {
        // Silently fail — unread count will remain unchanged
      }
    };

    fetchUnread();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(fetchUnread, UNREAD_POLL_INTERVAL);

    return () => {
      isCancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user]);

  // Handle notification tap → navigate
  useEffect(() => {
    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.relativeId) {
          router.push(`/tree/${data.relativeId}`);
        } else if (data?.treeId) {
          router.push('/(tabs)/tree');
        }
      },
    );

    return () => {
      if (responseListenerRef.current) {
        Notifications.removeNotificationSubscription(responseListenerRef.current);
      }
    };
  }, [router]);

  const enableNotifications = useCallback(async () => {
    if (registrationLockRef.current) return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    setPermissionStatus(finalStatus);

    if (finalStatus !== 'granted') {
      return false;
    }

    await saveEnabled(true);
    setIsEnabled(true);

    // Register token immediately
    registrationLockRef.current = true;
    try {
      const deviceToken = await getExpoPushToken();
      if (!deviceToken) return true;

      const existingId = await getPushTokenId();
      if (existingId) return true;

      const { data } = await registerPushToken(
        deviceToken,
        Platform.OS,
        getDeviceInfo(),
      );
      await setPushTokenId(data.data.id);
    } catch (err) {
      console.warn('Push token registration failed:', err.message);
    } finally {
      registrationLockRef.current = false;
    }

    return true;
  }, []);

  const disableNotifications = useCallback(async () => {
    const tokenId = await getPushTokenId();
    if (tokenId) {
      try {
        await removePushToken(tokenId);
        await clearPushTokenId();
      } catch {
        // Still disable locally even if server call fails
        await clearPushTokenId();
      }
    }

    await saveEnabled(false);
    setIsEnabled(false);
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await getNotifications({ page: 1, limit: 1 });
      setUnreadCount(data.meta?.unreadCount ?? 0);
    } catch {
      // Silently fail
    }
  }, [user]);

  const value = {
    isEnabled,
    unreadCount,
    permissionStatus,
    enableNotifications,
    disableNotifications,
    refreshUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
