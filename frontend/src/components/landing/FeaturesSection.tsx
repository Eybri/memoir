'use client';

import * as React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Lock, Calendar, Sparkles } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    { 
      icon: <Lock size={26} />, 
      title: "Secure Digital Vault", 
      desc: "Zero-knowledge encryption shields your photo albums. Only those you choose can look at your treasured scrapbooks.",
      rotation: -2,
      pinColor: "rose"
    },
    { 
      icon: <Calendar size={26} />, 
      title: "Milestone Timelines", 
      desc: "Arrange your memories Chronologically or by event type. Easy sorting means finding the right page is effortless.",
      rotation: 1.5,
      pinColor: "amber"
    },
    { 
      icon: <Sparkles size={26} />, 
      title: "Personalized Scribbles", 
      desc: "Add sweet notes, journal transcripts, or annotations to every picture. Craft your life story, word by word.",
      rotation: -1.8,
      pinColor: "rose"
    }
  ];

  return (
    <Box className="py-24 border-y border-amber-900/10 bg-amber-50/20 relative overflow-hidden">
      {/* Decorative dashed stitching at top/bottom border */}
      <div className="absolute top-1 left-0 right-0 border-t border-dashed border-amber-900/20" />
      <div className="absolute bottom-1 left-0 right-0 border-t border-dashed border-amber-900/20" />

      <Container maxWidth="lg">
        <Box className="text-center mb-16 relative">
          <Typography 
            variant="h2" 
            className="font-display font-bold text-amber-950 mb-3 text-3xl sm:text-4xl md:text-5xl"
          >
            Crafted with Passion
          </Typography>
          <Typography 
            className="font-handwritten text-2xl sm:text-3xl text-amber-800/80 max-w-xl mx-auto"
          >
            "Every photo is a page in the story of your life..."
          </Typography>
        </Box>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-4">
          {features.map((f, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -8, rotate: 0, scale: 1.02 }}
              style={{ rotate: `${f.rotation}deg` }}
              className="relative"
            >
              {/* Pushpin at the top */}
              <div 
                className={`absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 ${
                  f.pinColor === 'rose' ? 'scrapbook-pin-rose' : 'scrapbook-pin-amber'
                }`} 
              />
              
              <Card className="scrapbook-paper-note p-8 pt-10 h-full border-0 relative overflow-hidden flex flex-col items-center text-center">
                {/* Vintage stamp container for the icon */}
                <Box className="mb-5 bg-amber-100/60 w-14 h-14 flex items-center justify-center rounded-2xl text-amber-800 border border-amber-900/10 shadow-inner">
                  {f.icon}
                </Box>
                
                <Typography 
                  variant="h5" 
                  className="text-amber-950 font-bold mb-3 font-display text-lg sm:text-xl md:text-2xl"
                >
                  {f.title}
                </Typography>
                
                <Typography 
                  className="text-amber-900/70 leading-relaxed text-sm font-medium"
                >
                  {f.desc}
                </Typography>

                {/* Stamped decorative line at the bottom */}
                <div className="w-16 h-[2px] bg-amber-900/10 mt-auto pt-6 border-dashed border-t border-amber-900/20" />
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </Box>
  );
}
