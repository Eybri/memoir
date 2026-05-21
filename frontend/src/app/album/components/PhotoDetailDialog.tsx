import React, { useState, useEffect } from 'react';
import { Dialog, Box, Stack, IconButton, Typography, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trash2, Download } from 'lucide-react';

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
  onSetAsCover,
  onUpdatePhotoAlbum
}: PhotoDetailDialogProps) {
  
  if (!photo) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `memoir-photo-${photo._id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed, opening in new tab instead", error);
      window.open(photo.url, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog 
          open={open} 
          onClose={onClose}
          maxWidth="lg"
          fullWidth
          slotProps={{
            paper: {
              sx: { 
                borderRadius: '16px', 
                overflow: 'hidden', 
                border: 'none',
                backgroundColor: '#ffffff',
                boxShadow: '0 24px 64px -10px rgba(0, 0, 0, 0.5)'
              }
            }
          }}
        >
          <Box className="flex flex-col h-full max-h-[95vh]">
            
            {/* Top Media viewer */}
            <Box className="w-full relative flex items-center justify-center bg-black overflow-hidden">
              {/* Overlaid controls top-right */}
              <Box className="absolute top-0 right-0 p-4 sm:p-6 flex justify-end z-20 pointer-events-none w-full">
                <Stack direction="row" spacing={1} className="pointer-events-auto">
                  <IconButton 
                    onClick={handleDownload} 
                    title="Download" 
                    sx={{ backgroundColor: '#1f2937', color: '#ffffff', '&:hover': { backgroundColor: '#000000' }, width: 32, height: 32, minWidth: 32, borderRadius: '50%', p: 0 }}
                  >
                    <Download size={15} />
                  </IconButton>
                  <IconButton 
                    onClick={onDeletePhoto} 
                    title="Delete" 
                    sx={{ backgroundColor: '#1f2937', color: '#ffffff', '&:hover': { backgroundColor: '#000000' }, width: 32, height: 32, minWidth: 32, borderRadius: '50%', p: 0 }}
                  >
                    <Trash2 size={15} />
                  </IconButton>
                  <IconButton 
                    onClick={onClose} 
                    title="Close" 
                    sx={{ backgroundColor: '#1f2937', color: '#ffffff', '&:hover': { backgroundColor: '#000000' }, width: 32, height: 32, minWidth: 32, borderRadius: '50%', p: 0, fontSize: '12px', fontWeight: 900 }}
                  >
                    ✕
                  </IconButton>
                </Stack>
              </Box>

              <img src={photo.url} alt="Scrapbook detail" className="max-w-full max-h-[85vh] h-auto object-contain block" />
            </Box>
            
            {/* Sleek White Footer */}
            <Box className="flex-shrink-0 bg-white p-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 z-10 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
               
               <div className="flex items-center gap-2">
                 <Calendar size={16} className="text-gray-400" />
                 <Typography className="text-gray-700 font-bold tracking-wide text-sm font-display">
                   {new Date(photo.takenAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                 </Typography>
               </div>
               
               <div className="flex items-center gap-3">
                 <select
                   value={photo.albumId || ''}
                   onChange={(e) => onUpdatePhotoAlbum(photo._id, e.target.value || null)}
                   className="bg-gray-50 text-gray-800 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 cursor-pointer font-medium hover:bg-gray-100 transition-colors"
                 >
                   <option value="" className="text-gray-500">No Album Selected</option>
                   {albums.map((alb) => (
                     <option key={alb._id} value={alb._id} className="text-black">
                       {alb.title}
                     </option>
                   ))}
                 </select>
                 
                 <Button
                   size="small"
                   onClick={() => onSetAsCover(photo.url)}
                   disabled={!photo.albumId}
                   className="text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 px-4 py-2 rounded-lg text-[10px] font-bold tracking-wider uppercase disabled:opacity-40 disabled:bg-gray-50 disabled:border-gray-100 disabled:text-gray-400 transition-all shadow-sm"
                 >
                   Make Cover
                 </Button>
               </div>

            </Box>
          </Box>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
