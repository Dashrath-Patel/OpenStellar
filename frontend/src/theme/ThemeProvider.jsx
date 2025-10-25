import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createCustomTheme } from './theme';

/**
 * Theme Context for managing light/dark mode across the app
 */
const ThemeContext = createContext({
  mode: 'dark',
  toggleTheme: () => {},
});

/**
 * Custom hook to access theme context
 * @returns {Object} Theme context value with mode and toggleTheme function
 */
export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return context;
};

/**
 * Theme Provider Component
 * Wraps the app and provides theme switching functionality
 * Persists user preference in localStorage
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ children }) => {
  // Initialize theme mode from localStorage or default to 'dark'
  const [mode, setMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem('themeMode');
      return savedMode === 'light' || savedMode === 'dark' ? savedMode : 'dark';
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      return 'dark';
    }
  });

  // Persist theme preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, [mode]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Memoize theme to prevent unnecessary re-renders
  const theme = useMemo(() => createCustomTheme(mode), [mode]);

  // Context value
  const contextValue = useMemo(
    () => ({
      mode,
      toggleTheme,
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        {/* CssBaseline provides consistent baseline styles */}
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
