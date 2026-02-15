import api from './api';

export function getTreeGuardians(treeId) {
  return api.get(`/api/trees/${treeId}/guardians`);
}

export function addGuardian(data) {
  return api.post('/api/guardians', data);
}

export function removeGuardian(guardianId) {
  return api.delete(`/api/guardians/${guardianId}`);
}
