import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  Button,
  CircularProgress,
} from '@mui/material';
import { MainLayout } from '../../components/layout';
import { BountyGrid } from '../../components/bounty';
import { useCustomWallet } from '../../contexts/WalletContext';
import { getAuthToken } from '../../utils/auth';
import WorkIcon from '@mui/icons-material/Work';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888';

const InProgressPage = () => {
  const { isConnected, walletAddress, connectWallet } = useCustomWallet();
  const [applications, setApplications] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) {
          console.log('No auth token found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/applications/my`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        console.log('Applications API Response:', data);
        if (data.success && data.applications) {
          console.log('Applications received:', data.applications);
          console.log('Number of applications:', data.applications.length);
          setApplications(data.applications);
        }
      } catch (error) {
        console.error('Failed to load applications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isConnected) {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [isConnected]);

  // Filter active bounties (approved/accepted applications where work is in progress)
  const activeBounties = applications.filter(app => {
    console.log('Filtering app:', {
      id: app._id,
      status: app.status,
      hasBounty: !!app.bountyIssueId,
      bountyStatus: app.bountyIssueId?.status
    });
    return app.status === 'accepted' && 
           app.bountyIssueId && 
           (app.bountyIssueId.status === 'in_progress' || app.bountyIssueId.status === 'open');
  }).map(app => ({
    ...app.bountyIssueId,
    applicationId: app._id,
    applicationStatus: app.status
  }));
  
  console.log('Active bounties:', activeBounties);
  
  // Filter submitted bounties (bounties with submitted work under review or completed)
  const submittedBounties = applications.filter(app =>
    app.status === 'accepted' &&
    app.bountyIssueId &&
    (app.bountyIssueId.status === 'under_review' || app.bountyIssueId.status === 'completed')
  ).map(app => ({
    ...app.bountyIssueId,
    applicationId: app._id,
    applicationStatus: app.status
  }));

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getFilteredBounties = () => {
    switch (tabValue) {
      case 0:
        return activeBounties;
      case 1:
        return submittedBounties;
      default:
        return activeBounties;
    }
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          In Progress
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track bounties you're currently working on
        </Typography>
      </Box>

      {!isConnected ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Connect Your Wallet
          </Typography>
          <Typography color="text.secondary" paragraph>
            Connect your wallet to view bounties you're working on.
          </Typography>
          <Button variant="contained" onClick={connectWallet} size="large">
            Connect Wallet
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
              <Tab label={`Active (${activeBounties.length})`} />
              <Tab label={`Submitted (${submittedBounties.length})`} />
            </Tabs>
          </Paper>

          {getFilteredBounties().length > 0 ? (
            <BountyGrid bounties={getFilteredBounties()} />
          ) : (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Bounties Found
              </Typography>
              <Typography color="text.secondary" paragraph>
                {tabValue === 0 && "You're not currently working on any bounties."}
                {tabValue === 1 && "You haven't submitted any work yet."}
              </Typography>
              <Button
                variant="contained"
                href="/repos"
              >
                View My Repositories
              </Button>
            </Paper>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default InProgressPage;
