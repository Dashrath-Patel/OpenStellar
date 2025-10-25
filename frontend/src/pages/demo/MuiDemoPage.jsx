import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Stack,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import { MainLayout } from '../../components/layout';
import { BountyGrid } from '../../components/bounty';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';

// Sample bounty data for demonstration
const sampleBounties = [
  {
    bountyId: '1',
    title: 'Build Stellar Smart Contract for NFT Marketplace',
    description: 'Create a Soroban smart contract that enables NFT minting, trading, and royalty distribution on the Stellar network.',
    payAmount: 500,
    status: 'open',
    difficulty: 'hard',
    topic: 'Smart Contracts',
    creator: { name: 'Alice Dev', wallet: 'GXXXXXXX...' },
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    participantCount: 3,
    maxParticipants: 5,
  },
  {
    bountyId: '2',
    title: 'Design Landing Page for DeFi Protocol',
    description: 'Create a modern, responsive landing page design for a new DeFi protocol built on Stellar.',
    payAmount: 250,
    status: 'open',
    difficulty: 'medium',
    topic: 'Design',
    creator: { name: 'Bob Designer' },
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    participantCount: 5,
    maxParticipants: 10,
  },
  {
    bountyId: '3',
    title: 'Write Technical Documentation',
    description: 'Document the API endpoints and integration guide for Stellar DEX trading bot.',
    payAmount: 150,
    status: 'in_progress',
    difficulty: 'easy',
    topic: 'Documentation',
    creator: { wallet: 'GYYYYYYYYYY...' },
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    participantCount: 1,
    maxParticipants: 2,
  },
  {
    bountyId: '4',
    title: 'Implement Wallet Integration',
    description: 'Add support for Freighter, Albedo, and xBull wallets to our Stellar dApp.',
    payAmount: 400,
    status: 'open',
    difficulty: 'medium',
    topic: 'Frontend',
    creator: { name: 'Charlie Tech' },
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    participantCount: 2,
    maxParticipants: 3,
  },
];

/**
 * MUI Demo Page
 * Showcases Material UI components and patterns
 * Demonstrates responsive design, dark mode, and component usage
 */
const MuiDemoPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Filter bounties based on selected filters
  const filteredBounties = sampleBounties.filter((bounty) => {
    const matchesSearch = bounty.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bounty.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bounty.status === statusFilter;
    const matchesDifficulty = difficultyFilter === 'all' || bounty.difficulty === difficultyFilter;
    
    return matchesSearch && matchesStatus && matchesDifficulty;
  });

  return (
    <MainLayout maxWidth="xl">
      {/* Hero Section */}
      <Box
        sx={{
          mb: 6,
          p: 4,
          borderRadius: 3,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1a1d3a 0%, #252a4a 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Material UI Demo
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
          Explore bounties with modern Material UI components
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            Create Bounty
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Learn More
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{ mb: 4 }}
      >
        {[
          { label: 'Total Bounties', value: '1,234', color: 'primary' },
          { label: 'Active Hunters', value: '567', color: 'secondary' },
          { label: 'Total Rewards', value: '125K XLM', color: 'success' },
          { label: 'Completed', value: '892', color: 'info' },
        ].map((stat) => (
          <Paper
            key={stat.label}
            sx={{
              flex: 1,
              p: 3,
              textAlign: 'center',
              borderTop: 3,
              borderColor: `${stat.color}.main`,
            }}
          >
            <Typography variant="h4" fontWeight={700} color={`${stat.color}.main`}>
              {stat.value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stat.label}
            </Typography>
          </Paper>
        ))}
      </Stack>

      {/* Alert Example */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <strong>New Feature!</strong> You can now filter bounties by difficulty and status.
        Try the filters below!
      </Alert>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Bounties" />
          <Tab label="Open" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
        </Tabs>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search bounties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficultyFilter}
              label="Difficulty"
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <MenuItem value="all">All Levels</MenuItem>
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            sx={{ minWidth: 120 }}
          >
            Filters
          </Button>
        </Stack>

        {/* Active filters */}
        {(statusFilter !== 'all' || difficultyFilter !== 'all' || searchQuery) && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Active Filters:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {searchQuery && (
                <Chip
                  label={`Search: "${searchQuery}"`}
                  onDelete={() => setSearchQuery('')}
                  size="small"
                />
              )}
              {statusFilter !== 'all' && (
                <Chip
                  label={`Status: ${statusFilter}`}
                  onDelete={() => setStatusFilter('all')}
                  size="small"
                />
              )}
              {difficultyFilter !== 'all' && (
                <Chip
                  label={`Difficulty: ${difficultyFilter}`}
                  onDelete={() => setDifficultyFilter('all')}
                  size="small"
                />
              )}
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Bounty Grid */}
      <BountyGrid bounties={filteredBounties} />

      {/* No results */}
      {filteredBounties.length === 0 && (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            backgroundColor: 'action.hover',
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bounties found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Try adjusting your search or filters
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setDifficultyFilter('all');
            }}
          >
            Clear All Filters
          </Button>
        </Paper>
      )}
    </MainLayout>
  );
};

export default MuiDemoPage;
