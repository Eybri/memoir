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
  Paper,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, Eye, EyeOff, User, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { useRouter } from 'next/navigation';
import { signup } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup(name, email, password);
      router.push('/auth/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="romantic-gradient min-h-screen flex items-center justify-center p-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={0}
          component="form"
          onSubmit={handleSignup}
          className="glass-card max-w-lg w-full p-8 md:p-12 rounded-[48px] border-0 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 p-8 text-yellow-300">
            <Sparkles size={64} strokeWidth={1} />
          </div>

          <Box className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Heart className="text-amber-600 fill-amber-600" size={32} />
              <Typography variant="h4" className="font-display font-bold text-amber-950">
                Memoir
              </Typography>
            </Link>
            <Typography variant="h5" className="font-display font-bold text-amber-950 mb-2">
              Create Your Vault
            </Typography>
            <Typography className="text-amber-900/50 font-medium">
              A secure digital vault for all your memories
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
              label="Your Name"
              placeholder="Alex Smith"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={20} className="text-yellow-600" />
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
              label="Create Password"
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

            <FormControlLabel
              control={
                <Checkbox 
                  size="small" 
                  required
                  sx={{ color: 'yellow.600', '&.Mui-checked': { color: '#d97706' } }} 
                />
              }
              label={
                <Typography variant="body2" className="text-amber-900/60">
                  I agree to follow the{' '}
                  <Link href="#" className="text-amber-600 font-bold">Terms of Service</Link>
                </Typography>
              }
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 rounded-full py-4 font-bold text-lg shadow-xl shadow-yellow-100 transition-all hover:scale-[1.02]"
            >
              {loading ? 'Creating Vault...' : 'Create Vault'}
            </Button>

            <Typography className="text-center text-amber-900/60 font-medium pt-4">
              Already have a vault?{' '}
              <Link href="/auth/login" className="text-amber-600 font-bold hover:underline">
                Sign in
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
}
