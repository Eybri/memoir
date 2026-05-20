'use client';

import * as React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Sparkles, 
  FolderOpen, 
  Image as ImageIcon, 
  BookOpen, 
  RotateCcw,
  Plus
} from 'lucide-react';

interface Album {
  _id: string;
  title: string;
  coverPhotoUrl: string;
  createdAt?: string;
}

interface Photo {
  _id: string;
  url: string;
  captions: { text: string; authorId: string; createdAt: string }[];
  takenAt: string;
  albumId?: string;
}

interface MemoryGridProps {
  photos: Photo[];
  albums?: Album[];
  activeAlbumId?: string | null;
  onSelectPhoto: (photo: Photo) => void;
  nostalgiaMode: boolean;
  onAddCaption?: (photoId: string, text: string) => Promise<void>;
  disableStacking?: boolean;
}

const getCollageSpanClass = (index: number) => {
  const mod = index % 8;
  switch (mod) {
    case 0:
      return "col-span-2 row-span-2"; // Large highlight
    case 1:
      return "col-span-1 row-span-1"; // Square
    case 2:
      return "col-span-1 row-span-2"; // Vertical portrait
    case 3:
      return "col-span-2 row-span-1"; // Horizontal landscape
    case 4:
      return "col-span-1 row-span-1"; // Square
    case 5:
      return "col-span-1 row-span-1"; // Square
    case 6:
      return "col-span-2 row-span-1"; // Horizontal landscape
    case 7:
      return "col-span-1 row-span-1"; // Square
    default:
      return "col-span-1 row-span-1";
  }
};

// Group photos into chapters based on season and year
interface Chapter {
  id: string;
  title: string;
  description: string;
  piles: Photo[][]; // Stacks of photos taken close to each other
}

