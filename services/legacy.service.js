import api from './api';

export function getTreeLegacyKeys(treeId) {
  return api.get(`/api/trees/${treeId}/legacy-keys`);
}

export function createLegacyKey(data) {
  return api.post('/api/legacy-keys', data);
}

export function redeemLegacyKey(keyCode) {
  return api.post('/api/legacy-keys/redeem', { keyCode });
}

export function revokeLegacyKey(keyId) {
  return api.delete(`/api/legacy-keys/${keyId}`);
}
