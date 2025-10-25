import { Box, Container } from '@mui/material';
import NavigationBar from './NavigationBar';
import Footer from './Footer';

/**
 * Main Layout Component
 * Provides consistent layout structure with navigation and footer
 * Wraps page content with proper spacing and responsiveness
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 * @param {boolean} props.fullWidth - If true, removes container max-width
 * @param {boolean} props.showFooter - If true, displays footer (default: true)
 * @param {React.ReactNode} props.walletButton - Custom wallet button component
 * @param {string} props.maxWidth - Container max width (xs, sm, md, lg, xl)
 */
const MainLayout = ({
  children,
  fullWidth = false,
  showFooter = true,
  walletButton = null,
  maxWidth = 'xl',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      {/* Navigation Bar */}
      <NavigationBar walletButton={walletButton} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        {fullWidth ? (
          <Box sx={{ px: { xs: 2, sm: 3 } }}>{children}</Box>
        ) : (
          <Container maxWidth={maxWidth}>{children}</Container>
        )}
      </Box>

      {/* Footer */}
      {showFooter && <Footer />}
    </Box>
  );
};

export default MainLayout;
