'use client';

import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface FloatingUploadButtonProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void> | void;
  isUploading: boolean;
  uploadProgress: { done: number; total: number } | null;
}

export default function FloatingUploadButton({
  fileInputRef,
  onUpload,
  isUploading,
  uploadProgress
}: FloatingUploadButtonProps) {
  return (
    <Box className="fixed bottom-10 right-10 flex flex-col items-end gap-3 z-30">
      <input
        type="file"
        ref={fileInputRef}
        onChange={onUpload}
        className="hidden"
        accept="image/*"
        multiple
      />

      {/* Progress pill — appears above button while uploading */}
      {uploadProgress && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-950/90 backdrop-blur-md text-amber-100 font-mono font-bold text-[10px] sm:text-xs md:text-sm px-4 py-2 rounded-full shadow-xl flex items-center gap-2"
        >
          <CircularProgress size={12} sx={{ color: '#fbbf24' }} />
          <span>{uploadProgress.done} / {uploadProgress.total} uploaded</span>
        </motion.div>
      )}

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="contained"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-2xl px-6 py-4 flex items-center gap-2 font-display font-black text-xs sm:text-sm md:text-base uppercase tracking-wider transition-all duration-300"
          title="Add memories — select multiple photos at once"
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <CircularProgress size={16} sx={{ color: '#fff' }} />
              <span>Uploading...</span>
            </span>
          ) : (
            <>
              <Plus size={18} strokeWidth={3} />
              <span>Add Memory</span>
            </>
          )}
        </Button>
      </motion.div>
    </Box>
  );
}
