import AsyncStorage from '@react-native-async-storage/async-storage';

const ENABLED_KEY = '@notifications_enabled';
const TOKEN_ID_KEY = '@push_token_id';

export async function getNotificationsEnabled() {
  try {
    const raw = await AsyncStorage.getItem(ENABLED_KEY);
    return raw === 'true';
  } catch {
    return false;
  }
}

export async function setNotificationsEnabled(enabled) {
  try {
    await AsyncStorage.setItem(ENABLED_KEY, String(enabled));
  } catch {
    // Silently fail — preference will reset to default
  }
}

export async function getPushTokenId() {
  try {
    return await AsyncStorage.getItem(TOKEN_ID_KEY);
  } catch {
    return null;
  }
}

export async function setPushTokenId(id) {
  try {
    await AsyncStorage.setItem(TOKEN_ID_KEY, id);
  } catch {
    // Silently fail
  }
}

export async function clearPushTokenId() {
  try {
    await AsyncStorage.removeItem(TOKEN_ID_KEY);
  } catch {
    // Silently fail
  }
}
