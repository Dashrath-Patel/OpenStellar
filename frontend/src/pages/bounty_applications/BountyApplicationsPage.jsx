import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardActions,
    Avatar,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Divider,
    Grid
} from '@mui/material';
import {
    CheckCircle as AcceptIcon,
    Cancel as RejectIcon,
    Person as PersonIcon,
    Schedule as ScheduleIcon,
    AccountBalanceWallet as WalletIcon,
    Link as LinkIcon,
    GitHub as GitHubIcon
} from '@mui/icons-material';
import NavigationBar from '../../components/layout/NavigationBar';
import { apiCall } from '../../utils/auth';

const BountyApplicationsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bounty, setBounty] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewDialog, setReviewDialog] = useState({ open: false, application: null, action: null });
    const [reviewComment, setReviewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [changesDialog, setChangesDialog] = useState(false);
    const [changesFeedback, setChangesFeedback] = useState('');
    const [approveDialog, setApproveDialog] = useState(false);
    const [approveFeedback, setApproveFeedback] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch bounty details
            const bountyData = await apiCall(`/api/bounty-issues/${id}`, { method: 'GET' });
            if (bountyData.success) {
                setBounty(bountyData.issue);
            }

            // Fetch applications
            const appsData = await apiCall(`/api/applications/bounty/${id}`, { method: 'GET' });
            if (appsData.success) {
                setApplications(appsData.applications);
            }

        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewClick = (application, action) => {
        setReviewDialog({ open: true, application, action });
        setReviewComment('');
    };

    const handleReviewSubmit = async () => {
        try {
            setSubmitting(true);

            const data = await apiCall(`/api/applications/${reviewDialog.application._id}/review`, {
                method: 'PATCH',
                body: JSON.stringify({
                    action: reviewDialog.action,
                    comment: reviewComment
                })
            });

            if (data.success) {
                // Refresh data
                await fetchData();
                setReviewDialog({ open: false, application: null, action: null });
                setReviewComment('');

                if (reviewDialog.action === 'accept') {
                    alert(`✅ Application accepted! Funds locked on blockchain: ${data.lock_tx_hash}`);
                } else {
                    alert('Application rejected');
                }
            }

        } catch (err) {
            console.error('Error reviewing application:', err);
            alert(err.message || 'Failed to review application');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending_approval': return 'warning';
            case 'accepted': return 'success';
            case 'rejected': return 'error';
            case 'withdrawn': return 'default';
            default: return 'default';
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

    if (error) {
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
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {/* Bounty Info Header */}
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                {bounty?.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Chip label={bounty?.repoFullName} size="small" />
                                <Chip label={`${bounty?.bountyAmount} XLM`} color="primary" size="small" />
                                <Chip label={bounty?.status} size="small" />
                            </Box>
                        </Box>
                        <Button variant="outlined" onClick={() => navigate(`/bounty/${id}`)}>
                            View Bounty
                        </Button>
                    </Box>
                </Paper>

                {/* Work Submission Section (if PR submitted) */}
                {bounty?.prUrl && (
                    <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            📝 Work Submitted
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<GitHubIcon />}
                                href={bounty.prUrl}
                                target="_blank"
                            >
                                View Pull Request #{bounty.prNumber}
                            </Button>
                            <Chip 
                                label={bounty.status === 'under_review' ? 'Under Review' : bounty.status} 
                                color={bounty.status === 'under_review' ? 'warning' : 'success'}
                            />
                        </Box>
                        
                        {bounty.status === 'under_review' && (
                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => setApproveDialog(true)}
                                >
                                    ✅ Approve & Release Payment
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="warning"
                                    onClick={() => setChangesDialog(true)}
                                >
                                    🔄 Request Changes
                                </Button>
                            </Box>
                        )}
                        
                        {bounty.status === 'completed' && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                Payment released! Transaction: {bounty.releaseTransactionHash}
                            </Alert>
                        )}
                    </Paper>
                )}

                {/* Applications List */}
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Applications ({applications.length})
                </Typography>

                {applications.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        No applications yet. Share your bounty to get more applicants!
                    </Alert>
                ) : (
                    <Grid container spacing={3}>
                        {applications.map((app) => (
                            <Grid item xs={12} key={app._id}>
                                <Card elevation={2}>
                                    <CardContent>
                                        {/* Applicant Header */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar 
                                                    src={app.applicantId.avatar}
                                                    alt={app.applicantId.github}
                                                    sx={{ width: 56, height: 56 }}
                                                />
                                                <Box>
                                                    <Typography variant="h6" fontWeight="bold">
                                                        {app.applicantId.github}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Chip 
                                                label={app.status.replace('_', ' ').toUpperCase()}
                                                color={getStatusColor(app.status)}
                                                size="small"
                                            />
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        {/* Proposal */}
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                📝 Proposal
                                            </Typography>
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                                                {app.proposal}
                                            </Typography>
                                        </Box>

                                        {/* Details */}
                                        <Grid container spacing={2} sx={{ mb: 2 }}>
                                            <Grid item xs={12} sm={4}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <ScheduleIcon fontSize="small" color="action" />
                                                    <Typography variant="body2">
                                                        <strong>Timeline:</strong> {app.estimatedDays} days
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={8}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <WalletIcon fontSize="small" color="action" />
                                                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                                        <strong>Wallet:</strong> {app.walletAddress}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        {/* Portfolio */}
                                        {app.portfolio && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                <LinkIcon fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    <strong>Portfolio:</strong>{' '}
                                                    <a href={app.portfolio} target="_blank" rel="noopener noreferrer">
                                                        {app.portfolio}
                                                    </a>
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Review Comment (if reviewed) */}
                                        {app.reviewComment && (
                                            <Alert severity={app.status === 'accepted' ? 'success' : 'info'} sx={{ mt: 2 }}>
                                                <Typography variant="body2">
                                                    <strong>Your feedback:</strong> {app.reviewComment}
                                                </Typography>
                                            </Alert>
                                        )}
                                    </CardContent>

                                    {/* Actions */}
                                    {app.status === 'pending_approval' && bounty?.status === 'open' && (
                                        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                startIcon={<RejectIcon />}
                                                onClick={() => handleReviewClick(app, 'reject')}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                startIcon={<AcceptIcon />}
                                                onClick={() => handleReviewClick(app, 'accept')}
                                            >
                                                Accept & Lock Funds
                                            </Button>
                                        </CardActions>
                                    )}
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>

            {/* Review Confirmation Dialog */}
            <Dialog open={reviewDialog.open} onClose={() => setReviewDialog({ open: false, application: null, action: null })} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {reviewDialog.action === 'accept' ? '✅ Accept Application' : '❌ Reject Application'}
                </DialogTitle>
                <DialogContent>
                    {reviewDialog.action === 'accept' ? (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                <strong>Important:</strong> By accepting, you will:
                            </Typography>
                            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                                <li>Assign this bounty to {reviewDialog.application?.applicantId?.github}</li>
                                <li>Lock {bounty?.bountyAmount} XLM on the blockchain</li>
                                <li>Reject all other pending applications</li>
                            </ul>
                        </Alert>
                    ) : (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            The applicant will be notified that their application was rejected.
                        </Alert>
                    )}

                    <TextField
                        label="Feedback (Optional)"
                        multiline
                        rows={3}
                        fullWidth
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Add a message for the applicant..."
                        helperText="This message will be visible to the applicant"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setReviewDialog({ open: false, application: null, action: null })} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleReviewSubmit}
                        variant="contained"
                        color={reviewDialog.action === 'accept' ? 'success' : 'error'}
                        disabled={submitting}
                    >
                        {submitting ? <CircularProgress size={24} /> : `Confirm ${reviewDialog.action === 'accept' ? 'Accept' : 'Reject'}`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Approve Work Dialog */}
            <Dialog open={approveDialog} onClose={() => !submitting && setApproveDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Approve Work & Release Payment</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        This will release the locked payment to the developer's wallet.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Feedback (Optional)"
                        placeholder="Great work! Everything looks good."
                        value={approveFeedback}
                        onChange={(e) => setApproveFeedback(e.target.value)}
                        disabled={submitting}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setApproveDialog(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={async () => {
                            try {
                                setSubmitting(true);
                                const data = await apiCall(`/api/work-submissions/${bounty._id}/approve`, {
                                    method: 'PATCH',
                                    body: JSON.stringify({ feedback: approveFeedback || '' })
                                });
                                if (data.success) {
                                    alert(`✅ Work approved! Payment released: ${data.payment.txHash}`);
                                    setApproveDialog(false);
                                    setApproveFeedback('');
                                    fetchData();
                                } else {
                                    alert(data.message || 'Failed to approve work');
                                }
                            } catch (err) {
                                console.error('Error approving work:', err);
                                alert(err.message || 'Failed to approve work');
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                        variant="contained"
                        color="success"
                        disabled={submitting}
                    >
                        {submitting ? <CircularProgress size={24} /> : '✅ Approve & Release Payment'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Request Changes Dialog */}
            <Dialog open={changesDialog} onClose={() => !submitting && setChangesDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Request Changes</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Describe what changes are needed. The developer will be notified and can resubmit.
                    </Typography>
                    <TextField
                        fullWidth
                        required
                        multiline
                        rows={4}
                        label="Changes Required"
                        placeholder="Please update the implementation to handle edge cases..."
                        value={changesFeedback}
                        onChange={(e) => setChangesFeedback(e.target.value)}
                        disabled={submitting}
                        error={!changesFeedback && submitting}
                        helperText={!changesFeedback && submitting ? 'Feedback is required' : ''}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setChangesDialog(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={async () => {
                            if (!changesFeedback.trim()) {
                                alert('Please provide feedback about what changes are needed');
                                return;
                            }
                            try {
                                setSubmitting(true);
                                const data = await apiCall(`/api/work-submissions/${bounty._id}/request-changes`, {
                                    method: 'PATCH',
                                    body: JSON.stringify({ feedback: changesFeedback })
                                });
                                if (data.success) {
                                    alert('✅ Changes requested. Developer has been notified.');
                                    setChangesDialog(false);
                                    setChangesFeedback('');
                                    fetchData();
                                } else {
                                    alert(data.message || 'Failed to request changes');
                                }
                            } catch (err) {
                                console.error('Error requesting changes:', err);
                                alert(err.message || 'Failed to request changes');
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                        variant="contained"
                        color="warning"
                        disabled={submitting || !changesFeedback.trim()}
                    >
                        {submitting ? <CircularProgress size={24} /> : '🔄 Request Changes'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default BountyApplicationsPage;
