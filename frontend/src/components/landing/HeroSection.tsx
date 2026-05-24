'use client';

import * as React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack, 
} from '@mui/material';
import { motion } from 'framer-motion';
import { Camera, Lock, Calendar, Star, ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <Container maxWidth="lg" className="pt-16 pb-24 paper-grain relative">
      {/* Background physical stamp effect */}
      <div className="absolute top-10 right-1/4 opacity-15 pointer-events-none select-none hidden md:block">
        <div className="border-4 border-double border-red-800 rounded-full w-32 h-32 flex items-center justify-center rotate-12 text-red-800 font-mono text-lg font-bold flex-col">
          <span>MEMOIR</span>
          <span className="text-xs">APPROVED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center">
        {/* Left Column: Heading and description */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          {/* Handwritten little note */}
          <div className="inline-block bg-[#fef9c3] px-3 py-1 border border-yellow-200 rounded-md font-handwritten text-amber-800 text-lg md:text-xl rotate-[-2deg] mb-4 shadow-sm">
            📔 Keep your life's journal safe
          </div>

          <Typography 
            variant="h1" 
            className="font-display font-extrabold text-amber-950 mb-6 text-4xl sm:text-5xl md:text-6xl md:text-7xl leading-[1.05]"
          >
            Preserve Your <br className="hidden sm:inline" />
            <span className="relative inline-block">
              <span className="text-gradient">Memories</span>
              {/* Hand-drawn underline SVG */}
              <svg className="absolute left-0 bottom-[-8px] w-full h-3 text-amber-500/60" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span> Today
          </Typography>

          <Typography 
            variant="body1" 
            className="text-amber-900/75 mb-8 leading-relaxed max-w-lg text-base sm:text-lg md:text-xl font-medium"
          >
            Store your family photo albums, vintage milestones, and secret journals in an encrypted personal vault. Think of it as a virtual scrapbook, crafted for the stories you never want to fade.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} className="pt-2">
            <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
              <Button 
                variant="contained" 
                size="large"
                disableElevation
                className="bg-amber-700 hover:bg-amber-800 text-white rounded-full px-8 py-4 shadow-lg shadow-amber-700/20 text-base md:text-lg font-bold transition-all hover:scale-105"
                endIcon={<ArrowRight />}
              >
                Start Your Scrapbook
              </Button>
            </Link>
            <Button 
              variant="outlined" 
              size="large"
              className="border-2 border-amber-800/20 text-amber-800 hover:bg-amber-950/5 hover:border-amber-800 rounded-full px-8 py-4 text-base md:text-lg font-bold transition-all"
            >
              Flip Through Guide
            </Button>
          </Stack>
        </motion.div>

        {/* Right Column: Layered interactive Polaroid cards */}
        <div className="relative h-[450px] sm:h-[500px] flex items-center justify-center">
          {/* Main Polaroid Photo: Summer Vacation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 6 }}
            animate={{ opacity: 1, scale: 1, rotate: 4 }}
            whileHover={{ scale: 1.05, rotate: 0, zIndex: 30 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute z-20 w-[240px] sm:w-[280px] polaroid-card cursor-pointer"
          >
            {/* Washi tape holding it down */}
            <div className="absolute -top-6 left-12 w-24 h-6 washi-tape-horizontal z-30" />
            
            {/* Polaroid Image Box */}
            <Box className="aspect-square bg-gradient-to-tr from-amber-50 to-orange-100 rounded-sm flex flex-col items-center justify-center border border-amber-900/10 overflow-hidden relative group">
              <Camera size={56} className="text-amber-800/40 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
              <div className="absolute inset-0 bg-amber-950/5 mix-blend-overlay" />
            </Box>

            {/* Polaroid Label Area */}
            <div className="pt-4 text-center">
              <Typography className="font-handwritten text-2xl text-amber-900 font-bold leading-tight">
                Summer in Paris '25
              </Typography>
              <Typography className="font-mono text-[9px] uppercase tracking-widest text-amber-700/50 mt-1">
                Stored Securely
              </Typography>
            </div>
          </motion.div>

          {/* Overlapping Polaroid Photo: Family Picnic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            whileHover={{ scale: 1.05, rotate: 0, zIndex: 30 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute z-10 w-[210px] sm:w-[250px] polaroid-card cursor-pointer left-4 sm:left-10"
          >
            {/* Washi tape at an angle */}
            <div className="absolute -top-5 right-8 w-20 h-6 washi-tape-angle z-30 rotate-12" />
            
            {/* Polaroid Image Box */}
            <Box className="aspect-square bg-gradient-to-tr from-rose-50 to-amber-100 rounded-sm flex flex-col items-center justify-center border border-amber-900/10 overflow-hidden relative group">
              <Heart size={48} fill="rgba(244, 63, 94, 0.1)" className="text-rose-500/50 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
              <div className="absolute inset-0 bg-amber-950/5 mix-blend-overlay" />
            </Box>

            {/* Polaroid Label Area */}
            <div className="pt-3.5 text-center">
              <Typography className="font-handwritten text-xl text-rose-900 font-bold leading-tight">
                Baby's First Steps 👶
              </Typography>
              <Typography className="font-mono text-[9px] uppercase tracking-widest text-amber-700/50 mt-1">
                Cherished Forever
              </Typography>
            </div>
          </motion.div>

          {/* Underlay Notebook Card: Vault Lock Details */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 110 }}
            className="absolute z-0 w-[280px] sm:w-[320px] bg-[#fcfbf7] border border-amber-900/15 p-6 rounded-2xl shadow-md rotate-[2deg] flex items-center gap-4 border-dashed"
          >
            {/* Little pushpin drawing */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 scrapbook-pin-rose" />
            
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/50 text-amber-800">
              <Lock size={22} />
            </div>
            <div>
              <Typography className="font-bold text-amber-950 text-sm">Lock & Keep Safe</Typography>
              <Typography className="text-xs text-amber-900/60 leading-normal">
                Encrypted with AES-256 keys, ensuring your journal notes are only visible to your family.
              </Typography>
            </div>
          </motion.div>

          {/* Little Floating Stamps & Tape Elements */}
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [-4, -2, -4] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute -top-4 -right-2 bg-amber-50/90 border border-amber-200/60 p-3 rounded-xl shadow-md flex items-center gap-2 border-dashed rotate-[-4deg] z-20"
          >
            <div className="bg-amber-100 p-1.5 rounded-lg text-amber-700">
              <Star size={16} fill="currentColor" />
            </div>
            <Typography className="font-bold text-amber-900 text-xs font-handwritten">Vault Certified</Typography>
          </motion.div>
        </div>
      </div>
    </Container>
  );
}
