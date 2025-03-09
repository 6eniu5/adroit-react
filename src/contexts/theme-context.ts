import { createContext } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Create context with undefined default value
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);