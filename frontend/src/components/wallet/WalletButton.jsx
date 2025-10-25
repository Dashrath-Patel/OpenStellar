import { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  ContentCopy as CopyIcon,
  Logout as LogoutIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useCustomWallet } from '../../contexts/WalletContext';

/**
 * Wallet Connect Button Component
 * Integrates with existing WalletContext
 * Shows wallet address, balance, and disconnect option
 */
const WalletButton = () => {
  const {
    isConnected,
    walletAddress,
    balance,
    balanceLoading,
    connectWallet,
    disconnectWallet,
  } = useCustomWallet();

  const [anchorEl, setAnchorEl] = useState(null);
  const [copied, setCopied] = useState(false);
  const open = Boolean(anchorEl);

  // Shorten wallet address for display
  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Copy address to clipboard
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  // Handle menu open
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle disconnect
  const handleDisconnect = () => {
    disconnectWallet();
    handleClose();
  };

  // If not connected, show connect button
  if (!isConnected) {
    return (
      <Button
        variant="contained"
        color="primary"
        startIcon={<WalletIcon />}
        onClick={connectWallet}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
        }}
      >
        Connect Wallet
      </Button>
    );
  }

  // If connected, show wallet info
  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        startIcon={<WalletIcon />}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
          borderWidth: 2,
          color: 'text.primary',
          borderColor: 'primary.main',
          '&:hover': {
            borderWidth: 2,
            borderColor: 'primary.main',
          },
          '& .MuiButton-startIcon': {
            color: 'primary.main',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 0.5 }}>
          <Typography variant="caption" sx={{ lineHeight: 1, mb: 0.3, color: 'text.secondary' }}>
            {balanceLoading ? (
              <CircularProgress size={10} />
            ) : (
              `${parseFloat(balance).toFixed(2)} XLM`
            )}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {shortenAddress(walletAddress)}
          </Typography>
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            minWidth: 280,
            mt: 1,
            borderRadius: 2,
          },
        }}
      >
        {/* Wallet Address */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Wallet Address
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
              {shortenAddress(walletAddress)}
            </Typography>
            <Tooltip title={copied ? 'Copied!' : 'Copy address'}>
              <IconButton size="small" onClick={handleCopyAddress}>
                {copied ? (
                  <CheckIcon fontSize="small" color="success" />
                ) : (
                  <CopyIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Balance */}
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Balance
          </Typography>
          <Chip
            label={
              balanceLoading
                ? 'Loading...'
                : `${parseFloat(balance).toFixed(4)} XLM`
            }
            color="success"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Divider />

        {/* Disconnect */}
        <MenuItem onClick={handleDisconnect} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" fontWeight={600}>
              Disconnect
            </Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default WalletButton;
