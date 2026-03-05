import React, { useState } from 'react';
import {
  TextField, Button, Typography, Box, Paper, Alert, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveUser, userExists } from '../utils/authStorage';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const data = new FormData(e.currentTarget);
    const email = data.get('email');
    const username = data.get('username');
    const password = data.get('password');
    const confirm = data.get('confirm');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (userExists(email, username)) {
      setError('A user with this email or username already exists.');
      return;
    }

    const newUser = { email, username, password };
    saveUser(newUser);
    login({ email, username });
    navigate('/');
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
          <PersonAddIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Create Account
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Join the crypto prediction community
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField name="email" label="Email" type="email" required fullWidth />
            <TextField name="username" label="Username" required fullWidth />
            <TextField name="password" label="Password" type="password" required fullWidth />
            <TextField name="confirm" label="Confirm Password" type="password" required fullWidth />
            <Button variant="contained" type="submit" size="large" fullWidth sx={{ mt: 1 }}>
              Create Account
            </Button>
          </Box>
        </form>

        <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          Already have an account?{' '}
          <MuiLink component={RouterLink} to="/login" sx={{ color: 'primary.main' }}>
            Sign in
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Register;
