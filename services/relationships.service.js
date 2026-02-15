import api from './api';

export function createRelationship(data) {
  return api.post('/api/relationships', data);
}

export function deleteRelationship(relationshipId) {
  return api.delete(`/api/relationships/${relationshipId}`);
}
