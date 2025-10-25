import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from './ThemeProvider';

/**
 * Theme Toggle Button Component
 * Provides a button to switch between light and dark modes
 * Displays sun icon for light mode, moon icon for dark mode
 * 
 * @param {Object} props - Component props
 * @param {Object} props.sx - Additional Material UI sx prop styles
 */
const ThemeToggle = ({ sx = {} }) => {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
      <IconButton
        onClick={toggleTheme}
        aria-label="toggle theme"
        sx={{
          color: 'primary.main',
          ...sx,
        }}
      >
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
