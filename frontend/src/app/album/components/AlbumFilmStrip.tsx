'use client';

import React, { useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Camera, MessageSquare, CalendarDays, ImageIcon } from 'lucide-react';

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
  const stripRef = useRef<HTMLDivElement>(null);

  if (photos.length === 0) return null;

  // Compute stats
  const sorted = [...photos].sort(
    (a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime()
  );
  const oldest = sorted[0];
  const newest = sorted[sorted.length - 1];
  const totalCaptions = photos.reduce((acc, p) => acc + p.captions.length, 0);

  const dateSpan =
    oldest._id === newest._id
      ? new Date(oldest.takenAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      : `${new Date(oldest.takenAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} — ${new Date(newest.takenAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`;

  // Film-strip photos: cycle through all, repeat for infinite feel
  const stripPhotos = photos.length >= 5 ? photos : [...photos, ...photos, ...photos].slice(0, Math.max(photos.length * 3, 8));

  const stats = [
    { icon: <Camera size={16} />, label: 'Memories', value: photos.length },
    { icon: <MessageSquare size={16} />, label: 'Captions', value: totalCaptions },
    { icon: <CalendarDays size={16} />, label: 'Span', value: dateSpan },
  ];

  return (
    <Box
      className="relative w-full rounded-1xl overflow-hidden"
      sx={{
        background: nostalgiaMode
          ? 'linear-gradient(135deg, #2a1a0e 0%, #1a0f07 100%)'
          : 'linear-gradient(135deg, #1c1008 0%, #0f0803 100%)',
        border: '1px solid rgba(255,200,80,0.08)',
        boxShadow: '0 24px 60px -10px rgba(0,0,0,0.6)',
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(251,191,36,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Top label */}
      <div className="relative z-10 px-6 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon size={14} className="text-amber-400/70" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400/60 font-bold">
            Album Reel
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest text-amber-900/40 font-bold">
          {dateSpan}
        </span>
      </div>

      {/* ── Film strip ── */}
      <div className="relative overflow-hidden py-2" ref={stripRef}>
        {/* Film sprocket holes top */}
        <div className="absolute top-0 left-0 right-0 h-5 flex items-center gap-[18px] px-4 pointer-events-none z-20">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-3 h-2.5 rounded-[3px] bg-amber-950/60 border border-amber-900/30"
            />
          ))}
        </div>

        {/* Scrolling strip */}
        <motion.div
          className="flex gap-2 px-4 py-5"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: Math.max(stripPhotos.length * 3.5, 18),
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ width: 'max-content' }}
        >
          {/* Duplicate for seamless loop */}
          {[...stripPhotos, ...stripPhotos].map((photo, i) => (
            <motion.div
              key={`${photo._id}-${i}`}
              whileHover={{ scale: 1.08, zIndex: 10 }}
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
                className="absolute bottom-1 right-1.5 font-mono text-[8px] text-amber-400/50 font-bold select-none"
              >
                {String(i % stripPhotos.length + 1).padStart(2, '0')}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Film sprocket holes bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-5 flex items-center gap-[18px] px-4 pointer-events-none z-20">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-3 h-2.5 rounded-[3px] bg-amber-950/60 border border-amber-900/30"
            />
          ))}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="relative z-10 px-6 pb-5 pt-1 flex flex-wrap gap-6 sm:gap-10 border-t border-amber-900/20">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-2.5"
          >
            <span className="text-amber-500/70">{s.icon}</span>
            <div>
              <div className="font-display font-black text-amber-100 text-base sm:text-lg leading-none">
                {s.value}
              </div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-amber-700/60 font-bold mt-0.5">
                {s.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Box>
  );
}
