import React from 'react';
import {
  AppBar, Toolbar, Button, Box, Typography, IconButton, useMediaQuery
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import HomeIcon from '@mui/icons-material/Home';
import QuizIcon from '@mui/icons-material/Quiz';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const navLinks = [
  { label: 'Home', path: '/', icon: <HomeIcon fontSize="small" /> },
  { label: 'Dashboard', path: '/charts', icon: <ShowChartIcon fontSize="small" /> },
  { label: 'Prediction Game', path: '/quiz', icon: <QuizIcon fontSize="small" /> },
  { label: 'Leaderboard', path: '/leaderboard', icon: <LeaderboardIcon fontSize="small" /> },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:768px)');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(10, 15, 26, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(31, 42, 61, 0.5)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, md: 3 } }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <ShowChartIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          {!isMobile && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #00E099, #00B4D8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CryptoPredict
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 } }}>
          {navLinks.map((link) => (
            <Button
              key={link.path}
              component={RouterLink}
              to={link.path}
              startIcon={!isMobile ? link.icon : undefined}
              sx={{
                color: location.pathname === link.path ? 'primary.main' : 'text.secondary',
                textTransform: 'none',
                fontWeight: location.pathname === link.path ? 600 : 400,
                fontSize: { xs: '0.75rem', md: '0.875rem' },
                minWidth: 'auto',
                px: { xs: 1, md: 2 },
                borderRadius: 2,
                position: 'relative',
                '&::after': location.pathname === link.path ? {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60%',
                  height: 2,
                  background: 'linear-gradient(90deg, #00E099, #00B4D8)',
                  borderRadius: 1,
                } : {},
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'rgba(0, 224, 153, 0.06)',
                },
              }}
            >
              {isMobile ? link.icon : link.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!user ? (
            <>
              <Button
                variant="text"
                component={RouterLink}
                to="/login"
                startIcon={!isMobile ? <LoginIcon fontSize="small" /> : undefined}
                sx={{
                  color: 'text.secondary',
                  textTransform: 'none',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {isMobile ? <LoginIcon fontSize="small" /> : 'Login'}
              </Button>
              <Button
                variant="contained"
                component={RouterLink}
                to="/register"
                startIcon={!isMobile ? <PersonAddIcon fontSize="small" /> : undefined}
                size="small"
              >
                {isMobile ? <PersonAddIcon fontSize="small" /> : 'Sign Up'}
              </Button>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', display: { xs: 'none', md: 'block' } }}
              >
                {user.username || user.email}
              </Typography>
              <IconButton onClick={handleLogout} sx={{ color: 'text.secondary' }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
