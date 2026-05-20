import React, { useState, useEffect } from 'react';
import { Dialog, Box, Stack, IconButton, Typography, Button, TextField } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trash2 } from 'lucide-react';

interface Photo {
  _id: string;
  url: string;
  captions: { text: string; authorId: string; createdAt: string }[];
  takenAt: string;
  albumId?: string;
}

interface Album {
  _id: string;
  title: string;
  coverPhotoUrl: string;
}

interface PhotoDetailDialogProps {
  photo: Photo | null;
  open: boolean;
  onClose: () => void;
  albums: Album[];
  nostalgiaMode: boolean;
  onDeletePhoto: () => void;
  onAddCaption: (captionText: string) => void;
  onSetAsCover: (photoUrl: string) => void;
  onUpdatePhotoAlbum: (photoId: string, targetAlbumId: string | null) => void;
}

export default function PhotoDetailDialog({
  photo,
  open,
  onClose,
  albums,
  nostalgiaMode,
  onDeletePhoto,
  onAddCaption,
  onSetAsCover,
  onUpdatePhotoAlbum
}: PhotoDetailDialogProps) {
  const [newCaption, setNewCaption] = useState('');

  useEffect(() => {
    if (open) {
      setNewCaption('');
    }
  }, [open, photo]);

  if (!photo) return null;

  return (
    <AnimatePresence>
      {open && (
        <Dialog 
          open={open} 
          onClose={onClose}
          maxWidth="md"
          fullWidth
          slotProps={{
            paper: {
              sx: { 
                borderRadius: '16px', 
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
              <img src={photo.url} alt="Scrapbook detail" className="max-w-full max-h-[75vh] object-contain rounded-xl" />
            </Box>
            
            {/* Info panel */}
            <Box className="md:w-1/2 p-8 flex flex-col justify-between h-full min-h-[400px] md:min-h-0">
              <div className="space-y-6 flex-grow overflow-y-auto pr-2">
                <div className="flex justify-between items-start">
                  <div>
                    <Typography variant="h5" className="font-display font-black text-amber-950">Memory Ledger</Typography>
                    <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs mt-1">
                      <Calendar size={14} />
                      {new Date(photo.takenAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <Stack direction="row" spacing={1}>
                    <IconButton onClick={onDeletePhoto} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2.5 rounded-full transition-all">
                      <Trash2 size={18} />
                    </IconButton>
                    <IconButton onClick={onClose} className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 p-2.5 rounded-full font-black text-sm">
                      ✕
                    </IconButton>
                  </Stack>
                </div>

                <Box className="space-y-4">
                  <Typography className="font-bold text-amber-900/40 uppercase tracking-widest text-[10px]">Captions Ledger</Typography>
                  {photo.captions.length === 0 ? (
                    <Typography className="text-amber-900/30 italic text-sm">No captions recorded yet. Be the first to describe this memory.</Typography>
                  ) : (
                    photo.captions.map((cap, i) => (
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
                      value={photo.albumId || ''}
                      onChange={(e) => onUpdatePhotoAlbum(photo._id, e.target.value || null)}
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
                      onClick={() => onSetAsCover(photo.url)}
                      disabled={!photo.albumId}
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
                  onClick={() => {
                    if (newCaption.trim()) {
                      onAddCaption(newCaption.trim());
                      setNewCaption('');
                    }
                  }}
                >
                  Add Caption
                </Button>
              </Stack>
            </Box>
          </Box>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
