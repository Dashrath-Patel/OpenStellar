import { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Grid,
  Chip,
  InputAdornment,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { MainLayout } from '../../components/layout';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useCustomWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';
import useBackend from '../../hooks/useBackend';
import { toast } from 'react-toastify';

const steps = ['Bounty Details', 'Additional Info (Optional)', 'Review & Create'];

const difficultyLevels = [
  { value: 0, label: 'Beginner', color: 'success' },
  { value: 1, label: 'Intermediate', color: 'warning' },
  { value: 2, label: 'Advanced', color: 'error' },
];

const bountyTypes = [
  { value: 0, label: 'Development' },
  { value: 1, label: 'Design' },
  { value: 2, label: 'Marketing' },
  { value: 3, label: 'Content Creation' },
  { value: 4, label: 'Research' },
  { value: 5, label: 'Other' },
];

const bountyTopics = [
  { value: 0, label: 'Smart Contracts' },
  { value: 1, label: 'Frontend' },
  { value: 2, label: 'Backend' },
  { value: 3, label: 'Full Stack' },
  { value: 4, label: 'UI/UX' },
  { value: 5, label: 'Documentation' },
  { value: 6, label: 'Testing' },
  { value: 7, label: 'Other' },
];

const NewBountyPage = () => {
  const navigate = useNavigate();
  const { isConnected, walletAddress, connectWallet } = useCustomWallet();
  const { createBounty: createBountyContract, refreshPages } = useContract();
  const { createBountyB } = useBackend();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state matching backend schema
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 0, // Development by default
    topic: 0, // Smart Contracts by default
    difficulty: 1, // Intermediate by default
    payAmount: '',
    deadline: '',
    gitRepo: '',
    requirements: [''],
    skills: [],
    currentSkill: '',
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, ''],
    });
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const handleRemoveRequirement = (index) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData({ ...formData, requirements: newRequirements });
  };

  const handleAddSkill = () => {
    if (formData.currentSkill.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.currentSkill.trim()],
        currentSkill: '',
      });
    }
  };

  const handleDeleteSkill = (skillToDelete) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToDelete),
    });
  };

  const handleSubmit = async () => {
    if (!isConnected || !walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Validation
    if (!formData.title || !formData.payAmount || !formData.deadline || !formData.gitRepo) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate GitHub URL format
    const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/.+\/.+/;
    if (!githubUrlPattern.test(formData.gitRepo)) {
      toast.error('Please enter a valid GitHub repository URL');
      return;
    }

    if (parseFloat(formData.payAmount) <= 0) {
      toast.error('Reward must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      // Calculate deadline as Unix timestamp
      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000);

      if (deadlineTimestamp <= Math.floor(now.getTime() / 1000)) {
        toast.error('Deadline must be in the future');
        setSubmitting(false);
        return;
      }

      // Calculate duration in seconds
      const duration = Math.floor((deadlineDate - now) / 1000);

      // Default pay token (Native XLM token on Futurenet)
      const PAY_TOKEN = 'CB64D3G7SM2RTH6JSGG34DDTFTQ5CFDKVDZJZSODMCX4NJ2HV2KN7OHT';

      // Create bounty on smart contract first
      toast.info('Creating bounty on blockchain...');
      const contractResult = await createBountyContract(
        walletAddress,
        formData.title,
        parseFloat(formData.payAmount),
        PAY_TOKEN,
        deadlineTimestamp
      );

      if (!contractResult || contractResult[0] < 0) {
        toast.error('Failed to create bounty on blockchain');
        setSubmitting(false);
        return;
      }

      const bountyId = contractResult[0];
      toast.success(`Bounty created on blockchain with ID: ${bountyId}`);

      // Store in backend database
      toast.info('Storing bounty in database...');
      console.log('Bounty data being sent to backend:', {
        wallet: walletAddress,
        bountyId: bountyId,
        title: formData.title,
        payAmount: parseFloat(formData.payAmount),
        duration: duration,
        type: formData.type,
        difficulty: formData.difficulty,
        topic: formData.topic,
        description: formData.description,
        gitRepo: formData.gitRepo,
        block: contractResult[1] || 0
      });

      const result = await createBountyB(
        walletAddress,
        bountyId,
        formData.title,
        parseFloat(formData.payAmount),
        duration,
        formData.type,
        formData.difficulty,
        formData.topic,
        formData.description,
        formData.gitRepo,
        contractResult[1] || 0 // ledger/block number from contract
      );

      console.log('Backend response:', result);

      if (result === 0) {
        toast.success('Bounty created successfully!');
        refreshPages();
        navigate('/MyBounties');
      } else if (result === -1) {
        toast.error('Failed to store bounty in database - Server error');
      } else if (result === -2) {
        toast.error('Failed to store bounty in database - Network error');
      } else {
        toast.error('Failed to store bounty in database - Unknown error');
      }
    } catch (error) {
      console.error('Error creating bounty:', error);
      toast.error(error.message || 'Failed to create bounty');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 1: Bounty Details
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Bounty Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Build a DeFi Dashboard"
              required
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the bounty in detail..."
            />

            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label="Type"
              >
                {bountyTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Topic</InputLabel>
              <Select
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                label="Topic"
              >
                {bountyTopics.map((topic) => (
                  <MenuItem key={topic.value} value={topic.value}>
                    {topic.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth required>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                label="Difficulty"
              >
                {difficultyLevels.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    <Chip 
                      label={level.label} 
                      color={level.color} 
                      size="small"
                      sx={{ minWidth: 100 }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              type="number"
              label="Reward (XLM)"
              value={formData.payAmount}
              onChange={(e) => setFormData({ ...formData, payAmount: e.target.value })}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>XLM</Typography>,
              }}
              required
            />
            
            <TextField
              fullWidth
              type="datetime-local"
              label="Deadline"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              fullWidth
              label="GitHub Repository"
              value={formData.gitRepo}
              onChange={(e) => setFormData({ ...formData, gitRepo: e.target.value })}
              placeholder="https://github.com/username/repo"
              required
              helperText="GitHub repository link is required"
            />
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Additional Information (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Add any requirements or skills needed for this bounty
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Requirements
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                List specific requirements or deliverables for this bounty
              </Typography>
              {formData.requirements.map((requirement, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                  />
                  <Button
                    color="error"
                    onClick={() => handleRemoveRequirement(index)}
                    disabled={formData.requirements.length === 1}
                  >
                    <DeleteIcon />
                  </Button>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddRequirement}
                variant="outlined"
              >
                Add Requirement
              </Button>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Required Skills
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Add skills that contributors should have
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  value={formData.currentSkill}
                  onChange={(e) => handleInputChange('currentSkill', e.target.value)}
                  placeholder="e.g., React, Solidity, UI/UX"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <Button onClick={handleAddSkill} variant="outlined">
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleDeleteSkill(skill)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Bounty
            </Typography>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {formData.title || 'Untitled Bounty'}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {formData.description || 'No description provided'}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body2">
                      {bountyTypes.find(t => t.value === formData.type)?.label}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Topic
                    </Typography>
                    <Typography variant="body2">
                      {bountyTopics.find(t => t.value === formData.topic)?.label}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Difficulty
                    </Typography>
                    <Typography variant="body2">
                      {difficultyLevels.find(d => d.value === formData.difficulty)?.label}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Reward
                    </Typography>
                    <Typography variant="body2">
                      {formData.payAmount} XLM
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Deadline
                    </Typography>
                    <Typography variant="body2">
                      {formData.deadline || 'Not set'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      GitHub Repository
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {formData.gitRepo || 'Not provided'}
                    </Typography>
                  </Grid>
                </Grid>

                {formData.requirements.filter(r => r.trim()).length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Requirements
                    </Typography>
                    <ul style={{ marginTop: 8 }}>
                      {formData.requirements.filter(r => r.trim()).map((req, index) => (
                        <li key={index}>
                          <Typography variant="body2">{req}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                )}

                {formData.skills.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Required Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.skills.map((skill, index) => (
                        <Chip key={index} label={skill} size="small" />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Alert severity="info">
              Once created, your bounty will be visible to all users on the platform.
            </Alert>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  if (!isConnected) {
    return (
      <MainLayout>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Connect Your Wallet
          </Typography>
          <Typography color="text.secondary" paragraph>
            You need to connect your wallet to create a bounty.
          </Typography>
          <Button variant="contained" onClick={connectWallet} size="large">
            Connect Wallet
          </Button>
        </Paper>
      </MainLayout>
    );
  }

  return (
    <MainLayout maxWidth="md">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Bounty
        </Typography>
        <Typography color="text.secondary" paragraph>
          Create a bounty to incentivize contributors to work on your project
        </Typography>

        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 400 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 3 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0 || submitting}
            onClick={handleBack}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              size="large"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Bounty'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={submitting}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </MainLayout>
  );
};

export default NewBountyPage;
