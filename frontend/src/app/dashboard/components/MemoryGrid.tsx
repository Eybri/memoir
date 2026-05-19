'use client';

import * as React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trash2, ChevronRight, Sparkles, FolderOpen, Image as ImageIcon } from 'lucide-react';

interface Photo {
  _id: string;
  url: string;
  captions: { text: string; authorId: string; createdAt: string }[];
  takenAt: string;
}

interface MemoryGridProps {
  photos: Photo[];
  onSelectPhoto: (photo: Photo) => void;
  nostalgiaMode: boolean;
}

// Group photos into chapters based on season and year
interface Chapter {
  id: string;
  title: string;
  description: string;
  piles: Photo[][]; // Stacks of photos taken close to each other
}

export default function MemoryGrid({ photos, onSelectPhoto, nostalgiaMode }: MemoryGridProps) {
  // Compute chapters and piles
  const chapters = React.useMemo(() => {
    if (photos.length === 0) return [];

    // Sort photos descending by takenAt
    const sorted = [...photos].sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());

    // 1. Group into Seasons (Chapters)
    const chapterMap: { [key: string]: Photo[] } = {};
    sorted.forEach(photo => {
      const date = new Date(photo.takenAt);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-11
      
      let season = '';
      if (month === 11 || month === 0 || month === 1) season = 'Cozy Winter';
      else if (month >= 2 && month <= 4) season = 'Spring Blossoms';
      else if (month >= 5 && month <= 7) season = 'Golden Summer';
      else season = 'Golden Autumn';

      const key = `${season} of ’${String(year).slice(-2)}`;
      if (!chapterMap[key]) {
        chapterMap[key] = [];
      }
      chapterMap[key].push(photo);
    });

    // 2. For each chapter, group photos taken within 3 days into "Piles" (stacks)
    const result: Chapter[] = [];
    Object.entries(chapterMap).forEach(([title, pList]) => {
      const piles: Photo[][] = [];
      let currentPile: Photo[] = [];

      pList.forEach(photo => {
        if (currentPile.length === 0) {
          currentPile.push(photo);
        } else {
          const lastPhoto = currentPile[currentPile.length - 1];
          const diffTime = Math.abs(new Date(photo.takenAt).getTime() - new Date(lastPhoto.takenAt).getTime());
          const diffDays = diffTime / (1000 * 60 * 60 * 24);

          if (diffDays <= 3) {
            currentPile.push(photo);
          } else {
            piles.push(currentPile);
            currentPile = [photo];
          }
        }
      });
      if (currentPile.length > 0) {
        piles.push(currentPile);
      }

      // Add a nice mock description for the chapter
      let description = 'A collection of beautiful captured moments.';
      if (title.includes('Summer')) description = 'Sunny walks, golden sunsets, and long warm evenings.';
      else if (title.includes('Winter')) description = 'Cozy indoor memories, hot drinks, and frosty mornings.';
      else if (title.includes('Spring')) description = 'Fresh blooms, clean air, and the start of something beautiful.';
      else if (title.includes('Autumn')) description = 'Crisp orange leaves, soft sweaters, and cozy rainy afternoons.';

      result.push({
        id: title,
        title,
        description,
        piles
      });
    });

    return result;
  }, [photos]);

  // Flip-book active index state map (pileId -> current photo index inside pile)
  const [hoveredPileId, setHoveredPileId] = React.useState<string | null>(null);
  const [flipIndex, setFlipIndex] = React.useState<number>(0);

  // Interval hook for cycling photos in hovered piles
  React.useEffect(() => {
    if (!hoveredPileId) return;
    
    // Find the pile to get its length
    let pileLength = 1;
    for (const ch of chapters) {
      const found = ch.piles.find((p, index) => `${ch.id}-pile-${index}` === hoveredPileId);
      if (found) {
        pileLength = found.length;
        break;
      }
    }

    if (pileLength <= 1) return;

    const interval = setInterval(() => {
      setFlipIndex(prev => (prev + 1) % pileLength);
    }, 450); // Frame-skipped visual speed

    return () => clearInterval(interval);
  }, [hoveredPileId, chapters]);

  const startFlipbook = (pileId: string) => {
    setHoveredPileId(pileId);
    setFlipIndex(0);
  };

  const stopFlipbook = () => {
    setHoveredPileId(null);
  };

  if (photos.length === 0) {
    return (
      <Box className="w-full flex flex-col items-center justify-center py-40 text-yellow-500/50">
        <ImageIcon size={100} strokeWidth={1} className="mb-6 opacity-20" />
        <Typography variant="h5" className="font-display font-bold">Your scrapbook is empty</Typography>
        <Typography className="text-amber-900/50">Start dragging or uploading photos to construct chapters.</Typography>
      </Box>
    );
  }

  return (
    <Box className="space-y-16">
      {chapters.map((chapter) => (
        <Box key={chapter.id} className="space-y-6">
          {/* Chapter Break Header */}
          <Box className="border-b border-amber-200/30 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <Typography variant="h4" className="font-display font-extrabold text-amber-950 flex items-center gap-2">
                <FolderOpen className="text-amber-600" size={24} /> {chapter.title}
              </Typography>
              <Typography className="text-amber-900/50 text-sm mt-1">
                {chapter.description}
              </Typography>
            </div>
            <Typography variant="caption" className="text-amber-600 font-bold uppercase tracking-wider bg-amber-500/5 px-3 py-1 rounded-full text-[10px]">
              {chapter.piles.reduce((acc, p) => acc + p.length, 0)} Memories
            </Typography>
          </Box>

          {/* Staggered Masonry Layout of Piles */}
          <div className="columns-1 sm:columns-2 xl:columns-3 gap-6">
            {chapter.piles.map((pile, pileIndex) => {
              const pileId = `${chapter.id}-pile-${pileIndex}`;
              const isHovered = hoveredPileId === pileId;
              const activePhoto = isHovered ? pile[flipIndex] : pile[0];

              // If only 1 photo in pile, display as standard photo
              if (pile.length === 1) {
                const photo = pile[0];
                return (
                  <div key={photo._id} className="break-inside-avoid mb-6">
                    <motion.div
                      layoutId={photo._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => onSelectPhoto(photo)}
                      className="group relative rounded-[32px] overflow-hidden cursor-pointer shadow-lg hover:shadow-yellow-200 transition-all duration-300 hover:scale-[1.02] bg-white p-3 border border-yellow-100"
                    >
                      <div className="aspect-[4/5] rounded-[24px] overflow-hidden relative">
                        <img 
                          src={photo.url} 
                          alt="Scrapbook Memory" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      
                      {/* Photo details inside Polaroid layout */}
                      <Box className="pt-4 pb-2 px-2 flex justify-between items-center">
                        <div className="truncate pr-2">
                          <Typography className="text-amber-950 font-bold text-sm italic truncate">
                            {photo.captions[0]?.text ? `"${photo.captions[0].text}"` : 'Untitled Memory'}
                          </Typography>
                          <Typography className="text-amber-800/40 text-xs font-bold mt-0.5">
                            {new Date(photo.takenAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </Typography>
                        </div>
                        <ChevronRight size={18} className="text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Box>
                    </motion.div>
                  </div>
                );
              }

              // Else it's a Smart Pile
              return (
                <div 
                  key={pileId} 
                  className="break-inside-avoid mb-6"
                  onMouseEnter={() => startFlipbook(pileId)}
                  onMouseLeave={stopFlipbook}
                >
                  <Box className="relative w-full h-[320px] cursor-pointer flex items-center justify-center">
                    {/* Visual Pile / Stack effect (3 layers) */}
                    {pile.slice(0, 3).map((photo, i) => {
                      // Stack offsets
                      let rotation = 0;
                      let xOffset = 0;
                      let yOffset = 0;
                      let scale = 1;

                      if (!isHovered) {
                        if (i === 1) { rotation = 6; xOffset = 8; yOffset = 4; scale = 0.96; }
                        else if (i === 2) { rotation = -8; xOffset = -10; yOffset = 8; scale = 0.92; }
                      } else {
                        // Spread effect on hover
                        if (i === 1) { rotation = 12; xOffset = 35; yOffset = -5; scale = 0.98; }
                        else if (i === 2) { rotation = -14; xOffset = -35; yOffset = 5; scale = 0.95; }
                      }

                      return (
                        <motion.div
                          key={photo._id}
                          animate={{ 
                            rotate: rotation,
                            x: xOffset,
                            y: yOffset,
                            scale: scale,
                            zIndex: 10 - i
                          }}
                          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                          onClick={() => onSelectPhoto(photo)}
                          className="absolute w-[85%] h-[90%] bg-white p-3 pb-10 rounded-[28px] shadow-xl border border-yellow-100 flex flex-col justify-between"
                        >
                          <div className="w-full h-[85%] rounded-[20px] overflow-hidden relative">
                            {/* If top photo, display current flip-book image */}
                            <img 
                              src={i === 0 ? activePhoto.url : photo.url} 
                              alt="Scrapbook Pile" 
                              className="w-full h-full object-cover"
                            />
                            {/* Pile indicator */}
                            {i === 0 && (
                              <div className="absolute top-3 right-3 bg-amber-950/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                                <Sparkles size={10} className="text-yellow-400" /> {pile.length} Stacking
                              </div>
                            )}
                          </div>

                          {i === 0 && (
                            <Box className="pt-2.5 px-1 truncate">
                              <Typography className="text-amber-950 font-bold text-xs italic truncate">
                                {activePhoto.captions[0]?.text ? `"${activePhoto.captions[0].text}"` : 'Stacked Collection'}
                              </Typography>
                              <Typography className="text-amber-800/40 text-[10px] font-bold">
                                {new Date(activePhoto.takenAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          )}
                        </motion.div>
                      );
                    })}
                  </Box>
                </div>
              );
            })}
          </div>
        </Box>
      ))}
    </Box>
  );
}
