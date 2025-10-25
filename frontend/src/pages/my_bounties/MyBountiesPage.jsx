import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  CircularProgress,
} from '@mui/material';
import { MainLayout } from '../../components/layout';
import { BountyGrid } from '../../components/bounty';
import { useCustomWallet } from '../../contexts/WalletContext';
import useBackend from '../../hooks/useBackend';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import WorkIcon from '@mui/icons-material/Work';

const MyBountiesPage = () => {
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

  // Filter bounties created by the user
  const createdBounties = bounties.filter(
    bounty => bounty.creator?.toLowerCase() === walletAddress?.toLowerCase()
  );

  // Filter bounties where user is participating
  const participatingBounties = bounties.filter(bounty => {
    return bounty.participants?.some(p => p.address?.toLowerCase() === walletAddress?.toLowerCase()) ||
           bounty.submissions?.some(s => s.submitter?.toLowerCase() === walletAddress?.toLowerCase());
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getDisplayedBounties = () => {
    return tabValue === 0 ? createdBounties : participatingBounties;
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
        {isConnected && (
          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            href="/NewBounty"
            size="large"
          >
            Create Bounty
          </Button>
        )}
      </Box>

      {!isConnected ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Connect Your Wallet
          </Typography>
          <Typography color="text.secondary" paragraph>
            Connect your wallet to view and manage your bounties.
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
              <Tab label={`Created by Me (${createdBounties.length})`} />
              <Tab label={`Participating (${participatingBounties.length})`} />
            </Tabs>
          </Paper>

          {getDisplayedBounties().length > 0 ? (
            <BountyGrid bounties={getDisplayedBounties()} />
          ) : (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              {tabValue === 0 ? (
                <>
                  <AddCircleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No Bounties Created Yet
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    Create your first bounty to get started with the platform.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddCircleIcon />}
                    href="/NewBounty"
                    size="large"
                  >
                    Create Your First Bounty
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
            </Paper>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default MyBountiesPage;
