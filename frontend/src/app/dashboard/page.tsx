'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack, 
  IconButton,
  TextField,
  Dialog
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Camera, 
  Sparkles, 
  Trash2,
  Calendar,
  Image as ImageIcon,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { fetchPhotos, addCaption, searchPhotos, uploadPhoto, deletePhoto } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

// Import subcomponents
import DailyCanvas from './components/DailyCanvas';
import MemoryGrid from './components/MemoryGrid';
import SensoryCorner from './components/SensoryCorner';

interface Photo {
  _id: string;
  url: string;
  captions: { text: string; authorId: string; createdAt: string }[];
  takenAt: string;
}

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [newCaption, setNewCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [nostalgiaMode, setNostalgiaMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      loadPhotos();
    }
  }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadPhoto(file);
      loadPhotos();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const loadPhotos = async () => {
    try {
      const data = await fetchPhotos();
      setPhotos(data);
    } catch (error) {
      console.error('Failed to load photos:', error);
    }
  };

  const handleDeletePhoto = async () => {
    if (!selectedPhoto) return;
    if (!confirm('Are you sure you want to delete this memory forever?')) return;

    try {
      await deletePhoto(selectedPhoto._id);
      setSelectedPhoto(null);
      loadPhotos();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await searchPhotos(searchQuery);
      setPhotos(data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleAddCaption = async () => {
    if (!selectedPhoto || !newCaption.trim()) return;
    try {
      await addCaption(selectedPhoto._id, newCaption);
      setNewCaption('');
      loadPhotos();
      // Update selected photo in modal
      const updated = await fetchPhotos(); 
      const found = updated.find((p: any) => p._id === selectedPhoto._id);
      setSelectedPhoto(found);
    } catch (error) {
      console.error('Failed to add caption:', error);
    }
  };

  // Determine welcome date details
  const timeDifferenceText = React.useMemo(() => {
    if (photos.length === 0) return 'Welcome to your vault.';
    const dates = photos.map(p => new Date(p.takenAt).getTime());
    const oldest = Math.min(...dates);
    const diffYears = Math.round((Date.now() - oldest) / (1000 * 60 * 60 * 24 * 365.25));
    if (diffYears >= 1) {
      return `Welcome back. Here is where your story was ${diffYears} year${diffYears > 1 ? 's' : ''} ago today...`;
    }
    return `Welcome back. Let's add more chapters to your story...`;
  }, [photos]);

  if (isLoading || !user) {
    return (
      <Box className="romantic-gradient min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Camera size={64} className="text-amber-500 animate-pulse" />
        </motion.div>
      </Box>
    );
  }

  // Base background theme
  const bgThemeClass = nostalgiaMode 
    ? 'bg-[#f4efe2] text-[#3c2f1f]' 
    : 'romantic-gradient text-amber-950';

  return (
    <Box className={`min-h-screen transition-all duration-700 pb-24 ${bgThemeClass}`}>
      
      {/* Premium Header */}
      <nav className={`p-6 sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-700 ${
        nostalgiaMode ? 'bg-[#f4efe2]/80 border-[#dcd2be]' : 'bg-white/10 border-white/20'
      }`}>
        <Container maxWidth="xl" className="flex justify-between items-center">
          <Typography variant="h5" className="font-display font-black flex items-center gap-2 text-amber-600 cursor-pointer" onClick={() => router.push('/')}>
            <Camera size={24} /> Memoir
          </Typography>

          <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
             <form onSubmit={handleSearch} className="relative hidden md:block">
              <TextField
                size="small"
                placeholder="Search captions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '50px',
                    backgroundColor: nostalgiaMode ? 'rgba(60, 47, 31, 0.05)' : 'rgba(255, 255, 255, 0.2)',
                    color: nostalgiaMode ? '#3c2f1f' : '#000',
                    '& fieldset': { border: 'none' },
                  }
                }}
              />
              <IconButton type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
                <Search size={18} className="text-amber-600" />
              </IconButton>
            </form>

            {/* 褪色 (Muted) Toggle */}
            <Button 
              onClick={() => setNostalgiaMode(!nostalgiaMode)}
              className={`rounded-full px-6 font-bold flex gap-2 transition-all ${
                nostalgiaMode 
                ? 'bg-amber-800 text-yellow-50 shadow-md' 
                : 'bg-white/50 text-amber-600 hover:bg-white border border-amber-200/20'
              }`}
            >
              <Sparkles size={18} />
              {nostalgiaMode ? 'Nostalgia Active' : 'Nostalgia Toggle'}
            </Button>

            <IconButton onClick={logout} className="text-amber-600 hover:text-amber-700 bg-white/20 p-2.5 rounded-full border border-amber-200/10">
              <LogOut size={18} />
            </IconButton>
          </Stack>
        </Container>
      </nav>

      {/* Main Content */}
      <Container maxWidth="xl" className="py-12 space-y-12">
        {/* Welcome Block */}
        <Box className="space-y-2">
          <Typography variant="h6" className="font-display text-amber-600/70 font-semibold tracking-wide uppercase text-xs sm:text-sm">
            {timeDifferenceText}
          </Typography>
          <Typography variant="h2" className="font-display font-black text-3xl sm:text-5xl leading-tight">
            The Living Scrapbook
          </Typography>
        </Box>

        {/* 1. Hero space - The Daily Canvas */}
        <DailyCanvas photos={photos} nostalgiaMode={nostalgiaMode} />

        {/* 2. Grid & Sidebar Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
          {/* Main Grid */}
          <div className="lg:col-span-8 space-y-8">
            <MemoryGrid 
              photos={photos} 
              onSelectPhoto={setSelectedPhoto} 
              nostalgiaMode={nostalgiaMode} 
            />
          </div>

          {/* 3. Sensory Corner (Sidebar) */}
          <div className="lg:col-span-4">
            <Box className="sticky top-28">
              <SensoryCorner photos={photos} nostalgiaMode={nostalgiaMode} />
            </Box>
          </div>
        </div>
      </Container>

      {/* Photo Detail Dialog */}
      <AnimatePresence>
        {selectedPhoto && (
          <Dialog 
            open={!!selectedPhoto} 
            onClose={() => setSelectedPhoto(null)}
            maxWidth="md"
            fullWidth
            slotProps={{
              paper: {
                sx: { 
                  borderRadius: '36px', 
                  overflow: 'hidden', 
                  border: 'none',
                  backgroundColor: nostalgiaMode ? '#f4efe2' : '#ffffff',
                  color: nostalgiaMode ? '#3c2f1f' : '#000000',
                  boxShadow: '0 24px 64px -10px rgba(0, 0, 0, 0.15)'
                }
              }
            }}
          >
            <Box className="flex flex-col md:flex-row h-full max-h-[85vh]">
              {/* Media viewer */}
              <Box className="md:w-1/2 bg-black flex items-center justify-center p-2 relative min-h-[300px] md:min-h-0">
                <img src={selectedPhoto.url} alt="Scrapbook detail" className="max-w-full max-h-[75vh] object-contain rounded-xl" />
              </Box>
              
              {/* Info panel */}
              <Box className="md:w-1/2 p-8 flex flex-col justify-between h-full min-h-[400px] md:min-h-0">
                <div className="space-y-6 flex-grow overflow-y-auto pr-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <Typography variant="h5" className="font-display font-black text-amber-950">Memory Ledger</Typography>
                      <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs mt-1">
                        <Calendar size={14} />
                        {new Date(selectedPhoto.takenAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={handleDeletePhoto} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2.5 rounded-full transition-all">
                        <Trash2 size={18} />
                      </IconButton>
                      <IconButton onClick={() => setSelectedPhoto(null)} className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 p-2.5 rounded-full font-black text-sm">
                        ✕
                      </IconButton>
                    </Stack>
                  </div>

                  <Box className="space-y-4">
                    <Typography className="font-bold text-amber-900/40 uppercase tracking-widest text-[10px]">Captions Ledger</Typography>
                    {selectedPhoto.captions.length === 0 ? (
                      <Typography className="text-amber-900/30 italic text-sm">No captions recorded yet. Be the first to describe this memory.</Typography>
                    ) : (
                      selectedPhoto.captions.map((cap, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={i} 
                          className="bg-amber-500/5 p-4 rounded-2xl border-l-4 border-amber-500"
                        >
                          <Typography className="text-amber-950 italic mb-1 text-sm font-medium">"{cap.text}"</Typography>
                          <Typography variant="caption" className="text-amber-600/60 font-bold text-[10px]">
                            Recorded {new Date(cap.createdAt).toLocaleDateString()}
                          </Typography>
                        </motion.div>
                      ))
                    )}
                  </Box>
                </div>

                <Stack spacing={2} className="pt-4 border-t border-amber-200/20">
                  <TextField
                    fullWidth
                    placeholder="Add a caption..."
                    multiline
                    rows={2}
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.4)',
                        '& fieldset': { borderColor: 'rgba(217, 119, 6, 0.1)' },
                        '&.Mui-focused fieldset': { borderColor: '#d97706' },
                      }
                    }}
                  />
                  <Button 
                    fullWidth 
                    variant="contained" 
                    className="bg-amber-600 hover:bg-amber-700 rounded-full py-3.5 font-bold text-white shadow-lg shadow-amber-600/10"
                    onClick={handleAddCaption}
                  >
                    Add Caption
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Floating Drag & Drop Action Trigger */}
      <Box className="fixed bottom-10 right-10 flex flex-col gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
          accept="image/*"
        />
        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
          <Button 
            variant="contained" 
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-2xl p-0 min-w-0 flex items-center justify-center"
            title="Add Memory"
          >
            {isUploading ? <Sparkles className="animate-spin" /> : <Plus size={32} />}
          </Button>
        </motion.div>
      </Box>

    </Box>
  );
}
