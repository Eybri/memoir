'use client';

import * as React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { Music, MapPin, Compass, Play, Disc } from 'lucide-react';

interface Photo {
  _id: string;
  url: string;
  captions: { text: string; authorId: string; createdAt: string }[];
  takenAt: string;
}

interface SensoryCornerProps {
  photos: Photo[];
  nostalgiaMode: boolean;
}

export default function SensoryCorner({ photos, nostalgiaMode }: SensoryCornerProps) {
  // Determine visible photo month
  const activeMonthIndex = React.useMemo(() => {
    if (photos.length === 0) return 0;
    return new Date(photos[0].takenAt).getMonth(); // 0-11
  }, [photos]);

  // Mock tracks matching seasons
  const soundscape = React.useMemo(() => {
    const playlists = [
      { track: "Snowman", artist: "Sia", album: "Everyday Is Christmas" }, // Jan
      { track: "Winter Winds", artist: "Mumford & Sons", album: "Sigh No More" }, // Feb
      { track: "Spring Affair", artist: "Donna Summer", album: "Four Seasons of Love" }, // Mar
      { track: "April Showers", artist: "Proleter", album: "Tribute to Jazz" }, // Apr
      { track: "Garden Song", artist: "Phoebe Bridgers", album: "Punisher" }, // May
      { track: "Cruel Summer", artist: "Taylor Swift", album: "Lover" }, // Jun
      { track: "Sunflower", artist: "Post Malone & Swae Lee", album: "Spider-Man" }, // Jul
      { track: "Summer Nostalgia", artist: "Lofi Fruits", album: "Chill Beats" }, // Aug
      { track: "Autumn Leaves", artist: "Ed Sheeran", album: "Autumn Variations" }, // Sep
      { track: "Sweater Weather", artist: "The Neighbourhood", album: "I Love You." }, // Oct
      { track: "Harvest Moon", artist: "Neil Young", album: "Harvest Moon" }, // Nov
      { track: "Last Christmas", artist: "Wham!", album: "Music from the Edge" } // Dec
    ];

    return playlists[activeMonthIndex] || playlists[0];
  }, [activeMonthIndex]);

  return (
    <Box className="space-y-6">
      {/* Soundscape Widget */}
      <Paper 
        elevation={0}
        className="glass-card p-6 rounded-[32px] border border-yellow-100 flex flex-col gap-4 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full filter blur-xl" />
        
        <div className="flex justify-between items-center relative z-10">
          <Typography className="font-display font-extrabold text-amber-950 text-sm tracking-wider uppercase flex items-center gap-2">
            <Music size={16} className="text-amber-600 animate-bounce" /> Soundscape
          </Typography>
          <Typography variant="caption" className="text-amber-900/40 font-bold uppercase tracking-widest text-[9px]">
            Nostalgia Tuner
          </Typography>
        </div>

        <div className="flex items-center gap-4 relative z-10 mt-2">
          {/* Animated vinyl disc */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-br from-amber-950 via-slate-900 to-amber-950 rounded-full flex items-center justify-center shadow-lg border border-amber-900/30 relative"
          >
            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center border border-amber-950/20">
              <Disc size={10} className="text-amber-900" />
            </div>
            <div className="absolute w-2 h-2 bg-white rounded-full top-1 right-1 border shadow" />
          </motion.div>

          <div className="flex-grow min-w-0">
            <Typography variant="body1" className="font-display font-bold text-amber-950 truncate leading-snug">
              {soundscape.track}
            </Typography>
            <Typography className="text-amber-900/50 text-xs truncate font-medium">
              {soundscape.artist} — {soundscape.album}
            </Typography>
            <div className="flex items-center gap-1.5 mt-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              <Typography variant="caption" className="text-amber-600 font-bold text-[9px] uppercase tracking-wider">
                Playing from memory
              </Typography>
            </div>
          </div>
        </div>
      </Paper>

      {/* Stylized Geographic Map */}
      <Paper 
        elevation={0}
        className="glass-card p-6 rounded-[32px] border border-yellow-100 flex flex-col gap-4 relative overflow-hidden"
      >
        <div className="flex justify-between items-center">
          <Typography className="font-display font-extrabold text-amber-950 text-sm tracking-wider uppercase flex items-center gap-2">
            <Compass size={16} className="text-amber-600" /> Memory Map
          </Typography>
          <Typography variant="caption" className="text-amber-900/40 font-bold uppercase tracking-widest text-[9px]">
            Visual Atlas
          </Typography>
        </div>

        {/* Custom SVG Map snippet */}
        <Box className="w-full aspect-[4/3] rounded-2xl bg-amber-50/60 overflow-hidden relative border border-amber-100">
          <svg viewBox="0 0 200 150" className={`w-full h-full opacity-40 transition-filter duration-700 ${nostalgiaMode ? 'sepia contrast-125' : ''}`}>
            {/* Outline lands */}
            <path d="M20,60 Q40,30 80,45 T140,20 T180,60 T140,110 T80,130 Z" fill="none" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="4 2" />
            <path d="M50,90 Q80,70 110,95 T170,120" fill="none" stroke="#d97706" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx="65" cy="40" r="1.5" fill="#ca8a04" />
            <circle cx="155" cy="35" r="1.5" fill="#ca8a04" />
          </svg>

          {/* Glowing location indicators */}
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-[40%] left-[30%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          >
            <div className="w-3.5 h-3.5 bg-amber-600 rounded-full border border-white flex items-center justify-center shadow-lg relative">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              {/* Tooltip */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-amber-950 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                Beach House
              </div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.7 }}
            className="absolute top-[60%] left-[65%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          >
            <div className="w-3.5 h-3.5 bg-amber-600 rounded-full border border-white flex items-center justify-center shadow-lg relative">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              {/* Tooltip */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-amber-950 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                Mountain Trails
              </div>
            </div>
          </motion.div>

          <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-md rounded-lg px-2.5 py-1 flex items-center gap-1.5 border border-amber-100/50 shadow-sm">
            <MapPin size={10} className="text-amber-600" />
            <Typography variant="caption" className="text-amber-950 font-bold text-[9px] uppercase tracking-wider">
              2 Locations
            </Typography>
          </div>
        </Box>
      </Paper>
    </Box>
  );
}
