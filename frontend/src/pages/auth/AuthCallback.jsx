import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const errorParam = params.get('error');

        if (errorParam) {
          setError(decodeURIComponent(errorParam));
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (!token) {
          setError('No authentication token received');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Store token in localStorage
        localStorage.setItem('authToken', token);
        
        // Fetch user profile to verify token
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to verify authentication');
        }

        const data = await response.json();
        const userData = data.user || data; // Handle both nested and flat response
        
        console.log('=== GitHub Auth Success ===');
        console.log('Raw response:', data);
        console.log('User data:', userData);
        console.log('Username:', userData.github);
        console.log('Avatar:', userData.avatarUrl || userData.avatar);
        console.log('=========================');
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Force a page reload to update React state
        window.location.href = '/';
        
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err.message || 'Authentication failed');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{ px: 2 }}
    >
      {error ? (
        <>
          <Alert severity="error" sx={{ mb: 2, maxWidth: 500 }}>
            {error}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Redirecting to home page...
          </Typography>
        </>
      ) : (
        <>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Authenticating with GitHub...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we complete your sign-in
          </Typography>
        </>
      )}
    </Box>
  );
};

export default AuthCallback;
