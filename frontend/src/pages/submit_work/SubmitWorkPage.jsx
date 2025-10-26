import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Chip,
    Divider
} from '@mui/material';
import {
    GitHub as GitHubIcon,
    CheckCircle as SuccessIcon,
    Send as SendIcon
} from '@mui/icons-material';
import NavigationBar from '../../components/layout/NavigationBar';
import { apiCall } from '../../utils/auth';

const SubmitWorkPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bounty, setBounty] = useState(null);
    const [prUrl, setPrUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchBounty();
    }, [id]);

    const fetchBounty = async () => {
        try {
            setLoading(true);
            const data = await apiCall(`/api/bounty-issues/${id}`, { method: 'GET' });
            
            if (data.success) {
                setBounty(data.issue);
                
                // Pre-fill PR URL if already submitted
                if (data.issue.prUrl) {
                    setPrUrl(data.issue.prUrl);
                }
            } else {
                setError(data.message || 'Failed to load bounty');
            }
        } catch (err) {
            console.error('Error fetching bounty:', err);
            setError(err.message || 'Failed to load bounty');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate PR URL
        const prUrlRegex = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/pull\/\d+$/;
        if (!prUrlRegex.test(prUrl)) {
            setError('Invalid GitHub PR URL format. Expected: https://github.com/owner/repo/pull/123');
            return;
        }

        try {
            setSubmitting(true);
            
            const data = await apiCall('/api/work-submissions', {
                method: 'POST',
                body: JSON.stringify({
                    bounty_issue_id: id,
                    pr_url: prUrl,
                    notes: notes || undefined
                })
            });

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/MyBounties');
                }, 3000);
            } else {
                setError(data.message || 'Failed to submit work');
            }
        } catch (err) {
            console.error('Error submitting work:', err);
            setError(err.message || 'Failed to submit work');
        } finally {
            setSubmitting(false);
        }
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

    if (error && !bounty) {
        return (
            <>
                <NavigationBar />
                <Container sx={{ mt: 4 }}>
                    <Alert severity="error">{error}</Alert>
                    <Button sx={{ mt: 2 }} onClick={() => navigate('/MyBounties')}>
                        Back to My Bounties
                    </Button>
                </Container>
            </>
        );
    }

    return (
        <>
            <NavigationBar />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                {success ? (
                    <Alert severity="success" icon={<SuccessIcon />} sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Work Submitted Successfully! 🎉
                        </Typography>
                        <Typography variant="body2">
                            The bounty creator will review your pull request. You'll be notified once it's approved.
                        </Typography>
                    </Alert>
                ) : null}

                {/* Bounty Info Card */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            {bounty?.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip label={bounty?.repoFullName} size="small" icon={<GitHubIcon />} />
                            <Chip label={`${bounty?.bountyAmount} XLM`} color="primary" size="small" />
                            <Chip label={bounty?.status} size="small" />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            {bounty?.description}
                        </Typography>
                    </CardContent>
                </Card>

                {/* Submit Work Form */}
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        🚀 Submit Your Work
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Submit your pull request link for review. Make sure your PR references this issue.
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {bounty?.status === 'under_review' && (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Your work is already under review. The creator will respond soon.
                        </Alert>
                    )}

                    {bounty?.status === 'completed' && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            This bounty has been completed and payment has been released! 🎉
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* PR URL */}
                            <TextField
                                label="Pull Request URL"
                                placeholder="https://github.com/owner/repo/pull/123"
                                fullWidth
                                required
                                value={prUrl}
                                onChange={(e) => setPrUrl(e.target.value)}
                                disabled={bounty?.status !== 'in_progress'}
                                helperText={
                                    bounty?.status === 'in_progress'
                                        ? `Must be a PR from: ${bounty?.repoFullName}`
                                        : bounty?.status === 'under_review'
                                        ? 'Your PR is under review'
                                        : 'This bounty is not in progress'
                                }
                                InputProps={{
                                    startAdornment: <GitHubIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                            />

                            {/* Notes */}
                            <TextField
                                label="Additional Notes (Optional)"
                                placeholder="Describe what you implemented, any challenges you faced, testing details, etc."
                                multiline
                                rows={4}
                                fullWidth
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                disabled={bounty?.status !== 'in_progress'}
                                helperText="Help the creator understand your implementation"
                            />

                            {/* Submit Button */}
                            {bounty?.status === 'in_progress' && (
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={submitting || !prUrl}
                                    startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
                                    sx={{ alignSelf: 'flex-start' }}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Work for Review'}
                                </Button>
                            )}

                            {/* View PR Button (if already submitted) */}
                            {bounty?.prUrl && (
                                <Button
                                    variant="outlined"
                                    startIcon={<GitHubIcon />}
                                    href={bounty.prUrl}
                                    target="_blank"
                                    sx={{ alignSelf: 'flex-start' }}
                                >
                                    View Your PR on GitHub
                                </Button>
                            )}
                        </Box>
                    </form>

                    {/* Instructions */}
                    <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            📋 Submission Guidelines:
                        </Typography>
                        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                            <li>
                                <Typography variant="body2">
                                    Make sure your PR references the issue number (e.g., "Fixes #{bounty?.githubIssueNumber}")
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body2">
                                    Include tests and documentation if applicable
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body2">
                                    Follow the repository's contribution guidelines
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body2">
                                    The creator will review your PR and either approve it or request changes
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body2">
                                    Once approved, payment will be automatically released to your wallet! 💰
                                </Typography>
                            </li>
                        </ul>
                    </Box>
                </Paper>
            </Container>
        </>
    );
};

export default SubmitWorkPage;
