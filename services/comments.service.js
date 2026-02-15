import api from './api';

export function createComment(storyId, content) {
  return api.post(`/api/stories/${storyId}/comments`, { content });
}

export function deleteComment(commentId) {
  return api.delete(`/api/comments/${commentId}`);
}
