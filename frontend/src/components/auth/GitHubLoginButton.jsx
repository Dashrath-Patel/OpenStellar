import React from 'react';
import { Button } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888';

const GitHubLoginButton = ({ fullWidth = false, size = 'large', text = 'Connect with GitHub' }) => {
  const handleGitHubLogin = () => {
    // Redirect to backend OAuth route
    window.location.href = `${API_BASE_URL}/api/auth/github`;
  };

  return (
    <Button
      variant="contained"
      startIcon={<GitHubIcon />}
      onClick={handleGitHubLogin}
      fullWidth={fullWidth}
      size={size}
      sx={{
        backgroundColor: '#24292e',
        color: 'white',
        textTransform: 'none',
        fontWeight: 600,
        py: 1.5,
        '&:hover': {
          backgroundColor: '#1a1e22',
        },
      }}
    >
      {text}
    </Button>
  );
};

export default GitHubLoginButton;
