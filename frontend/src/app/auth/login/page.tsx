'use client';
import * as React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Stack, 
  IconButton,
  InputAdornment,
  Paper
} from '@mui/material';
import { motion } from 'framer-motion';
import { Camera, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
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
      login(response.access_token, response.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen w-full flex bg-gradient-to-br from-yellow-50 via-amber-50/20 to-yellow-100/40 overflow-hidden relative">
      {/* Background blobs for right side on desktop / overall on mobile */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] bg-yellow-200/20 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] bg-amber-200/20 rounded-full filter blur-[120px] pointer-events-none" />

      {/* LEFT SIDE - Brand showcase (Desktop only) */}
      <Box className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-gradient-to-br from-amber-600 via-amber-600 to-yellow-600 text-white relative overflow-hidden shadow-2xl">
        {/* Animated background lines */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/20 rounded-full filter blur-3xl animate-pulse" />
        
        {/* Brand Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3 relative z-10"
        >
          <Box className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/20">
            <Camera size={28} className="text-yellow-300" />
          </Box>
          <Typography variant="h4" className="font-display font-black tracking-tight text-yellow-50">
            Memoir
          </Typography>
        </motion.div>

        {/* Polaroid Showcase with Hover Spread Effect */}
        <Box className="relative flex items-center justify-center h-[400px] my-auto">
          {/* Stack background glow */}
          <div className="absolute w-72 h-72 bg-yellow-300/30 rounded-full filter blur-3xl" />
          
          <motion.div 
            className="relative w-[320px] h-[340px] cursor-pointer"
            whileHover="hover"
          >
            {/* Polaroid 1 (Bottom) */}
            <motion.div
              variants={{
                hover: { rotate: -15, x: -60, y: -20, scale: 1.05 }
              }}
              initial={{ rotate: -8, x: -20, y: 10 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="absolute inset-0 bg-white p-4 pb-12 shadow-xl rounded-2xl border border-yellow-100 flex flex-col justify-between"
            >
              <Box className="w-full h-full bg-slate-100 rounded-lg overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80" 
                  alt="Golden Hour" 
                  className="w-full h-full object-cover"
                />
              </Box>
              <Typography className="font-display font-bold text-amber-950 mt-3 text-center text-sm italic">
                Golden Hour, 2026
              </Typography>
            </motion.div>

            {/* Polaroid 2 (Middle) */}
            <motion.div
              variants={{
                hover: { rotate: 12, x: 60, y: -10, scale: 1.05 }
              }}
              initial={{ rotate: 6, x: 20, y: -10 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="absolute inset-0 bg-white p-4 pb-12 shadow-2xl rounded-2xl border border-yellow-100 flex flex-col justify-between"
            >
              <Box className="w-full h-full bg-slate-100 rounded-lg overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80" 
                  alt="Mountains" 
                  className="w-full h-full object-cover"
                />
              </Box>
              <Typography className="font-display font-bold text-amber-950 mt-3 text-center text-sm italic">
                Mountain Dawn, 2026
              </Typography>
            </motion.div>

            {/* Polaroid 3 (Top) */}
            <motion.div
              variants={{
                hover: { rotate: -2, y: -30, scale: 1.1 }
              }}
              initial={{ rotate: -2, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="absolute inset-0 bg-white p-4 pb-12 shadow-2xl rounded-2xl border border-yellow-100 flex flex-col justify-between z-10"
            >
              <Box className="w-full h-full bg-slate-100 rounded-lg overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=400&q=80" 
                  alt="Forest path" 
                  className="w-full h-full object-cover"
                />
              </Box>
              <Typography className="font-display font-bold text-amber-950 mt-3 text-center text-sm italic">
                Peaceful Trails, 2026
              </Typography>
            </motion.div>
          </motion.div>
        </Box>

        {/* Slogan Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10"
        >
          <Typography variant="h5" className="font-display font-bold mb-2 text-yellow-100">
            Preserve your life's story, one snapshot at a time.
          </Typography>
          <Typography className="text-yellow-100/70 font-light">
            Memoir securely logs and catalogs your albums in a clean, private grid vault. Keep your stories safe.
          </Typography>
        </motion.div>
      </Box>

      {/* RIGHT SIDE - Form container */}
      <Box className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <Paper 
            elevation={0}
            component="form"
            onSubmit={handleLogin}
            className="glass-card w-full p-8 md:p-12 rounded-[48px] border-0 shadow-2xl relative overflow-hidden"
          >
            {/* Header mobile brand details */}
            <Box className="text-center mb-10">
              <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-6">
                <Camera className="text-amber-600" size={32} />
                <Typography variant="h4" className="font-display font-black text-amber-950">
                  Memoir
                </Typography>
              </Link>
              <Typography variant="h4" className="font-display font-black text-amber-950 mb-2 tracking-tight">
                Welcome Back
              </Typography>
              <Typography className="text-amber-900/60 font-medium">
                Continue preserving your memories
              </Typography>
              {error && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-xl"
                >
                  <Typography color="error" variant="body2" className="font-bold text-left">
                    {error}
                  </Typography>
                </motion.div>
              )}
            </Box>

            {/* Inputs */}
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
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    transition: 'all 0.3s ease',
                    '& fieldset': { borderColor: 'rgba(217, 119, 6, 0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(217, 119, 6, 0.25)' },
                    '&.Mui-focused fieldset': { borderColor: '#d97706' },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#d97706',
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
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" className="text-yellow-600">
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    transition: 'all 0.3s ease',
                    '& fieldset': { borderColor: 'rgba(217, 119, 6, 0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(217, 119, 6, 0.25)' },
                    '&.Mui-focused fieldset': { borderColor: '#d97706' },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#d97706',
                  }
                }}
              />

              <Box className="flex justify-end">
                <Button className="text-amber-600 font-bold text-sm hover:bg-transparent hover:text-amber-700 transition-colors">
                  Forgot password?
                </Button>
              </Box>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  endIcon={<ArrowRight size={18} />}
                  className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 rounded-full py-4 font-bold text-lg text-white shadow-xl shadow-amber-600/10 transition-all border-0"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </motion.div>

              <Typography className="text-center text-amber-900/60 font-medium pt-4">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-amber-600 font-bold hover:text-amber-700 hover:underline transition-all">
                  Create one
                </Link>
              </Typography>
            </Stack>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
}
