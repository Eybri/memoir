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
  Paper,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { motion } from 'framer-motion';
import { Camera, Mail, Lock, Eye, EyeOff, User, Sparkles, ArrowRight } from 'lucide-react';
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
                hover: { rotate: -18, x: -70, y: 10, scale: 1.05 }
              }}
              initial={{ rotate: -5, x: -10, y: 20 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="absolute inset-0 bg-white p-4 pb-12 shadow-xl rounded-2xl border border-yellow-100 flex flex-col justify-between"
            >
              <Box className="w-full h-full bg-slate-100 rounded-lg overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=400&q=80" 
                  alt="Nature hills" 
                  className="w-full h-full object-cover"
                />
              </Box>
              <Typography className="font-display font-bold text-amber-950 mt-3 text-center text-xs sm:text-sm md:text-base italic">
                Wild Hills, 2026
              </Typography>
            </motion.div>

            {/* Polaroid 2 (Middle) */}
            <motion.div
              variants={{
                hover: { rotate: 15, x: 70, y: -10, scale: 1.05 }
              }}
              initial={{ rotate: 8, x: 15, y: -5 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="absolute inset-0 bg-white p-4 pb-12 shadow-2xl rounded-2xl border border-yellow-100 flex flex-col justify-between"
            >
              <Box className="w-full h-full bg-slate-100 rounded-lg overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80" 
                  alt="Scenic mountains" 
                  className="w-full h-full object-cover"
                />
              </Box>
              <Typography className="font-display font-bold text-amber-950 mt-3 text-center text-xs sm:text-sm md:text-base italic">
                Mountain Lake, 2026
              </Typography>
            </motion.div>

            {/* Polaroid 3 (Top) */}
            <motion.div
              variants={{
                hover: { rotate: -3, y: -25, scale: 1.1 }
              }}
              initial={{ rotate: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="absolute inset-0 bg-white p-4 pb-12 shadow-2xl rounded-2xl border border-yellow-100 flex flex-col justify-between z-10"
            >
              <Box className="w-full h-full bg-slate-100 rounded-lg overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=400&q=80" 
                  alt="Deer in woods" 
                  className="w-full h-full object-cover"
                />
              </Box>
              <Typography className="font-display font-bold text-amber-950 mt-3 text-center text-xs sm:text-sm md:text-base italic">
                Meadow Life, 2026
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
            A beautiful, organized vault for your albums.
          </Typography>
          <Typography className="text-yellow-100/70 font-light">
            Create an account, securely upload images and organize them into visual memory boards. Add captions to save details forever.
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
            onSubmit={handleSignup}
            className="glass-card w-full p-8 md:p-12 rounded-[48px] border-0 shadow-2xl relative overflow-hidden"
          >
            {/* Header mobile brand details */}
            <Box className="text-center mb-8">
              <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-6">
                <Camera className="text-amber-600" size={32} />
                <Typography variant="h4" className="font-display font-black text-amber-950">
                  Memoir
                </Typography>
              </Link>
              <Typography variant="h4" className="font-display font-black text-amber-950 mb-2 tracking-tight">
                Create Your Vault
              </Typography>
              <Typography className="text-amber-900/60 font-medium">
                A secure digital vault for all your memories
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

              <FormControlLabel
                control={
                  <Checkbox 
                    size="small" 
                    required
                    sx={{ color: 'amber.600', '&.Mui-checked': { color: '#d97706' } }} 
                  />
                }
                label={
                  <Typography variant="body2" className="text-amber-900/60 select-none">
                    I agree to follow the{' '}
                    <Link href="#" className="text-amber-600 font-bold hover:text-amber-700 hover:underline transition-all">Terms of Service</Link>
                  </Typography>
                }
              />

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  endIcon={<ArrowRight size={18} />}
                  className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 rounded-full py-4 font-bold text-base sm:text-lg md:text-xl text-white shadow-xl shadow-amber-600/10 transition-all border-0"
                >
                  {loading ? 'Creating Vault...' : 'Create Vault'}
                </Button>
              </motion.div>

              <Typography className="text-center text-amber-900/60 font-medium pt-2">
                Already have a vault?{' '}
                <Link href="/auth/login" className="text-amber-600 font-bold hover:text-amber-700 hover:underline transition-all">
                  Sign in
                </Link>
              </Typography>
            </Stack>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
}
