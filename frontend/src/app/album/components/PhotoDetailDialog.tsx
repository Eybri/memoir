import React, { useState } from 'react';
import { Dialog, Box, Stack, IconButton, Typography, Button, TextField } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Trash2, Download, RotateCcw, BookOpen, Send } from 'lucide-react';

interface Photo {
  _id: string;
  url: string;
  captions: { text: string; authorId: string; createdAt: string }[];
  takenAt: string;
  albumId?: string;
}

interface Album {
  _id: string;
  title: string;
  coverPhotoUrl: string;
}

interface PhotoDetailDialogProps {
  photo: Photo | null;
  open: boolean;
  onClose: () => void;
  albums: Album[];
  nostalgiaMode: boolean;
  onDeletePhoto: () => void;
  onAddCaption?: (captionText: string) => void;
  onSetAsCover: (photoUrl: string) => void;
  onUpdatePhotoAlbum: (photoId: string, targetAlbumId: string | null) => void;
}

export default function PhotoDetailDialog({
  photo,
  open,
  onClose,
  albums,
  onDeletePhoto,
  onAddCaption,
  onSetAsCover,
  onUpdatePhotoAlbum
}: PhotoDetailDialogProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!photo) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `memoir-photo-${photo._id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open(photo.url, '_blank');
    }
  };

  const handleSaveNote = async () => {
    if (!noteText.trim() || !onAddCaption) return;
    setIsSaving(true);
    try {
      await onAddCaption(noteText.trim());
      setNoteText('');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setIsFlipped(false);
    setNoteText('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                background: 'transparent',
                boxShadow: 'none',
                overflow: 'visible',
              }
            },
            backdrop: {
              sx: { backgroundColor: 'rgba(10,8,5,0.85)', backdropFilter: 'blur(8px)' }
            }
          }}
        >
          <Box className="relative flex flex-col items-center">

            {/* Top action bar */}
            <Box className="flex justify-between w-full pb-3 px-1">
              {/* Flip button */}
              <Button
                onClick={() => setIsFlipped(f => !f)}
                startIcon={isFlipped ? <RotateCcw size={14} /> : <BookOpen size={14} />}
                sx={{
                  backgroundColor: '#1f2937',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  borderRadius: '20px',
                  px: 2,
                  py: 0.6,
                  '&:hover': { backgroundColor: '#374151' },
                }}
              >
                {isFlipped ? 'See Photo' : 'See Notes'}
              </Button>

              <Stack direction="row" spacing={1}>
                <IconButton
                  onClick={handleDownload}
                  title="Download"
                  sx={{ backgroundColor: '#1f2937', color: '#fff', '&:hover': { backgroundColor: '#111827' }, width: 34, height: 34, borderRadius: '50%' }}
                >
                  <Download size={15} />
                </IconButton>
                <IconButton
                  onClick={onDeletePhoto}
                  title="Delete"
                  sx={{ backgroundColor: '#1f2937', color: '#fff', '&:hover': { backgroundColor: '#7f1d1d' }, width: 34, height: 34, borderRadius: '50%' }}
                >
                  <Trash2 size={15} />
                </IconButton>
                <IconButton
                  onClick={handleClose}
                  title="Close"
                  sx={{ backgroundColor: '#1f2937', color: '#fff', '&:hover': { backgroundColor: '#111827' }, width: 34, height: 34, borderRadius: '50%', fontSize: '13px', fontWeight: 900 }}
                >
                  ✕
                </IconButton>
              </Stack>
            </Box>

            {/* ── POLAROID CARD with 3D flip ── */}
            <Box
              style={{
                width: '100%',
                maxWidth: '480px',
                perspective: '1200px',
              }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                style={{
                  transformStyle: 'preserve-3d',
                  position: 'relative',
                  width: '100%',
                }}
              >
                {/* ── FRONT FACE (Photo) ── */}
                <motion.div
                  style={{
                    backfaceVisibility: 'hidden',
                    background: '#ffffff',
                    padding: '10px 10px 0 10px',
                    boxShadow: '0 30px 80px -10px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.2)',
                    borderRadius: '3px',
                    width: '100%',
                  }}
                >
                  {/* Photo */}
                  <Box style={{ borderRadius: '1px', aspectRatio: '4/3', background: '#000', overflow: 'hidden' }}>
                    <img
                      src={photo.url}
                      alt="Polaroid photo"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </Box>

                  {/* White bottom strip */}
                  <Box
                    className="flex flex-col sm:flex-row justify-between items-center gap-3"
                    style={{ padding: '14px 8px 18px 8px' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400" />
                      <Typography style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#555', letterSpacing: '0.05em' }}>
                        {new Date(photo.takenAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={photo.albumId || ''}
                        onChange={(e) => onUpdatePhotoAlbum(photo._id, e.target.value || null)}
                        style={{ fontSize: '10px' }}
                        className="bg-gray-50 text-gray-700 border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:border-amber-400 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <option value="">No Album</option>
                        {albums.map((alb) => (
                          <option key={alb._id} value={alb._id}>{alb.title}</option>
                        ))}
                      </select>

                      <Button
                        size="small"
                        onClick={() => onSetAsCover(photo.url)}
                        disabled={!photo.albumId}
                        style={{ fontSize: '9px', padding: '3px 10px' }}
                        className="text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 rounded-md font-bold tracking-wider uppercase disabled:opacity-30 transition-all"
                      >
                        Make Cover
                      </Button>
                    </div>
                  </Box>
                </motion.div>

                {/* ── BACK FACE (Handwritten Journal) ── */}
                <motion.div
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: '#fef9f0',
                    padding: '24px 20px 20px',
                    boxShadow: '0 30px 80px -10px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.2)',
                    borderRadius: '3px',
                    minHeight: '360px',
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #d4b896 27px, #d4b896 28px)',
                    backgroundPositionY: '36px',
                  }}
                >
                  {/* Red margin line */}
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: '44px', width: '1.5px', background: 'rgba(200,80,80,0.35)' }} />

                  <Box style={{ paddingLeft: '52px' }}>
                    <Typography style={{ fontFamily: "'Courier New', monospace", fontSize: '10px', color: '#b45309', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
                      Notes / Memories
                    </Typography>

                    {/* Existing captions */}
                    <Box style={{ marginBottom: '16px', maxHeight: '200px', overflowY: 'auto' }}>
                      {photo.captions.length === 0 ? (
                        <Typography style={{ fontFamily: "'Courier New', monospace", fontSize: '12px', color: '#9ca3af', fontStyle: 'italic', lineHeight: '28px' }}>
                          No notes written yet...
                        </Typography>
                      ) : (
                        photo.captions.map((cap, i) => (
                          <Typography
                            key={i}
                            style={{
                              fontFamily: "'Courier New', monospace",
                              fontSize: '12px',
                              color: '#374151',
                              lineHeight: '28px',
                              fontStyle: 'italic',
                            }}
                          >
                            — {cap.text}
                          </Typography>
                        ))
                      )}
                    </Box>

                    {/* Write new note */}
                    {onAddCaption && (
                      <Box className="flex items-end gap-2">
                        <TextField
                          fullWidth
                          multiline
                          maxRows={3}
                          placeholder="Write a memory..."
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          variant="standard"
                          sx={{
                            '& .MuiInput-underline:before': { borderBottomColor: 'rgba(180,120,40,0.3)' },
                            '& .MuiInput-underline:after': { borderBottomColor: '#b45309' },
                            '& textarea': {
                              fontFamily: "'Courier New', monospace",
                              fontSize: '12px',
                              color: '#374151',
                              fontStyle: 'italic',
                              lineHeight: '28px',
                            }
                          }}
                        />
                        <IconButton
                          onClick={handleSaveNote}
                          disabled={isSaving || !noteText.trim()}
                          sx={{ color: '#b45309', '&:hover': { background: 'rgba(180,90,0,0.08)' }, flexShrink: 0, mb: 0.5 }}
                        >
                          <Send size={16} />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </motion.div>
              </motion.div>
            </Box>

          </Box>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
