'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Camera, MessageSquare, CalendarDays, ImageIcon, Play, Pause } from 'lucide-react';

interface Photo {
  _id: string;
  url: string;
  captions: { text: string; authorId: string; createdAt: string }[];
  takenAt: string;
}

interface AlbumFilmStripProps {
  photos: Photo[];
  nostalgiaMode: boolean;
}

export default function AlbumFilmStrip({ photos, nostalgiaMode }: AlbumFilmStripProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (photos.length === 0) return null;

  // Compute stats
  const sorted = [...photos].sort(
    (a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime()
  );
  const oldest = sorted[0];
  const newest = sorted[sorted.length - 1];

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
  };

  const dateSpan =
    oldest._id === newest._id
      ? formatDate(oldest.takenAt)
      : `${formatDate(oldest.takenAt)} - ${formatDate(newest.takenAt)}`;

  const stats = [
    { icon: <Camera size={16} />, label: 'Memories', value: photos.length },
    { icon: <CalendarDays size={16} />, label: 'Span', value: dateSpan },
  ];

  // Duplicate photos for infinite scroll illusion
  const stripPhotos = photos.length >= 5 ? [...photos, ...photos] : [...photos, ...photos, ...photos, ...photos];

  return (
    <Box
      className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden border-y border-neutral-900 bg-black"
      sx={{
        boxShadow: '0 24px 60px -10px rgba(0,0,0,0.8)',
      }}
    >
      {/* Subtle ambient reflection */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.02) 0%, transparent 70%)',
        }}
      />

      {/* Top label & Navigation Controls */}
      <div className="relative z-10 px-6 sm:px-12 pt-5 pb-2 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <ImageIcon size={14} className="text-white/60" />
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/50 font-bold">
            Album Reel
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] sm:text-[11px] uppercase tracking-widest text-white/30 font-bold mr-4 hidden sm:block">
            {dateSpan}
          </span>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-all active:scale-95"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>
        </div>
      </div>

      {/* ── Film strip ── */}
      <div className="relative overflow-hidden py-2 group">
        <style>{`
          @keyframes smoothFilmScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .film-track {
            display: flex;
            width: max-content;
            animation: smoothFilmScroll ${Math.max(stripPhotos.length * 2.5, 20)}s linear infinite;
          }
          .film-track.paused {
            animation-play-state: paused;
          }
        `}</style>
        
        {/* Film sprocket holes top */}
        <div className="absolute top-0 left-0 right-0 h-5 flex items-center gap-[18px] px-4 pointer-events-none z-20 overflow-hidden">
          {Array.from({ length: 120 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-3 h-2.5 rounded-[3px] bg-[#fdfbf7] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]"
            />
          ))}
        </div>

        {/* Scrollable frozen strip */}
        <div className="w-full overflow-hidden py-5">
          <div className={`film-track px-4 gap-2 ${!isPlaying ? 'paused' : ''}`}>
            {stripPhotos.map((photo, i) => (
              <motion.div
                key={`${photo._id}-${i}`}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className="flex-shrink-0 relative"
                style={{
                  width: 140,
                  height: 100,
                  background: '#0a0500',
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: '2px solid rgba(255,200,80,0.12)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                }}
              >
                <img
                  src={photo.url}
                  alt="Film frame"
                  className="w-full h-full object-cover"
                  style={{
                    filter: nostalgiaMode ? 'sepia(0.3) contrast(0.95) brightness(0.85)' : 'brightness(0.88)',
                  }}
                  draggable={false}
                />
                {/* Film frame overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: 'inset 0 0 0 1.5px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,0,0,0.3)',
                  }}
                />
                {/* Frame number */}
                <span
                  className="absolute bottom-1 right-1.5 font-mono text-[8px] sm:text-[10px] text-amber-400/50 font-bold select-none"
                >
                  {String((i % photos.length) + 1).padStart(2, '0')}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Film sprocket holes bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-5 flex items-center gap-[18px] px-4 pointer-events-none z-20 overflow-hidden">
          {Array.from({ length: 120 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-3 h-2.5 rounded-[3px] bg-[#fdfbf7] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]"
            />
          ))}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="relative z-10 px-6 sm:px-12 pb-5 pt-1 flex flex-wrap gap-6 sm:gap-10 border-t border-white/10 max-w-7xl mx-auto">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="text-white/40">{s.icon}</span>
            <div>
              <div className="font-display font-black text-white/90 text-sm sm:text-base md:text-lg sm:text-lg leading-none">
                {s.value}
              </div>
              <div className="font-mono text-[9px] sm:text-[11px] uppercase tracking-widest text-white/40 font-bold mt-0.5">
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
}
