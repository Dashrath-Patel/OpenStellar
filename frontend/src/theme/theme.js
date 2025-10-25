import { createTheme } from '@mui/material/styles';

/**
 * Custom color palette for OpenStellar/Sorobounty
 * Stellar brand colors with bounty-themed accents
 */
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#7B61FF' : '#5A3FD8', // Stellar purple
      light: '#9D85FF',
      dark: '#4A2FB0',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: mode === 'dark' ? '#00D1FF' : '#00B8E6', // Stellar cyan
      light: '#33DAFF',
      dark: '#0099CC',
      contrastText: '#000000',
    },
    success: {
      main: '#00D395', // Bounty reward green
      light: '#33DCA9',
      dark: '#00A876',
    },
    warning: {
      main: '#FFB800', // Pending bounty yellow
      light: '#FFC933',
      dark: '#CC9300',
    },
    error: {
      main: '#FF4757', // Error/rejected red
      light: '#FF6B77',
      dark: '#CC3946',
    },
    background: {
      default: mode === 'dark' ? '#0A0E27' : '#F5F7FA',
      paper: mode === 'dark' ? '#131730' : '#FFFFFF',
    },
    text: {
      primary: mode === 'dark' ? '#FFFFFF' : '#0A0E27',
      secondary: mode === 'dark' ? '#A8B3CF' : '#4B5563',
    },
    divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.375rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none', // Remove uppercase transformation
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // Rounded corners for modern look
  },
  spacing: 8, // Base spacing unit (8px)
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

/**
 * Creates a custom MUI theme based on the mode (light/dark)
 * @param {string} mode - 'light' or 'dark'
 * @returns {Theme} Material UI theme object
 */
export const createCustomTheme = (mode) => {
  const theme = createTheme({
    ...getDesignTokens(mode),
    components: {
      // Button component customization
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '10px 24px',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
            },
          },
        },
      },
      // Card component customization
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'dark' 
              ? '0 4px 20px rgba(0, 0, 0, 0.4)'
              : '0 2px 12px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: mode === 'dark'
                ? '0 8px 30px rgba(0, 0, 0, 0.6)'
                : '0 4px 20px rgba(0, 0, 0, 0.12)',
            },
          },
        },
      },
      // Paper component customization
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
          elevation1: {
            boxShadow: mode === 'dark'
              ? '0 2px 8px rgba(0, 0, 0, 0.4)'
              : '0 1px 4px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      // AppBar customization
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'dark'
              ? '0 2px 12px rgba(0, 0, 0, 0.3)'
              : '0 1px 8px rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(10px)',
            backgroundColor: mode === 'dark'
              ? 'rgba(19, 23, 48, 0.9)'
              : 'rgba(255, 255, 255, 0.9)',
          },
        },
      },
      // TextField customization
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
            },
          },
        },
      },
      // Typography customization
      MuiTypography: {
        styleOverrides: {
          root: {
            color: 'inherit', // Inherit color from theme
          },
        },
      },
      // Chip customization
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
      // Drawer customization
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  return theme;
};

export default createCustomTheme;
