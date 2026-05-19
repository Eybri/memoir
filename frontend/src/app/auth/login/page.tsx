'use client';
import * as React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  TextField, 
  Stack, 
  IconButton,
  InputAdornment,
  Divider,
  Paper
} from '@mui/material';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

import { useRouter } from 'next/navigation';
import { login as apiLogin } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await apiLogin(email, password);
      // Store token and user info using AuthProvider
      login(response.access_token, response.user);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="romantic-gradient min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={0}
          component="form"
          onSubmit={handleLogin}
          className="glass-card max-w-md w-full p-8 md:p-12 rounded-[40px] border-0 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-200/30 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-200/30 blur-3xl rounded-full" />

          <Box className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Heart className="text-amber-600 fill-amber-600" size={32} />
              <Typography variant="h4" className="font-display font-bold text-amber-950">
                Memoir
              </Typography>
            </Link>
            <Typography variant="h5" className="font-display font-bold text-amber-950 mb-2">
              Welcome Back
            </Typography>
            <Typography className="text-amber-900/50 font-medium">
              Continue preserving your memories
            </Typography>
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
                {error}
              </Typography>
            )}
          </Box>

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Email Address"
              placeholder="hello@example.com"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} className="text-yellow-600" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  '& fieldset': { borderColor: 'rgba(217, 119, 6, 0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(217, 119, 6, 0.3)' },
                }
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} className="text-yellow-600" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  '& fieldset': { borderColor: 'rgba(217, 119, 6, 0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(217, 119, 6, 0.3)' },
                }
              }}
            />

            <Box className="flex justify-end">
              <Button className="text-amber-600 font-bold text-sm hover:bg-transparent">
                Forgot password?
              </Button>
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 rounded-full py-4 font-bold text-lg shadow-xl shadow-yellow-100 transition-all hover:scale-[1.02]"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Typography className="text-center text-amber-900/60 font-medium pt-4">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-amber-600 font-bold hover:underline">
                Create one
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
}
