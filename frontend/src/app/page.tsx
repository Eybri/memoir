'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (isLoading || user) {
    return (
      <Box className="romantic-gradient min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Camera size={64} className="text-amber-500" />
        </motion.div>
      </Box>
    );
  }

  return (
    <Box className="romantic-gradient min-h-screen overflow-x-hidden">
      {/* Navigation */}
      <Header isDashboard={false} />

      {/* Hero Section */}
      <HeroSection />

      {/* Feature Section */}
      <FeaturesSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </Box>
  );
}
