import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeStore {
  isDark: boolean;
  toggleTheme: () => void;
  initTheme: () => Promise<void>;
}

const THEME_STORAGE_KEY = 'themePreference';

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: false,

  toggleTheme: async () => {
    set((state) => {
      const newIsDark = !state.isDark;
      AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newIsDark));
      return { isDark: newIsDark };
    });
  },

  initTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        set({ isDark: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  },
}));
