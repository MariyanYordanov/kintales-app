import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'kintales_access_token';
const REFRESH_TOKEN_KEY = 'kintales_refresh_token';

const storage = {
  async getItem(key) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export async function getAccessToken() {
  return storage.getItem(ACCESS_TOKEN_KEY);
}

export async function setAccessToken(token) {
  return storage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function getRefreshToken() {
  return storage.getItem(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(token) {
  return storage.setItem(REFRESH_TOKEN_KEY, token);
}

export async function clearTokens() {
  await storage.deleteItem(ACCESS_TOKEN_KEY);
  await storage.deleteItem(REFRESH_TOKEN_KEY);
}

export async function setTokens({ accessToken, refreshToken }) {
  await storage.setItem(ACCESS_TOKEN_KEY, accessToken);
  await storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}
