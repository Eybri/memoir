'use client';

import * as React from 'react';
import {
  Container,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import { Camera } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-16 border-t border-amber-900/10 bg-amber-50/20 relative">
      {/* Dashed edge at top */}
      <div className="absolute top-0 left-0 right-0 border-t border-dashed border-amber-900/10" />

      <Container maxWidth="lg" className="flex flex-col md:flex-row justify-between items-center gap-8">
        <Typography
          variant="h6"
          className="font-display font-black text-amber-800 flex items-center gap-2.5 opacity-70 hover:opacity-100 transition-opacity duration-300 select-none"
        >
          <Camera size={20} className="text-amber-700" /> Memoir
        </Typography>
        
        <Typography 
          variant="body2" 
          className="font-handwritten text-xl text-amber-800/60 font-bold"
        >
          © 2026 Memoir App. Built for my Wife.
        </Typography>

        <Stack direction="row" spacing={3}>
          <Button className="text-amber-900/40 hover:text-amber-800 text-xs font-mono capitalize tracking-wider font-semibold">Privacy</Button>
          <Button className="text-amber-900/40 hover:text-amber-800 text-xs font-mono capitalize tracking-wider font-semibold">Terms</Button>
        </Stack>
      </Container>
    </footer>
  );
}
