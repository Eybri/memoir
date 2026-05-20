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
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsCreateOpen(true)}
          className="flex-shrink-0 cursor-pointer"
        >
          <Box className={`w-28 h-36 bg-white rounded-2xl shadow-md border-2 border-dashed flex flex-col justify-between p-3 transition-colors ${
            nostalgiaMode 
              ? 'border-amber-900/25 bg-[#faf6eb] hover:bg-amber-900/5' 
              : 'border-amber-600/20 bg-amber-500/5 hover:bg-amber-500/10'
          }`}>
            <div className="flex-grow flex items-center justify-center">
              <div className={`p-3 rounded-full ${nostalgiaMode ? 'bg-[#3c2f1f]/5 text-amber-800' : 'bg-amber-500/10 text-amber-700'}`}>
                <Plus size={20} strokeWidth={3} />
              </div>
            </div>
            
            <div className="text-center pt-2 border-t border-dashed border-amber-900/10">
              <Typography className="text-[10px] font-display font-black tracking-tight leading-tight text-amber-950">
                + Create
              </Typography>
              <Typography className="text-[8px] font-mono tracking-wider text-amber-600 font-bold uppercase">
                Album
              </Typography>
            </div>
          </Box>
        </motion.div>

        {/* Albums List */}
        {albums.map((album, idx) => {
          const count = getAlbumPhotoCount(album._id);
          const cover = getAlbumCover(album);
          const isActive = activeAlbumId === album._id;

          return (
            <motion.div 
              key={album._id}
              whileHover={{ scale: 1.03, y: -4, rotate: (idx % 2 === 0 ? 1.5 : -1.5) }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectAlbum(isActive ? null : album._id)}
              className="flex-shrink-0 cursor-pointer"
            >
              <Box className={`w-28 h-36 bg-white rounded-2xl shadow-md p-2 pb-3.5 flex flex-col justify-between relative overflow-hidden group border transition-all duration-300 ${
                isActive 
                  ? 'border-amber-500 ring-2 ring-amber-500/30' 
                  : 'border-amber-100 hover:border-amber-300'
              }`}>
                {/* Thumbnail window */}
                <div className="w-full h-24 rounded-lg overflow-hidden relative bg-amber-50">
                  <img 
                    src={cover} 
                    alt={album.title}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                      nostalgiaMode ? 'sepia-[0.15] contrast-95' : ''
                    }`}
                  />
                  
                  {/* Vintage overlay glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                  
                  {/* Count indicator */}
                  <span className="absolute bottom-1.5 right-1.5 bg-amber-950/80 backdrop-blur-sm text-yellow-50 text-[7px] font-black tracking-widest px-1.5 py-0.5 rounded-full uppercase">
                    {count} Log{count !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Polaroid-style signature text label */}
                <div className="text-center pt-1.5 flex flex-col items-center justify-center">
                  <Typography className={`font-display font-black italic text-[11px] leading-none truncate w-full px-1 ${
                    nostalgiaMode ? 'text-[#3c2f1f]' : 'text-amber-950'
                  }`}>
                    {album.title}
                  </Typography>
                  <Typography className="text-[7px] font-mono font-bold tracking-[0.1em] text-amber-500 uppercase mt-0.5">
                    Collection
                  </Typography>
                </div>

                {/* Active check-line */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
                )}
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
                      className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all relative ${
                        isSelected ? 'border-amber-500 scale-95 shadow' : 'border-transparent hover:border-amber-200'
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
