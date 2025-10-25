import { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  useMediaQuery,
  useTheme,
  Container,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import WorkIcon from '@mui/icons-material/Work';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GitHubIcon from '@mui/icons-material/GitHub';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import FolderIcon from '@mui/icons-material/Folder';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from '../../theme/ThemeToggle';
import { isAuthenticated, getCurrentUser, logout } from '../../utils/auth';

/**
 * Navigation items configuration
 */
const navItems = [
  { label: 'Home', path: '/', icon: <HomeIcon /> },
  { label: 'Explore Bounties', path: '/ExploreBounties', icon: <ExploreIcon /> },
  { label: 'My Repositories', path: '/repos', icon: <FolderIcon />, requireAuth: true },
  { label: 'In Progress', path: '/InProgress', icon: <WorkIcon /> },
  { label: 'My Bounties', path: '/MyBounties', icon: <WorkIcon /> },
  { label: 'Profile Settings', path: '/Settings', icon: <SettingsIcon /> },
];

/**
 * Responsive Navigation Bar Component
 * Includes mobile drawer, theme toggle, and wallet connection
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.walletButton - Custom wallet button component
 */
const NavigationBar = ({ walletButton = null }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get authentication state
  const authenticated = isAuthenticated();
  const user = getCurrentUser();

  // User menu handlers
  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  const handleGitHubLogin = () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888';
    window.location.href = `${API_BASE_URL}/api/auth/github`;
  };

  // Toggle mobile drawer
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Navigate to page and close drawer
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Check if current path is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Mobile drawer content
  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7B61FF 0%, #00D1FF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RocketLaunchIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Typography variant="h6" fontWeight={700} color="primary">
          OpenStellar
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems
          .filter(item => !item.requireAuth || authenticated)
          .map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? 'inherit' : 'text.secondary',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexGrow: { xs: 1, md: 0 },
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7B61FF 0%, #00D1FF 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RocketLaunchIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography
                variant="h6"
                fontWeight={700}
                color="primary"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                OpenStellar
              </Typography>
            </Box>

            {/* Desktop navigation */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', ml: 4, gap: 1 }}>
                {navItems
                  .filter(item => !item.requireAuth || authenticated)
                  .slice(0, -1)
                  .map((item) => (
                  <Button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    startIcon={item.icon}
                    variant={isActive(item.path) ? 'contained' : 'text'}
                    sx={{
                      color: isActive(item.path)
                        ? 'primary.contrastText'
                        : 'text.primary',
                      '& .MuiButton-startIcon': {
                        color: 'inherit',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Right side actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ThemeToggle />
              
              {/* GitHub Authentication */}
              {authenticated ? (
                <>
                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{ p: 0 }}
                  >
                    <Avatar
                      src={user?.avatarUrl || `https://github.com/${user?.github}.png`}
                      alt={user?.github || 'User'}
                      sx={{ width: 32, height: 32 }}
                    >
                      {user?.github?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleUserMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem onClick={() => { handleUserMenuClose(); navigate('/Settings'); }}>
                      <ListItemIcon>
                        <AccountCircleIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Profile Settings</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Logout</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<GitHubIcon />}
                  onClick={handleGitHubLogin}
                  size="small"
                  sx={{
                    backgroundColor: '#24292e',
                    color: 'white',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#1a1e22',
                    },
                  }}
                >
                  {isMobile ? 'Login' : 'Sign in with GitHub'}
                </Button>
              )}
              
              {walletButton}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default NavigationBar;
