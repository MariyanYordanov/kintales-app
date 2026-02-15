import api from './api';

export function getProfile() {
  return api.get('/api/profile');
}

export function updateProfile(fields) {
  return api.put('/api/profile', fields);
}

export function uploadAvatar(uri, mimeType = 'image/jpeg') {
  const formData = new FormData();
  const filename = uri.split('/').pop() || 'avatar.jpg';

  formData.append('avatar', {
    uri,
    name: filename,
    type: mimeType,
  });

  return api.put('/api/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
}
