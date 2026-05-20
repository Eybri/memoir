import React, { useState, useEffect } from 'react';
import { Dialog, Box, Typography, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Pause, Sparkles } from 'lucide-react';

interface Photo {
  _id: string;
  url: string;
  captions: { text: string; authorId: string; createdAt: string }[];
  takenAt: string;
}

interface SlideshowDialogProps {
  open: boolean;
  onClose: () => void;
  photos: Photo[];
  albumTitle: string;
}

export default function SlideshowDialog({ open, onClose, photos, albumTitle }: SlideshowDialogProps) {
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (open && isSlideshowPlaying && photos.length > 0) {
      interval = setInterval(() => {
        setSlideshowIndex((prevIndex) => (prevIndex + 1) % photos.length);
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [open, isSlideshowPlaying, photos]);

  useEffect(() => {
    if (open) {
      setSlideshowIndex(0);
      setIsSlideshowPlaying(true);
    }
  }, [open]);

  if (photos.length === 0) return null;

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
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
            {albumTitle}
          </Typography>
          <Typography className="text-amber-400 font-mono text-[10px] uppercase tracking-wider mt-1 font-bold">
            Memory Reels Playback
          </Typography>
        </div>
        <IconButton 
          onClick={onClose} 
          className="text-white hover:bg-white/10 p-2.5 rounded-full"
        >
          <X size={24} />
        </IconButton>
      </Box>

      {/* Slideshow Content */}
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
              src={photos[slideshowIndex].url} 
              alt="Slideshow Frame" 
              className="max-w-full max-h-[70vh] object-contain"
            />
          </motion.div>
        </AnimatePresence>

        {/* Slideshow Description and Index Stamp */}
        <Box className="absolute bottom-24 text-center max-w-xl space-y-2 z-40 bg-black/60 backdrop-blur-md p-5 rounded-2xl border border-white/10">
          <Typography className="text-white text-base italic font-medium leading-relaxed">
            {photos[slideshowIndex].captions[0]?.text 
              ? `"${photos[slideshowIndex].captions[0].text}"`
              : 'Untitled Memory'}
          </Typography>
          <Typography className="text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
            {new Date(photos[slideshowIndex].takenAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
      </Box>

      {/* Bottom Playback Navigation Panel */}
      <Box className="absolute bottom-0 left-0 right-0 p-6 flex justify-center items-center gap-6 bg-gradient-to-t from-black/80 to-transparent z-40">
        <IconButton 
          onClick={() => setSlideshowIndex((prev) => (prev - 1 + photos.length) % photos.length)} 
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
          onClick={() => setSlideshowIndex((prev) => (prev + 1) % photos.length)} 
          className="text-white/80 hover:text-white hover:bg-white/10 p-3 rounded-full"
        >
          <ChevronRight size={24} />
        </IconButton>

        <span className="absolute right-8 text-white/50 font-mono text-xs font-bold uppercase">
          {slideshowIndex + 1} / {photos.length}
        </span>
      </Box>
    </Dialog>
  );
}
