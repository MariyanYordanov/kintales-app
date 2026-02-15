import api from './api';

export function createDeathRecord(data) {
  return api.post('/api/death-records', data);
}

export function confirmDeathRecord(deathRecordId, confirmed) {
  return api.post(`/api/death-records/${deathRecordId}/confirm`, { confirmed });
}

export function getTreeDeathRecords(treeId) {
  return api.get(`/api/trees/${treeId}/death-records`);
}
