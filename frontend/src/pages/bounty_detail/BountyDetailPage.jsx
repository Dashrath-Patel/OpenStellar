import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Chip,
    Button,
    CircularProgress,
    Alert,
    Divider,
    Grid,
    Avatar,
    Card,
    CardContent
} from '@mui/material';
import {
    GitHub as GitHubIcon,
    AccountBalanceWallet as WalletIcon,
    Schedule as ScheduleIcon,
    TrendingUp as DifficultyIcon,
    Code as CodeIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import NavigationBar from '../../components/layout/NavigationBar';
import ApplyBountyModal from '../../components/bounty/ApplyBountyModal';
import { apiCall } from '../../utils/auth';

const BountyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bounty, setBounty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [applyModalOpen, setApplyModalOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchBountyDetails();
        fetchUserInfo();
    }, [id]);

    const fetchBountyDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8888/api/bounty-issues/public/${id}`);
            const data = await response.json();

            if (data.success) {
                setBounty(data.issue);
            } else {
                setError(data.message || 'Failed to load bounty');
            }
        } catch (err) {
            console.error('Error fetching bounty:', err);
            setError('Failed to load bounty details');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserInfo = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const data = await apiCall('/api/auth/me', { method: 'GET' });
            if (data) {
                setUser(data);
            }
        } catch (err) {
            console.error('Error fetching user:', err);
        }
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
            case 'completed': return 'default';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const handleApplyClick = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/auth/signin');
            return;
        }
        setApplyModalOpen(true);
    };

    const handleApplySuccess = () => {
        setApplyModalOpen(false);
        // Could show success message or navigate
        alert('Application submitted successfully! The creator will review it soon.');
    };

    if (loading) {
        return (
            <>
                <NavigationBar />
                <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress />
                </Container>
            </>
        );
    }

    if (error || !bounty) {
        return (
            <>
                <NavigationBar />
                <Container sx={{ mt: 4 }}>
                    <Alert severity="error">{error || 'Bounty not found'}</Alert>
                    <Button sx={{ mt: 2 }} onClick={() => navigate('/explore')}>
                        Back to Bounties
                    </Button>
                </Container>
            </>
        );
    }

    const isCreator = user && bounty.creatorId && bounty.creatorId._id === user._id;
    const canApply = user && !isCreator && bounty.status === 'open';
    const isAssigned = user && bounty.assigneeId && bounty.assigneeId._id === user._id;

    // Debug logging
    console.log('Bounty Detail Debug:', {
        hasUser: !!user,
        userId: user?._id,
        creatorId: bounty?.creatorId?._id,
        isCreator,
        bountyStatus: bounty?.status,
        canApply
    });

    return (
        <>
            <NavigationBar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
                                {bounty.title}
                            </Typography>
                            <Chip 
                                label={bounty.status.toUpperCase().replace('_', ' ')}
                                color={getStatusColor(bounty.status)}
                                size="small"
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Chip 
                                icon={<GitHubIcon />}
                                label={bounty.repoFullName}
                                component="a"
                                href={bounty.githubIssueUrl}
                                target="_blank"
                                clickable
                            />
                            <Chip 
                                icon={<DifficultyIcon />}
                                label={bounty.difficulty}
                                color={getDifficultyColor(bounty.difficulty)}
                                size="small"
                            />
                            <Chip 
                                icon={<WalletIcon />}
                                label={`${bounty.bountyAmount} XLM`}
                                color="primary"
                                variant="outlined"
                            />
                            {bounty.deadline && (
                                <Chip 
                                    icon={<ScheduleIcon />}
                                    label={`Deadline: ${new Date(bounty.deadline).toLocaleDateString()}`}
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Main Content Grid */}
                    <Grid container spacing={3}>
                        {/* Left Column - Bounty Details */}
                        <Grid item xs={12} md={8}>
                            {/* Description */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" gutterBottom fontWeight="bold" color="text.primary">
                                    📝 Description
                                </Typography>
                                <Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                                    {bounty.description}
                                </Typography>
                            </Box>

                            {/* Required Skills */}
                            {bounty.skills && bounty.skills.length > 0 && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" gutterBottom fontWeight="bold" color="text.primary">
                                        🛠️ Required Skills
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {bounty.skills.map((skill, index) => (
                                            <Chip 
                                                key={index}
                                                icon={<CodeIcon />}
                                                label={skill}
                                                variant="outlined"
                                                size="small"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* GitHub Issue Link */}
                            <Box sx={{ mb: 4 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<GitHubIcon />}
                                    href={bounty.githubIssueUrl}
                                    target="_blank"
                                    fullWidth
                                >
                                    View Issue on GitHub #{bounty.githubIssueNumber}
                                </Button>
                            </Box>
                        </Grid>

                        {/* Right Column - Creator Info & Apply */}
                        <Grid item xs={12} md={4}>
                            {/* Creator Card */}
                            <Card sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Created By
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                        <Avatar 
                                            src={bounty.creatorId.avatar}
                                            alt={bounty.creatorId.github}
                                            sx={{ width: 48, height: 48 }}
                                        />
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                                {bounty.creatorId.github}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Maintainer
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Assignee Card (if assigned) */}
                            {bounty.assigneeId && (
                                <Card sx={{ mb: 3 }}>
                                    <CardContent>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Assigned To
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar 
                                                src={bounty.assigneeId.avatar}
                                                alt={bounty.assigneeId.github}
                                                sx={{ width: 48, height: 48 }}
                                            />
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                                    {bounty.assigneeId.github}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Working on it
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Apply Button */}
                            {canApply && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    onClick={handleApplyClick}
                                    sx={{ 
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    🚀 Apply for this Bounty
                                </Button>
                            )}

                            {!user && bounty.status === 'open' && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    onClick={handleApplyClick}
                                    sx={{ 
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Sign In to Apply
                                </Button>
                            )}

                            {isCreator && (
                                <Alert severity="info">
                                    You are the creator of this bounty
                                </Alert>
                            )}

                            {/* Submit Work Button (for assigned developer) */}
                            {isAssigned && ['in_progress', 'under_review'].includes(bounty.status) && (
                                <>
                                    {bounty.status === 'in_progress' && bounty.prUrl && bounty.notes?.includes('Changes Requested:') && (
                                        <Alert severity="warning" sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                🔄 Changes Requested
                                            </Typography>
                                            <Typography variant="body2">
                                                The creator has requested changes to your PR. Check the PR comments on GitHub for details.
                                            </Typography>
                                        </Alert>
                                    )}
                                    <Button
                                        variant="contained"
                                        color="success"
                                        size="large"
                                        fullWidth
                                        onClick={() => navigate(`/bounty/${bounty._id}/submit-work`)}
                                        sx={{ 
                                            py: 1.5,
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {bounty.status === 'in_progress' && bounty.prUrl 
                                            ? '🔄 Resubmit Updated Work' 
                                            : bounty.status === 'under_review'
                                            ? '👀 View Submission Status'
                                            : '📤 Submit Your Work'
                                        }
                                    </Button>
                                </>
                            )}

                            {bounty.status !== 'open' && !isCreator && !isAssigned && (
                                <Alert severity="warning">
                                    This bounty is {bounty.status.replace('_', ' ')}
                                </Alert>
                            )}
                        </Grid>
                    </Grid>
                </Paper>
            </Container>

            {/* Apply Modal */}
            {canApply && (
                <ApplyBountyModal
                    open={applyModalOpen}
                    onClose={() => setApplyModalOpen(false)}
                    bountyId={bounty._id}
                    bountyTitle={bounty.title}
                    bountyAmount={bounty.bountyAmount}
                    onSuccess={handleApplySuccess}
                />
            )}
        </>
    );
};

export default BountyDetailPage;
