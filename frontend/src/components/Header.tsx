'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack, 
  IconButton,
  TextField,
  Drawer,
  Avatar
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Search, 
  Sparkles, 
  LogOut,
  Bell,
  UserMinus,
  Users
} from 'lucide-react';
import { Snackbar, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { searchUsers, fetchFriends, sendFriendRequest, removeFriend, fetchPendingRequests, fetchSentRequests, acceptFriendRequest, rejectFriendRequest, UserBasic } from '@/lib/api';
import ConfirmDialog from '@/components/ConfirmDialog';

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
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [friends, setFriends] = React.useState<UserBasic[]>([]);
  const [searchEmail, setSearchEmail] = React.useState('');
  const [searchResult, setSearchResult] = React.useState<UserBasic[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [pendingRequests, setPendingRequests] = React.useState<any[]>([]);
  const [sentRequests, setSentRequests] = React.useState<any[]>([]);
  const [friendToRemove, setFriendToRemove] = React.useState<{id: string, name: string} | null>(null);
  const [snackbar, setSnackbar] = React.useState<{open: boolean, message: string, severity: 'success'|'error'|'info'}>({open: false, message: '', severity: 'info'});

  React.useEffect(() => {
    if (isProfileOpen && user) {
      loadFriends();
    }
  }, [isProfileOpen, user]);

  const loadFriends = async () => {
    try {
      const f = await fetchFriends();
      setFriends(f);
      const reqs = await fetchPendingRequests();
      setPendingRequests(reqs);
      const sent = await fetchSentRequests();
      setSentRequests(sent);
    } catch(e) { console.error(e) }
  };

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      setSearchResult([]);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    setHasSearched(false);
    try {
      const res = await searchUsers(searchEmail.trim());
      setSearchResult(res);
      setHasSearched(true);
    } catch(e) { console.error(e) }
    finally { setIsSearching(false); }
  }

  const handleSendRequest = async (id: string) => {
    try {
      await sendFriendRequest(id);
      setSearchResult([]);
      setSearchEmail('');
      loadFriends();
      setSnackbar({ open: true, message: 'Friend request sent!', severity: 'success' });
    } catch(e: any) { 
      setSnackbar({ open: true, message: e.message || 'Failed to send request', severity: 'error' });
      console.error(e); 
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      loadFriends();
    } catch(e) { console.error(e) }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      loadFriends();
    } catch(e) { console.error(e) }
  }

  const handleRemoveFriend = async () => {
    if (!friendToRemove) return;
    try {
      const f = await removeFriend(friendToRemove.id);
      setFriends(f);
    } catch(e) { console.error(e) }
  }

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
    <>
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

            {/* Circular Profile Avatar */}
            {user && (
              <motion.div 
                whileHover={{ scale: 1.08 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileOpen(true)}
                title={`Logged in as ${user.name} (${user.email})`}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-black text-xs shadow-md border-2 cursor-pointer select-none transition-all duration-300 ${
                  nostalgiaMode 
                    ? 'bg-[#3c2f1f] border-[#3c2f1f]/20 text-[#fdfcf8] hover:shadow-[0_4px_12px_rgba(60,47,31,0.2)]' 
                    : 'bg-gradient-to-br from-amber-500 to-amber-700 border-white text-white hover:shadow-[0_4px_12px_rgba(217,119,6,0.3)]'
                }`}
              >
                {initials}
              </motion.div>
            )}

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

      {/* User Profile Sidebar */}
      {user && (
        <Drawer
          variant="persistent"
          anchor="right"
          open={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          elevation={4}
          sx={{
            zIndex: 1200,
            '& .MuiDrawer-paper': {
              width: { xs: 280, sm: 400 },
              backgroundColor: nostalgiaMode ? '#f4efe2' : '#ffffff',
              color: nostalgiaMode ? '#3c2f1f' : '#000000',
              borderLeft: nostalgiaMode ? '1px solid #dcd2be' : '1px solid #f3f4f6',
              mt: '80px',
              height: 'calc(100% - 80px)',
            }
          }}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b border-amber-900/10">
              <Typography className="font-display font-black text-amber-950 text-xl">
                Profile Details
              </Typography>
              <IconButton onClick={() => setIsProfileOpen(false)} className="text-amber-700 hover:bg-amber-500/10">
                ✕
              </IconButton>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center text-center space-y-4">
              <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: nostalgiaMode ? '#3c2f1f' : '#d97706',
                fontSize: '32px',
                fontFamily: 'var(--font-display)',
                fontWeight: 900
              }}
              className="shadow-xl"
            >
              {initials}
            </Avatar>
            <div>
              <Typography className="font-display font-black text-2xl text-amber-950">
                {user.name}
              </Typography>
              <Typography className="font-mono text-sm tracking-wider text-amber-700/70 uppercase font-bold mt-1">
                {user.email}
              </Typography>
            </div>
            <div className="w-full text-left mt-2">
              <Typography className="font-display font-black text-amber-950 text-sm mb-3 flex items-center gap-2">
                <Users size={16} className="text-amber-700" /> Friends
              </Typography>
              
              {/* Search User */}
              <div className="flex gap-2 mb-3">
                <TextField
                  size="small"
                  placeholder="Find by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleSearchUser}
                  disabled={isSearching || !searchEmail}
                  className="bg-amber-600 hover:bg-amber-700 min-w-[60px] rounded-lg shadow-none"
                >
                  <Search size={14} />
                </Button>
              </div>

              {/* Search Results & Lists Scroll Container */}
              <div className="w-full space-y-3">
                {/* Search Results */}
                {hasSearched && searchResult.length === 0 && (
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-center">
                    <Typography className="text-xs text-amber-900/60 italic">No user found with that email.</Typography>
                  </div>
                )}
                {searchResult.length > 0 && (
                  <div className="bg-amber-50 rounded-lg p-2 border border-amber-200">
                    <Typography className="text-xs font-bold text-amber-900 mb-2">Search Result:</Typography>
                    {searchResult.map(res => {
                      const isFriend = friends.some(f => f._id === res._id);
                      return (
                        <div key={res._id} className="flex justify-between items-center py-1">
                          <div>
                            <Typography className="text-sm font-bold text-amber-950">{res.name}</Typography>
                            <Typography className="text-[10px] text-amber-700">{res.email}</Typography>
                          </div>
                          {!isFriend && (
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => handleSendRequest(res._id)} 
                              className="text-[9px] py-0.5 px-2 border-amber-600 text-amber-700 rounded-md font-bold"
                            >
                              Send Request
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                  <div className="bg-blue-50/50 rounded-lg p-2 border border-blue-200">
                    <Typography className="text-xs font-bold text-blue-900 mb-2">Friend Requests:</Typography>
                    {pendingRequests.map(req => (
                      <div key={req._id} className="flex justify-between items-center py-1 bg-white p-2 rounded-lg border border-blue-100 shadow-sm mb-1">
                        <div>
                          <Typography className="text-sm font-bold text-blue-950">{req.senderId?.name || 'Unknown'}</Typography>
                          <Typography className="text-[10px] text-blue-700">{req.senderId?.email || 'unknown@example.com'}</Typography>
                        </div>
                        <div className="flex gap-1">
                          <Button size="small" variant="contained" className="bg-blue-600 hover:bg-blue-700 text-white min-w-0 px-2 py-0.5 text-[9px] rounded font-bold shadow-none" onClick={() => handleAcceptRequest(req._id)}>Accept</Button>
                          <Button size="small" variant="outlined" className="border-red-200 text-red-600 min-w-0 px-2 py-0.5 text-[9px] rounded font-bold hover:bg-red-50" onClick={() => handleRejectRequest(req._id)}>Reject</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sent Requests */}
                {sentRequests.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                    <Typography className="text-xs font-bold text-gray-700 mb-2">Sent Requests:</Typography>
                    {sentRequests.map(req => (
                      <div key={req._id} className="flex justify-between items-center py-1 bg-white p-2 rounded-lg border border-gray-100 shadow-sm mb-1">
                        <div>
                          <Typography className="text-sm font-bold text-gray-800">{req.receiverId?.name || 'Unknown'}</Typography>
                          <Typography className="text-[10px] text-gray-500">{req.receiverId?.email || 'unknown@example.com'}</Typography>
                        </div>
                        <Typography className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-widest">Pending</Typography>
                      </div>
                    ))}
                  </div>
                )}

                {/* Friends List */}
                <div className="space-y-2 pt-1">
                  {friends.length === 0 ? (
                    <Typography className="text-xs text-amber-900/40 italic">No friends added yet.</Typography>
                  ) : (
                    friends.map(f => {
                      const fInitials = f.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                      return (
                        <div key={f._id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-amber-900/5 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex items-center gap-3">
                            <Avatar sx={{ width: 32, height: 32, bgcolor: nostalgiaMode ? '#5c4a3d' : '#f59e0b', fontSize: '12px', fontWeight: 'bold' }}>{fInitials}</Avatar>
                            <div>
                              <Typography className="text-sm font-bold text-amber-950">{f.name}</Typography>
                              <Typography className="text-[10px] text-amber-900/60">{f.email}</Typography>
                            </div>
                          </div>
                          <IconButton size="small" onClick={() => setFriendToRemove({id: f._id, name: f.name})} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <UserMinus size={14} />
                          </IconButton>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Friend Removal Confirmation */}
            <ConfirmDialog
              open={!!friendToRemove}
              title="Remove Friend"
              message={`Are you sure you want to remove ${friendToRemove?.name} from your friends list? You will no longer have access to each other's shared albums.`}
              confirmText="Remove Friend"
              onConfirm={handleRemoveFriend}
              onCancel={() => setFriendToRemove(null)}
            />

            <div className="w-full border-t border-amber-900/10 mt-auto pt-6 flex justify-center">
              <Button 
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                }} 
                startIcon={<LogOut size={16} />}
                className="bg-red-50 hover:bg-red-100 text-red-600 rounded-full px-6 py-2 font-bold transition-all"
              >
                Sign Out
              </Button>
            </div>
            </div>
          </div>
        </Drawer>
      )}

      {/* Global Snackbar for Header Notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%', borderRadius: '12px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </>
  );
}
