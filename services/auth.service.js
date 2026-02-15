import api from './api';

export function forgotPassword(email) {
  return api.post('/api/auth/forgot-password', { email });
}
