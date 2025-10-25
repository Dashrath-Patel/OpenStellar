import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Paper,
  Chip,
  Button,
  InputAdornment,
  Alert,
  Skeleton,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { MainLayout } from '../../components/layout';
import { WalletButton } from '../../components/wallet';
import { BountyGrid } from '../../components/bounty';
import useBackend from '../../hooks/useBackend';

/**
 * Explore Bounties Page
 * Browse all bounties with filters and search
 * Integrates with existing backend hooks
 */
const ExploreBountiesPage = () => {
  const { getRecentBounties } = useBackend();
  
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Load bounties from backend
  const loadBounties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecentBounties();
      
      if (data && Array.isArray(data)) {
        setBounties(data);
      } else {
        setBounties([]);
      }
    } catch (err) {
      console.error('Failed to load bounties:', err);
      setError('Failed to load bounties. Please try again.');
      setBounties([]);
    } finally {
      setLoading(false);
    }
  };

  // Load bounties on mount
  useEffect(() => {
    loadBounties();
  }, []);

  // Filter and sort bounties
  const filteredBounties = bounties
    .filter((bounty) => {
      // Search filter
      const matchesSearch =
        bounty.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bounty.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bounty.topic?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === 'all' || bounty.status === statusFilter;

      // Difficulty filter
      const matchesDifficulty =
        difficultyFilter === 'all' || bounty.difficulty === difficultyFilter;

      return matchesSearch && matchesStatus && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'reward-high':
          return (b.payAmount || 0) - (a.payAmount || 0);
        case 'reward-low':
          return (a.payAmount || 0) - (b.payAmount || 0);
        default:
          return 0;
      }
    });

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDifficultyFilter('all');
    setSortBy('newest');
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery || statusFilter !== 'all' || difficultyFilter !== 'all';

  return (
    <MainLayout walletButton={<WalletButton />}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Explore Bounties
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover bounties and start earning rewards on the Stellar network
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stack spacing={3}>
          {/* Search and Refresh */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Search bounties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadBounties}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              Refresh
            </Button>
          </Stack>

          {/* Filters Row */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
          >
            <FormControl sx={{ minWidth: 150 }} size="small">
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
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }} size="small">
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

            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="reward-high">Reward: High to Low</MenuItem>
                <MenuItem value="reward-low">Reward: Low to High</MenuItem>
              </Select>
            </FormControl>

            {hasActiveFilters && (
              <Button
                variant="text"
                onClick={clearFilters}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Clear Filters
              </Button>
            )}
          </Stack>

          {/* Active Filters */}
          {hasActiveFilters && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
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
        </Stack>
      </Paper>

      {/* Results Count */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {loading ? (
            'Loading bounties...'
          ) : (
            <>
              Showing <strong>{filteredBounties.length}</strong> of{' '}
              <strong>{bounties.length}</strong> bounties
            </>
          )}
        </Typography>
      </Box>

      {/* Bounties Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : filteredBounties.length > 0 ? (
        <BountyGrid bounties={filteredBounties} spacing={3} />
      ) : (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: 'action.hover',
          }}
        >
          <FilterIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bounties found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {hasActiveFilters
              ? 'Try adjusting your search or filters'
              : 'No bounties available at the moment'}
          </Typography>
          {hasActiveFilters && (
            <Button variant="outlined" onClick={clearFilters}>
              Clear All Filters
            </Button>
          )}
        </Paper>
      )}
    </MainLayout>
  );
};

export default ExploreBountiesPage;
