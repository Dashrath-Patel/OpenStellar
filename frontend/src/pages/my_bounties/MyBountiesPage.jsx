import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  Grid,
  Alert,
} from '@mui/material';
import { MainLayout } from '../../components/layout';
import { BountyGrid } from '../../components/bounty';
import { useCustomWallet } from '../../contexts/WalletContext';
import useBackend from '../../hooks/useBackend';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import WorkIcon from '@mui/icons-material/Work';
import GitHubIcon from '@mui/icons-material/GitHub';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { apiCall, isAuthenticated, getCurrentUser } from '../../utils/auth';

const MyBountiesPage = () => {
  const { isConnected, walletAddress, connectWallet } = useCustomWallet();
  const { getRecentBounties } = useBackend();
  const [oldBounties, setOldBounties] = useState([]);
  const [bountyIssues, setBountyIssues] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const authenticated = isAuthenticated();
  const user = getCurrentUser();

  useEffect(() => {
    fetchAllBounties();
  }, [isConnected, authenticated]);

  const fetchAllBounties = async () => {
    setLoading(true);
    try {
      // Fetch old bounties (Stellar contract based)
      if (isConnected) {
        const data = await getRecentBounties();
        if (data) {
          setOldBounties(data);
        }
      }

      // Fetch new bounty issues (GitHub + Stellar)
      if (authenticated) {
        const response = await apiCall('/api/bounty-issues?created_by_me=true');
        if (response.success) {
          setBountyIssues(response.issues);
        }
      }
    } catch (error) {
      console.error('Failed to load bounties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter old bounties created by the user
  const createdOldBounties = oldBounties.filter(
    bounty => bounty.creator?.toLowerCase() === walletAddress?.toLowerCase()
  );

  // Filter old bounties where user is participating
  const participatingOldBounties = oldBounties.filter(bounty => {
    return bounty.participants?.some(p => p.address?.toLowerCase() === walletAddress?.toLowerCase()) ||
           bounty.submissions?.some(s => s.submitter?.toLowerCase() === walletAddress?.toLowerCase());
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'success';
      case 'in_progress': return 'info';
      case 'under_review': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <MainLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" gutterBottom fontWeight={700}>
            My Bounties
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage bounties you've created and track your participation
          </Typography>
        </Box>
        {authenticated && (
          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            href="/repos"
            size="large"
          >
            Create Bounty Issue
          </Button>
        )}
      </Box>

      {!authenticated ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Sign In with GitHub
          </Typography>
          <Typography color="text.secondary" paragraph>
            Sign in with GitHub to view and manage your bounty issues.
          </Typography>
          <Button variant="contained" href="/api/auth/github" size="large">
            Sign In with GitHub
          </Button>
        </Paper>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label={`Created by Me (${bountyIssues.length})`} />
              <Tab label={`Participating (${participatingOldBounties.length})`} />
            </Tabs>
          </Paper>

          {tabValue === 0 ? (
            // Created by Me - Show GitHub Bounty Issues
            bountyIssues.length > 0 ? (
              <Grid container spacing={3}>
                {bountyIssues.map((issue) => (
                  <Grid item xs={12} md={6} key={issue._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                          <Chip 
                            label={formatStatus(issue.status)} 
                            color={getStatusColor(issue.status)} 
                            size="small" 
                          />
                          <Chip 
                            label={issue.difficulty} 
                            color={getDifficultyColor(issue.difficulty)} 
                            size="small" 
                          />
                        </Stack>

                        <Typography variant="h6" gutterBottom>
                          {issue.title}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {issue.description.substring(0, 150)}...
                        </Typography>

                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <GitHubIcon fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                              {issue.repoFullName}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachMoneyIcon fontSize="small" color="success" />
                            <Typography variant="body2" fontWeight="bold" color="success.main">
                              {issue.bountyAmount} XLM
                            </Typography>
                          </Box>

                          {issue.deadline && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarTodayIcon fontSize="small" />
                              <Typography variant="body2" color="text.secondary">
                                Deadline: {new Date(issue.deadline).toLocaleDateString()}
                              </Typography>
                            </Box>
                          )}

                          <Box sx={{ mt: 1 }}>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                              {issue.skills.map((skill, idx) => (
                                <Chip key={idx} label={skill} size="small" variant="outlined" />
                              ))}
                            </Stack>
                          </Box>
                        </Stack>
                      </CardContent>

                      <CardActions sx={{ p: 2, pt: 0 }}>
                        {issue.githubIssueUrl && (
                          <Button 
                            size="small" 
                            startIcon={<GitHubIcon />}
                            href={issue.githubIssueUrl}
                            target="_blank"
                          >
                            View on GitHub
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <AddCircleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Bounties Created Yet
                </Typography>
                <Typography color="text.secondary" paragraph>
                  Create your first bounty issue to get started with the platform.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddCircleIcon />}
                  href="/repos"
                >
                  Create Your First Bounty
                </Button>
              </Paper>
            )
          ) : (
            // Participating - Show Old Bounties
            participatingOldBounties.length > 0 ? (
              <BountyGrid bounties={participatingOldBounties} />
            ) : (
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Not Participating Yet
                </Typography>
                <Typography color="text.secondary" paragraph>
                  Explore available bounties and start participating to earn rewards.
                </Typography>
                <Button
                  variant="contained"
                  href="/ExploreBounties"
                  size="large"
                >
                  Explore Bounties
                </Button>
              </Paper>
            )
          )}
        </>
      )}
    </MainLayout>
  );
};

export default MyBountiesPage;
