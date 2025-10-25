import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Alert,
    CircularProgress
} from '@mui/material';
import { apiCall } from '../../utils/auth';

const ApplyBountyModal = ({ open, onClose, bountyId, bountyTitle, bountyAmount, onSuccess }) => {
    const [formData, setFormData] = useState({
        proposal: '',
        estimated_days: '',
        wallet_address: '',
        portfolio: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (formData.proposal.length < 50) {
            setError('Proposal must be at least 50 characters');
            return;
        }

        if (!formData.estimated_days || formData.estimated_days < 1) {
            setError('Please provide a valid estimated timeline');
            return;
        }

        if (!formData.wallet_address) {
            setError('Wallet address is required');
            return;
        }

        try {
            setLoading(true);
            const data = await apiCall('/api/applications', {
                method: 'POST',
                body: JSON.stringify({
                    bounty_issue_id: bountyId,
                    ...formData,
                    estimated_days: parseInt(formData.estimated_days)
                })
            });

            if (data && data.success) {
                onSuccess();
                // Reset form
                setFormData({
                    proposal: '',
                    estimated_days: '',
                    wallet_address: '',
                    portfolio: ''
                });
            } else {
                setError(data?.message || 'Failed to submit application');
            }
        } catch (err) {
            console.error('Error submitting application:', err);
            setError(err.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle>
                <Typography variant="h5" fontWeight="bold">
                    🚀 Apply for Bounty
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                    {bountyTitle}
                </Typography>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Info Box */}
                        <Alert severity="info" sx={{ mb: 1 }}>
                            <Typography variant="body2">
                                <strong>Reward:</strong> {bountyAmount} XLM
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                The creator will review your proposal. If accepted, funds will be locked on the blockchain.
                            </Typography>
                        </Alert>

                        {error && (
                            <Alert severity="error" onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}

                        {/* Proposal */}
                        <TextField
                            name="proposal"
                            label="Your Proposal"
                            placeholder="Describe your approach to solving this issue. What technologies will you use? What's your implementation plan?"
                            multiline
                            rows={6}
                            required
                            fullWidth
                            value={formData.proposal}
                            onChange={handleChange}
                            helperText={`${formData.proposal.length}/2000 characters (minimum 50)`}
                            inputProps={{ maxLength: 2000 }}
                        />

                        {/* Timeline */}
                        <TextField
                            name="estimated_days"
                            label="Estimated Timeline (days)"
                            type="number"
                            required
                            fullWidth
                            value={formData.estimated_days}
                            onChange={handleChange}
                            helperText="How many days do you need to complete this?"
                            inputProps={{ min: 1, max: 365 }}
                        />

                        {/* Wallet Address */}
                        <TextField
                            name="wallet_address"
                            label="Stellar Wallet Address"
                            placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                            required
                            fullWidth
                            value={formData.wallet_address}
                            onChange={handleChange}
                            helperText="Your Stellar wallet address to receive payment"
                        />

                        {/* Portfolio (Optional) */}
                        <TextField
                            name="portfolio"
                            label="Portfolio / GitHub Profile (Optional)"
                            placeholder="https://github.com/yourusername or your portfolio URL"
                            fullWidth
                            value={formData.portfolio}
                            onChange={handleChange}
                            helperText="Link to your previous work to strengthen your application"
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2.5 }}>
                    <Button 
                        onClick={onClose} 
                        disabled={loading}
                        size="large"
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        size="large"
                        sx={{ minWidth: 120 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Submit Application'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ApplyBountyModal;
