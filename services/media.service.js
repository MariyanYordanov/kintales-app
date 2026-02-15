import api from './api';
import { AUDIO_MIME_MAP } from '../constants/media';

export function uploadPhoto(relativeId, uri, metadata = {}) {
  const { caption, dateTakenYear, dateTakenMonth, dateTakenDay } = metadata;

  const formData = new FormData();
  const filename = uri.split('/').pop() || 'photo.jpg';

  formData.append('photo', { uri, name: filename, type: 'image/jpeg' });
  formData.append('relativeId', relativeId);

  if (caption) formData.append('caption', caption);
  if (dateTakenYear != null) formData.append('dateTakenYear', String(dateTakenYear));
  if (dateTakenMonth != null) formData.append('dateTakenMonth', String(dateTakenMonth));
  if (dateTakenDay != null) formData.append('dateTakenDay', String(dateTakenDay));

  return api.post('/api/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
}

export function deletePhoto(photoId) {
  return api.delete(`/api/photos/${photoId}`);
}

export function uploadAudio(relativeId, uri, title) {
  const formData = new FormData();
  const ext = (uri.split('.').pop() || 'm4a').toLowerCase();
  const mimeType = AUDIO_MIME_MAP[ext] || 'audio/mp4';

  formData.append('audio', { uri, name: `recording.${ext}`, type: mimeType });
  formData.append('relativeId', relativeId);

  if (title) formData.append('title', title);

  return api.post('/api/audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
}

export function deleteAudio(audioId) {
  return api.delete(`/api/audio/${audioId}`);
}
