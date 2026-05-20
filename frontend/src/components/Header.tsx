'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack, 
  IconButton,
  TextField
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Search, 
  Sparkles, 
  LogOut,
  Bell
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

interface HeaderProps {
  isDashboard?: boolean;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  handleSearch?: (e: React.FormEvent) => void;
  nostalgiaMode?: boolean;
  setNostalgiaMode?: (mode: boolean) => void;
  logout?: () => void;
}

export default function Header({
  isDashboard = false,
  searchQuery = '',
  setSearchQuery = () => {},
  handleSearch = (e) => e.preventDefault(),
  nostalgiaMode = false,
  setNostalgiaMode = () => {},
  logout = () => {}
}: HeaderProps) {
  const router = useRouter();
  const { user } = useAuth();

  const initials = React.useMemo(() => {
    if (!user || !user.name) return 'U';
    return user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }, [user]);

  // Generate today's date formatted like a classic ink stamp
  const stampDateText = React.useMemo(() => {
    const d = new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')} ${d.getFullYear()}`;
  }, []);

  return (
    <nav className={`sticky top-0 z-40 p-5 backdrop-blur-lg border-b transition-all duration-700 select-none ${
      nostalgiaMode 
        ? 'bg-gradient-to-b from-[#f4efe2] to-[#ebdcb9] border-[#dcd2be] shadow-[0_4px_20px_rgba(60,47,31,0.08)]' 
        : 'bg-[#fffdf0]/65 border-amber-900/10 shadow-sm'
    }`}>
      
      {/* Subtle top leather-stitch decoration if nostalgia mode is active */}
      {nostalgiaMode && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 opacity-60" />
      )}

      <Container maxWidth="xl" className="flex justify-between items-center relative">
        
        {/* Left Side: Brand Logo & Typewriter Tag */}
        <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
          <Box 
            onClick={() => router.push('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {/* Shutter rotating Camera Icon */}
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`p-2 rounded-xl transition-colors duration-500 ${
                nostalgiaMode ? 'bg-[#3c2f1f]/5 text-amber-800' : 'bg-amber-500/10 text-amber-700'
              }`}
            >
              <Camera size={22} strokeWidth={2.2} />
            </motion.div>

            <div className="flex flex-col">
              <Typography 
                variant="h5" 
                className={`font-display font-black tracking-tight leading-none ${
                  nostalgiaMode ? 'text-amber-900' : 'text-amber-950'
                }`}
              >
                Memoir
              </Typography>
              <span className={`font-mono text-[8px] tracking-[0.2em] font-semibold mt-0.5 uppercase ${
                nostalgiaMode ? 'text-amber-800/40' : 'text-amber-600/55'
              }`}>
                Vault No. 01
              </span>
            </div>
          </Box>

          {/* Nostalgic Physical Ink Stamp (Dynamic Date) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: -4 }}
            whileHover={{ rotate: 0, scale: 1.02 }}
            className={`hidden sm:flex flex-col items-center justify-center border border-dashed rounded px-2.5 py-0.5 border-red-800/30 text-red-800/60 font-mono text-[10px] font-bold tracking-widest bg-red-50/5 leading-none transition-all select-none ${
              nostalgiaMode ? 'border-red-900/40 text-red-900/50 rotate-[-5deg]' : 'border-amber-700/30 text-amber-700/50'
            }`}
            style={{
              boxShadow: nostalgiaMode ? 'inset 0 0 4px rgba(153, 27, 27, 0.05)' : 'none'
            }}
          >
            <span className="text-[7px] uppercase opacity-70 tracking-widest pb-0.5">archived</span>
            {stampDateText}
          </motion.div>
        </Stack>

        {/* Right Side */}
        {isDashboard ? (
          /* Dashboard Mode Navigation */
          <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
            
            {/* Card-Catalog Styled Search Bar */}
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <TextField
                size="small"
                placeholder="Pull card from catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    paddingLeft: '6px',
                    backgroundColor: nostalgiaMode 
                      ? 'rgba(60, 47, 31, 0.04)' 
                      : 'rgba(255, 255, 255, 0.15)',
                    color: nostalgiaMode ? '#3c2f1f' : '#3c2f0f',
                    border: nostalgiaMode 
                      ? '1px solid rgba(60, 47, 31, 0.12)' 
                      : '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: nostalgiaMode ? 'inset 0 1px 3px rgba(0,0,0,0.05)' : 'none',
                    fontSize: '0.875rem',
                    fontFamily: nostalgiaMode ? 'serif' : 'inherit',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: nostalgiaMode ? 'rgba(60, 47, 31, 0.25)' : 'rgba(255, 255, 255, 0.4)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: nostalgiaMode ? 'rgba(60, 47, 31, 0.06)' : 'rgba(255, 255, 255, 0.25)',
                      borderColor: '#b45309',
                      boxShadow: nostalgiaMode 
                        ? '0 0 0 3px rgba(180, 83, 9, 0.12)' 
                        : '0 0 0 3px rgba(217, 119, 6, 0.2)',
                    },
                    '& fieldset': { border: 'none' },
                  }
                }}
              />
              <IconButton type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 text-amber-700 hover:scale-110 transition-transform">
                <Search size={16} />
              </IconButton>
            </form>

            {/* Premium 褪色 (Muted) Nostalgia Toggle */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => setNostalgiaMode(!nostalgiaMode)}
                className={`rounded-full px-5 py-2 text-xs font-black tracking-wider uppercase transition-all duration-500 shadow-sm flex items-center gap-2 border ${
                  nostalgiaMode 
                    ? 'bg-amber-800 hover:bg-amber-900 text-yellow-50 border-amber-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]' 
                    : 'bg-white/40 hover:bg-white/70 text-amber-800 border-amber-200/50 hover:border-amber-300'
                }`}
              >
                {/* Dial indicator with glow */}
                <motion.div 
                  animate={nostalgiaMode ? { rotate: 180 } : { rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className={`p-0.5 rounded-full flex items-center justify-center ${
                    nostalgiaMode ? 'bg-amber-700/50 shadow-inner' : 'bg-transparent'
                  }`}
                >
                  <Sparkles size={14} className={nostalgiaMode ? 'text-yellow-200 animate-pulse' : 'text-amber-700'} />
                </motion.div>
                <span>{nostalgiaMode ? 'Sepia Muted' : 'Muted Toggle'}</span>
              </Button>
            </motion.div>

            {/* Notifications Bell */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <IconButton 
                className={`p-2.5 rounded-full border relative transition-all duration-500 ${
                  nostalgiaMode 
                    ? 'bg-[#3c2f1f]/5 border-[#3c2f1f]/10 text-amber-800 hover:bg-[#3c2f1f]/10' 
                    : 'bg-white/20 border-white/20 text-amber-700 hover:bg-white/40'
                }`}
              >
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-600 rounded-full" />
              </IconButton>
            </motion.div>

            {/* Wax-Seal styled User Profile Avatar */}
            {user && (
              <motion.div 
                whileHover={{ scale: 1.08, rotate: 3 }} 
                title={`Logged in as ${user.name} (${user.email})`}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-black text-xs shadow border cursor-pointer select-none transition-all duration-500 ${
                  nostalgiaMode 
                    ? 'bg-red-800 border-red-950 text-yellow-50 shadow-[0_2px_8px_rgba(153,27,27,0.3)]' 
                    : 'bg-amber-600 border-amber-700 text-white shadow-[0_2px_8px_rgba(217,119,6,0.3)]'
                }`}
                style={{
                  clipPath: 'polygon(50% 0%, 93% 15%, 100% 55%, 85% 90%, 50% 100%, 15% 90%, 0% 55%, 7% 15%)',
                }}
              >
                {initials}
              </motion.div>
            )}

            {/* Wax-Seal styled Logout Button */}
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
              <IconButton 
                onClick={logout} 
                title="Close Vault"
                className={`p-2.5 rounded-full border transition-all duration-500 ${
                  nostalgiaMode 
                    ? 'bg-[#3c2f1f]/5 border-[#3c2f1f]/10 text-amber-800 hover:bg-[#3c2f1f]/10 hover:text-red-700' 
                    : 'bg-white/20 border-white/20 text-amber-700 hover:bg-white/40 hover:text-amber-900'
                }`}
              >
                <LogOut size={16} />
              </IconButton>
            </motion.div>
          </Stack>
        ) : (
          /* Public Web Landing Mode Navigation */
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Link href="/auth/login" style={{ textDecoration: 'none' }}>
              <Button 
                variant="text" 
                className="text-amber-950 hover:text-amber-750 font-bold px-6 py-2 hover:bg-amber-500/5 rounded-full transition-all duration-300"
              >
                Login
              </Button>
            </Link>
            <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="contained" 
                  disableElevation
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-7 py-2.5 font-bold shadow-lg shadow-amber-600/10 transition-all"
                >
                  Sign Up
                </Button>
              </motion.div>
            </Link>
          </Stack>
        )}
      </Container>
    </nav>
  );
}
