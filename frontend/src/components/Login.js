import React, { useState } from 'react';
import {
  TextField, Button, Typography, Box, Paper, Alert, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import LoginIcon from '@mui/icons-material/Login';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const username = data.get('username');
    const password = data.get('password');

    try {
      const res = await axios.post('/api/login', { username, password });
      login({ user_id: res.data.user_id, username: res.data.username });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 5,
          width: '100%',
          maxWidth: 440,
          background: 'rgba(19, 26, 48, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(31, 42, 61, 0.6)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Sign in to track your predictions
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField name="username" label="Username" required fullWidth />
            <TextField name="password" label="Password" type="password" required fullWidth />
            <Button
              variant="contained"
              type="submit"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </Box>
        </form>

        <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          Don't have an account?{' '}
          <MuiLink component={RouterLink} to="/register" sx={{ color: 'primary.main' }}>
            Sign up
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
