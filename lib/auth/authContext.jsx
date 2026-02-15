import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
  getAccessToken,
  setTokens,
  clearTokens,
  getRefreshToken,
} from './tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const { data } = await api.get('/api/profile');
          setUser(data.data);
        }
      } catch {
        await clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { data } = await api.post('/api/auth/login', {
      email,
      password,
      deviceInfo: 'KinTales Mobile App',
    });
    await setTokens({
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    });
    setUser(data.data.user);
    return data.data;
  }, []);

  const register = useCallback(async ({ email, password, fullName, language }) => {
    const { data } = await api.post('/api/auth/register', {
      email,
      password,
      fullName,
      language,
      deviceInfo: 'KinTales Mobile App',
    });
    await setTokens({
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    });
    setUser(data.data.user);
    return data.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await api.post('/api/auth/logout', { refreshToken });
      }
    } catch {
      // Ignore — clearing local state regardless
    } finally {
      await clearTokens();
      setUser(null);
    }
  }, []);

  const value = { user, setUser, isLoading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
