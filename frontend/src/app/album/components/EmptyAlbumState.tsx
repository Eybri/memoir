'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Image as ImageIcon } from 'lucide-react';

interface EmptyAlbumStateProps {
  onAddMemoryClick: () => void;
}

export default function EmptyAlbumState({ onAddMemoryClick }: EmptyAlbumStateProps) {
  return (
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
        onClick={onAddMemoryClick}
        className="mt-6 bg-amber-600 hover:bg-amber-700 text-white rounded-full px-6 py-2.5 font-bold text-sm uppercase tracking-wider shadow"
      >
        Add first memory
      </Button>
    </Box>
  );
}
