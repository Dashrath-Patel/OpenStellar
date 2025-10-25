import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import TelegramIcon from '@mui/icons-material/Telegram';
import { useNavigate } from 'react-router-dom';

/**
 * Footer links configuration
 */
const footerLinks = {
  product: [
    { label: 'Explore Bounties', path: '/ExploreBounties' },
    { label: 'Create Bounty', path: '/NewBounty' },
    { label: 'How It Works', path: '/#how-it-works' },
  ],
  resources: [
    { label: 'Documentation', path: '/docs' },
    { label: 'Help Center', path: '/help' },
    { label: 'API', path: '/api' },
  ],
  company: [
    { label: 'About Us', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Careers', path: '/careers' },
  ],
};

/**
 * Social media links configuration
 */
const socialLinks = [
  { icon: <GitHubIcon />, url: 'https://github.com', label: 'GitHub' },
  { icon: <TwitterIcon />, url: 'https://twitter.com', label: 'Twitter' },
  { icon: <TelegramIcon />, url: 'https://telegram.org', label: 'Telegram' },
];

/**
 * Footer Component
 * Displays site links, social media, and copyright information
 * Fully responsive with adaptive layout
 */
const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleNavigation = (path) => {
    if (path.startsWith('#')) {
      // Handle hash navigation
      const element = document.querySelector(path);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(path);
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Brand section */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              fontWeight={700}
              color="primary"
              gutterBottom
            >
              OpenStellar
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Discover, create, and complete bounties on the Stellar network.
              Empowering developers and projects with decentralized incentives.
            </Typography>
            <Stack direction="row" spacing={1}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Product links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Product
            </Typography>
            <Stack spacing={1}>
              {footerLinks.product.map((link) => (
                <Link
                  key={link.label}
                  component="button"
                  onClick={() => handleNavigation(link.path)}
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    textAlign: 'left',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Resources links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Resources
            </Typography>
            <Stack spacing={1}>
              {footerLinks.resources.map((link) => (
                <Link
                  key={link.label}
                  component="button"
                  onClick={() => handleNavigation(link.path)}
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    textAlign: 'left',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Company links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Company
            </Typography>
            <Stack spacing={1}>
              {footerLinks.company.map((link) => (
                <Link
                  key={link.label}
                  component="button"
                  onClick={() => handleNavigation(link.path)}
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    textAlign: 'left',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Newsletter section (optional) */}
          <Grid item xs={12} md={2}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Stay Updated
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Follow us on social media for the latest updates and announcements.
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Copyright section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} OpenStellar. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Link
              component="button"
              onClick={() => navigate('/privacy')}
              variant="body2"
              color="text.secondary"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              component="button"
              onClick={() => navigate('/terms')}
              variant="body2"
              color="text.secondary"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Terms of Service
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
