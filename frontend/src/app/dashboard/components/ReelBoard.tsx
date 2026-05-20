'use client';

import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Plus, Calendar, Sparkles } from 'lucide-react';

interface Photo {
  _id: string;
  url: string;
  captions: { text: string; authorId: string; createdAt: string }[];
  takenAt: string;
}

interface ReelBoardProps {
  photos: Photo[];
  onAddClick: () => void;
  onFilterByDate?: (month: number, year: number | null) => void;
  nostalgiaMode: boolean;
}

interface ReelItem {
  year: number;
  label: string;
  thumbnail: string;
  photoCount: number;
}

export default function ReelBoard({ 
  photos, 
  onAddClick, 
  onFilterByDate, 
  nostalgiaMode 
}: ReelBoardProps) {
  
  // Calculate "On This Day" logs dynamically based on the current month across past years
  const reelItems = React.useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthLabel = monthNames[currentMonth];

    // Find photos from the current month in previous years
    const historyMap: { [key: number]: Photo[] } = {};
    photos.forEach(photo => {
      const pDate = new Date(photo.takenAt);
      const pMonth = pDate.getMonth();
      const pYear = pDate.getFullYear();

      if (pMonth === currentMonth && pYear < currentYear) {
        if (!historyMap[pYear]) historyMap[pYear] = [];
        historyMap[pYear].push(photo);
      }
    });

    const items: ReelItem[] = Object.keys(historyMap)
      .map(Number)
      .sort((a, b) => b - a)
      .map(year => ({
        year,
        label: `${monthLabel} ${year}`,
        thumbnail: historyMap[year][0].url,
        photoCount: historyMap[year].length
      }));

    // If we have no historic photos, populate with a couple of nostalgic placeholders to illustrate the layout
    if (items.length === 0) {
      const mockYears = [currentYear - 1, currentYear - 2, currentYear - 4];
      mockYears.forEach((year, index) => {
        // Find any photo to use as placeholder thumbnail, or use a beautiful warm placeholder pattern
        const thumb = photos[index % photos.length]?.url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=150';
        items.push({
          year,
          label: `${monthLabel} ${year}`,
          thumbnail: thumb,
          photoCount: 0
        });
      });
    }

    return items;
  }, [photos]);

  return (
    <Box className="w-full space-y-3 select-none">
      {/* Title label */}
      <Box className="flex justify-between items-center px-1">
        <Typography className="font-display font-extrabold text-[11px] tracking-[0.15em] text-amber-600/70 uppercase flex items-center gap-1.5">
          <Calendar size={12} className="text-amber-500" /> Section 1: The Reel Board
        </Typography>
        <Typography className="font-mono text-[9px] text-amber-900/30 uppercase">
          On This Day Logs
        </Typography>
      </Box>

      {/* Horizontal Scrollable Reel */}
      <div className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1 scrollbar-hide mask-image-horizontal">
        
        {/* First Bubble: Add to today's Scrap */}
        <motion.div 
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAddClick}
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
                + Add Today's
              </Typography>
              <Typography className="text-[8px] font-mono tracking-wider text-amber-600 font-bold uppercase">
                Scrap
              </Typography>
            </div>
          </Box>
        </motion.div>

        {/* History Bubbles */}
        {reelItems.map((item, idx) => (
          <motion.div 
            key={`${item.year}-${idx}`}
            whileHover={{ scale: 1.03, y: -4, rotate: (idx % 2 === 0 ? 1.5 : -1.5) }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onFilterByDate?.(new Date().getMonth(), item.year)}
            className="flex-shrink-0 cursor-pointer"
          >
            <Box className="w-28 h-36 bg-white rounded-2xl shadow-md border border-amber-100 p-2 pb-3.5 flex flex-col justify-between relative overflow-hidden group">
              {/* Thumbnail window */}
              <div className="w-full h-24 rounded-lg overflow-hidden relative bg-amber-50">
                <img 
                  src={item.thumbnail} 
                  alt={item.label}
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                    nostalgiaMode ? 'sepia-[0.15] contrast-95' : ''
                  }`}
                />
                
                {/* Vintage overlay glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                
                {/* Count indicator */}
                {item.photoCount > 0 && (
                  <span className="absolute bottom-1.5 right-1.5 bg-amber-950/80 backdrop-blur-sm text-yellow-50 text-[7px] font-black tracking-widest px-1.5 py-0.5 rounded-full uppercase">
                    {item.photoCount} Log{item.photoCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Polaroid-style signature text label */}
              <div className="text-center pt-1.5 flex flex-col items-center justify-center">
                <Typography className={`font-display font-black italic text-[11px] leading-none ${
                  nostalgiaMode ? 'text-[#3c2f1f]' : 'text-amber-950'
                }`}>
                  {item.label}
                </Typography>
                <Typography className="text-[7px] font-mono font-bold tracking-[0.1em] text-amber-500 uppercase mt-0.5">
                  Archives
                </Typography>
              </div>

              {/* Stamp aesthetic line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-500/20" />
            </Box>
          </motion.div>
        ))}

      </div>
    </Box>
  );
}
