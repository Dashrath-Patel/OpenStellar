# Material UI Setup Guide - OpenStellar

## 🎨 Overview

OpenStellar frontend now features a modern Material UI (MUI v5+) implementation with:
- ✅ Custom theme with light/dark mode
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Reusable components following best practices
- ✅ Stellar brand colors and design tokens
- ✅ Fully accessible components
- ✅ Type-safe styling with `sx` prop

## 📁 Project Structure

```
src/
├── theme/
│   ├── theme.js              # Custom theme configuration
│   ├── ThemeProvider.jsx     # Theme context provider
│   ├── ThemeToggle.jsx       # Dark/light mode toggle button
│   └── index.js              # Theme exports
│
├── components/
│   ├── layout/
│   │   ├── MainLayout.jsx    # Main app layout wrapper
│   │   ├── NavigationBar.jsx # Responsive navbar with drawer
│   │   ├── Footer.jsx        # Footer component
│   │   └── index.js
│   │
│   └── bounty/
│       ├── BountyCard.jsx    # Bounty card component
│       ├── BountyGrid.jsx    # Responsive bounty grid
│       └── index.js
│
└── pages/
    └── demo/
        └── MuiDemoPage.jsx   # MUI showcase/demo page
```

## 🚀 Getting Started

### 1. View the Demo

Navigate to `/demo` to see all MUI components in action:

```bash
npm start
# Then visit http://localhost:5173/demo
```

### 2. Using the Theme

The theme is already configured in `src/index.jsx`. All components automatically use it:

```jsx
import { ThemeProvider } from './theme';

// Wraps entire app
<ThemeProvider>
  <App />
</ThemeProvider>
```

### 3. Theme Toggle

Add dark/light mode toggle anywhere:

```jsx
import { ThemeToggle } from '../theme';

function MyComponent() {
  return <ThemeToggle />;
}
```

### 4. Access Theme Mode

```jsx
import { useThemeMode } from '../theme';

function MyComponent() {
  const { mode, toggleTheme } = useThemeMode();
  
  return (
    <div>
      Current mode: {mode}
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}
```

## 🎨 Custom Theme Colors

### Primary Colors (Stellar Purple)
```jsx
// In components, use:
<Box sx={{ color: 'primary.main' }}>Purple text</Box>
<Button color="primary">Primary Button</Button>
```

- `primary.main`: #7B61FF (dark) / #5A3FD8 (light)
- `primary.light`: #9D85FF
- `primary.dark`: #4A2FB0

### Secondary Colors (Stellar Cyan)
- `secondary.main`: #00D1FF (dark) / #00B8E6 (light)
- `secondary.light`: #33DAFF
- `secondary.dark`: #0099CC

### Status Colors
- `success.main`: #00D395 (bounty rewards)
- `warning.main`: #FFB800 (pending)
- `error.main`: #FF4757 (errors)

## 📦 Reusable Components

### MainLayout

Wraps pages with navigation, footer, and consistent spacing:

```jsx
import { MainLayout } from '../components/layout';

function MyPage() {
  return (
    <MainLayout maxWidth="lg" showFooter={true}>
      <h1>My Content</h1>
    </MainLayout>
  );
}
```

**Props:**
- `maxWidth`: Container width (`xs`, `sm`, `md`, `lg`, `xl`)
- `fullWidth`: Remove container constraints (default: `false`)
- `showFooter`: Display footer (default: `true`)
- `walletButton`: Custom wallet connect button

### BountyCard

Display bounty information in a card:

```jsx
import { BountyCard } from '../components/bounty';

const bounty = {
  bountyId: '123',
  title: 'Build Smart Contract',
  description: 'Create NFT marketplace contract',
  payAmount: 500,
  status: 'open',
  difficulty: 'hard',
  topic: 'Smart Contracts',
  creator: { name: 'Alice' },
  endDate: new Date(),
  participantCount: 3,
  maxParticipants: 5,
};

<BountyCard bounty={bounty} />
```

### BountyGrid

Responsive grid of bounty cards:

```jsx
import { BountyGrid } from '../components/bounty';

<BountyGrid bounties={bountyArray} spacing={3} />
```

## 🎯 MUI Component Examples

### Typography

```jsx
<Typography variant="h1" fontWeight={700}>
  Heading 1
</Typography>

<Typography variant="body1" color="text.secondary">
  Body text
</Typography>
```

### Buttons

```jsx
<Button variant="contained" color="primary">
  Primary Button
</Button>

<Button variant="outlined" startIcon={<AddIcon />}>
  With Icon
</Button>
```

### Cards

