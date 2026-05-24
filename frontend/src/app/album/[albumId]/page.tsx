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
  Alert,
  IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Camera,
  ArrowLeft,
  LayoutGrid,
  LayoutTemplate,
  X
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
  updatePhotoAlbum,
  bulkDeletePhotos
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
import InviteCollaboratorDialog from '../components/InviteCollaboratorDialog';

interface Album {
  _id: string;
  title: string;
  coverPhotoUrl: string;
  createdAt?: string;
  userId?: any;
  sharedWith?: any[];
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
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'scrapbook' | 'gallery'>('scrapbook');
  const [confirmDeletePhoto, setConfirmDeletePhoto] = useState(false);
  const [confirmDeleteAlbum, setConfirmDeleteAlbum] = useState(false);
  const [collaboratorToRemove, setCollaboratorToRemove] = useState<{ id: string, name: string } | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'|'info'}>({open: false, message: '', severity: 'info'});

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

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

    await Promise.allSettled(
      files.map(async (file) => {
        try {
          const newPhoto = await uploadPhoto(file);
          const targetAlbumId = albumId === 'unassigned' ? null : albumId;
          await updatePhotoAlbum(newPhoto._id, targetAlbumId);
        } catch (error) {
          console.error(`Upload failed for ${file.name}:`, error);
        } finally {
          setUploadProgress((prev) =>
            prev ? { ...prev, done: prev.done + 1 } : null
          );
        }
      })
    );

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
      await updateAlbum(albumId, { title: editedTitle.trim() });
      setAlbum(prev => prev ? { ...prev, title: editedTitle.trim() } : prev);
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Failed to rename album:', error);
    }
  };

  const handleInviteCollaborators = async (selectedUserIds: string[]) => {
    if (!album) return;
    try {
      const currentShared = album.sharedWith?.map((sw: any) => sw._id) || [];
      const newSharedWith = [...new Set([...currentShared, ...selectedUserIds])];
      await updateAlbum(albumId, { sharedWith: newSharedWith });
      
      const fetchedAlbum = await fetchAlbumById(albumId);
      setAlbum(fetchedAlbum);
      setIsInviteDialogOpen(false);
      setSnackbar({ open: true, message: `Successfully invited ${selectedUserIds.length} friend(s)!`, severity: 'success' });
    } catch (error) {
      console.error('Failed to invite collaborators:', error);
      setSnackbar({ open: true, message: 'Failed to invite friends', severity: 'error' });
    }
  };

  const handleRemoveCollaborator = async () => {
    if (!album || !collaboratorToRemove) return;
    try {
      const currentShared = album.sharedWith?.map((sw: any) => sw._id) || [];
      const newSharedWith = currentShared.filter((id: string) => id !== collaboratorToRemove.id);
      await updateAlbum(albumId, { sharedWith: newSharedWith });
      
      const fetchedAlbum = await fetchAlbumById(albumId);
      setAlbum(fetchedAlbum);
      setSnackbar({ open: true, message: `${collaboratorToRemove.name} was removed from the album.`, severity: 'info' });
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
      setSnackbar({ open: true, message: 'Failed to remove friend', severity: 'error' });
    } finally {
      setCollaboratorToRemove(null);
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

  const handleToggleSelection = (photoId: string) => {
    setSelectedPhotoIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) newSet.delete(photoId);
      else newSet.add(photoId);
      return newSet;
    });
  };

  const handleLongPress = (photoId: string) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedPhotoIds(new Set([photoId]));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeletePhotos(Array.from(selectedPhotoIds));
      setSnackbar({ open: true, message: `${selectedPhotoIds.size} memories deleted!`, severity: 'success' });
      setSelectedPhotoIds(new Set());
      setIsSelectionMode(false);
      loadPageData();
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, message: 'Failed to delete photos', severity: 'error' });
    }
    setConfirmBulkDelete(false);
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
        <Typography className="font-mono text-amber-800/60 text-[10px] sm:text-xs md:text-sm uppercase tracking-widest font-bold">
          Restoring Memories...
        </Typography>
      </Box>
    );
  }

  const bgThemeClass = nostalgiaMode
    ? 'bg-[#f4efe2] text-[#3c2f1f] paper-grain'
    : 'romantic-gradient text-amber-950';

  const coverUrl = album.coverPhotoUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800';

  return (
    <Box className={`min-h-screen transition-all duration-700 pb-24 ${bgThemeClass}`}>

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

        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }} className="w-full">
          <Button
            startIcon={<ArrowLeft size={16} />}
            onClick={() => router.push('/dashboard')}
            className="text-amber-800 hover:bg-amber-500/5 font-display font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wider rounded-full px-5 py-2.5 border border-amber-900/10 backdrop-blur-sm"
          >
            Dashboard
          </Button>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button
              startIcon={viewMode === 'scrapbook' ? <LayoutGrid size={16} /> : <LayoutTemplate size={16} />}
              onClick={() => setViewMode(v => v === 'scrapbook' ? 'gallery' : 'scrapbook')}
              className="text-amber-800 hover:bg-amber-500/5 font-display font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wider rounded-full px-5 py-2.5 border border-amber-900/10 backdrop-blur-sm transition-all"
            >
              {viewMode === 'scrapbook' ? 'Gallery' : 'Scrapbook'}
            </Button>
          </Stack>
        </Stack>

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
          onInviteClick={() => setIsInviteDialogOpen(true)}
          onRemoveCollaborator={(id, name) => setCollaboratorToRemove({ id, name })}
          currentUser={user}
        />

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
                    isSelectionMode={isSelectionMode}
                    selectedPhotoIds={selectedPhotoIds}
                    onToggleSelection={handleToggleSelection}
                    onLongPress={handleLongPress}
                  />
                </Box>
              ) : (
                <AlbumGallery 
                  photos={albumPhotos} 
                  onSelectPhoto={setSelectedPhoto} 
                  isSelectionMode={isSelectionMode}
                  selectedPhotoIds={selectedPhotoIds}
                  onToggleSelection={handleToggleSelection}
                  onLongPress={handleLongPress}
                />
              )}
            </>
          ) : (
            <EmptyAlbumState onAddMemoryClick={() => fileInputRef.current?.click()} />
          )}
        </Box>
      </Container>

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

      <ConfirmDialog
        open={!!collaboratorToRemove}
        title="Remove Friend"
        message={`Are you sure you want to remove ${collaboratorToRemove?.name} from this album? They will no longer be able to view it.`}
        confirmText="Remove"
        onConfirm={handleRemoveCollaborator}
        onCancel={() => setCollaboratorToRemove(null)}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Delete ${selectedPhotoIds.size} ${selectedPhotoIds.size === 1 ? 'Memory' : 'Memories'}`}
        message={`Are you sure you want to permanently delete ${selectedPhotoIds.size === 1 ? 'this memory' : 'these memories'}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
        isDestructive={true}
      />

      {/* Bulk Selection Floating Action Bar */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-amber-950/90 backdrop-blur-xl px-6 py-4 rounded-full shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] border border-amber-500/20"
          >
            <Typography className="text-amber-50 font-display font-bold whitespace-nowrap min-w-[100px] text-center">
              {selectedPhotoIds.size} Selected
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSelectedPhotoIds(new Set(albumPhotos.map(p => p._id)))}
              className="border-amber-500/50 text-amber-200 hover:bg-amber-500/20 rounded-full font-bold uppercase tracking-wider text-[10px] sm:text-xs"
            >
              Select All
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => setConfirmBulkDelete(true)}
              disabled={selectedPhotoIds.size === 0}
              className="bg-red-500 hover:bg-red-600 disabled:bg-red-900/50 text-white rounded-full font-bold uppercase tracking-wider text-[10px] sm:text-xs shadow-none"
            >
              Delete
            </Button>
            <IconButton
              size="small"
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedPhotoIds(new Set());
              }}
              className="bg-white/10 text-white hover:bg-white/20 ml-2"
            >
              <X size={16} />
            </IconButton>
          </motion.div>
        )}
      </AnimatePresence>

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

      <InviteCollaboratorDialog
        open={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        onInvite={handleInviteCollaborators}
        currentCollaborators={album.sharedWith?.map((sw: any) => sw._id) || []}
        nostalgiaMode={nostalgiaMode}
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
