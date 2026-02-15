import api from './api';

export function createRelative(data) {
  return api.post('/api/relatives', data);
}

export function getRelativeById(relativeId) {
  return api.get(`/api/relatives/${relativeId}`);
}

export function updateRelative(relativeId, data) {
  return api.put(`/api/relatives/${relativeId}`, data);
}

export function deleteRelative(relativeId) {
  return api.delete(`/api/relatives/${relativeId}`);
}

export function getRelativePhotos(relativeId) {
  return api.get(`/api/relatives/${relativeId}/photos`);
}

export function getRelativeAudio(relativeId) {
  return api.get(`/api/relatives/${relativeId}/audio`);
}
