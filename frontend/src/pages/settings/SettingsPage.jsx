import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  IconButton,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  GitHub as GitHubIcon,
  Send as DiscordIcon,
  AccountBalanceWallet as WalletIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { MainLayout } from '../../components/layout';
import { useCustomWallet } from '../../contexts/WalletContext';
import useBackend from '../../hooks/useBackend';
import AvatarCrop from '../../components/AvatarCrop';
import { isAuthenticated, getCurrentUser } from '../../utils/auth';

const SettingsPage = () => {
  const { walletAddress, isConnected, balance, connectWallet } = useCustomWallet();
  const { getUser, setUser } = useBackend();
  
  // Get GitHub authenticated user
  const authenticated = isAuthenticated();
  const githubUser = getCurrentUser();
  
  const [name, setName] = useState('');
  const [github, setGitHub] = useState('');
  const [discord, setDiscord] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  // Load user data
  useEffect(() => {
    // If GitHub authenticated, use GitHub data
    if (authenticated && githubUser) {
      setName(githubUser.name || githubUser.github || '');
      setGitHub(githubUser.github || '');
      setAvatar(githubUser.avatarUrl || `https://github.com/${githubUser.github}.png`);
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      if (!isConnected) {
        setName('');
        setGitHub('');
        setDiscord('');
        setAvatar(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const user = await getUser(walletAddress);
        if (user) {
          setName(user.name || '');
          setGitHub(user.github || '');
          setDiscord(user.discord || '');
          setAvatar(user.img || null);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        toast.error('Failed to load user information');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isConnected, walletAddress, authenticated, githubUser]);

  // Handle avatar dialog
  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setPreview(null);
  };

  const handleAvatarOk = () => {
    setAvatar(preview);
    setOpen(false);
    setPreview(null);
  };

  const handleAvatarCrop = (croppedImage) => {
    setPreview(croppedImage);
  };

  const handleAvatarClose = () => {
    setPreview(null);
  };

  // Save user settings
  const handleSave = async () => {
    if (!isConnected) {
      toast.warning('Wallet not connected yet!');
      return;
    }

    setSaving(true);
    try {
      const result = await setUser(walletAddress, name, github, discord, avatar);
      
      if (result) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error('Failed to save user information!');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save user information!');
    } finally {
      setSaving(false);
    }
  };

  // Shorten wallet address
  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 10)}...${address.slice(-6)}`;
  };

  return (
    <MainLayout maxWidth="md">
      <Typography variant="h3" gutterBottom fontWeight={700}>
        Profile Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your profile and account settings
      </Typography>

      {!authenticated && !isConnected ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Connect Your Wallet or Sign In
          </Typography>
          <Typography color="text.secondary" paragraph>
            You need to sign in with GitHub or connect your wallet to access settings.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" onClick={connectWallet} size="large">
              Connect Wallet
            </Button>
          </Stack>
        </Paper>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
        <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Stack spacing={3}>
                {/* Avatar */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={avatar || '/images/banner/unknown.png'}
                      sx={{ width: 120, height: 120 }}
                    />
                    {!authenticated && (
                      <IconButton
                        onClick={handleOpenDialog}
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                        }}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Profile Picture
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {authenticated ? 'Synced from GitHub' : 'Upload a profile picture to personalize your account'}
                    </Typography>
                  </Box>
                </Box>

                {/* GitHub Account Info - Show if authenticated */}
                {authenticated && githubUser && (
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GitHubIcon color="primary" />
                        <Typography variant="subtitle1" fontWeight={600}>
                          GitHub Account
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            Username
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            @{githubUser.github || 'N/A'}
                          </Typography>
                        </Grid>
                        {githubUser.email && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">
                              Email
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {githubUser.email}
                            </Typography>
                          </Grid>
                        )}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            GitHub ID
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {githubUser.githubId || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            Role
                          </Typography>
                          <Chip 
                            label={githubUser.role || 'contributor'} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </Grid>
                        {githubUser.createdAt && (
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                              Member Since
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {new Date(githubUser.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Stack>
                  </Paper>
                )}

                {/* Wallet Info */}
                {isConnected && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Connected Wallet
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Chip
                        icon={<WalletIcon />}
                        label={shortenAddress(walletAddress)}
                        variant="outlined"
                        color="primary"
                      />
                      <Chip
                        label={`${balance} XLM`}
                        color="success"
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                )}

                {/* Name */}
                <TextField
                  fullWidth
                  label="Name"
                  disabled={authenticated}
                  helperText={authenticated ? 'Synced from GitHub account' : 'Your display name'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />

                {/* GitHub */}
                <TextField
                  fullWidth
                  label="GitHub Profile"
                  disabled={authenticated}
                  helperText={authenticated ? 'Synced from GitHub account' : 'Your GitHub profile URL'}
                  value={github}
                  onChange={(e) => setGitHub(e.target.value)}
                  placeholder="https://github.com/username"
                  InputProps={{
                    startAdornment: <GitHubIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />

                {/* Discord */}
                <TextField
                  fullWidth
                  label="Discord"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  placeholder="username#1234"
                  InputProps={{
                    startAdornment: <DiscordIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  helperText="Your Discord username"
                />

                {/* Save Button */}
                {!authenticated && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ mt: 2 }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
                
                {authenticated && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Profile information is automatically synced from your GitHub account.
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Info */}
        <Grid item xs={12}>
          <Alert severity="info">
            Your profile information helps other users connect with you for bounty collaborations.
          </Alert>
        </Grid>
      </Grid>

      {/* Avatar Crop Dialog */}
      <Dialog 
        open={open} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Your Profile Picture</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexDirection: { xs: 'column', sm: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <AvatarCrop
                width={300}
                height={250}
                exportSize={200}
                onCrop={handleAvatarCrop}
                onClose={handleAvatarClose}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Preview
              </Typography>
              <Avatar
                src={preview || avatar || '/images/banner/unknown.png'}
                sx={{ width: 120, height: 120 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleAvatarOk} 
            variant="contained"
            disabled={!preview}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
        </>
      )}
    </MainLayout>
  );
};

export default SettingsPage;
