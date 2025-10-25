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

const steps = ['Bounty Details', 'Requirements', 'Review & Create'];

const difficultyLevels = [
  { value: 'beginner', label: 'Beginner', color: 'success' },
  { value: 'intermediate', label: 'Intermediate', color: 'warning' },
  { value: 'advanced', label: 'Advanced', color: 'error' },
];

const NewBountyPage = () => {
  const navigate = useNavigate();
  const { isConnected, connectWallet } = useCustomWallet();
  const [activeStep, setActiveStep] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'intermediate',
    reward: '',
    deadline: '',
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

  const handleSubmit = () => {
    // TODO: Integrate with contract to create bounty
    console.log('Creating bounty:', formData);
    // Navigate to bounty details or explore page
    navigate('/ExploreBounties');
  };

  // Step 1: Bounty Details
  const renderBasicDetails = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Basic Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Bounty Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Build a DeFi Dashboard"
            required
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your bounty in detail..."
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              label="Category"
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              <MenuItem value="development">Development</MenuItem>
              <MenuItem value="design">Design</MenuItem>
              <MenuItem value="marketing">Marketing</MenuItem>
              <MenuItem value="content">Content Creation</MenuItem>
              <MenuItem value="research">Research</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={formData.difficulty}
              label="Difficulty"
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
            >
              {difficultyLevels.map((level) => (
                <MenuItem key={level.value} value={level.value}>
                  {level.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Reward Amount"
            value={formData.reward}
            onChange={(e) => handleInputChange('reward', e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">XLM</InputAdornment>,
            }}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="date"
            label="Deadline"
            value={formData.deadline}
            onChange={(e) => handleInputChange('deadline', e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
        </Grid>
      </Grid>
    </Box>
  );

  // Step 2: Requirements
  const renderRequirements = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Requirements & Skills
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Requirements
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

  // Step 3: Review
  const renderReview = () => (
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
                Category
              </Typography>
              <Typography variant="body2">
                {formData.category || 'Not specified'}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Difficulty
              </Typography>
              <Typography variant="body2">
                {formData.difficulty}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Reward
              </Typography>
              <Typography variant="body2">
                {formData.reward} XLM
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

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderBasicDetails();
      case 1:
        return renderRequirements();
      case 2:
        return renderReview();
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
          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 3 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
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
            >
              Create Bounty
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
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
