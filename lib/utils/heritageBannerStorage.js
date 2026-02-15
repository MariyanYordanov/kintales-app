import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@heritage_banner_dismissed_at';
const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function isDismissed() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    const dismissedAt = parseInt(raw, 10);
    if (Number.isNaN(dismissedAt)) return false;

    return Date.now() - dismissedAt < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

export async function dismiss() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // Silently fail — banner will reappear next time
  }
}

export async function clearDismissal() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}
