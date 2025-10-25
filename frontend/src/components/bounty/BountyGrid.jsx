import { Grid } from '@mui/material';
import BountyCard from './BountyCard';

/**
 * Bounty Grid Component
 * Displays a responsive grid of bounty cards
 * Automatically adjusts columns based on screen size
 * 
 * @param {Object} props - Component props
 * @param {Array} props.bounties - Array of bounty objects
 * @param {number} props.spacing - Grid spacing (default: 3)
 */
const BountyGrid = ({ bounties = [], spacing = 3 }) => {
  if (!bounties || bounties.length === 0) {
    return null;
  }

  return (
    <Grid container spacing={spacing}>
      {bounties.map((bounty) => (
        <Grid
          item
          key={bounty.bountyId || bounty.id}
          xs={12}
          sm={6}
          md={4}
          lg={3}
        >
          <BountyCard bounty={bounty} />
        </Grid>
      ))}
    </Grid>
  );
};

export default BountyGrid;
