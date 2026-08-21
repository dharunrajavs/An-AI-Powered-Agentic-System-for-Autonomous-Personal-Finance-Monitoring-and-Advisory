import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      toggleTheme: () => set({ mode: get().mode === 'light' ? 'dark' : 'light' }),
      setTheme: (mode) => set({ mode }),
    }),
    {
      name: 'finance-advisor-theme',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
