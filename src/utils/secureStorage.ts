import { Platform } from 'react-native';

// expo-secure-store only works on iOS/Android
// On web, fall back to AsyncStorage
let SecureStore: any = null;

if (Platform.OS !== 'web') {
  try {
    SecureStore = require('expo-secure-store');
  } catch {
    // expo-secure-store not available
  }
}

export const secureStorage = {
  async getItemAsync(key: string): Promise<string | null> {
    if (SecureStore) {
      try {
        return await SecureStore.getItemAsync(key);
      } catch {
        return null;
      }
    }
    // Web fallback — localStorage
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  async setItemAsync(key: string, value: string): Promise<void> {
    if (SecureStore) {
      try {
        await SecureStore.setItemAsync(key, value);
        return;
      } catch {
        // fall through to localStorage
      }
    }
    // Web fallback
    try {
      localStorage.setItem(key, value);
    } catch {
      // storage full or unavailable
    }
  },

  async deleteItemAsync(key: string): Promise<void> {
    if (SecureStore) {
      try {
        await SecureStore.deleteItemAsync(key);
        return;
      } catch {
        // fall through
      }
    }
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};
