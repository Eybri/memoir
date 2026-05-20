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
  Camera, 
  Sparkles, 
  Trash2,
  Calendar,
  Image as ImageIcon,
  Moon,
  Sun
} from 'lucide-react';
import { 
  fetchPhotos, 
  addCaption, 
  searchPhotos, 
  uploadPhoto, 
  deletePhoto,
  fetchAlbums,
  createAlbum,
  deleteAlbum,
  updateAlbum,
  updatePhotoAlbum
} from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

// Import subcomponents
import DailyCanvas from './components/DailyCanvas';
import MemoryGrid from './components/MemoryGrid';
import SensoryCorner from './components/SensoryCorner';
import Header from '@/components/Header';
import ReelBoard from './components/ReelBoard';

interface Album {
  _id: string;
  title: string;
  coverPhotoUrl: string;
}

interface Photo {
  _id: string;
  url: string;
  captions: { text: string; authorId: string; createdAt: string }[];
  takenAt: string;
  albumId?: string;
}

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
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
      loadAlbums();
    }
  }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newPhoto = await uploadPhoto(file);
      if (activeAlbumId) {
        await updatePhotoAlbum(newPhoto._id, activeAlbumId);
      }
      loadPhotos();
      loadAlbums();
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

  const loadAlbums = async () => {
    try {
      const data = await fetchAlbums();
      setAlbums(data);
    } catch (error) {
      console.error('Failed to load albums:', error);
    }
  };

  const handleCreateAlbum = async (title: string, coverPhotoUrl?: string) => {
    try {
      await createAlbum(title, coverPhotoUrl);
      loadAlbums();
    } catch (error) {
      console.error('Failed to create album:', error);
    }
  };

  const handleDeleteAlbum = async () => {
    if (!activeAlbumId) return;
    const album = albums.find(a => a._id === activeAlbumId);
    if (!album) return;
    if (!confirm(`Are you sure you want to delete the album "${album.title}"? Your photos inside it will not be deleted.`)) return;
    try {
      await deleteAlbum(activeAlbumId);
      setActiveAlbumId(null);
      loadAlbums();
      loadPhotos();
    } catch (error) {
      console.error('Failed to delete album:', error);
    }
  };

  const handleUpdatePhotoAlbum = async (photoId: string, albumId: string | null) => {
    try {
      await updatePhotoAlbum(photoId, albumId);
      loadPhotos();
      loadAlbums();
      
      // Update selected photo in modal
      if (selectedPhoto && selectedPhoto._id === photoId) {
        setSelectedPhoto(prev => prev ? { ...prev, albumId: albumId || undefined } : null);
      }
    } catch (error) {
      console.error('Failed to update photo album:', error);
    }
  };

  const handleSetAsCover = async (photoUrl: string) => {
    if (!activeAlbumId) return;
    const album = albums.find(a => a._id === activeAlbumId);
    if (!album) return;
    try {
      await updateAlbum(activeAlbumId, { coverPhotoUrl: photoUrl });
      loadAlbums();
      alert(`Set as cover photo for "${album.title}"!`);
    } catch (error) {
      console.error('Failed to update album cover:', error);
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

  const handleAddCaptionForId = async (photoId: string, text: string) => {
    try {
      await addCaption(photoId, text);
      loadPhotos();
    } catch (error) {
      console.error('Failed to add caption:', error);
    }
  };

  const filteredPhotos = React.useMemo(() => {
    if (!activeAlbumId) return photos;
    return photos.filter(p => p.albumId === activeAlbumId);
  }, [photos, activeAlbumId]);

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
    ? 'bg-[#f4efe2] text-[#3c2f1f] paper-grain' 
    : 'romantic-gradient text-amber-950';

  return (
    <Box className={`min-h-screen transition-all duration-700 pb-24 ${bgThemeClass}`}>
      
      {/* Premium Header */}
      <Header 
        isDashboard={true}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        nostalgiaMode={nostalgiaMode}
        setNostalgiaMode={setNostalgiaMode}
        logout={logout}
      />

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

        {/* Section 1: The Reel Board */}
        <ReelBoard 
          albums={albums}
          photos={photos}
          activeAlbumId={activeAlbumId}
          onSelectAlbum={setActiveAlbumId}
          onCreateAlbum={handleCreateAlbum}
          nostalgiaMode={nostalgiaMode} 
        />

        {activeAlbumId && (() => {
          const activeAlbum = albums.find(a => a._id === activeAlbumId);
          if (!activeAlbum) return null;
          return (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row justify-between items-center bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-950/10 flex-shrink-0">
                  <img 
                    src={activeAlbum.coverPhotoUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=100'} 
                    alt={activeAlbum.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <Typography className="font-display font-black text-amber-950 text-base leading-tight">
                    {activeAlbum.title}
                  </Typography>
                  <Typography className="text-amber-600 font-mono text-[9px] uppercase tracking-wider font-bold">
                    Filtering dashboard by this album
                  </Typography>
                </div>
              </div>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  onClick={handleDeleteAlbum}
                  className="border-red-500/30 hover:border-red-600 text-red-600 hover:bg-red-50 text-xs px-4 py-2 rounded-full font-bold uppercase"
                >
                  Delete Album
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setActiveAlbumId(null)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-5 py-2 rounded-full font-bold uppercase shadow-sm"
                >
                  Clear Filter
                </Button>
              </Stack>
            </motion.div>
          );
        })()}

        {/* 1. Hero space - The Daily Canvas */}
        <DailyCanvas photos={filteredPhotos} nostalgiaMode={nostalgiaMode} />

        {/* 2. Grid & Sidebar Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
          {/* Main Grid */}
          <div className="lg:col-span-8 space-y-8">
            <MemoryGrid 
              photos={filteredPhotos} 
              albums={albums}
              activeAlbumId={activeAlbumId}
              onSelectPhoto={setSelectedPhoto} 
              nostalgiaMode={nostalgiaMode} 
              onAddCaption={handleAddCaptionForId}
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

          {/* Album Assignment Section */}
          <Box className="space-y-2 pt-2 border-t border-amber-200/20">
            <Typography className="font-bold text-amber-900/40 uppercase tracking-widest text-[10px]">
              Album Assignment
            </Typography>
            <div className="flex gap-2 items-center">
              <select
                value={selectedPhoto.albumId || ''}
                onChange={(e) => handleUpdatePhotoAlbum(selectedPhoto._id, e.target.value || null)}
                className="bg-amber-500/5 border border-amber-900/10 rounded-xl p-2.5 text-xs text-amber-950 focus:outline-none focus:border-amber-600 flex-grow"
              >
                <option value="">No Album</option>
                {albums.map((alb) => (
                  <option key={alb._id} value={alb._id}>
                    {alb.title}
                  </option>
                ))}
              </select>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleSetAsCover(selectedPhoto.url)}
                disabled={!selectedPhoto.albumId}
                className="border-amber-600/30 text-amber-700 hover:bg-amber-500/5 text-[10px] py-2 rounded-xl font-bold uppercase"
              >
                Make Cover
              </Button>
            </div>
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
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="contained" 
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-2xl px-6 py-4 flex items-center gap-2 font-display font-black text-sm uppercase tracking-wider transition-all duration-300"
            title="Quick Toss a Photo"
          >
            {isUploading ? (
              <Sparkles className="animate-spin" size={18} />
            ) : (
              <>
                <Plus size={18} strokeWidth={3} />
                <span>Quick Toss</span>
              </>
            )}
          </Button>
        </motion.div>
      </Box>

    </Box>
  );
}
