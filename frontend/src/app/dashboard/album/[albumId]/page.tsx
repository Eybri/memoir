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
  Dialog,
  CircularProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Camera, 
  Sparkles, 
  Trash2,
  Calendar,
  Image as ImageIcon,
  ArrowLeft,
  Play,
  Edit2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Pause
} from 'lucide-react';
import { 
  fetchPhotos, 
  addCaption, 
  searchPhotos, 
  uploadPhoto, 
  deletePhoto,
  fetchAlbums,
  fetchAlbumById,
  deleteAlbum,
  updateAlbum,
  updatePhotoAlbum
} from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import DailyCanvas from '../../components/DailyCanvas';
import MemoryGrid from '../../components/MemoryGrid';

interface Album {
  _id: string;
  title: string;
  coverPhotoUrl: string;
  createdAt?: string;
}

interface Photo {
  _id: string;
  url: string;
  captions: { text: string; authorId: string; createdAt: string }[];
  takenAt: string;
  albumId?: string;
}

export default function AlbumDetailsPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const albumId = params.albumId as string;

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [newCaption, setNewCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [nostalgiaMode, setNostalgiaMode] = useState(false);
  
  // Album-specific UI states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync Nostalgia Mode with localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('nostalgiaMode');
    if (savedMode === 'true') {
      setNostalgiaMode(true);
    }
  }, []);

  const handleToggleNostalgia = (mode: boolean) => {
    setNostalgiaMode(mode);
    localStorage.setItem('nostalgiaMode', String(mode));
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && albumId) {
      loadPageData();
    }
  }, [user, albumId]);

  const loadPageData = async () => {
    setIsPageLoading(true);
    try {
      const albumData = await fetchAlbumById(albumId);
      setAlbum(albumData);
      setEditedTitle(albumData.title);

      const allPhotos = await fetchPhotos();
      setPhotos(allPhotos);

      const allAlbums = await fetchAlbums();
      setAlbums(allAlbums);
    } catch (error) {
      console.error('Failed to load album data:', error);
      // Redirect to dashboard if album not found or unauthorized
      router.push('/dashboard');
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newPhoto = await uploadPhoto(file);
      await updatePhotoAlbum(newPhoto._id, albumId);
      loadPageData();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAlbum = async () => {
    if (!album) return;
    if (!confirm(`Are you sure you want to delete the album "${album.title}"? Your photos inside it will not be deleted.`)) return;
    try {
      await deleteAlbum(albumId);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to delete album:', error);
    }
  };

  const handleRenameAlbum = async () => {
    if (!editedTitle.trim() || !album) return;
    try {
      const updated = await updateAlbum(albumId, { title: editedTitle.trim() });
      setAlbum(updated);
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Failed to rename album:', error);
    }
  };

  const handleSetAsCover = async (photoUrl: string) => {
    if (!album) return;
    try {
      const updated = await updateAlbum(albumId, { coverPhotoUrl: photoUrl });
      setAlbum(updated);
      alert(`Cover photo updated!`);
    } catch (error) {
      console.error('Failed to update album cover:', error);
    }
  };

  const handleUpdatePhotoAlbum = async (photoId: string, targetAlbumId: string | null) => {
    try {
      await updatePhotoAlbum(photoId, targetAlbumId);
      // Reload page photos
      const allPhotos = await fetchPhotos();
      setPhotos(allPhotos);
      
      // Update selected photo in modal
      if (selectedPhoto && selectedPhoto._id === photoId) {
        setSelectedPhoto(prev => prev ? { ...prev, albumId: targetAlbumId || undefined } : null);
      }
    } catch (error) {
      console.error('Failed to update photo album:', error);
    }
  };

  const handleDeletePhoto = async () => {
    if (!selectedPhoto) return;
    if (!confirm('Are you sure you want to delete this memory forever?')) return;

    try {
      await deletePhoto(selectedPhoto._id);
      setSelectedPhoto(null);
      loadPageData();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleAddCaption = async () => {
    if (!selectedPhoto || !newCaption.trim()) return;
    try {
      await addCaption(selectedPhoto._id, newCaption);
      setNewCaption('');
      // Update selected photo in modal
      const updated = await fetchPhotos(); 
      const found = updated.find((p: any) => p._id === selectedPhoto._id);
      setSelectedPhoto(found);
      setPhotos(updated);
    } catch (error) {
      console.error('Failed to add caption:', error);
    }
  };

  const handleAddCaptionForId = async (photoId: string, text: string) => {
    try {
      await addCaption(photoId, text);
      const updated = await fetchPhotos();
      setPhotos(updated);
    } catch (error) {
      console.error('Failed to add caption:', error);
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

  // Filter photos to only those belonging to this album
  const albumPhotos = React.useMemo(() => {
    return photos.filter(p => p.albumId === albumId);
  }, [photos, albumId]);

  // Slideshow playback logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSlideshowOpen && isSlideshowPlaying && albumPhotos.length > 0) {
      interval = setInterval(() => {
        setSlideshowIndex((prevIndex) => (prevIndex + 1) % albumPhotos.length);
      }, 4000); // Change photo every 4 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSlideshowOpen, isSlideshowPlaying, albumPhotos]);

  const startSlideshow = () => {
    if (albumPhotos.length === 0) return;
    setSlideshowIndex(0);
    setIsSlideshowPlaying(true);
    setIsSlideshowOpen(true);
  };

  if (authLoading || isPageLoading || !user || !album) {
    return (
      <Box className="romantic-gradient min-h-screen flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Camera size={64} className="text-amber-500 animate-pulse" />
        </motion.div>
        <Typography className="font-mono text-amber-800/60 text-xs uppercase tracking-widest font-bold">
          Restoring Memories...
        </Typography>
      </Box>
    );
  }

  // Base background theme
  const bgThemeClass = nostalgiaMode 
    ? 'bg-[#f4efe2] text-[#3c2f1f] paper-grain' 
    : 'romantic-gradient text-amber-950';

  const coverUrl = album.coverPhotoUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800';

  return (
    <Box className={`min-h-screen transition-all duration-700 pb-24 ${bgThemeClass}`}>
      
      {/* Premium Header */}
      <Header 
        isDashboard={true}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        nostalgiaMode={nostalgiaMode}
        setNostalgiaMode={handleToggleNostalgia}
        logout={logout}
      />

      <Container maxWidth="xl" className="py-8 space-y-10">
        
        {/* Navigation & Action Bar */}
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }} className="w-full">
          <Button
            startIcon={<ArrowLeft size={16} />}
            onClick={() => router.push('/dashboard')}
            className="text-amber-800 hover:bg-amber-500/5 font-display font-black text-xs uppercase tracking-wider rounded-full px-5 py-2.5 border border-amber-900/10 backdrop-blur-sm"
          >
            Dashboard
          </Button>
        </Stack>

        {/* Cinematic Album Hero Cover */}
        <Box 
          className="relative w-full h-[320px] sm:h-[400px] rounded-[36px] overflow-hidden shadow-2xl border border-amber-900/10 flex items-end p-8 sm:p-12"
        >
          {/* Cover Photo */}
          <img 
            src={coverUrl} 
            alt={album.title} 
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ${
              nostalgiaMode ? 'sepia-[0.2] contrast-95 brightness-90' : 'brightness-95'
            }`}
          />
          {/* Cinematic Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

          {/* Album Info & Controls inside Cover */}
          <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-3 max-w-xl">
              <span className="bg-amber-500 text-amber-950 font-mono text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                Memory Album
              </span>
              
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="font-display font-black text-white text-3xl sm:text-5xl bg-white/10 border-b-2 border-amber-500 outline-none px-2 py-1 rounded-t-lg max-w-md"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameAlbum();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                  />
                  <IconButton onClick={handleRenameAlbum} className="bg-amber-500 text-amber-950 hover:bg-amber-600 p-2">
                    <Check size={20} />
                  </IconButton>
                  <IconButton onClick={() => setIsEditingTitle(false)} className="bg-white/10 text-white hover:bg-white/20 p-2">
                    <X size={20} />
                  </IconButton>
                </div>
              ) : (
                <div className="flex items-center gap-3 group">
                  <Typography variant="h2" className="font-display font-black text-white text-3xl sm:text-5xl leading-tight">
                    {album.title}
                  </Typography>
                  <IconButton 
                    onClick={() => {
                      setEditedTitle(album.title);
                      setIsEditingTitle(true);
                    }}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white/10 text-white hover:bg-white/20 p-1.5 sm:p-2 rounded-full flex-shrink-0"
                    title="Rename Album"
                  >
                    <Edit2 size={14} className="sm:w-4 sm:h-4" />
                  </IconButton>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/70 text-xs font-mono font-bold">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-amber-400" />
                  <span>Created {album.createdAt ? new Date(album.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}</span>
                </div>
                <span>•</span>
                <span>{albumPhotos.length} Captured Moment{albumPhotos.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} className="flex-shrink-0">
              {albumPhotos.length > 0 && (
                <Button
                  variant="contained"
                  onClick={startSlideshow}
                  startIcon={<Play size={16} strokeWidth={3} />}
                  className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-display font-black text-xs uppercase tracking-wider rounded-full px-6 py-3 shadow-lg shadow-amber-500/20"
                >
                  Slideshow
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={handleDeleteAlbum}
                startIcon={<Trash2 size={16} />}
                className="border-red-500/40 hover:border-red-600 text-red-400 hover:bg-red-950/20 font-display font-bold text-xs uppercase tracking-wider rounded-full px-6 py-3 backdrop-blur-sm"
              >
                Delete Album
              </Button>
            </Stack>
          </div>
        </Box>

        {/* Main Content Area */}
        <Box className="space-y-12">
          {albumPhotos.length > 0 ? (
            <>
              {/* Daily Canvas - Carousel Collage */}
              <DailyCanvas photos={albumPhotos} nostalgiaMode={nostalgiaMode} />

              {/* Album Photos Grid */}
              <Box className="space-y-6">
                <Box className="border-b border-amber-200/30 pb-4">
                  <Typography variant="h4" className="font-display font-black text-amber-950">
                    Album Ledger
                  </Typography>
                  <Typography className="text-amber-900/50 text-sm mt-1">
                    Your beautiful stories, organized inside this private space.
                  </Typography>
                </Box>
                
                <MemoryGrid 
                  photos={albumPhotos} 
                  albums={albums}
                  activeAlbumId={albumId}
                  onSelectPhoto={setSelectedPhoto} 
                  nostalgiaMode={nostalgiaMode} 
                  onAddCaption={handleAddCaptionForId}
                  disableStacking={true}
                />
              </Box>
            </>
          ) : (
            <Box className="w-full flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-amber-900/10 rounded-[36px] bg-amber-500/5 p-8">
              <ImageIcon size={72} strokeWidth={1} className="text-amber-600/30 mb-4 animate-bounce" />
              <Typography variant="h5" className="font-display font-black text-amber-950">
                This album is currently empty
              </Typography>
              <Typography className="text-amber-900/60 max-w-sm mt-2 text-sm leading-relaxed">
                Toss photos inside this scrapbook or upload memories using the button below to start your collection.
              </Typography>
              <Button
                variant="contained"
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 bg-amber-600 hover:bg-amber-700 text-white rounded-full px-6 py-2.5 font-bold text-sm uppercase tracking-wider shadow"
              >
                Add first memory
              </Button>
            </Box>
          )}
        </Box>
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
      <Box className="fixed bottom-10 right-10 flex flex-col gap-4 z-30">
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
              <CircularProgress size={18} className="text-white" />
            ) : (
              <>
                <Plus size={18} strokeWidth={3} />
                <span>Add Memory</span>
              </>
            )}
          </Button>
        </motion.div>
      </Box>

      {/* Beautiful Full-Screen Slideshow Dialog */}
      <Dialog
        fullScreen
        open={isSlideshowOpen}
        onClose={() => setIsSlideshowOpen(false)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: '#0a0500',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }
          }
        }}
      >
        {/* Slideshow Top Controls */}
        <Box className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-40">
          <div>
            <Typography variant="h6" className="font-display font-black text-white leading-none">
              {album.title}
            </Typography>
            <Typography className="text-amber-400 font-mono text-[10px] uppercase tracking-wider mt-1 font-bold">
              Memory Reels Playback
            </Typography>
          </div>
          <IconButton 
            onClick={() => setIsSlideshowOpen(false)} 
            className="text-white hover:bg-white/10 p-2.5 rounded-full"
          >
            <X size={24} />
          </IconButton>
        </Box>

        {/* Slideshow Content */}
        {albumPhotos.length > 0 && (
          <Box className="relative w-full h-full flex flex-col justify-center items-center px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={slideshowIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 1 }}
                className="relative max-w-4xl max-h-[70vh] flex justify-center items-center rounded-2xl overflow-hidden shadow-2xl border border-white/5"
              >
                <img 
                  src={albumPhotos[slideshowIndex].url} 
                  alt="Slideshow Frame" 
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </motion.div>
            </AnimatePresence>

            {/* Slideshow Description and Index Stamp */}
            <Box className="absolute bottom-24 text-center max-w-xl space-y-2 z-40 bg-black/60 backdrop-blur-md p-5 rounded-2xl border border-white/10">
              <Typography className="text-white text-base italic font-medium leading-relaxed">
                {albumPhotos[slideshowIndex].captions[0]?.text 
                  ? `"${albumPhotos[slideshowIndex].captions[0].text}"`
                  : 'Untitled Memory'}
              </Typography>
              <Typography className="text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                {new Date(albumPhotos[slideshowIndex].takenAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Bottom Playback Navigation Panel */}
        <Box className="absolute bottom-0 left-0 right-0 p-6 flex justify-center items-center gap-6 bg-gradient-to-t from-black/80 to-transparent z-40">
          <IconButton 
            onClick={() => setSlideshowIndex((prev) => (prev - 1 + albumPhotos.length) % albumPhotos.length)} 
            className="text-white/80 hover:text-white hover:bg-white/10 p-3 rounded-full"
          >
            <ChevronLeft size={24} />
          </IconButton>

          <IconButton 
            onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)} 
            className="bg-amber-500 text-amber-950 hover:bg-amber-600 p-4 rounded-full shadow-lg"
          >
            {isSlideshowPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </IconButton>

          <IconButton 
            onClick={() => setSlideshowIndex((prev) => (prev + 1) % albumPhotos.length)} 
            className="text-white/80 hover:text-white hover:bg-white/10 p-3 rounded-full"
          >
            <ChevronRight size={24} />
          </IconButton>

          <span className="absolute right-8 text-white/50 font-mono text-xs font-bold uppercase">
            {slideshowIndex + 1} / {albumPhotos.length}
          </span>
        </Box>
      </Dialog>

    </Box>
  );
}
