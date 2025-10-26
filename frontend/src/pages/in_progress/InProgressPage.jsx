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
import useBackend from '../../hooks/useBackend';
import WorkIcon from '@mui/icons-material/Work';

const InProgressPage = () => {
  const { isConnected, walletAddress, connectWallet } = useCustomWallet();
  const { getRecentBounties } = useBackend();
  const [bounties, setBounties] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBounties = async () => {
      setLoading(true);
      try {
        const data = await getRecentBounties();
        if (data) {
          setBounties(data);
        }
      } catch (error) {
        console.error('Failed to load bounties:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isConnected) {
      fetchBounties();
    } else {
      setLoading(false);
    }
  }, [isConnected]);

  // Filter bounties where user is participating
  const inProgressBounties = bounties.filter(bounty => {
    // Check if user has submitted work or is participating
    // This assumes bounty has participants array or similar structure
    return bounty.participants?.some(p => p.address === walletAddress) ||
           bounty.submissions?.some(s => s.submitter === walletAddress);
  });

  // Filter by status
  const activeBounties = inProgressBounties.filter(
    bounty => bounty.status === 'active' || bounty.status === 'in_progress'
  );
  
  const submittedBounties = inProgressBounties.filter(
    bounty => bounty.submissions?.some(s => s.submitter === walletAddress && s.status === 'pending')
  );

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
        return inProgressBounties;
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
              <Tab label={`All (${inProgressBounties.length})`} />
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
                {tabValue === 2 && "You're not participating in any bounties."}
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
