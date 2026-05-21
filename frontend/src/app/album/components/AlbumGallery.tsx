'use client';

import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface Photo {
  _id: string;
  url: string;
  captions: { text: string; authorId: string; createdAt: string }[];
  takenAt: string;
  albumId?: string;
}

interface AlbumGalleryProps {
  photos: Photo[];
  onSelectPhoto: (photo: Photo) => void;
}

export default function AlbumGallery({ photos, onSelectPhoto }: AlbumGalleryProps) {
  const [galleryZoom, setGalleryZoom] = useState(3);

  const getGridCols = () => {
    switch (galleryZoom) {
      case 1: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'; // largest
      case 2: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
      case 3: return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'; // normal
      case 4: return 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10';
      case 5: return 'grid-cols-6 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16'; // smallest (zoomed out)
      default: return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6';
    }
  };

  return (
    <Box className="w-full relative">
      {/* Zoom Controls above images */}
      <Box className="flex justify-center sm:justify-end p-2 mb-1 w-full">
        <Box className="flex items-center bg-amber-900/5 border border-amber-900/10 rounded-full px-1 py-1">
          <Button
            onClick={() => setGalleryZoom(z => Math.max(1, z - 1))}
            disabled={galleryZoom === 1}
            className="min-w-0 p-2 text-amber-900 rounded-full hover:bg-amber-900/10 disabled:opacity-30"
          >
            <ZoomIn size={18} />
          </Button>
          <Box className="px-4 text-xs font-mono font-bold text-amber-900/70">
            {galleryZoom}
          </Box>
          <Button
            onClick={() => setGalleryZoom(z => Math.min(5, z + 1))}
            disabled={galleryZoom === 5}
            className="min-w-0 p-2 text-amber-900 rounded-full hover:bg-amber-900/10 disabled:opacity-30"
          >
            <ZoomOut size={18} />
          </Button>
        </Box>
      </Box>

      <div className={`grid ${getGridCols()} w-full`}>
        {photos.map((photo) => (
          <div
            key={photo._id}
            className="aspect-square relative cursor-pointer group bg-amber-100/50 border-[1px] border-black"
            onClick={() => onSelectPhoto(photo)}
          >
            <img
              src={photo.url}
              alt="Gallery Photo"
              className="w-full h-full object-cover transition-transform duration-150 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        ))}
      </div>
    </Box>
  );
}
