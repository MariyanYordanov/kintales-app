import api from './api';

export function getUserTrees() {
  return api.get('/api/trees');
}

export function getTreeById(treeId) {
  return api.get(`/api/trees/${treeId}`);
}

export function getTreeRelatives(treeId) {
  return api.get(`/api/trees/${treeId}/relatives`);
}
