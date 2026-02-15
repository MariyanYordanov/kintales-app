import api from './api';

export function getTreeEvents(treeId, params = {}) {
  return api.get(`/api/trees/${treeId}/events`, { params });
}
