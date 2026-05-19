'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack, 
  IconButton,
  TextField,
  Dialog,
  Grid
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Camera, 
  MessageCircle, 
  Sparkles, 
  Share2,
  Calendar,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { fetchPhotos, addCaption, searchPhotos, uploadPhoto, deletePhoto } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

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
  const [isSurpriseMode, setIsSurpriseMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading]);

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
      const updated = await fetchPhotos(); // Simple way to refresh
      const found = updated.find((p: any) => p._id === selectedPhoto._id);
      setSelectedPhoto(found);
    } catch (error) {
      console.error('Failed to add caption:', error);
    }
  };

  if (isLoading || !user) {
    return (
      <Box className="romantic-gradient min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Camera size={64} className="text-amber-500" />
        </motion.div>
      </Box>
    );
  }

  return (
    <Box className={`min-h-screen transition-all duration-700 ${isSurpriseMode ? 'bg-yellow-950' : 'romantic-gradient'}`}>
      {/* Premium Header */}
      <nav className="p-6 sticky top-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
        <Container maxWidth="xl" className="flex justify-between items-center">
          <Typography variant="h5" className={`font-display font-bold flex items-center gap-2 ${isSurpriseMode ? 'text-yellow-100' : 'text-amber-600'}`}>
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
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: isSurpriseMode ? '#fff' : '#000',
                    '& fieldset': { border: 'none' },
                  }
                }}
              />
              <IconButton type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
                <Search size={18} className={isSurpriseMode ? 'text-yellow-200' : 'text-yellow-600'} />
              </IconButton>
            </form>

            <Button 
              onClick={() => setIsSurpriseMode(!isSurpriseMode)}
              className={`rounded-full px-6 font-bold flex gap-2 transition-all ${
                isSurpriseMode 
                ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(217,119,6,0.5)]' 
                : 'bg-white/50 text-amber-600 hover:bg-white'
              }`}
            >
              <Sparkles size={18} />
              {isSurpriseMode ? 'Surprise Mode ON' : 'Surprise Mode'}
            </Button>

            <IconButton onClick={logout} className={isSurpriseMode ? 'text-yellow-200' : 'text-amber-600'}>
              <Typography variant="body2" className="mr-2 font-bold">Logout</Typography>
            </IconButton>
          </Stack>
        </Container>
      </nav>

      <Container maxWidth="xl" className="py-12">
        <Box className="mb-12">
          <Typography variant="h3" className={`font-display font-bold mb-2 ${isSurpriseMode ? 'text-white' : 'text-amber-950'}`}>
            Our Infinite Grid
          </Typography>
          <Typography className={isSurpriseMode ? 'text-yellow-200' : 'text-amber-900/60'}>
            Every moment we've shared, captured forever.
          </Typography>
        </Box>

        {/* Infinite Grid */}
        <Grid container spacing={3}>
          {photos.length === 0 ? (
             <Box className="w-full flex flex-col items-center justify-center py-40 text-yellow-500/50">
               <ImageIcon size={100} strokeWidth={1} className="mb-6 opacity-20" />
               <Typography variant="h5" className="font-display">Your vault is empty</Typography>
               <Typography>Start adding memories together</Typography>
               <Button variant="contained" className="mt-8 bg-amber-600 hover:bg-amber-700 rounded-full px-8 py-3 text-white" onClick={() => fileInputRef.current?.click()}>Add First Photo</Button>
             </Box>
          ) : (
            photos.map((photo, index) => (
              <Grid xs={12} sm={6} md={4} lg={3} key={photo._id}>
                <motion.div
                  layoutId={photo._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedPhoto(photo)}
                  className="group relative aspect-[4/5] rounded-[32px] overflow-hidden cursor-pointer shadow-xl hover:shadow-yellow-200 transition-all hover:scale-[1.02]"
                >
                  <img 
                    src={photo.url} 
                    alt="Memory" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-yellow-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    {photo.captions.length > 0 && (
                      <Typography className="text-white font-medium line-clamp-2 italic">
                        "{photo.captions[0].text}"
                      </Typography>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-yellow-200 text-xs font-bold uppercase tracking-widest">
                      <Calendar size={12} />
                      {new Date(photo.takenAt).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              </Grid>
            ))
          )}
        </Grid>
      </Container>

      {/* Photo Detail Dialog */}
      <AnimatePresence>
        {selectedPhoto && (
          <Dialog 
            open={!!selectedPhoto} 
            onClose={() => setSelectedPhoto(null)}
            maxWidth="sm"
            fullWidth
            slotProps={{
              paper: {
                sx: { borderRadius: '40px', overflow: 'hidden', border: 'none' }
              }
            }}
          >
            <Box className="flex flex-col md:flex-row h-full max-h-[80vh]">
              <Box className="md:w-1/2 bg-black flex items-center justify-center">
                <img src={selectedPhoto.url} alt="Memory" className="max-w-full max-h-full object-contain" />
              </Box>
              
              <Box className="md:w-1/2 p-8 flex flex-col h-full bg-white">
                <div className="flex justify-between items-center mb-6">
                  <Typography variant="h5" className="font-display font-bold text-amber-950">Memory Details</Typography>
                  <Stack direction="row" spacing={1}>
                    <IconButton onClick={handleDeletePhoto} className="text-red-400 hover:text-red-600">
                      <Trash2 size={20} />
                    </IconButton>
                    <IconButton onClick={() => setSelectedPhoto(null)}><Plus style={{ transform: 'rotate(45deg)' }} /></IconButton>
                  </Stack>
                </div>

                <Box className="flex-grow overflow-y-auto space-y-6 mb-6 pr-2">
                  <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                    <Calendar size={16} />
                    {new Date(selectedPhoto.takenAt).toLocaleDateString()}
                  </div>

                  <Box className="space-y-4">
                    <Typography className="font-bold text-amber-900/40 uppercase tracking-widest text-xs">Captions</Typography>
                    {selectedPhoto.captions.length === 0 ? (
                      <Typography className="text-amber-900/30 italic">No captions yet. Be the first to add one.</Typography>
                    ) : (
                      selectedPhoto.captions.map((cap, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={i} 
                          className="bg-yellow-50 p-4 rounded-2xl border-l-4 border-amber-500"
                        >
                          <Typography className="text-amber-950 italic mb-1">"{cap.text}"</Typography>
                          <Typography variant="caption" className="text-yellow-600 font-bold">
                            {new Date(cap.createdAt).toLocaleDateString()}
                          </Typography>
                        </motion.div>
                      ))
                    )}
                  </Box>
                </Box>

                <Stack spacing={2}>
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
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        '& fieldset': { borderColor: 'yellow.100' },
                      }
                    }}
                  />
                  <Button 
                    fullWidth 
                    variant="contained" 
                    className="bg-amber-600 hover:bg-amber-700 rounded-full py-3 font-bold text-white"
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

      {/* Floating Action Buttons */}
      {!isSurpriseMode && (
        <Box className="fixed bottom-10 right-10 flex flex-col gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
            accept="image/*"
          />
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button 
              variant="contained" 
              className="w-16 h-16 rounded-full bg-white text-amber-600 shadow-2xl p-0 min-w-0"
              title="Share Access"
            >
              <Share2 />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button 
              variant="contained" 
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-full bg-amber-600 text-white shadow-2xl p-0 min-w-0"
              title="Add Memory"
            >
              {isUploading ? <Sparkles className="animate-spin" /> : <Plus size={32} />}
            </Button>
          </motion.div>
        </Box>
      )}
    </Box>
  );
}
