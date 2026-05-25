'use client';

import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { ZoomIn, ZoomOut, Check } from 'lucide-react';

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
  isSelectionMode?: boolean;
  selectedPhotoIds?: Set<string>;
  onToggleSelection?: (photoId: string) => void;
  onLongPress?: (photoId: string) => void;
}

export default function AlbumGallery({ 
  photos, 
  onSelectPhoto,
  isSelectionMode,
  selectedPhotoIds,
  onToggleSelection,
  onLongPress
}: AlbumGalleryProps) {
  const [galleryZoom, setGalleryZoom] = useState(3);

  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const justLongPressed = React.useRef(false);

  const startLongPress = (photoId: string) => {
    if (isSelectionMode) return;
    justLongPressed.current = false;
    longPressTimerRef.current = setTimeout(() => {
      justLongPressed.current = true;
      if (onLongPress) {
        onLongPress(photoId);
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(50);
        }
      }
    }, 500);
  };

  const endLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

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
          <Box className="px-4 text-[10px] sm:text-xs md:text-sm font-mono font-bold text-amber-900/70">
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
            className={`aspect-square relative cursor-pointer group bg-amber-100/50 border-[1px] border-black overflow-hidden ${isSelectionMode && selectedPhotoIds?.has(photo._id) ? 'ring-4 ring-amber-500 ring-inset border-none' : ''}`}
            onPointerDown={() => startLongPress(photo._id)}
            onPointerUp={endLongPress}
            onPointerLeave={endLongPress}
            onClick={() => {
              if (justLongPressed.current) {
                justLongPressed.current = false;
                return;
              }
              if (isSelectionMode && onToggleSelection) {
                onToggleSelection(photo._id);
              } else {
                onSelectPhoto(photo);
              }
            }}
          >
            <img
              src={photo.url}
              alt="Gallery Photo"
              className={`w-full h-full object-cover ${isSelectionMode && selectedPhotoIds?.has(photo._id) ? 'scale-[1.03] brightness-90' : ''}`}
            />
            
            {/* Selection Checkbox */}
            {isSelectionMode && selectedPhotoIds && (
              <div className="absolute top-2 left-2 z-50 transition-all duration-200">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center backdrop-blur-md shadow-lg ${
                  selectedPhotoIds.has(photo._id) 
                    ? 'bg-amber-500 border-amber-500 text-white' 
                    : 'bg-black/30 border-white/80'
                }`}>
                  {selectedPhotoIds.has(photo._id) && <Check size={14} strokeWidth={4} />}
                </div>
              </div>
            )}
            
            <div className={`absolute inset-0 transition-colors duration-300 ${isSelectionMode && selectedPhotoIds?.has(photo._id) ? 'bg-amber-500/20' : 'bg-black/0'}`} />
          </div>
        ))}
      </div>
    </Box>
  );
}
