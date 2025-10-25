import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Chip,
    Stack,
    Box,
    Typography,
    Alert,
    CircularProgress,
    InputAdornment,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { apiCall } from '../../utils/auth';

const DIFFICULTY_OPTIONS = [
    { value: 'easy', label: 'Easy (1-2 days)', color: 'success' },
    { value: 'medium', label: 'Medium (3-5 days)', color: 'warning' },
    { value: 'hard', label: 'Hard (1+ week)', color: 'error' }
];

const COMMON_SKILLS = [
    'React', 'Node.js', 'TypeScript', 'JavaScript', 'Python',
    'HTML', 'CSS', 'MongoDB', 'PostgreSQL', 'Docker',
    'API', 'Testing', 'DevOps', 'UI/UX', 'Documentation'
];

export default function CreateBountyIssueModal({ open, onClose, repo, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'medium',
        bounty_amount: '',
        deadline: '',
        skills: []
    });
    const [customSkill, setCustomSkill] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [createdIssue, setCreatedIssue] = useState(null);
    const [processingStep, setProcessingStep] = useState(0);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const addSkill = (skill) => {
        if (!formData.skills.includes(skill)) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, skill]
            }));
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const addCustomSkill = () => {
        if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
            addSkill(customSkill.trim());
            setCustomSkill('');
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title || formData.title.length < 10) {
            newErrors.title = 'Title must be at least 10 characters';
        }

        if (!formData.description || formData.description.length < 50) {
            newErrors.description = 'Description must be at least 50 characters';
        }

        if (!formData.bounty_amount || parseFloat(formData.bounty_amount) < 1) {
            newErrors.bounty_amount = 'Bounty amount must be at least 1 XLM';
        }

        if (formData.skills.length === 0) {
            newErrors.skills = 'Select at least one skill';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        setLoading(true);
        setProcessingStep(0);

        try {
            // Step 1: Validating
            setProcessingStep(1);
            await new Promise(resolve => setTimeout(resolve, 500));

            // Step 2: Saving to database
            setProcessingStep(2);
            await new Promise(resolve => setTimeout(resolve, 500));

            // Step 3: Create on backend
            setProcessingStep(3);
            const response = await apiCall('/api/bounty-issues', {
                method: 'POST',
                body: JSON.stringify({
                    repo_full_name: repo.full_name,
                    title: formData.title,
                    description: formData.description,
                    difficulty: formData.difficulty,
                    skills: formData.skills,
                    bounty_amount: parseFloat(formData.bounty_amount),
                    deadline: formData.deadline || null
                })
            });

            if (response.success) {
                setCreatedIssue(response);
                setSuccess(true);
                setProcessingStep(5);
                
                // Call success callback after 2 seconds
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            } else {
                throw new Error(response.message || 'Failed to create bounty issue');
            }
        } catch (error) {
            console.error('Error creating bounty:', error);
            setErrors({ submit: error.message || 'Failed to create bounty issue' });
            setProcessingStep(0);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setFormData({
                title: '',
                description: '',
                difficulty: 'medium',
                bounty_amount: '',
                deadline: '',
                skills: []
            });
            setErrors({});
            setSuccess(false);
            setCreatedIssue(null);
            setProcessingStep(0);
            onClose();
        }
    };

    const processingSteps = [
        'Validating details',
        'Saving to database',
        'Creating GitHub issue',
        'Locking funds on Stellar',
        'Finalizing'
    ];

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { minHeight: '600px' }
            }}
        >
            <DialogTitle>
                {success ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircleIcon color="success" />
                        <Typography variant="h6">Bounty Issue Created Successfully!</Typography>
                    </Stack>
                ) : (
                    'Create Bounty Issue'
                )}
            </DialogTitle>

            <DialogContent dividers>
                {success ? (
                    // Success View
                    <Box>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Your issue has been created and funds locked.
                        </Alert>

                        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Issue #{createdIssue?.github_issue_number}: {formData.title}
                            </Typography>

                            <Stack spacing={2} sx={{ mt: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        GitHub Issue
                                    </Typography>
                                    <Typography variant="body2">
                                        <a 
                                            href={createdIssue?.github_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ color: '#6366f1' }}
                                        >
                                            {createdIssue?.github_url}
                                        </a>
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Stellar Transaction
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                        {createdIssue?.stellar_tx_hash?.substring(0, 40)}...
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Bounty Amount
                                    </Typography>
                                    <Typography variant="h6" color="success.main">
                                        {formData.bounty_amount} XLM
                                    </Typography>
                                </Box>

                                {formData.deadline && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Deadline
                                        </Typography>
                                        <Typography variant="body2">
                                            {new Date(formData.deadline).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                )}

                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Status
                                    </Typography>
                                    <Chip label="🟢 Open for contributions" color="success" size="small" />
                                </Box>
                            </Stack>
                        </Box>
                    </Box>
                ) : loading ? (
                    // Loading View
                    <Box sx={{ py: 4 }}>
                        <Typography variant="h6" gutterBottom align="center">
                            Creating your bounty issue...
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
                            Please wait, do not close this window.
                        </Typography>

                        <Stepper activeStep={processingStep} orientation="vertical">
                            {processingSteps.map((label, index) => (
                                <Step key={label}>
                                    <StepLabel>
                                        {index < processingStep ? (
                                            <Typography color="success.main">✓ {label}</Typography>
                                        ) : index === processingStep ? (
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <CircularProgress size={16} />
                                                <Typography>{label}...</Typography>
                                            </Stack>
                                        ) : (
                                            <Typography color="text.disabled">{label}</Typography>
                                        )}
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>
                ) : (
                    // Form View
                    <Stack spacing={3}>
                        {/* Repository Info */}
                        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                Repository
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                                {repo.full_name}
                            </Typography>
                        </Box>

                        {/* Title */}
                        <TextField
                            fullWidth
                            required
                            label="Issue Title"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            error={!!errors.title}
                            helperText={errors.title || `${formData.title.length}/10 minimum`}
                            placeholder="e.g., Fix login button alignment"
                        />

                        {/* Description */}
                        <TextField
                            fullWidth
                            required
                            multiline
                            rows={4}
                            label="Description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            error={!!errors.description}
                            helperText={errors.description || `${formData.description.length}/50 minimum`}
                            placeholder="Describe the issue in detail..."
                        />

                        {/* Difficulty */}
                        <FormControl component="fieldset" error={!!errors.difficulty}>
                            <FormLabel component="legend">Difficulty *</FormLabel>
                            <RadioGroup
                                row
                                value={formData.difficulty}
                                onChange={(e) => handleChange('difficulty', e.target.value)}
                            >
                                {DIFFICULTY_OPTIONS.map(option => (
                                    <FormControlLabel
                                        key={option.value}
                                        value={option.value}
                                        control={<Radio />}
                                        label={option.label}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>

                        {/* Skills */}
                        <Box>
                            <FormLabel error={!!errors.skills}>
                                Skills Required * {errors.skills && `(${errors.skills})`}
                            </FormLabel>
                            
                            {/* Common Skills */}
                            <Box sx={{ mt: 1, mb: 2 }}>
                                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                    {COMMON_SKILLS.map(skill => (
                                        <Chip
                                            key={skill}
                                            label={skill}
                                            onClick={() => addSkill(skill)}
                                            color={formData.skills.includes(skill) ? 'primary' : 'default'}
                                            variant={formData.skills.includes(skill) ? 'filled' : 'outlined'}
                                            size="small"
                                        />
                                    ))}
                                </Stack>
                            </Box>

                            {/* Custom Skill Input */}
                            <Stack direction="row" spacing={1}>
                                <TextField
                                    size="small"
                                    placeholder="Add custom skill"
                                    value={customSkill}
                                    onChange={(e) => setCustomSkill(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
                                />
                                <Button onClick={addCustomSkill} variant="outlined">
                                    + Add
                                </Button>
                            </Stack>

                            {/* Selected Skills */}
                            {formData.skills.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Selected:
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                                        {formData.skills.map(skill => (
                                            <Chip
                                                key={skill}
                                                label={skill}
                                                onDelete={() => removeSkill(skill)}
                                                color="primary"
                                                size="small"
                                            />
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </Box>

                        {/* Bounty Amount */}
                        <TextField
                            fullWidth
                            required
                            type="number"
                            label="Bounty Amount"
                            value={formData.bounty_amount}
                            onChange={(e) => handleChange('bounty_amount', e.target.value)}
                            error={!!errors.bounty_amount}
                            helperText={errors.bounty_amount || 'Minimum 1 XLM'}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">XLM</InputAdornment>,
                            }}
                            placeholder="50"
                        />

                        {/* Deadline */}
                        <TextField
                            fullWidth
                            type="date"
                            label="Deadline (Optional)"
                            value={formData.deadline}
                            onChange={(e) => handleChange('deadline', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: new Date().toISOString().split('T')[0] }}
                        />

                        {/* Submit Error */}
                        {errors.submit && (
                            <Alert severity="error">{errors.submit}</Alert>
                        )}

                        {/* Cost Summary */}
                        {formData.bounty_amount && (
                            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                <Typography variant="body2">
                                    <strong>Total Cost:</strong> {formData.bounty_amount} XLM + ~0.01 XLM (network fee)
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                )}
            </DialogContent>

            <DialogActions>
                {success ? (
                    <>
                        <Button onClick={handleClose} variant="outlined">
                            Close
                        </Button>
                        <Button 
                            href={createdIssue?.github_url} 
                            target="_blank"
                            variant="contained"
                        >
                            View Issue
                        </Button>
                    </>
                ) : (
                    <>
                        <Button onClick={handleClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSubmit} 
                            variant="contained"
                            disabled={loading}
                            sx={{
                                background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)',
                                }
                            }}
                        >
                            {loading ? 'Creating...' : 'Create Issue & Lock Bounty'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}
