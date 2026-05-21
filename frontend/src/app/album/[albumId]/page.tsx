'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Plus,
  Camera,
  ArrowLeft,
  LayoutGrid,
  LayoutTemplate
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
import AlbumFilmStrip from '../components/AlbumFilmStrip';
import MemoryGrid from '../../dashboard/components/MemoryGrid';

// Import modular components
import AlbumHero from '../components/AlbumHero';
import SlideshowDialog from '../components/SlideshowDialog';
import PhotoDetailDialog from '../components/PhotoDetailDialog';
import AlbumGallery from '../components/AlbumGallery';
import FloatingUploadButton from '../components/FloatingUploadButton';
import EmptyAlbumState from '../components/EmptyAlbumState';
import ConfirmDialog from '@/components/ConfirmDialog';

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
  const [viewMode, setViewMode] = useState<'scrapbook' | 'gallery'>('scrapbook');
  const [galleryZoom, setGalleryZoom] = useState(3);
  const [confirmDeletePhoto, setConfirmDeletePhoto] = useState(false);
  const [confirmDeleteAlbum, setConfirmDeleteAlbum] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'|'info'}>({open: false, message: '', severity: 'info'});

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
      if (albumId === 'unassigned') {
        setAlbum({
          _id: 'unassigned',
          title: 'Public Images',
          coverPhotoUrl: '',
        });
        setEditedTitle('Public Images');
      } else {
        const albumData = await fetchAlbumById(albumId);
        setAlbum(albumData);
        setEditedTitle(albumData.title);
      }

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
    try {
      await deleteAlbum(albumId);
      setConfirmDeleteAlbum(false);
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
      setSnackbar({ open: true, message: 'Cover photo updated!', severity: 'success' });
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

    try {
      await deletePhoto(selectedPhoto._id);
      setSelectedPhoto(null);
      setConfirmDeletePhoto(false);
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

  const handleAddCaptionForId = React.useCallback(async (photoId: string, text: string) => {
    try {
      await addCaption(photoId, text);
      const updated = await fetchPhotos();
      setPhotos(updated);
    } catch (error) {
      console.error('Failed to add caption:', error);
    }
  }, []);

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
    if (albumId === 'unassigned') {
      return photos.filter(p => !p.albumId);
    }
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

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button
              startIcon={viewMode === 'scrapbook' ? <LayoutGrid size={16} /> : <LayoutTemplate size={16} />}
              onClick={() => setViewMode(v => v === 'scrapbook' ? 'gallery' : 'scrapbook')}
              className="text-amber-800 hover:bg-amber-500/5 font-display font-black text-xs uppercase tracking-wider rounded-full px-5 py-2.5 border border-amber-900/10 backdrop-blur-sm transition-all"
            >
              {viewMode === 'scrapbook' ? 'Gallery' : 'Scrapbook'}
            </Button>
          </Stack>
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
          handleDeleteAlbum={() => setConfirmDeleteAlbum(true)}
          startSlideshow={() => setIsSlideshowOpen(true)}
          currentUser={user}
        />

        {/* Main Content Area */}
        <Box className="space-y-12">
          {albumPhotos.length > 0 ? (
            <>
              {viewMode === 'scrapbook' && (
                <AlbumFilmStrip photos={albumPhotos} nostalgiaMode={nostalgiaMode} />
              )}

              {viewMode === 'scrapbook' ? (
                <Box className="scrapbook-page-canvas p-2 sm:p-6 md:p-12 space-y-6 overflow-hidden">


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
              ) : (
                <AlbumGallery 
                  photos={albumPhotos} 
                  onSelectPhoto={setSelectedPhoto} 
                />
              )}
            </>
          ) : (
            <EmptyAlbumState onAddMemoryClick={() => fileInputRef.current?.click()} />
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
        onDeletePhoto={() => setConfirmDeletePhoto(true)}
        onAddCaption={handleAddCaption}
        onSetAsCover={handleSetAsCover}
        onUpdatePhotoAlbum={handleUpdatePhotoAlbum}
      />

      <ConfirmDialog
        open={confirmDeletePhoto}
        title="Delete Memory"
        message="Are you sure you want to delete this memory forever?"
        confirmText="Delete"
        onConfirm={handleDeletePhoto}
        onCancel={() => setConfirmDeletePhoto(false)}
      />

      <ConfirmDialog
        open={confirmDeleteAlbum}
        title="Delete Collection"
        message={`Are you sure you want to delete "${album.title}"? Photos inside it will not be deleted, they will just be unassigned.`}
        confirmText="Delete Album"
        onConfirm={handleDeleteAlbum}
        onCancel={() => setConfirmDeleteAlbum(false)}
      />

      <FloatingUploadButton
        fileInputRef={fileInputRef}
        onUpload={handleUpload}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />

      {/* Slideshow Dialog */}
      <SlideshowDialog
        open={isSlideshowOpen}
        onClose={() => setIsSlideshowOpen(false)}
        photos={albumPhotos}
        albumTitle={album.title}
      />

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

    </Box>
  );
}
