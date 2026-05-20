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
}

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
  onAddCaption
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

          {/* Staggered Masonry Layout */}
          <div className="columns-1 sm:columns-2 xl:columns-3 gap-6">
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
                    className="break-inside-avoid mb-8 relative"
                    style={{ perspective: 1000 }}
                  >
                    {/* Washi Tape overlay */}
                    <div 
                      className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-20 h-5 rotate-[-2deg] z-30 select-none pointer-events-none"
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
                      className={`absolute right-[-4px] top-[40px] z-40 p-2.5 rounded-r-xl border shadow-md flex items-center justify-center transition-all ${
                        isFlipped 
                          ? 'bg-amber-800 text-yellow-50 border-amber-900 right-[-8px]' 
                          : 'bg-white hover:bg-amber-50 text-amber-850 hover:right-[-6px] border-amber-100'
                      }`}
                      title={isFlipped ? "View Photo" : "Write Journal Memo"}
                    >
                      {isFlipped ? <RotateCcw size={13} /> : <BookOpen size={13} />}
                    </button>

                    {/* 3D Card Structure */}
                    <motion.div
                      animate={{ rotateY: isFlipped ? 180 : 0, rotate: baseTilt }}
                      transition={{ type: 'spring', stiffness: 100, damping: 13 }}
                      style={{ transformStyle: 'preserve-3d' }}
                      className="w-full relative shadow-lg hover:shadow-yellow-200/50 transition-shadow duration-500 bg-white p-3 pb-5 border border-yellow-100 rounded-[28px]"
                    >
                      {/* FRONT FACE */}
                      <div 
                        style={{ backfaceVisibility: 'hidden' }}
                        className="w-full"
                      >
                        <div 
                          className="aspect-[4/5] rounded-[20px] overflow-hidden relative cursor-pointer"
                          onClick={() => onSelectPhoto(photo)}
                        >
                          <img 
                            src={photo.url} 
                            alt="Scrapbook Memory" 
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                          />
                        </div>
                        
                        {/* Polaroid margin info */}
                        <Box className="pt-4 px-2 flex justify-between items-center select-none">
                          <div className="truncate pr-2">
                            <Typography className="text-amber-950 font-bold text-sm italic truncate">
                              {photo.captions[0]?.text ? `"${photo.captions[0].text}"` : 'Untitled Memory'}
                            </Typography>
                            <Typography className="text-amber-800/40 text-xs font-bold mt-0.5 font-mono">
                              {new Date(photo.takenAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Typography>
                          </div>
                          <ChevronRight size={18} className="text-amber-600 opacity-60" />
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
                        className="bg-[#fefcf7] p-5 rounded-[28px] flex flex-col justify-between border-2 border-amber-900/10 shadow-inner"
                      >
                        {/* Ruled Notebook Paper Styling */}
                        <div 
                          className="flex-grow overflow-y-auto space-y-4"
                          style={{
                            backgroundImage: 'linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0) 95%, #cbd5e1 95%, #cbd5e1 100%)',
                            backgroundSize: '100% 24px',
                            lineHeight: '24px',
                            paddingLeft: '24px',
                            borderLeft: '1.5px solid #f87171', // Red notebook margin line
                          }}
                        >
                          <Typography className="font-mono text-[9px] uppercase tracking-wider text-amber-600 font-bold leading-none border-b border-amber-500/10 pb-1 mt-1">
                            Memory Journal Back
                          </Typography>
                          
                          {/* Past Memos */}
                          <div className="space-y-3 pt-2">
                            {photo.captions.length === 0 ? (
                              <Typography className="text-slate-400 font-mono italic text-xs leading-normal">
                                No stories recorded on the back of this print yet.
                              </Typography>
                            ) : (
                              photo.captions.map((cap, i) => (
                                <div key={i} className="leading-tight pb-1">
                                  <Typography className="text-amber-950 font-mono text-xs italic font-bold">
                                    "{cap.text}"
                                  </Typography>
                                  <Typography className="text-[8px] font-mono text-amber-800/40 uppercase">
                                    {new Date(cap.createdAt).toLocaleDateString()}
                                  </Typography>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Quick Add Form */}
                        <div className="pt-3 border-t border-amber-900/5 mt-2 space-y-2">
                          <textarea 
                            placeholder="Jot down details..."
                            value={memos[photo._id] || ''}
                            onChange={(e) => setMemos(prev => ({ ...prev, [photo._id]: e.target.value }))}
                            className="w-full text-xs p-2.5 bg-amber-500/5 border border-amber-900/10 rounded-xl focus:outline-none focus:border-amber-600 font-mono resize-none text-amber-950"
                            rows={2}
                          />
                          <Button
                            fullWidth
                            variant="contained"
                            size="small"
                            disabled={isSavingMemo[photo._id] || !memos[photo._id]?.trim()}
                            onClick={() => handleSaveMemo(photo._id)}
                            className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] uppercase py-1.5 shadow"
                          >
                            {isSavingMemo[photo._id] ? 'Saving...' : 'Save Memo'}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              }

              // RENDER PHOTO STACK (2+ items) - Swipe Stacker
              return (
                <div 
                  key={pileId} 
                  className="break-inside-avoid mb-8 relative"
                  style={{ perspective: 1000 }}
                  onMouseEnter={() => startFlipbook(pileId)}
                  onMouseLeave={stopFlipbook}
                >
                  {/* Washi Tape overlay */}
                  <div 
                    className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-20 h-5 rotate-[-2deg] z-30 select-none pointer-events-none"
                    style={{
                      background: 'rgba(252, 211, 77, 0.4)',
                      borderLeft: '2px dashed rgba(217, 119, 6, 0.3)',
                      borderRight: '2px dashed rgba(217, 119, 6, 0.3)',
                      backdropFilter: 'blur(1.5px)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  />

                  {/* Pull-out Journal tab for stack top */}
                  <button 
                    onClick={() => toggleFlip(topPhoto._id)}
                    className={`absolute right-[-4px] top-[40px] z-40 p-2.5 rounded-r-xl border shadow-md flex items-center justify-center transition-all ${
                      isFlipped 
                        ? 'bg-amber-800 text-yellow-50 border-amber-900 right-[-8px]' 
                        : 'bg-white hover:bg-amber-50 text-amber-850 hover:right-[-6px] border-amber-100'
                    }`}
                    title={isFlipped ? "View Stack" : "Write Journal Memo on Top"}
                  >
                    {isFlipped ? <RotateCcw size={13} /> : <BookOpen size={13} />}
                  </button>

                  <div 
                    className="relative w-full h-[340px]"
                    style={{ transform: `rotate(${baseTilt}deg)` }}
                  >
                    {/* Render stack layers */}
                    {orderedPile.slice(0, 3).map((photo, i) => {
                      const isTopCard = i === 0;
                      
                      // Calculate layered offsets (when stack is not hovered)
                      let rotation = 0;
                      let xOffset = 0;
                      let yOffset = 0;
                      let scale = 1;

                      if (!isHovered) {
                        if (i === 1) { rotation = 6; xOffset = 8; yOffset = 4; scale = 0.96; }
                        else if (i === 2) { rotation = -8; xOffset = -10; yOffset = 8; scale = 0.92; }
                      } else {
                        // Spread offset on hover
                        if (i === 1) { rotation = 12; xOffset = 30; yOffset = -5; scale = 0.98; }
                        else if (i === 2) { rotation = -14; xOffset = -30; yOffset = 5; scale = 0.95; }
                      }

                      // If top card is flipped, we disable drag and offsets
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
                            scale: 1,
                            zIndex: 20
                          } : { 
                            rotateY: 0,
                            rotate: rotation,
                            x: xOffset,
                            y: yOffset,
                            scale: scale,
                            zIndex: 10 - i
                          }}
                          transition={{ type: 'spring', stiffness: 110, damping: 14 }}
                          style={{ transformStyle: 'preserve-3d' }}
                          className="absolute w-[88%] h-[92%] bg-white p-3 pb-8 rounded-[28px] shadow-xl border border-yellow-100 flex flex-col justify-between cursor-grab active:cursor-grabbing"
                        >
                          {/* FRONT FACE */}
                          <div 
                            style={{ backfaceVisibility: 'hidden' }}
                            className="w-full h-full flex flex-col justify-between"
                          >
                            <div 
                              className="w-full h-[82%] rounded-[20px] overflow-hidden relative"
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
                                <div className="absolute top-3 right-3 bg-amber-950/85 backdrop-blur-sm text-yellow-50 text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow select-none">
                                  <Sparkles size={8} className="text-yellow-400" /> {pile.length} Stacking
                                </div>
                              )}
                            </div>

                            <Box className="pt-2 px-1 truncate select-none">
                              <Typography className="text-amber-950 font-bold text-xs italic truncate">
                                {isTopCard 
                                  ? (topPhoto.captions[0]?.text ? `"${topPhoto.captions[0].text}"` : 'Stacked Collection') 
                                  : (photo.captions[0]?.text ? `"${photo.captions[0].text}"` : 'Stacked Photo')}
                              </Typography>
                              <Typography className="text-amber-800/40 text-[9px] font-bold mt-0.5 font-mono">
                                {new Date(isTopCard ? topPhoto.takenAt : photo.takenAt).toLocaleDateString()}
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
                              className="bg-[#fefcf7] p-5 rounded-[28px] flex flex-col justify-between border-2 border-amber-900/10 shadow-inner"
                            >
                              <div 
                                className="flex-grow overflow-y-auto space-y-4"
                                style={{
                                  backgroundImage: 'linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0) 95%, #cbd5e1 95%, #cbd5e1 100%)',
                                  backgroundSize: '100% 24px',
                                  lineHeight: '24px',
                                  paddingLeft: '24px',
                                  borderLeft: '1.5px solid #f87171',
                                }}
                              >
                                <Typography className="font-mono text-[9px] uppercase tracking-wider text-amber-600 font-bold leading-none border-b border-amber-500/10 pb-1 mt-1">
                                  Top Memory Journal
                                </Typography>
                                
                                <div className="space-y-3 pt-2">
                                  {topPhoto.captions.length === 0 ? (
                                    <Typography className="text-slate-400 font-mono italic text-xs leading-normal">
                                      No stories recorded on this print yet.
                                    </Typography>
                                  ) : (
                                    topPhoto.captions.map((cap, i) => (
                                      <div key={i} className="leading-tight pb-1">
                                        <Typography className="text-amber-950 font-mono text-xs italic font-bold">
                                          "{cap.text}"
                                        </Typography>
                                        <Typography className="text-[8px] font-mono text-amber-800/40 uppercase">
                                          {new Date(cap.createdAt).toLocaleDateString()}
                                        </Typography>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              <div className="pt-3 border-t border-amber-900/5 mt-2 space-y-2">
                                <textarea 
                                  placeholder="Jot down details..."
                                  value={memos[topPhoto._id] || ''}
                                  onChange={(e) => setMemos(prev => ({ ...prev, [topPhoto._id]: e.target.value }))}
                                  className="w-full text-xs p-2.5 bg-amber-500/5 border border-amber-900/10 rounded-xl focus:outline-none focus:border-amber-600 font-mono resize-none text-amber-950"
                                  rows={2}
                                />
                                <Button
                                  fullWidth
                                  variant="contained"
                                  size="small"
                                  disabled={isSavingMemo[topPhoto._id] || !memos[topPhoto._id]?.trim()}
                                  onClick={() => handleSaveMemo(topPhoto._id)}
                                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] uppercase py-1.5 shadow"
                                >
                                  {isSavingMemo[topPhoto._id] ? 'Saving...' : 'Save Memo'}
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
        </Box>
      ))}
    </Box>
  );
}
