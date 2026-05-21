'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import { motion } from 'framer-motion';
import { Plus, Folder, Sparkles } from 'lucide-react';

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

interface ReelBoardProps {
  albums: Album[];
  photos: Photo[];
  activeAlbumId: string | null;
  onSelectAlbum: (albumId: string | null) => void;
  onCreateAlbum: (title: string, coverPhotoUrl?: string) => Promise<void>;
  nostalgiaMode: boolean;
}

export default function ReelBoard({
  albums,
  photos,
  activeAlbumId,
  onSelectAlbum,
  onCreateAlbum,
  nostalgiaMode
}: ReelBoardProps) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [selectedCoverUrl, setSelectedCoverUrl] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const getAlbumPhotoCount = (albumId: string) => {
    return photos.filter(p => p.albumId === albumId).length;
  };

  const getAlbumCover = (album: Album) => {
    if (album.coverPhotoUrl) return album.coverPhotoUrl;

    // Fallback to the first photo in this album
    const albumPhotos = photos.filter(p => p.albumId === album._id);
    if (albumPhotos.length > 0) return albumPhotos[0].url;

    // Default premium warm fallback cover
    return 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=250';
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateAlbum(newTitle.trim(), selectedCoverUrl || undefined);
      setNewTitle('');
      setSelectedCoverUrl('');
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Failed to create album:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="w-full space-y-3 select-none">
      {/* Title label */}
      <Box className="flex justify-between items-center px-1">
        <Typography className="font-display font-extrabold text-[11px] tracking-[0.15em] text-amber-600/70 uppercase flex items-center gap-1.5">
          <Folder size={12} className="text-amber-500" /> Section 1: The Album Board
        </Typography>
        <Typography className="font-mono text-[9px] text-amber-900/30 uppercase">
          Memory Collections
        </Typography>
      </Box>

      {/* Horizontal Scrollable Reel */}
      <div className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1 scrollbar-hide mask-image-horizontal">

        {/* First Bubble: Create Album */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsCreateOpen(true)}
          className="flex-shrink-0 cursor-pointer pl-1 pt-2 pb-2"
        >
          <Box className={`w-40 h-[216px] rounded-md shadow-sm border-2 border-dashed flex flex-col p-3 transition-all duration-500 group relative overflow-hidden backdrop-blur-sm ${nostalgiaMode
              ? 'border-amber-900/25 bg-[#faf6eb]/80 hover:bg-amber-900/10 hover:border-amber-900/40'
              : 'border-amber-400/40 bg-gradient-to-br from-amber-50/50 to-amber-100/30 hover:border-amber-500/60 hover:shadow-xl hover:shadow-amber-500/20'
            }`}>
            <div className="absolute inset-0 bg-white/40 group-hover:bg-transparent transition-colors duration-500" />
            <div className="flex-grow flex items-center justify-center relative z-10 aspect-square border border-dashed border-amber-900/10 rounded-sm">
              <div className={`p-4 rounded-full shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-90 ${nostalgiaMode ? 'bg-[#3c2f1f]/5 text-amber-800' : 'bg-white text-amber-600'
                }`}>
                <Plus size={28} strokeWidth={2.5} />
              </div>
            </div>

            <div className="text-center mt-2 relative z-10 flex-shrink-0 h-12 flex flex-col justify-center">
              <Typography className="text-[14px] font-display font-black tracking-tight leading-tight text-amber-950">
                + Create
              </Typography>
              <Typography className="text-[9px] font-mono tracking-[0.2em] text-amber-600/80 font-bold uppercase mt-1">
                Collection
              </Typography>
            </div>
          </Box>
        </motion.div>

        {/* Public Images Virtual Album */}
        {(() => {
          const unassignedPhotos = photos.filter(p => !p.albumId);
          const count = unassignedPhotos.length;
          const cover = unassignedPhotos.length > 0 ? unassignedPhotos[0].url : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=250';
          const isActive = activeAlbumId === 'unassigned';

          return (
            <motion.div
              key="unassigned"
              whileHover={{ scale: 1.04, y: -6 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelectAlbum(isActive ? null : 'unassigned')}
              className={`flex-shrink-0 cursor-pointer relative transition-transform duration-500 group pt-2 pb-2 -rotate-1 mt-1 group-hover:rotate-1`}
            >
              <div className={`absolute inset-0 bg-[#fdfcf8] rounded-md shadow-sm border border-black/5 transform origin-bottom-right transition-all duration-500 ease-out group-hover:rotate-6 group-hover:translate-x-3 group-hover:-translate-y-1 ${isActive ? 'rotate-3 translate-x-1' : 'rotate-2 translate-x-0.5'}`} />
              <div className={`absolute inset-0 bg-[#fdfcf8] rounded-md shadow-sm border border-black/5 transform origin-bottom-left transition-all duration-500 ease-out group-hover:-rotate-6 group-hover:-translate-x-3 group-hover:-translate-y-1 ${isActive ? '-rotate-3 -translate-x-1' : '-rotate-1 -translate-x-0.5'}`} />

              <Box className={`relative z-10 w-40 h-[216px] bg-[#fdfcf8] rounded-md p-3 flex flex-col transition-all duration-500 ${isActive
                  ? 'border border-rose-400 shadow-[0_8px_30px_rgb(244,63,94,0.3)] ring-2 ring-rose-400/30 scale-105'
                  : 'border border-rose-900/20 shadow-md hover:border-rose-400 hover:shadow-xl'
                }`}>
                
                {!isActive && (
                  <div className="absolute h-5 bg-white/60 backdrop-blur-md border border-rose-900/10 shadow-sm z-30 transition-opacity duration-300 group-hover:opacity-0 top-[-6px] left-1/2 -translate-x-1/2 -rotate-2 w-14" style={{ clipPath: 'polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)' }} />
                )}

                <div className="relative w-full aspect-square flex-shrink-0 rounded-sm overflow-hidden bg-rose-50 shadow-inner border border-black/10">
                  <img
                    src={cover}
                    alt="Public Images"
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${nostalgiaMode ? 'sepia-[0.15] contrast-95' : ''}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-white/10" />
                  <span className={`absolute bottom-2 right-2 backdrop-blur-md border border-white/20 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase shadow-lg transition-colors ${isActive ? 'bg-rose-600/90' : 'bg-black/50'}`}>
                    {count} Log{count !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="text-center mt-3 flex flex-col items-center justify-center flex-grow overflow-hidden">
                  <Typography className={`font-display font-black italic text-[15px] leading-tight line-clamp-2 px-1 ${nostalgiaMode ? 'text-[#3c2f1f]' : 'text-rose-950'}`}>
                    Public Images
                  </Typography>
                </div>
              </Box>
            </motion.div>
          );
        })()}

        {/* Albums List */}
        {albums.map((album, idx) => {
          const count = getAlbumPhotoCount(album._id);
          const cover = getAlbumCover(album);
          const isActive = activeAlbumId === album._id;

          // Creative diff styles for a natural scrapbook feel
          const tilts = ['-rotate-2 mt-1', 'rotate-1 mt-2', '-rotate-1 mt-0', 'rotate-2 mt-1'];
          const hoverTilts = ['rotate-1', '-rotate-2', 'rotate-2', '-rotate-1'];
          const tapeStyles = [
            'top-[-6px] left-1/2 -translate-x-1/2 -rotate-2 w-14',
            'top-[-8px] right-3 rotate-3 w-12',
            'top-[-8px] left-3 -rotate-3 w-12',
            'top-[-6px] left-1/2 -translate-x-1/2 rotate-2 w-16'
          ];

          const tiltClass = isActive ? '' : tilts[idx % tilts.length];
          const hoverTiltClass = isActive ? '' : hoverTilts[idx % hoverTilts.length];
          const tape = tapeStyles[idx % tapeStyles.length];

          return (
            <motion.div
              key={album._id}
              whileHover={{ scale: 1.04, y: -6 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelectAlbum(isActive ? null : album._id)}
              className={`flex-shrink-0 cursor-pointer relative transition-transform duration-500 group pt-2 pb-2 ${tiltClass} group-hover:${hoverTiltClass}`}
            >
              {/* Stack effect polaroids behind the main card */}
              <div className={`absolute inset-0 bg-[#fdfcf8] rounded-md shadow-sm border border-black/5 transform origin-bottom-right transition-all duration-500 ease-out group-hover:rotate-6 group-hover:translate-x-3 group-hover:-translate-y-1 ${isActive ? 'rotate-3 translate-x-1' : 'rotate-2 translate-x-0.5'}`} />
              <div className={`absolute inset-0 bg-[#fdfcf8] rounded-md shadow-sm border border-black/5 transform origin-bottom-left transition-all duration-500 ease-out group-hover:-rotate-6 group-hover:-translate-x-3 group-hover:-translate-y-1 ${isActive ? '-rotate-3 -translate-x-1' : '-rotate-1 -translate-x-0.5'}`} />

              {/* Main Polaroid */}
              <Box className={`relative z-10 w-40 h-[216px] bg-[#fdfcf8] rounded-md p-3 flex flex-col transition-all duration-500 ${isActive
                  ? 'border border-amber-400 shadow-[0_8px_30px_rgb(217,119,6,0.3)] ring-2 ring-amber-400/30 scale-105'
                  : 'border border-amber-900/10 shadow-md hover:border-amber-300 hover:shadow-xl'
                }`}>
                {/* Washi Tape */}
                {!isActive && (
                  <div className={`absolute h-5 bg-white/60 backdrop-blur-md border border-amber-900/10 shadow-sm z-30 transition-opacity duration-300 group-hover:opacity-0 ${tape}`} style={{ clipPath: 'polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)' }} />
                )}

                {/* Photo window */}
                <div className="relative w-full aspect-square flex-shrink-0 rounded-sm overflow-hidden bg-amber-50 shadow-inner border border-black/10">
                  <img
                    src={cover}
                    alt={album.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${nostalgiaMode ? 'sepia-[0.15] contrast-95' : ''
                      }`}
                  />

                  {/* Premium vignette / gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-white/10" />

                  {/* Count indicator */}
                  <span className={`absolute bottom-2 right-2 backdrop-blur-md border border-white/20 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase shadow-lg transition-colors ${isActive ? 'bg-amber-600/90' : 'bg-black/50'
                    }`}>
                    {count} Log{count !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Polaroid-style signature text label */}
                <div className="text-center mt-3 flex flex-col items-center justify-center flex-grow overflow-hidden">
                  <Typography className={`font-display font-black italic text-[15px] leading-tight line-clamp-2 px-1 ${nostalgiaMode ? 'text-[#3c2f1f]' : 'text-amber-950'
                    }`}>
                    {album.title}
                  </Typography>
                </div>
              </Box>
            </motion.div>
          );
        })}
      </div>

      {/* Create Album Dialog */}
      <Dialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              p: 2,
              backgroundColor: nostalgiaMode ? '#f4efe2' : '#ffffff',
              color: nostalgiaMode ? '#3c2f1f' : '#000000',
            }
          }
        }}
      >
        <DialogTitle className="font-display font-black text-amber-950 text-xl pb-1">
          Create New Album
        </DialogTitle>

        <DialogContent className="space-y-4 pt-2">
          <TextField
            autoFocus
            margin="dense"
            label="Album Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. Summer Memories"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': { borderColor: 'rgba(217, 119, 6, 0.2)' },
                '&.Mui-focused fieldset': { borderColor: '#d97706' },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#d97706' }
            }}
          />

          <Box className="space-y-2">
            <Typography variant="caption" className="font-bold text-amber-900/60 uppercase tracking-widest text-[9px]">
              Choose Cover Photo (Optional)
            </Typography>
            {photos.length === 0 ? (
              <Typography className="text-xs text-amber-900/40 italic">
                Upload photos to choose a cover.
              </Typography>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-[140px] overflow-y-auto p-1 border border-amber-950/10 rounded-xl bg-amber-500/5">
                {photos.map((photo) => {
                  const isSelected = selectedCoverUrl === photo.url;
                  return (
                    <div
                      key={photo._id}
                      onClick={() => setSelectedCoverUrl(isSelected ? '' : photo.url)}
                      className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all relative ${isSelected ? 'border-amber-500 scale-95 shadow' : 'border-transparent hover:border-amber-200'
                        }`}
                    >
                      <img src={photo.url} alt="Cover option" className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                          <Sparkles size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Box>
        </DialogContent>

        <DialogActions className="px-6 pb-2">
          <Button
            onClick={() => setIsCreateOpen(false)}
            disabled={isSubmitting}
            className="text-amber-700 font-bold hover:bg-amber-500/5 rounded-full px-4"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isSubmitting || !newTitle.trim()}
            variant="contained"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-full px-5 shadow-md"
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
