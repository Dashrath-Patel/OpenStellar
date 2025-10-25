import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    InputAdornment,
    CircularProgress,
    Alert,
    Stack,
    ToggleButtonGroup,
    ToggleButton,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GitHubIcon from '@mui/icons-material/GitHub';
import StarIcon from '@mui/icons-material/Star';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { apiCall } from '../../utils/auth';
import CreateBountyIssueModal from '../../components/bounty/CreateBountyIssueModal';
import NavigationBar from '../../components/layout/NavigationBar';

export default function ReposShowcasePage() {
    const [repos, setRepos] = useState([]);
    const [filteredRepos, setFilteredRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewFilter, setViewFilter] = useState('all');
    const [sortBy, setSortBy] = useState('updated');
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchRepos();
    }, []);

    useEffect(() => {
        filterRepos();
    }, [repos, searchQuery, viewFilter, sortBy]);

    const fetchRepos = async () => {
        try {
            setLoading(true);
            const response = await apiCall('/api/github/repos?per_page=100');
            
            if (response.success) {
                setRepos(response.repos);
            } else {
                setError(response.message || 'Failed to fetch repositories');
            }
        } catch (err) {
            console.error('Error fetching repos:', err);
            setError('Failed to load repositories. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filterRepos = () => {
        let filtered = [...repos];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(repo =>
                repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                repo.language?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // View filter
        if (viewFilter === 'with-bounties') {
            filtered = filtered.filter(repo => repo.active_bounties > 0);
        } else if (viewFilter === 'no-bounties') {
            filtered = filtered.filter(repo => repo.active_bounties === 0);
        } else if (viewFilter === 'private') {
            filtered = filtered.filter(repo => repo.private);
        } else if (viewFilter === 'public') {
            filtered = filtered.filter(repo => !repo.private);
        }

        // Sort
        if (sortBy === 'updated') {
            filtered.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        } else if (sortBy === 'stars') {
            filtered.sort((a, b) => b.stargazers_count - a.stargazers_count);
        } else if (sortBy === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'bounties') {
            filtered.sort((a, b) => b.active_bounties - a.active_bounties);
        }

        setFilteredRepos(filtered);
    };

    const handleCreateBounty = (repo) => {
        setSelectedRepo(repo);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedRepo(null);
    };

    const handleBountyCreated = () => {
        // Refresh repos to update stats
        fetchRepos();
        handleModalClose();
    };

    if (loading) {
        return (
            <>
                <NavigationBar />
                <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress size={60} />
                </Container>
            </>
        );
    }

    if (error) {
        return (
            <>
                <NavigationBar />
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Alert severity="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                </Container>
            </>
        );
    }

    return (
        <>
            <NavigationBar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    📦 My Repositories
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Select a repository to create bounty issues
                </Typography>
            </Box>

            {/* Search and Filters */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Search repositories..."
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
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Filter</InputLabel>
                            <Select
                                value={viewFilter}
                                label="Filter"
                                onChange={(e) => setViewFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Repos</MenuItem>
                                <MenuItem value="with-bounties">With Bounties</MenuItem>
                                <MenuItem value="no-bounties">No Bounties</MenuItem>
                                <MenuItem value="public">Public Only</MenuItem>
                                <MenuItem value="private">Private Only</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortBy}
                                label="Sort By"
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <MenuItem value="updated">Recently Updated</MenuItem>
                                <MenuItem value="stars">Most Stars</MenuItem>
                                <MenuItem value="name">Name A-Z</MenuItem>
                                <MenuItem value="bounties">Most Bounties</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            {/* Results Count */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing {filteredRepos.length} of {repos.length} repositories
            </Typography>

            {/* Repos Grid */}
            {filteredRepos.length === 0 ? (
                <Alert severity="info">
                    No repositories found. Try adjusting your filters or connect more repositories.
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {filteredRepos.map((repo) => (
                        <Grid item xs={12} md={6} key={repo.id}>
                            <Card 
                                sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        boxShadow: 6,
                                        transform: 'translateY(-4px)'
                                    }
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    {/* Repo Name */}
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                        <GitHubIcon fontSize="small" />
                                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                            {repo.name}
                                        </Typography>
                                        {repo.private ? (
                                            <LockIcon fontSize="small" color="warning" />
                                        ) : (
                                            <PublicIcon fontSize="small" color="success" />
                                        )}
                                    </Stack>

                                    {/* Full Name */}
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {repo.full_name}
                                    </Typography>

                                    {/* Description */}
                                    <Typography variant="body2" sx={{ mb: 2, minHeight: 40 }}>
                                        {repo.description || 'No description provided'}
                                    </Typography>

                                    {/* Metadata */}
                                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                                        {repo.language && (
                                            <Chip 
                                                label={repo.language} 
                                                size="small" 
                                                color="primary" 
                                                variant="outlined" 
                                            />
                                        )}
                                        <Chip 
                                            icon={<StarIcon fontSize="small" />}
                                            label={repo.stargazers_count} 
                                            size="small" 
                                            variant="outlined"
                                        />
                                        {repo.private && (
                                            <Chip 
                                                label="Private" 
                                                size="small" 
                                                color="warning"
                                                variant="outlined"
                                            />
                                        )}
                                    </Stack>

                                    {/* Bounty Stats */}
                                    {(repo.active_bounties > 0 || repo.completed_bounties > 0) && (
                                        <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                                            <Grid container spacing={1}>
                                                <Grid item xs={4}>
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        Active
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="bold" color="primary">
                                                        {repo.active_bounties}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        Total XLM
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="bold" color="success.main">
                                                        {repo.total_bounty_amount}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        Completed
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {repo.completed_bounties}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}
                                </CardContent>

                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<AttachMoneyIcon />}
                                        onClick={() => handleCreateBounty(repo)}
                                        sx={{
                                            background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)',
                                            }
                                        }}
                                    >
                                        Create Bounty Issue
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Create Bounty Modal */}
            {selectedRepo && (
                <CreateBountyIssueModal
                    open={modalOpen}
                    onClose={handleModalClose}
                    repo={selectedRepo}
                    onSuccess={handleBountyCreated}
                />
            )}
        </Container>
        </>
    );
}