```jsx
<Card sx={{ borderRadius: 3, p: 2 }}>
  <CardContent>
    <Typography variant="h6">Card Title</Typography>
    <Typography variant="body2">Card content</Typography>
  </CardContent>
  <CardActions>
    <Button>Action</Button>
  </CardActions>
</Card>
```

### Grid Layout (Responsive)

```jsx
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={4}>
    <Paper>Column 1</Paper>
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    <Paper>Column 2</Paper>
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    <Paper>Column 3</Paper>
  </Grid>
</Grid>
```

### Stack Layout

```jsx
<Stack direction="row" spacing={2} alignItems="center">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</Stack>
```

### Chips

```jsx
<Chip label="Open" color="success" size="small" />
<Chip label="Hard" variant="outlined" />
<Chip label="Filter" onDelete={handleDelete} />
```

## 🎨 Styling with `sx` Prop

The `sx` prop provides type-safe inline styling with theme access:

```jsx
<Box
  sx={{
    p: 3,                    // padding: theme.spacing(3)
    m: 2,                    // margin: theme.spacing(2)
    backgroundColor: 'primary.main',
    color: 'primary.contrastText',
    borderRadius: 2,         // borderRadius: theme.shape.borderRadius * 2
    boxShadow: 3,            // theme.shadows[3]
    '&:hover': {
      backgroundColor: 'primary.dark',
    },
    // Responsive styles
    display: { xs: 'block', md: 'flex' },
    fontSize: { xs: '1rem', md: '1.5rem' },
  }}
>
  Content
</Box>
```

### Responsive Breakpoints

```jsx
sx={{
  // xs: 0-600px (mobile)
  // sm: 600-900px (tablet)
  // md: 900-1200px (small desktop)
  // lg: 1200-1536px (desktop)
  // xl: 1536px+ (large desktop)
  
  padding: { xs: 1, sm: 2, md: 3 },
  display: { xs: 'block', md: 'flex' },
}}
```

## 🌙 Dark Mode Support

All components automatically adapt to dark mode. To manually check mode:

```jsx
import { useTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Box
      sx={{
        backgroundColor: isDark ? 'grey.900' : 'grey.100',
      }}
    >
      Content
    </Box>
  );
}
```

## 📱 Responsive Design

### useMediaQuery Hook

```jsx
import { useMediaQuery, useTheme } from '@mui/material';

function MyComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

## 🔧 Customizing the Theme

Edit `src/theme/theme.js` to customize colors, typography, spacing, etc:

```javascript
export const createCustomTheme = (mode) => {
  return createTheme({
    palette: {
      primary: {
        main: '#YOUR_COLOR',
      },
      // ... other colors
    },
    typography: {
      fontFamily: 'Your Font',
      h1: {
        fontSize: '3rem',
      },
    },
    shape: {
      borderRadius: 12,
    },
    spacing: 8, // base unit (8px)
  });
};
```

## 📚 Resources

- [Material UI Documentation](https://mui.com/material-ui/)
- [MUI Theme Documentation](https://mui.com/material-ui/customization/theming/)
- [sx Prop Guide](https://mui.com/system/getting-started/the-sx-prop/)
- [Responsive Design](https://mui.com/material-ui/react-use-media-query/)

## ✅ Best Practices

1. **Use functional components** - Always use functional components with hooks
2. **Use `sx` prop for styling** - Prefer `sx` over `style` or CSS classes
3. **Leverage theme values** - Use theme.spacing(), theme.palette, etc.
4. **Component composition** - Build complex UIs from smaller components
5. **Responsive-first** - Design for mobile, then scale up
6. **Accessible** - Use proper ARIA labels and semantic HTML
7. **Type safety** - Leverage TypeScript for better DX (optional)

## 🎓 Quick Tips

- Use `Stack` for simple layouts instead of `Grid`
- Use `Box` as a flexible container with `sx` prop
- Wrap text in `Typography` for consistent styling
- Use theme colors: `color="primary"`, `color="error"`, etc.
- Add transitions: `sx={{ transition: 'all 0.3s' }}`
- Use elevation prop for shadows: `elevation={3}`

## 🐛 Troubleshooting

**Theme not applying?**
- Check ThemeProvider is wrapping your app in `index.jsx`
- Ensure CssBaseline is imported

**Dark mode not working?**
- Check localStorage: `localStorage.getItem('themeMode')`
- Clear browser cache

**Icons not showing?**
- Install: `npm install @mui/icons-material`
- Import: `import AddIcon from '@mui/icons-material/Add';`

---

Happy coding with Material UI! 🎉
