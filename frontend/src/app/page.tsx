'use client';
import * as React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack, 
  Card,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Heart, Lock, Calendar, Star, ArrowRight } from 'lucide-react';

import Link from 'next/link';

export default function Home() {
  return (
    <Box className="romantic-gradient min-h-screen overflow-x-hidden">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Typography 
          variant="h5" 
          className="font-display font-bold text-pink-600 flex items-center gap-2"
        >
          <Heart fill="currentColor" size={24} /> Someday
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Link href="/auth/login" style={{ textDecoration: 'none' }}>
            <Button variant="text" className="text-pink-900 font-medium px-6 hover:bg-pink-100/50 rounded-full">Login</Button>
          </Link>
          <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
            <Button 
              variant="contained" 
              disableElevation
              className="bg-pink-600 hover:bg-pink-700 rounded-full px-8 py-2 font-bold transition-all hover:scale-105"
            >
              Sign Up
            </Button>
          </Link>
        </Stack>
      </nav>

      {/* Hero Section */}
      <Container maxWidth="lg" className="pt-20 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography 
              variant="h1" 
              className="font-display font-extrabold text-pink-950 mb-6 text-5xl md:text-8xl leading-[1.1]"
            >
              Capture Your <span className="text-gradient">Forever</span> Today
            </Typography>
            <Typography 
              variant="h5" 
              className="text-pink-900/60 mb-10 font-light leading-relaxed max-w-lg text-lg md:text-xl"
            >
              The digital vault for couples. Store secret letters, photos, and dreams to be opened on your special dates.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Button 
                variant="contained" 
                size="large"
                disableElevation
                className="bg-pink-600 hover:bg-pink-700 text-white rounded-full px-10 py-5 shadow-2xl shadow-pink-200 text-lg font-bold transition-all hover:scale-105"
                endIcon={<ArrowRight />}
              >
                Create Your Vault
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                className="border-2 border-pink-200 text-pink-600 hover:bg-white/50 hover:border-pink-300 rounded-full px-10 py-5 text-lg font-bold backdrop-blur-sm transition-all"
              >
                Learn More
              </Button>
            </Stack>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2, type: 'spring' }}
            className="relative"
          >
            {/* Decorative Blur */}
            <div className="absolute -inset-10 bg-pink-400/20 blur-[100px] rounded-full" />
            
            <Card className="glass-card p-10 relative overflow-hidden border-0 rounded-[48px] shadow-2xl">
              <Box className="aspect-square flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 rounded-[40px] mb-8">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 6 }}
                >
                  <Lock size={140} className="text-pink-400/80" strokeWidth={1} />
                </motion.div>
              </Box>
              
              <Box className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <Typography variant="h5" className="text-pink-950 font-bold mb-1 font-display">Locked Memory</Typography>
                    <Typography className="text-pink-800/50 font-medium">For Emily • Opens in 324 Days</Typography>
                  </div>
                  <Heart className="text-pink-500 fill-pink-500" size={32} />
                </div>
                
                <Box className="pt-4">
                  <div className="flex justify-between text-xs font-bold text-pink-400 mb-2 uppercase tracking-widest">
                    <span>Progress</span>
                    <span>12%</span>
                  </div>
                  <div className="h-3 w-full bg-pink-100/50 rounded-full overflow-hidden p-0.5 border border-pink-100">
                    <motion.div 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: '12%' }}
                      transition={{ duration: 2, delay: 1 }}
                      className="h-full bg-pink-500 rounded-full shadow-sm" 
                    />
                  </div>
                </Box>
              </Box>
            </Card>

            {/* Floating Interactive Elements */}
            <motion.div 
              animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
              className="absolute -top-12 -right-6 glass-card p-5 rounded-3xl shadow-xl flex items-center gap-3 border-0"
            >
              <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600">
                <Star size={24} fill="currentColor" />
              </div>
              <Typography className="font-bold text-pink-900">New Secret Added</Typography>
            </motion.div>
            
            <motion.div 
              animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-8 -left-10 glass-card p-5 rounded-3xl shadow-xl flex items-center gap-4 border-0"
            >
              <div className="bg-pink-100 p-2 rounded-xl text-pink-600">
                <Calendar size={24} />
              </div>
              <div>
                <Typography className="font-bold text-pink-900 text-sm">Anniversary 2026</Typography>
                <Typography variant="caption" className="text-pink-800/50 font-bold uppercase">Locked</Typography>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Container>

      {/* Feature Section */}
      <Box className="bg-white/40 backdrop-blur-xl py-32 border-t border-pink-100/50">
        <Container maxWidth="lg">
          <Box className="text-center mb-20">
            <Typography variant="h2" className="font-display font-bold text-pink-950 mb-4">
              Designed for Soulmates
            </Typography>
            <Typography className="text-pink-900/50 text-xl max-w-2xl mx-auto">
              Every feature is crafted to strengthen your bond and preserve your most precious moments.
            </Typography>
          </Box>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Lock />, title: "Secure Vault", desc: "Military-grade encryption ensures your secrets are safe until the right moment." },
              { icon: <Calendar />, title: "Time-Locked", desc: "Set specific dates or milestones for your letters and media to unlock automatically." },
              { icon: <Star />, title: "Rich Memories", desc: "Combine text, voice notes, photos and videos into a single beautiful keepsake." }
            ].map((f: { icon: React.ReactElement; title: string; desc: string }, i: number) => (
              <motion.div key={i} whileHover={{ y: -12 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Card className="glass-card p-10 rounded-[40px] h-full border-0 shadow-lg hover:shadow-2xl transition-all group">
                  <Box className="mb-6 bg-pink-50 w-16 h-16 flex items-center justify-center rounded-2xl text-pink-600 group-hover:bg-pink-500 group-hover:text-white transition-colors duration-500">
                    {React.cloneElement(f.icon as React.ReactElement<any>, { size: 32 })}
                  </Box>
                  <Typography variant="h5" className="text-pink-950 font-bold mb-4 font-display">
                    {f.title}
                  </Typography>
                  <Typography className="text-pink-900/60 leading-relaxed text-lg">
                    {f.desc}
                  </Typography>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" className="py-32 text-center">
        <Box className="glass-card p-16 rounded-[60px] border-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-right from-transparent via-pink-400 to-transparent opacity-30" />
          <Typography variant="h3" className="font-display font-bold text-pink-950 mb-6">
            Ready to start your journey?
          </Typography>
          <Typography className="text-pink-900/60 text-xl mb-10 max-w-xl mx-auto">
            Join thousands of couples who are building their digital legacy together.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            className="bg-pink-600 hover:bg-pink-700 rounded-full px-12 py-5 text-xl font-bold shadow-xl shadow-pink-100 transition-all hover:scale-105"
          >
            Get Started for Free
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <footer className="py-20 border-t border-pink-100/50 bg-pink-50/30">
        <Container maxWidth="lg" className="flex flex-col md:flex-row justify-between items-center gap-8">
          <Typography 
            variant="h6" 
            className="font-display font-bold text-pink-400 flex items-center gap-2 opacity-50"
          >
            <Heart fill="currentColor" size={20} /> Someday
          </Typography>
          <Typography variant="body2" className="text-pink-800/30 font-medium">
            © 2026 Someday App. Built with Love and Passion.
          </Typography>
          <Stack direction="row" spacing={4}>
            <Button className="text-pink-800/40 text-sm capitalize">Privacy</Button>
            <Button className="text-pink-800/40 text-sm capitalize">Terms</Button>
          </Stack>
        </Container>
      </footer>
    </Box>
  );
}
