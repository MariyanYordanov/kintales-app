import api from './api';
import { AUDIO_MIME_MAP } from '../constants/media';

export function getTreeStories(treeId, page = 1, limit = 20) {
  return api.get(`/api/trees/${treeId}/stories`, { params: { page, limit } });
}

export function getStoryById(storyId) {
  return api.get(`/api/stories/${storyId}`);
}

/**
 * Create a story with optional attachments (photos + audio).
 * @param {string} treeId
 * @param {string} content - Story text (1-10000 chars)
 * @param {string|null} relativeId - Optional linked relative
 * @param {{ uri: string, type: 'photo'|'audio' }[]} files - Attachments
 */
export function createStory(treeId, content, relativeId, files = []) {
  const formData = new FormData();
  formData.append('treeId', treeId);
  formData.append('content', content);
  if (relativeId) formData.append('relativeId', relativeId);

  for (const file of files) {
    const ext = (file.uri.split('.').pop() || 'jpg').toLowerCase();
    const mimeType = file.type === 'audio'
      ? (AUDIO_MIME_MAP[ext] || 'audio/mp4')
      : 'image/jpeg';
    const name = file.type === 'audio' ? `audio.${ext}` : `photo.${ext}`;
    formData.append('attachments', { uri: file.uri, name, type: mimeType });
  }

  return api.post('/api/stories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
}

export function deleteStory(storyId) {
  return api.delete(`/api/stories/${storyId}`);
}
