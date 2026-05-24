'use client';

import * as React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button,
} from '@mui/material';
import Link from 'next/link';

export default function CTASection() {
  return (
    <Container maxWidth="md" className="py-24 text-center relative">
      {/* Decorative Washi Tapes holding down the entire block */}
      <div className="absolute -top-3 left-6 w-24 h-7 washi-tape-angle z-20 opacity-80 rotate-[-12deg]" />
      <div className="absolute -bottom-3 right-6 w-24 h-7 washi-tape-horizontal z-20 opacity-80 rotate-[6deg]" />

      <Box className="bg-[#fcfaf2] p-12 sm:p-16 rounded-[40px] border border-amber-900/10 shadow-xl journal-stitch overflow-hidden relative">
        {/* Subdued watermarked notebook lines in the background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(180,92,26,0.02)_1px,transparent_1px)] bg-[size:100%_24px] pointer-events-none" />

        <Typography 
          variant="h3" 
          className="font-display font-bold text-amber-950 mb-2 text-2xl sm:text-3xl md:text-4xl relative z-10"
        >
          Ready to preserve your story?
        </Typography>

        <Typography 
          className="font-handwritten text-2xl sm:text-3xl text-amber-800 mb-8 relative z-10"
        >
          Start writing the pages of tomorrow, today.
        </Typography>

        <Typography 
          className="text-amber-900/70 text-sm sm:text-base mb-10 max-w-md mx-auto relative z-10 font-medium"
        >
          Join thousands of scrapbookers who trust Memoir with their family history, travel snapshots, and personal growth journals.
        </Typography>

        <Link href="/auth/signup" style={{ textDecoration: 'none' }} className="relative z-10">
          <Button 
            variant="contained" 
            size="large"
            className="bg-rose-700 hover:bg-rose-800 text-white rounded-full px-10 py-4.5 text-base sm:text-lg font-bold shadow-lg shadow-rose-900/20 transition-all hover:scale-105 border-4 border-rose-600/20"
          >
            Create Your Vault Free
          </Button>
        </Link>
      </Box>
    </Container>
  );
}