export default function MemoryGrid({ 
  photos, 
  albums = [],
  activeAlbumId,
  onSelectPhoto, 
  nostalgiaMode,
  onAddCaption,
  disableStacking = false
}: MemoryGridProps) {
  
  // Chapter & Stacking calculation
  const chapters = React.useMemo(() => {
    if (photos.length === 0) return [];

    // Sort photos descending by takenAt
    const sorted = [...photos].sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());

    // 1. Group into Albums (Chapters)
    const chapterMap: { [key: string]: Photo[] } = {};
    sorted.forEach(photo => {
      const key = photo.albumId || 'unassigned';
      if (!chapterMap[key]) {
        chapterMap[key] = [];
      }
      chapterMap[key].push(photo);
    });

    // 2. For each chapter, group photos taken within 3 days into "Piles" (stacks)
    const result: Chapter[] = [];
    Object.entries(chapterMap).forEach(([albumId, pList]) => {
      const piles: Photo[][] = [];
      let currentPile: Photo[] = [];

      pList.forEach(photo => {
        if (disableStacking) {
          piles.push([photo]);
        } else if (currentPile.length === 0) {
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
      if (!disableStacking && currentPile.length > 0) {
        piles.push(currentPile);
      }

      let title = 'Loose Memories';
      let description = 'A collection of unassigned beautiful captured moments.';

      if (albumId !== 'unassigned') {
        const album = albums.find(a => a._id === albumId);
        if (album) {
          title = album.title;
          const dateCreated = album.createdAt ? new Date(album.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date';
          description = `Created on ${dateCreated}`;
        } else {
          title = 'Unknown Album';
          description = 'Photos belonging to an unknown album.';
        }
      }

      result.push({
        id: albumId,
        title,
        description,
        piles
      });
    });

    // Sort chapters: active album first, then unassigned, then rest by title.
    result.sort((a, b) => {
      if (a.id === activeAlbumId) return -1;
      if (b.id === activeAlbumId) return 1;
      if (a.id === 'unassigned') return 1;
      if (b.id === 'unassigned') return -1;
      return a.title.localeCompare(b.title);
    });

    return result;
  }, [photos, albums, activeAlbumId]);

  // Flip-book active index state map (pileId -> current photo index inside pile)
  const [hoveredPileId, setHoveredPileId] = React.useState<string | null>(null);
  const [flipIndex, setFlipIndex] = React.useState<number>(0);

  // Pile drag order management (pileId -> array of photoIds in display order)
  const [pileOrders, setPileOrders] = React.useState<{ [pileId: string]: string[] }>({});

  // 3D Card flip states (photoId -> true if card is flipped to back)
  const [flippedCards, setFlippedCards] = React.useState<{ [photoId: string]: boolean }>({});

  // Input states for writing back-side captions (photoId -> current text)
  const [memos, setMemos] = React.useState<{ [photoId: string]: string }>({});
  const [isSavingMemo, setIsSavingMemo] = React.useState<{ [photoId: string]: boolean }>({});

  // Interval hook for cycling photos in hovered piles (for frame-skipped preview)
  React.useEffect(() => {
    if (!hoveredPileId) return;
    
    // Get current items in the pile
    let pileLength = 1;
    for (const ch of chapters) {
      const foundIdx = ch.piles.findIndex((p, index) => `${ch.id}-pile-${index}` === hoveredPileId);
      if (foundIdx !== -1) {
        const pileId = `${ch.id}-pile-${foundIdx}`;
        const order = pileOrders[pileId];
        pileLength = order ? order.length : ch.piles[foundIdx].length;
        break;
      }
    }

    if (pileLength <= 1) return;

    const interval = setInterval(() => {
      setFlipIndex(prev => (prev + 1) % pileLength);
    }, 450); // Frame-skipped visual speed

    return () => clearInterval(interval);
  }, [hoveredPileId, chapters, pileOrders]);

  const startFlipbook = (pileId: string) => {
    setHoveredPileId(pileId);
    setFlipIndex(0);
  };

  const stopFlipbook = () => {
    setHoveredPileId(null);
  };

  // Helper to retrieve photos in their current pile stacking order
  const getPilePhotosOrdered = (pileId: string, originalPile: Photo[]) => {
    const order = pileOrders[pileId];
    if (!order) return originalPile;
    const map = new Map(originalPile.map(p => [p._id, p]));
    return order.map(id => map.get(id)).filter(Boolean) as Photo[];
  };

  // Swipe gesture handler - cycles top photo to the bottom
  const handleSwipe = (pileId: string, originalPile: Photo[]) => {
    const currentOrder = getPilePhotosOrdered(pileId, originalPile);
    if (currentOrder.length <= 1) return;
    
    const [top, ...rest] = currentOrder;
    const newOrder = [...rest, top].map(p => p._id);
    
    setPileOrders(prev => ({
      ...prev,
      [pileId]: newOrder
    }));
  };

  // Toggle 3D flip on a card
  const toggleFlip = (photoId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [photoId]: !prev[photoId]
    }));
  };

  // Submit caption memo from the card back face
  const handleSaveMemo = async (photoId: string) => {
    const text = memos[photoId];
    if (!text || !text.trim() || !onAddCaption) return;
    
    setIsSavingMemo(prev => ({ ...prev, [photoId]: true }));
    try {
      await onAddCaption(photoId, text);
      setMemos(prev => ({ ...prev, [photoId]: '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingMemo(prev => ({ ...prev, [photoId]: false }));
    }
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

          {disableStacking ? (
            /* ── Collage Scrapbook Page Grid ── */
            <Box
              className="relative overflow-hidden"
              sx={{
                background: 'linear-gradient(135deg, #f5ede0 0%, #ede0cc 40%, #f5ede0 100%)',
                borderRadius: '36px',
                border: '10px solid #e8d5bc',
                boxShadow: '0 20px 50px -10px rgba(60,40,15,0.18), inset 0 0 80px rgba(180,100,20,0.04)',
                p: { xs: '20px', sm: '40px' },
              }}
            >
              {/* Aged paper grain overlay */}
              <div
                className="absolute inset-0 pointer-events-none z-0 opacity-[0.04]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  backgroundSize: '180px 180px',
                }}
              />

              {/* Dashed inner stitch border */}
              <div
                className="absolute pointer-events-none z-0"
                style={{
                  inset: '10px',
                  border: '1.5px dashed rgba(150, 90, 20, 0.22)',
                  borderRadius: '26px',
                }}
              />

              {/* Page label stamp */}
              <div className="absolute top-5 right-7 z-10 opacity-30 select-none pointer-events-none">
                <div
                  className="font-serif italic text-amber-900 text-[10px] sm:text-xs border border-amber-900/40 px-2 py-0.5 rounded"
                  style={{ transform: 'rotate(2deg)', letterSpacing: '0.05em' }}
                >
                  Scrapbook Ledger · {activeAlbumId ? 'Vol. I' : 'Vol. II'}
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-8 auto-rows-[150px] sm:auto-rows-[210px]">
                {chapter.piles.map((pile, pileIndex) => {
                  const photo = pile[0];
                  // More expressive organic tilts
                  const tilts = [-3, 2, -1.5, 3.5, -2.5, 1, -4, 2.5];
                  const baseTilt = tilts[pileIndex % tilts.length];
                  const isFlipped = flippedCards[photo._id] || false;
                  const collageClass = getCollageSpanClass(pileIndex);

                  // Washi tape colors cycling through warm scrapbook tones
                  const washiColors = [
                    'rgba(252,211,77,0.55)',   // amber yellow
                    'rgba(251,146,60,0.45)',   // orange
                    'rgba(167,243,208,0.50)',  // mint
                    'rgba(253,186,116,0.50)',  // peach
                    'rgba(196,181,253,0.45)',  // lavender
                    'rgba(253,224,71,0.50)',   // lemon
                  ];
                  const washiColor = washiColors[pileIndex % washiColors.length];
                  const washiRotate = (pileIndex % 2 === 0) ? '-2deg' : '1.5deg';
                  const washiLeft = (pileIndex % 3 === 0) ? '15%' : (pileIndex % 3 === 1) ? '30%' : '50%';

                  return (
                    <div
                      key={photo._id}
                      className={`${collageClass} relative`}
                      style={{ perspective: 1000 }}
                    >
                      {/* Washi tape strip */}
                      <div
                        className="absolute top-[-9px] z-30 select-none pointer-events-none"
                        style={{
                          left: washiLeft,
                          transform: `translateX(-50%) rotate(${washiRotate})`,
                          width: '52px',
                          height: '16px',
                          background: washiColor,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                          backdropFilter: 'blur(1px)',
                          borderLeft: '1.5px dashed rgba(0,0,0,0.07)',
                          borderRight: '1.5px dashed rgba(0,0,0,0.07)',
                        }}
                      />

                      {/* Pull-out Journal slider tab */}
                      <button
                        onClick={() => toggleFlip(photo._id)}
                        className={`absolute right-[-4px] top-[22px] sm:top-[32px] z-40 p-1 sm:p-2 rounded-r-xl border shadow-md flex items-center justify-center transition-all ${
                          isFlipped
                            ? 'bg-amber-800 text-yellow-50 border-amber-900 right-[-8px]'
                            : 'bg-white hover:bg-amber-50 text-amber-850 hover:right-[-6px] border-amber-100'
                        }`}
                        title={isFlipped ? 'View Photo' : 'Write Journal'}
                      >
                        {isFlipped ? <RotateCcw size={10} className="sm:w-3 sm:h-3" /> : <BookOpen size={10} className="sm:w-3 sm:h-3" />}
                      </button>

                      <motion.div
                        animate={{ rotateY: isFlipped ? 180 : 0, rotate: baseTilt }}
                        whileHover={{ scale: 1.04, rotate: 0, zIndex: 20 }}
                        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                        style={{ transformStyle: 'preserve-3d', zIndex: 1 }}
                        className="w-full h-full relative shadow-lg hover:shadow-2xl bg-white rounded-[14px] sm:rounded-[22px] flex flex-col justify-between overflow-hidden"
                        sx={{ border: '5px solid #fff', outline: '1px solid rgba(180,120,40,0.12)' }}
                      >
                        {/* Photo corner stickers */}
                        {[
                          { top: 4, left: 4, rotate: '-45deg' },
                          { top: 4, right: 4, rotate: '45deg' },
                          { bottom: 22, left: 4, rotate: '-135deg' },
                          { bottom: 22, right: 4, rotate: '135deg' },
                        ].map((pos, ci) => (
                          <div
                            key={ci}
                            className="absolute z-20 pointer-events-none select-none"
                            style={{
                              width: 10,
                              height: 10,
                              ...pos,
                              transform: `rotate(${pos.rotate})`,
                              borderTop: '2px solid rgba(120,80,20,0.35)',
                              borderLeft: '2px solid rgba(120,80,20,0.35)',
                            }}
                          />
                        ))}

                        {/* FRONT FACE */}
                        <div
                          style={{ backfaceVisibility: 'hidden' }}
                          className="w-full h-full flex flex-col justify-between min-h-0"
                        >
                          <div
                            className="w-full flex-grow overflow-hidden relative cursor-pointer min-h-0"
                            onClick={() => onSelectPhoto(photo)}
                          >
                            <img
                              src={photo.url}
                              alt="Scrapbook Collage Piece"
                              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                          </div>

                          {/* Polaroid-style date footer */}
                          <Box className="px-2 py-1 flex justify-between items-center select-none flex-shrink-0 bg-white">
                            <Typography className="text-amber-800/60 text-[8px] sm:text-[10px] font-bold font-mono tracking-wide">
                              {new Date(photo.takenAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Typography>
                            <ChevronRight size={9} className="text-amber-600/30 flex-shrink-0" />
                          </Box>
                        </div>

                        {/* BACK FACE (Journal Paper) */}
                        <div
                          style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                          }}
                          className="bg-[#fefcf7] p-2.5 sm:p-4 rounded-[14px] sm:rounded-[22px] flex flex-col justify-between border-2 border-amber-900/10 shadow-inner"
                        >
                          <div
                            className="flex-grow overflow-y-auto space-y-1.5 sm:space-y-3"
                            style={{
                              backgroundImage: 'repeating-linear-gradient(transparent, transparent 19px, #cbd5e1 19px, #cbd5e1 20px)',
                              paddingLeft: '14px',
                              borderLeft: '1.5px solid #fca5a5',
                            }}
                          >
                            <Typography className="font-mono text-[6px] sm:text-[8px] uppercase tracking-wider text-amber-600 font-bold leading-none border-b border-amber-500/10 pb-0.5 bg-[#fefcf7]">
                              Journal
                            </Typography>
                            <div className="space-y-1.5 pt-1">
                              {photo.captions.length === 0 ? (
                                <Typography className="text-slate-400 font-mono italic text-[8px] sm:text-[10px] leading-tight">
                                  No stories yet.
                                </Typography>
                              ) : (
                                photo.captions.map((cap, i) => (
                                  <div key={i} className="leading-tight">
                                    <Typography className="text-amber-950 font-mono text-[9px] sm:text-[11px] italic font-bold">
                                      "{cap.text}"
                                    </Typography>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-amber-900/5 mt-1 space-y-1">
                            <textarea
                              placeholder="Write..."
                              value={memos[photo._id] || ''}
                              onChange={(e) => setMemos(prev => ({ ...prev, [photo._id]: e.target.value }))}
                              className="w-full text-[9px] sm:text-xs p-1 bg-amber-500/5 border border-amber-900/10 rounded focus:outline-none focus:border-amber-600 font-mono resize-none text-amber-950"
                              rows={1}
                            />
                            <Button
                              fullWidth
                              variant="contained"
                              size="small"
                              disabled={isSavingMemo[photo._id] || !memos[photo._id]?.trim()}
                              onClick={() => handleSaveMemo(photo._id)}
                              className="bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[7px] sm:text-[9px] uppercase py-0.5 shadow"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </Box>
          ) : (
            /* Staggered Masonry Layout */
            <div className="columns-2 sm:columns-2 xl:columns-3 gap-4 sm:gap-6">
              {chapter.piles.map((pile, pileIndex) => {
                const pileId = `${chapter.id}-pile-${pileIndex}`;
                const isHovered = hoveredPileId === pileId;
                
                // Get current display stack
                const orderedPile = getPilePhotosOrdered(pileId, pile);
                const topPhoto = isHovered && !flippedCards[orderedPile[0]._id] && orderedPile.length > 1
                  ? orderedPile[flipIndex] 
                  : orderedPile[0];
                
                // Compute rotation for layout tilts (based on pileIndex for natural spread look)
                const baseTilt = (pileIndex % 3 === 0) ? -2.5 : (pileIndex % 3 === 1) ? 1.5 : -1;
                const isFlipped = flippedCards[topPhoto._id] || false;

                // RENDER SINGLE PHOTO CARD (1 item)
                if (pile.length === 1) {
                  const photo = pile[0];
                  return (
                    <div 
                      key={photo._id} 
                      className="break-inside-avoid mb-4 sm:mb-8 relative"
                      style={{ perspective: 1000 }}
                    >
                      {/* Washi Tape overlay */}
                      <div 
                        className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-14 sm:w-20 h-4 sm:h-5 rotate-[-2deg] z-30 select-none pointer-events-none"
                        style={{
                          background: 'rgba(252, 211, 77, 0.4)',
                          borderLeft: '2px dashed rgba(217, 119, 6, 0.3)',
                          borderRight: '2px dashed rgba(217, 119, 6, 0.3)',
                          backdropFilter: 'blur(1.5px)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      />

                      {/* Pull-out Journal slider tab */}
                      <button 
                        onClick={() => toggleFlip(photo._id)}
                        className={`absolute right-[-4px] top-[30px] sm:top-[40px] z-40 p-1.5 sm:p-2.5 rounded-r-xl border shadow-md flex items-center justify-center transition-all ${
                          isFlipped 
                            ? 'bg-amber-800 text-yellow-50 border-amber-900 right-[-8px]' 
                            : 'bg-white hover:bg-amber-50 text-amber-850 hover:right-[-6px] border-amber-100'
                        }`}
                        title={isFlipped ? "View Photo" : "Write Journal Memo"}
                      >
                        {isFlipped ? <RotateCcw size={11} className="sm:w-3 sm:h-3" /> : <BookOpen size={11} className="sm:w-3 sm:h-3" />}
                      </button>

                      {/* 3D Card Structure */}
                      <motion.div
                        animate={{ rotateY: isFlipped ? 180 : 0, rotate: baseTilt }}
                        transition={{ type: 'spring', stiffness: 100, damping: 13 }}
                        style={{ transformStyle: 'preserve-3d' }}
                        className="w-full relative shadow-lg hover:shadow-yellow-200/50 transition-shadow duration-500 bg-white p-1 pb-1.5 sm:p-1.5 sm:pb-2.5 border border-yellow-100 rounded-[18px] sm:rounded-[28px]"
                      >
                        {/* FRONT FACE */}
                        <div 
                          style={{ backfaceVisibility: 'hidden' }}
                          className="w-full"
                        >
                          <div 
                            className="aspect-[4/5] rounded-[14px] sm:rounded-[20px] overflow-hidden relative cursor-pointer"
                            onClick={() => onSelectPhoto(photo)}
                          >
                            <img 
                              src={photo.url} 
                              alt="Scrapbook Memory" 
                              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                          </div>
                          
                          {/* Polaroid margin info */}
                          <Box className="pt-1 px-1 flex justify-between items-center select-none">
                            <Typography className="text-amber-800/60 text-[8px] sm:text-xs font-bold font-mono">
                              {new Date(photo.takenAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Typography>
                            <ChevronRight size={10} className="text-amber-600/40 flex-shrink-0" />
                          </Box>
                        </div>

                        {/* BACK FACE (Ruled Journal Paper) */}
                        <div 
                          style={{ 
                            backfaceVisibility: 'hidden', 
                            transform: 'rotateY(180deg)',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                          }}
                          className="bg-[#fefcf7] p-3 sm:p-5 rounded-[18px] sm:rounded-[28px] flex flex-col justify-between border-2 border-amber-900/10 shadow-inner"
                        >
                          {/* Ruled Notebook Paper Styling */}
                          <div 
                            className="flex-grow overflow-y-auto space-y-2 sm:space-y-4"
                            style={{
                              backgroundImage: 'linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0) 95%, #cbd5e1 95%, #cbd5e1 100%)',
                              backgroundSize: '100% 20px sm:100% 24px',
                              lineHeight: '20px sm:24px',
                              paddingLeft: '16px sm:24px',
                              borderLeft: '1.5px solid #f87171', // Red notebook margin line
                            }}
                          >
                            <Typography className="font-mono text-[7px] sm:text-[9px] uppercase tracking-wider text-amber-600 font-bold leading-none border-b border-amber-500/10 pb-1 mt-1">
                              Memory Journal Back
                            </Typography>
                            
                            {/* Past Memos */}
                            <div className="space-y-2 pt-1 sm:pt-2">
                              {photo.captions.length === 0 ? (
                                <Typography className="text-slate-400 font-mono italic text-[9px] sm:text-xs leading-normal">
                                  No stories recorded yet.
                                </Typography>
                              ) : (
                                photo.captions.map((cap, i) => (
                                  <div key={i} className="leading-tight pb-0.5">
                                    <Typography className="text-amber-950 font-mono text-[10px] sm:text-xs italic font-bold">
                                      "{cap.text}"
                                    </Typography>
                                    <Typography className="text-[7px] sm:text-[8px] font-mono text-amber-800/40 uppercase">
                                      {new Date(cap.createdAt).toLocaleDateString()}
                                    </Typography>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Quick Add Form */}
                          <div className="pt-2 border-t border-amber-900/5 mt-1 sm:mt-2 space-y-1.5">
                            <textarea 
                              placeholder="Jot down details..."
                              value={memos[photo._id] || ''}
                              onChange={(e) => setMemos(prev => ({ ...prev, [photo._id]: e.target.value }))}
                              className="w-full text-[10px] sm:text-xs p-1.5 sm:p-2.5 bg-amber-500/5 border border-amber-900/10 rounded-lg sm:rounded-xl focus:outline-none focus:border-amber-600 font-mono resize-none text-amber-950"
                              rows={2}
                            />
                            <Button
                              fullWidth
                              variant="contained"
                              size="small"
                              disabled={isSavingMemo[photo._id] || !memos[photo._id]?.trim()}
                              onClick={() => handleSaveMemo(photo._id)}
                              className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[8px] sm:text-[10px] uppercase py-1 sm:py-1.5 shadow"
                            >
                              {isSavingMemo[photo._id] ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                }

                // RENDER PHOTO STACK (2+ items) - Swipe Stacker styled as Miniature Vintage Album
                return (
                  <div 
                    key={pileId} 
                    className="break-inside-avoid mb-4 sm:mb-8 relative"
                    style={{ perspective: 1000 }}
                    onMouseEnter={() => startFlipbook(pileId)}
                    onMouseLeave={stopFlipbook}
                  >
                    <div 
                      className="relative w-full h-[280px] sm:h-[360px]"
                      style={{ transform: `rotate(${baseTilt}deg)` }}
                    >
                      {/* Album Outer Cover Base */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#2a1b12] to-[#1c110a] rounded-[18px] sm:rounded-[28px] border-2 border-[#150c07] shadow-xl z-0" />
                      
                      {/* Antique Leather Spine on the Left */}
                      <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-r from-[#120a05] via-[#24150d] to-[#120a05] rounded-l-[16px] sm:rounded-l-[26px] z-20 border-r border-[#0d0704] flex flex-col justify-between py-8 sm:py-12 select-none pointer-events-none shadow-md">
                        {/* Brass Binder Rings */}
                        <div className="w-4 h-1 sm:w-5.5 sm:h-1.5 bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-600 rounded-full border border-amber-950/40 -mr-2 sm:-mr-2.5 shadow-sm" />
                        <div className="w-4 h-1 sm:w-5.5 sm:h-1.5 bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-600 rounded-full border border-amber-950/40 -mr-2 sm:-mr-2.5 shadow-sm" />
                        <div className="w-4 h-1 sm:w-5.5 sm:h-1.5 bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-600 rounded-full border border-amber-950/40 -mr-2 sm:-mr-2.5 shadow-sm" />
                      </div>

                      {/* Pull-out Journal tab for stack top */}
                      <button 
                        onClick={() => toggleFlip(topPhoto._id)}
                        className={`absolute right-[4px] top-[30px] sm:top-[40px] z-40 p-1.5 sm:p-2.5 rounded-r-xl border shadow-md flex items-center justify-center transition-all ${
                          isFlipped 
                            ? 'bg-amber-800 text-yellow-50 border-amber-900 right-[-8px]' 
                            : 'bg-white hover:bg-amber-50 text-amber-850 hover:right-[-6px] border-amber-100'
                        }`}
                        title={isFlipped ? "View Album" : "Write Journal Memo"}
                      >
                        {isFlipped ? <RotateCcw size={11} className="sm:w-3 sm:h-3" /> : <BookOpen size={11} className="sm:w-3 sm:h-3" />}
                      </button>

                      {/* Render stack album pages */}
                      {orderedPile.slice(0, 3).map((photo, i) => {
                        const isTopCard = i === 0;
                        
                        // Calculate fanning book-like page offsets anchored at the spine
                        let rotation = 0;
                        let xOffset = 0;
                        let yOffset = 0;
                        let scale = 1;

                        if (!isHovered) {
                          if (i === 1) { rotation = 0.5; xOffset = 2; yOffset = 2; scale = 0.99; }
                          else if (i === 2) { rotation = 1; xOffset = 4; yOffset = 4; scale = 0.98; }
                        } else {
                          // Swing open pages to the right when hovered (book leaf look)
                          if (i === 1) { rotation = 5; xOffset = 8; sm:xOffset = 14; yOffset = -2; scale = 0.99; }
                          else if (i === 2) { rotation = 10; xOffset = 16; sm:xOffset = 28; yOffset = -4; scale = 0.98; }
                        }

                        // If top card is flipped, we center it and raise zIndex above the binder spine
                        const topCardFlipped = isFlipped && isTopCard;

                        return (
                          <motion.div
                            key={photo._id}
                            drag={isTopCard && !topCardFlipped ? "x" : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={(event, info) => {
                              if (isTopCard && !topCardFlipped) {
                                  const swipeThreshold = 120;
                                  if (Math.abs(info.offset.x) > swipeThreshold) {
                                    handleSwipe(pileId, pile);
                                  }
                              }
                            }}
                            animate={topCardFlipped ? {
                              rotateY: 180,
                              rotate: 0,
                              x: 0,
                              y: 0,
                              scale: 1.02,
                              zIndex: 25
                            } : { 
                              rotateY: 0,
                              rotate: rotation,
                              x: xOffset,
                              y: yOffset,
                              scale: scale,
                              zIndex: 10 - i
                            }}
                            transition={{ type: 'spring', stiffness: 110, damping: 14 }}
                            style={{ 
                              transformStyle: 'preserve-3d',
                              transformOrigin: 'left center' 
                            }}
                            className="absolute left-5 sm:left-7 w-[80%] sm:w-[78%] h-[92%] top-[4%] bg-[#FAF8F4] p-1 pb-1.5 sm:p-1.5 sm:pb-2.5 rounded-r-[16px] sm:rounded-r-[22px] rounded-l-[4px] shadow-lg border border-amber-900/10 flex flex-col justify-between cursor-grab active:cursor-grabbing"
                          >
                            {/* FRONT FACE */}
                            <div 
                              style={{ backfaceVisibility: 'hidden' }}
                              className="w-full h-full flex flex-col justify-between min-h-0"
                            >
                              <div 
                                className="w-full flex-grow rounded-[10px] sm:rounded-[14px] overflow-hidden relative min-h-0"
                                onClick={() => {
                                  if (isTopCard && !topCardFlipped) {
                                    onSelectPhoto(photo);
                                  }
                                }}
                              >
                                <img 
                                  src={isTopCard ? topPhoto.url : photo.url} 
                                  alt="Scrapbook Pile Card" 
                                  className="w-full h-full object-cover select-none pointer-events-none"
                                />

                                {/* Stacking indicator */}
                                {isTopCard && (
                                  <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 bg-amber-950/85 backdrop-blur-sm text-yellow-50 text-[6px] sm:text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow select-none z-20">
                                    <Sparkles size={6} className="text-yellow-400 sm:w-2 sm:h-2" /> {pile.length} Pages
                                  </div>
                                )}
                              </div>

                              <Box className="pt-1 px-1 flex justify-between items-center select-none flex-shrink-0">
                                <Typography className="text-amber-800/60 text-[8px] sm:text-[10px] font-bold font-mono">
                                  {new Date(isTopCard ? topPhoto.takenAt : photo.takenAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </Typography>
                              </Box>
                            </div>

                            {/* BACK FACE (Ruled Journal Back for Stack Top Photo) */}
                            {isTopCard && (
                              <div 
                                style={{ 
                                  backfaceVisibility: 'hidden', 
                                  transform: 'rotateY(180deg)',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                }}
                                className="bg-[#fefcf7] p-3 sm:p-5 rounded-r-[16px] sm:rounded-r-[22px] rounded-l-[4px] flex flex-col justify-between border-2 border-amber-900/10 shadow-inner"
                              >
                                <div 
                                  className="flex-grow overflow-y-auto space-y-2 sm:space-y-4"
                                  style={{
                                    backgroundImage: 'linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0) 95%, #cbd5e1 95%, #cbd5e1 100%)',
                                    backgroundSize: '100% 20px sm:100% 24px',
                                    lineHeight: '20px sm:24px',
                                    paddingLeft: '16px sm:24px',
                                    borderLeft: '1.5px solid #f87171',
                                  }}
                                >
                                  <Typography className="font-mono text-[7px] sm:text-[9px] uppercase tracking-wider text-amber-600 font-bold leading-none border-b border-amber-500/10 pb-1 mt-1">
                                    Top Memory Journal
                                  </Typography>
                                  
                                  <div className="space-y-2 pt-1 sm:pt-2">
                                    {topPhoto.captions.length === 0 ? (
                                      <Typography className="text-slate-400 font-mono italic text-[9px] sm:text-xs leading-normal">
                                        No stories recorded yet.
                                      </Typography>
                                    ) : (
                                      topPhoto.captions.map((cap, i) => (
                                        <div key={i} className="leading-tight pb-0.5">
                                          <Typography className="text-amber-950 font-mono text-[10px] sm:text-xs italic font-bold">
                                            "{cap.text}"
                                          </Typography>
                                          <Typography className="text-[7px] sm:text-[8px] font-mono text-amber-800/40 uppercase">
                                            {new Date(cap.createdAt).toLocaleDateString()}
                                          </Typography>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-amber-900/5 mt-1 sm:mt-2 space-y-1.5">
                                  <textarea 
                                    placeholder="Jot down details..."
                                    value={memos[topPhoto._id] || ''}
                                    onChange={(e) => setMemos(prev => ({ ...prev, [topPhoto._id]: e.target.value }))}
                                    className="w-full text-[10px] sm:text-xs p-1.5 sm:p-2.5 bg-amber-500/5 border border-amber-900/10 rounded-lg sm:rounded-xl focus:outline-none focus:border-amber-600 font-mono resize-none text-amber-950"
                                    rows={2}
                                  />
                                  <Button
                                    fullWidth
                                    variant="contained"
                                    size="small"
                                    disabled={isSavingMemo[topPhoto._id] || !memos[topPhoto._id]?.trim()}
                                    onClick={() => handleSaveMemo(topPhoto._id)}
                                    className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[8px] sm:text-[10px] uppercase py-1 sm:py-1.5 shadow"
                                  >
                                    {isSavingMemo[topPhoto._id] ? 'Saving...' : 'Save'}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Box>
      ))}
    </Box>
  );
}
