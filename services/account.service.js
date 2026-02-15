import api from './api';

export function deleteAccount(confirmation) {
  return api.delete('/api/account', { data: { confirmation } });
}
