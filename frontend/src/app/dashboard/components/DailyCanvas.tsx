'use client';

import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Calendar, Sparkles } from 'lucide-react';

interface Photo {
  _id: string;
  url: string;
  captions: { text: string; authorId: string; createdAt: string }[];
  takenAt: string;
}

interface DailyCanvasProps {
  photos: Photo[];
  nostalgiaMode: boolean;
}

export default function DailyCanvas({ photos, nostalgiaMode }: DailyCanvasProps) {
  // Find photos from "this week in past years", or fallback to latest photos if none match
  const canvasPhotos = React.useMemo(() => {
    if (photos.length === 0) return [];
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    
    // Try to find photos within 5 days of current date in any past year
    const matched = photos.filter(p => {
      const pDate = new Date(p.takenAt);
      const diffTime = Math.abs(now.getTime() - pDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Same month or close date
      return Math.abs(pDate.getMonth() - currentMonth) <= 1 && Math.abs(pDate.getDate() - currentDay) <= 7;
    });

    if (matched.length > 0) return matched.slice(0, 3);
    return photos.slice(0, 3); // Fallback
  }, [photos]);

  if (canvasPhotos.length === 0) {
    return (
      <Box className="w-full h-[220px] rounded-[32px] bg-white/30 border border-dashed border-amber-200/50 flex flex-col items-center justify-center text-center p-6 backdrop-blur-md">
        <Sparkles size={40} className="text-amber-500/40 mb-3" />
        <Typography variant="h6" className="font-display font-bold text-amber-950/70">
          Your Canvas is Waiting
        </Typography>
        <Typography className="text-amber-900/50 text-sm max-w-sm mt-1">
          Upload some photos below to see them compiled into your daily canvas collage.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="relative w-full h-full rounded-[40px] overflow-hidden shadow-xl border border-white/20 glass-card p-6 flex flex-col gap-6 items-center justify-center">
      {/* Background ambient lighting */}
      <div className={`absolute inset-0 transition-colors duration-700 ${nostalgiaMode ? 'bg-[#f4efe2]/40' : 'bg-gradient-to-br from-yellow-100/20 to-amber-100/20'}`} />
      
      {/* Top text */}
      <div className="w-full relative z-10 space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-800 text-xs font-bold uppercase tracking-wider mx-auto">
          <Calendar size={14} /> The Daily Canvas
        </div>
        <Typography variant="h3" className="font-display font-black text-amber-950 leading-tight text-2xl sm:text-3xl">
          Nostalgia <br />
          <span className="text-gradient">Unlocked</span>
        </Typography>
        <Typography className="text-amber-900/60 font-medium text-sm">
          Here is a snippet of where your story was during this time of the year in the past.
        </Typography>
      </div>

      {/* Bottom Collage Layer (Living Photo Effect) */}
      <div className="w-full h-[220px] sm:h-[260px] relative flex items-center justify-center z-10 mt-2">
        {canvasPhotos.map((photo, index) => {
          // Unique rotations/translations for the layered collage look
          const positions = [
            { rotate: -6, z: 10, scale: 0.9, x: '-25%', y: '-5%' },
            { rotate: 8, z: 20, scale: 0.95, x: '25%', y: '5%' },
            { rotate: -2, z: 30, scale: 1.0, x: '0%', y: '0%' }
          ];
          const pos = positions[index % positions.length];

          return (
            <motion.div
              key={photo._id}
              initial={{ opacity: 0, scale: 0.8, rotate: pos.rotate }}
              animate={{ 
                opacity: 1, 
                scale: [pos.scale, pos.scale * 1.02, pos.scale],
                rotate: [pos.rotate, pos.rotate + 1, pos.rotate - 1, pos.rotate],
                x: pos.x,
                y: pos.y
              }}
              transition={{
                opacity: { duration: 0.6, delay: index * 0.15 },
                scale: { repeat: Infinity, duration: 6 + index * 2, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 8 + index * 3, ease: "easeInOut" }
              }}
              style={{ zIndex: pos.z }}
              className="absolute w-[180px] sm:w-[220px] aspect-[4/3] bg-white p-3 pb-8 rounded-2xl shadow-2xl border border-yellow-50 flex flex-col justify-between"
            >
              <Box className="w-full h-full bg-slate-100 rounded-lg overflow-hidden relative">
                <img 
                  src={photo.url} 
                  alt="Scrapbook Memory" 
                  className="w-full h-full object-cover"
                />
              </Box>
              <Typography className="font-display font-bold text-amber-950 mt-2 text-center text-xs italic truncate">
                {photo.captions[0]?.text || new Date(photo.takenAt).toLocaleDateString()}
              </Typography>
            </motion.div>
          );
        })}
      </div>
    </Box>
  );
}
