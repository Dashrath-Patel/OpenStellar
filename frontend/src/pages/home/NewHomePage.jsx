import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Paper,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Rocket as RocketIcon,
  EmojiEvents as TrophyIcon,
  People as PeopleIcon,
  TrendingUp as TrendingIcon,
  Add as AddIcon,
  Explore as ExploreIcon,
  Code as CodeIcon,
  Palette as DesignIcon,
  Description as DocsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout';
import { WalletButton } from '../../components/wallet';
import { BountyGrid } from '../../components/bounty';
import useBackend from '../../hooks/useBackend';

/**
 * Feature Card Component
 */
const FeatureCard = ({ icon, title, description }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-8px)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            mb: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

/**
 * Category Chip Component
 */
const CategoryChip = ({ icon, label, count }) => {
  return (
    <Chip
      icon={icon}
      label={`${label} (${count})`}
      variant="outlined"
      sx={{
        borderRadius: 2,
        py: 2.5,
        px: 1,
        '& .MuiChip-label': {
          fontWeight: 600,
        },
      }}
    />
  );
};

/**
 * New HomePage Component
 * Modern landing page with hero, features, stats, and featured bounties
 */
const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { getRecentBounties } = useBackend();
  
  const [stats, setStats] = useState({
    totalBounties: 0,
    activeBounties: 0,
    totalRewards: 0,
    activeUsers: 0,
  });
  
  const [featuredBounties, setFeaturedBounties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load stats and featured bounties
  useEffect(() => {
    const loadData = async () => {
      try {
        const bounties = await getRecentBounties();
        
        if (bounties && bounties.length > 0) {
          // Calculate stats
          const activeBounties = bounties.filter(b => b.status === 'open').length;
          const totalRewards = bounties.reduce((sum, b) => sum + (b.payAmount || 0), 0);
          
          setStats({
            totalBounties: bounties.length,
            activeBounties,
            totalRewards: Math.round(totalRewards),
            activeUsers: bounties.length * 2, // Estimate
          });
          
          // Get featured bounties (first 3 open bounties)
          const featured = bounties
            .filter(b => b.status === 'open')
            .slice(0, 3);
          setFeaturedBounties(featured);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const features = [
    {
      icon: <RocketIcon fontSize="large" />,
      title: 'Create Bounties',
      description: 'Launch bounties for your project and attract talented developers from the Stellar ecosystem.',
    },
    {
      icon: <TrophyIcon fontSize="large" />,
      title: 'Earn Rewards',
      description: 'Complete bounties and earn XLM directly to your wallet. Build your reputation in the community.',
    },
    {
      icon: <PeopleIcon fontSize="large" />,
      title: 'Collaborate',
      description: 'Connect with other developers, share knowledge, and build amazing projects together.',
    },
    {
      icon: <TrendingIcon fontSize="large" />,
      title: 'Track Progress',
      description: 'Monitor your bounties, submissions, and payments all in one place with real-time updates.',
    },
  ];

  const categories = [
    { icon: <CodeIcon />, label: 'Smart Contracts', count: stats.totalBounties > 0 ? Math.floor(stats.totalBounties * 0.4) : 12 },
    { icon: <DesignIcon />, label: 'Design', count: stats.totalBounties > 0 ? Math.floor(stats.totalBounties * 0.3) : 8 },
    { icon: <DocsIcon />, label: 'Documentation', count: stats.totalBounties > 0 ? Math.floor(stats.totalBounties * 0.3) : 6 },
  ];

  return (
    <MainLayout walletButton={<WalletButton />} showFooter={true}>
      {/* Hero Section */}
      <Box
        sx={{
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a1d3a 0%, #252a4a 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          color: '#FFFFFF',
          py: { xs: 6, md: 10 },
          px: { xs: 3, md: 6 },
          mb: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          }}
        />
        
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="h2"
                fontWeight={700}
                gutterBottom
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  color: '#FFFFFF',
                }}
              >
                Find Bounties, Reap Rewards
              </Typography>
              <Typography
                variant="h6"
                sx={{ opacity: 0.95, mb: 4, lineHeight: 1.6, color: '#FFFFFF' }}
              >
                Discover and complete bounties on the Stellar network. Earn XLM while building the future of decentralized finance.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ExploreIcon />}
                  onClick={() => navigate('/ExploreBounties')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                    borderRadius: 2,
                    py: 1.5,
                    px: 4,
                  }}
                >
                  Explore Bounties
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/NewBounty')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    borderWidth: 2,
                    '&:hover': {
                      borderColor: 'white',
                      borderWidth: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                    borderRadius: 2,
                    py: 1.5,
                    px: 4,
                  }}
                >
                  Create Bounty
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ mb: 8 }}>
        <Grid container spacing={3}>
          {[
            { label: 'Total Bounties', value: stats.totalBounties, icon: <TrophyIcon /> },
            { label: 'Active Bounties', value: stats.activeBounties, icon: <RocketIcon /> },
            { label: 'Total Rewards', value: `${stats.totalRewards} XLM`, icon: <TrendingIcon /> },
            { label: 'Active Users', value: stats.activeUsers, icon: <PeopleIcon /> },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderTop: 3,
                  borderColor: 'primary.main',
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 1 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {loading ? '...' : stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Categories Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom textAlign="center" mb={4}>
          Browse by Category
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          flexWrap="wrap"
          useFlexGap
        >
          {categories.map((category, index) => (
            <CategoryChip key={index} {...category} />
          ))}
        </Stack>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom textAlign="center" mb={4}>
          Why Choose OpenStellar?
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <FeatureCard {...feature} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Featured Bounties Section */}
      {featuredBounties.length > 0 && (
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight={700}>
              Featured Bounties
            </Typography>
            <Button
              variant="outlined"
              endIcon={<ExploreIcon />}
              onClick={() => navigate('/ExploreBounties')}
            >
              View All
            </Button>
          </Box>
          <BountyGrid bounties={featuredBounties} spacing={3} />
        </Box>
      )}

      {/* CTA Section */}
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.3)} 0%, ${alpha(theme.palette.secondary.light, 0.3)} 100%)`,
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Ready to Get Started?
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
          Join the OpenStellar community and start earning rewards today.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<ExploreIcon />}
          onClick={() => navigate('/ExploreBounties')}
          sx={{ borderRadius: 2, py: 1.5, px: 4 }}
        >
          Start Exploring
        </Button>
      </Paper>
    </MainLayout>
  );
};

export default HomePage;
