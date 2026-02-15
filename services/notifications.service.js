import api from './api';

export function registerPushToken(deviceToken, platform, deviceInfo) {
  return api.post('/api/notifications/push-tokens', { deviceToken, platform, deviceInfo });
}

export function removePushToken(tokenId) {
  return api.delete(`/api/notifications/push-tokens/${tokenId}`);
}

export function getNotifications(params = {}) {
  return api.get('/api/notifications', { params });
}

export function markNotificationRead(notificationId) {
  return api.put(`/api/notifications/${notificationId}/read`);
}

export function markAllNotificationsRead() {
  return api.post('/api/notifications/read-all');
}
