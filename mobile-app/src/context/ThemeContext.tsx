import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { MD3DarkTheme, MD3LightTheme, PaperProvider, adaptNavigationTheme } from 'react-native-paper';
import { 
  DarkTheme as NavigationDarkTheme, 
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import merge from 'deepmerge';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);

interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
  theme: any;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleTheme: () => {},
  theme: CombinedDarkTheme,
});

export const useThemeMode = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => {
    const baseTheme = mode === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme;
    // Customizing the theme to match the original app's colors if needed
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: '#4caf50', // Green 500
        secondary: '#81c784', // Green 300
        background: mode === 'dark' ? '#0f1a0f' : '#f1f8e9', // Very dark green for dark mode, light green for light mode
        surface: mode === 'dark' ? '#1b2e1b' : '#ffffff', // Dark green surface
        onSurface: mode === 'dark' ? '#e8f5e9' : '#1b2e1b',
      }
    };
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
