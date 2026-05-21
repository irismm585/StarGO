import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../config';

interface ThemeContextType {
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ isDark: false, toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  useEffect(() => {
    (async () => {
      const saved = await storage.get<boolean>(STORAGE_KEYS.THEME);
      if (saved !== null) {
        setIsDark(saved);
      }
    })();
  }, []);

  const toggle = useCallback(async () => {
    setIsDark((prev) => {
      const next = !prev;
      storage.set(STORAGE_KEYS.THEME, next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
