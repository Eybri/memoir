'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack, 
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Camera, 
  ArrowLeft,
  Image as ImageIcon
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
import DailyCanvas from '../../dashboard/components/DailyCanvas';
import MemoryGrid from '../../dashboard/components/MemoryGrid';

// Import modular components
import AlbumHero from '../components/AlbumHero';
import SlideshowDialog from '../components/SlideshowDialog';
import PhotoDetailDialog from '../components/PhotoDetailDialog';

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [nostalgiaMode, setNostalgiaMode] = useState(false);
  
  // Album UI states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);

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
      router.push('/dashboard');
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ done: 0, total: files.length });

    // Upload all files concurrently, track individual completions
    await Promise.allSettled(
      files.map(async (file) => {
        try {
          const newPhoto = await uploadPhoto(file);
          await updatePhotoAlbum(newPhoto._id, albumId);
        } catch (error) {
          console.error(`Upload failed for ${file.name}:`, error);
        } finally {
          setUploadProgress((prev) =>
            prev ? { ...prev, done: prev.done + 1 } : null
          );
        }
      })
    );

    // Reset input so the same files can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = '';

    setIsUploading(false);
    setUploadProgress(null);
    loadPageData();
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
      const allPhotos = await fetchPhotos();
      setPhotos(allPhotos);
      
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

  const handleAddCaption = async (captionText: string) => {
    if (!selectedPhoto || !captionText.trim()) return;
    try {
      await addCaption(selectedPhoto._id, captionText);
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
        <AlbumHero
          album={album}
          albumPhotosCount={albumPhotos.length}
          coverUrl={coverUrl}
          nostalgiaMode={nostalgiaMode}
          isEditingTitle={isEditingTitle}
          editedTitle={editedTitle}
          setEditedTitle={setEditedTitle}
          setIsEditingTitle={setIsEditingTitle}
          handleRenameAlbum={handleRenameAlbum}
          handleDeleteAlbum={handleDeleteAlbum}
          startSlideshow={() => setIsSlideshowOpen(true)}
        />

        {/* Main Content Area */}
        <Box className="space-y-12">
          {albumPhotos.length > 0 ? (
            <>
              {/* Daily Canvas - Carousel Collage */}
              <DailyCanvas photos={albumPhotos} nostalgiaMode={nostalgiaMode} />

              {/* Album Photos Grid */}
              <Box className="scrapbook-page-canvas p-6 sm:p-12 space-y-6">
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
      <PhotoDetailDialog
        photo={selectedPhoto}
        open={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        albums={albums}
        nostalgiaMode={nostalgiaMode}
        onDeletePhoto={handleDeletePhoto}
        onAddCaption={handleAddCaption}
        onSetAsCover={handleSetAsCover}
        onUpdatePhotoAlbum={handleUpdatePhotoAlbum}
      />

      {/* Floating Multi-Upload Action Button */}
      <Box className="fixed bottom-10 right-10 flex flex-col items-end gap-3 z-30">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
          accept="image/*"
          multiple
        />

        {/* Progress pill — appears above button while uploading */}
        {uploadProgress && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-950/90 backdrop-blur-md text-amber-100 font-mono font-bold text-xs px-4 py-2 rounded-full shadow-xl flex items-center gap-2"
          >
            <CircularProgress size={12} sx={{ color: '#fbbf24' }} />
            <span>{uploadProgress.done} / {uploadProgress.total} uploaded</span>
          </motion.div>
        )}

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="contained"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-2xl px-6 py-4 flex items-center gap-2 font-display font-black text-sm uppercase tracking-wider transition-all duration-300"
            title="Add memories — select multiple photos at once"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <CircularProgress size={16} sx={{ color: '#fff' }} />
                <span>Uploading...</span>
              </span>
            ) : (
              <>
                <Plus size={18} strokeWidth={3} />
                <span>Add Memory</span>
              </>
            )}
          </Button>
        </motion.div>
      </Box>

      {/* Slideshow Dialog */}
      <SlideshowDialog
        open={isSlideshowOpen}
        onClose={() => setIsSlideshowOpen(false)}
        photos={albumPhotos}
        albumTitle={album.title}
      />

    </Box>
  );
}
