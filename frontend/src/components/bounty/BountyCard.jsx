import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Box,
  Avatar,
  Stack,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Wallet as WalletIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Bounty Status Chip Component
 * Displays colored status indicator
 */
const StatusChip = ({ status }) => {
  const statusConfig = {
    open: { label: 'Open', color: 'success' },
    in_progress: { label: 'In Progress', color: 'warning' },
    completed: { label: 'Completed', color: 'primary' },
    closed: { label: 'Closed', color: 'default' },
  };

  const config = statusConfig[status] || statusConfig.open;

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      sx={{ fontWeight: 600 }}
    />
  );
};

/**
 * Difficulty Badge Component
 * Shows bounty difficulty level with color coding
 */
const DifficultyBadge = ({ difficulty }) => {
  const difficultyConfig = {
    easy: { label: 'Easy', color: '#00D395' },
    medium: { label: 'Medium', color: '#FFB800' },
    hard: { label: 'Hard', color: '#FF4757' },
  };

  const config = difficultyConfig[difficulty] || difficultyConfig.medium;

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        fontWeight: 600,
        border: `1px solid ${config.color}`,
      }}
    />
  );
};

/**
 * Bounty Card Component
 * Displays bounty information in a modern, responsive card
 * Includes reward amount, status, difficulty, and participant count
 * 
 * @param {Object} props - Component props
 * @param {Object} props.bounty - Bounty data object
 * @param {string} props.bounty.bountyId - Unique bounty identifier
 * @param {string} props.bounty.title - Bounty title
 * @param {string} props.bounty.description - Bounty description
 * @param {number} props.bounty.payAmount - Reward amount in XLM
 * @param {string} props.bounty.status - Bounty status
 * @param {string} props.bounty.difficulty - Difficulty level
 * @param {string} props.bounty.topic - Bounty category/topic
 * @param {Object} props.bounty.creator - Creator information
 * @param {Date} props.bounty.endDate - Deadline date
 * @param {number} props.bounty.participantCount - Number of participants
 * @param {number} props.bounty.maxParticipants - Maximum participants allowed
 */
const BountyCard = ({ bounty }) => {
  const navigate = useNavigate();

  const {
    bountyId,
    title,
    description,
    payAmount,
    status = 'open',
    difficulty = 'medium',
    topic,
    creator,
    endDate,
    participantCount = 0,
    maxParticipants = 10,
  } = bounty;

  // Calculate progress percentage
  const progressPercentage = maxParticipants
    ? (participantCount / maxParticipants) * 100
    : 0;

  // Format date
  const formatDate = (date) => {
    if (!date) return 'No deadline';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Handle card click
  const handleViewDetails = () => {
    navigate(`/ExploreBounties/${bountyId}`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header with status and difficulty */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <StatusChip status={status} />
          <DifficultyBadge difficulty={difficulty} />
        </Stack>

        {/* Title */}
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {description}
        </Typography>

        {/* Topic/Category */}
        {topic && (
          <Chip
            label={topic}
            size="small"
            variant="outlined"
            sx={{ mb: 2 }}
          />
        )}

        <Divider sx={{ my: 2 }} />

        {/* Reward amount */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
            p: 1.5,
            backgroundColor: 'success.main',
            backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
            borderRadius: 2,
          }}
        >
          <WalletIcon sx={{ color: 'success.contrastText' }} />
          <Box>
            <Typography variant="body2" sx={{ color: 'success.contrastText', opacity: 0.9 }}>
              Reward
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ color: 'success.contrastText' }}>
              {payAmount} XLM
            </Typography>
          </Box>
        </Box>

        {/* Creator and deadline info */}
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {creator?.name || creator?.wallet?.slice(0, 8) + '...' || 'Anonymous'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {formatDate(endDate)}
            </Typography>
          </Box>
        </Stack>

        {/* Participants progress */}
        {maxParticipants > 0 && (
          <Box sx={{ mt: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={0.5}
            >
              <Typography variant="caption" color="text.secondary">
                Participants
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {participantCount}/{maxParticipants}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleViewDetails}
          startIcon={<TrendingIcon />}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default BountyCard;
