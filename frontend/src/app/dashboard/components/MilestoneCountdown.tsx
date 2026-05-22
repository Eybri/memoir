import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, Trash2 } from 'lucide-react';
import { fetchMilestones, createMilestone, deleteMilestone, Milestone } from '@/lib/api';

interface MilestoneCountdownProps {
  nostalgiaMode: boolean;
}

export default function MilestoneCountdown({ nostalgiaMode }: MilestoneCountdownProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadMilestones();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadMilestones = async () => {
    try {
      const data = await fetchMilestones();
      setMilestones(data);
    } catch (error) {
      console.error('Failed to load milestones:', error);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newDate) return;
    setIsSubmitting(true);
    try {
      await createMilestone(newTitle.trim(), newDate);
      await loadMilestones();
      setNewTitle('');
      setNewDate('');
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Failed to create milestone:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this date?')) return;
    try {
      await deleteMilestone(id);
      await loadMilestones();
    } catch (error) {
      console.error('Failed to delete milestone:', error);
    }
  };

  // Helper to calculate time difference to the next annual occurrence (e.g. anniversaries/birthdays)
  const getTimeDifference = (dateString: string) => {
    const originalDate = new Date(dateString);
    
    // Create a target date in the current year using the same month and day
    const targetDate = new Date(currentTime.getFullYear(), originalDate.getMonth(), originalDate.getDate());
    
    // If the date has already passed this year, count down to next year
    if (targetDate.getTime() < currentTime.getTime()) {
      targetDate.setFullYear(currentTime.getFullYear() + 1);
    }
    
    const diffMs = targetDate.getTime() - currentTime.getTime();
    const absDiff = Math.max(0, diffMs);
    
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((absDiff / 1000 / 60) % 60);
    const secs = Math.floor((absDiff / 1000) % 60);
    
    return {
      days,
      hours,
      mins,
      secs,
      isPast: false // It is now always counting down to a future date
    };
  };

  return (
    <Box className="w-full space-y-3 select-none">
      <Box className="flex justify-between items-center px-1">
        <Typography className="font-display font-extrabold text-[11px] tracking-[0.15em] text-amber-600/70 uppercase flex items-center gap-1.5">
          <Clock size={12} className="text-amber-500" /> Important Dates
        </Typography>
      </Box>

      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-hide mask-image-horizontal">
        {/* Milestone Cards */}
        <AnimatePresence>
          {milestones.map((milestone) => {
            const diff = getTimeDifference(milestone.date);
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={milestone._id}
                className="flex-shrink-0 cursor-pointer"
                onClick={() => setSelectedMilestone(milestone)}
              >
                <Box className={`w-64 h-[180px] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col p-4 transition-all duration-500 relative overflow-hidden ${nostalgiaMode
                    ? 'border-amber-900/15 bg-[#fdfcf8] hover:border-amber-900/30 hover:shadow-[0_8px_30px_rgb(60,47,31,0.08)]'
                    : 'border-amber-500/30 bg-gradient-to-br from-white to-amber-50/30 hover:border-amber-400 hover:shadow-[0_8px_30px_rgb(217,119,6,0.12)]'
                  }`}>
                  <Typography className={`text-[12px] font-display font-black tracking-tight leading-tight line-clamp-2 ${nostalgiaMode ? 'text-[#3c2f1f]' : 'text-amber-950'}`}>
                    {milestone.title}
                  </Typography>
                  <Typography className="text-[9px] sm:text-[11px] font-mono tracking-[0.1em] text-amber-600/70 font-bold uppercase mt-1">
                    {new Date(milestone.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Typography>

                  <div className="flex-grow flex flex-col justify-end">
                    <Typography className="text-[8px] sm:text-[10px] font-mono uppercase text-amber-600/70 mb-1.5 font-bold tracking-widest text-center">
                      {diff.isPast ? 'Time Elapsed' : 'Time Remaining'}
                    </Typography>
                    
                    <div className="flex gap-2 w-full justify-between">
                      <div className={`flex-1 flex flex-col items-center justify-center rounded-lg py-2.5 px-1 shadow-lg ${nostalgiaMode ? 'bg-[#3c2f1f]' : 'bg-amber-950'}`}>
                        <Typography className={`text-lg sm:text-xl md:text-2xl font-mono font-black tracking-tighter leading-none ${nostalgiaMode ? 'text-[#fdfcf8]' : 'text-amber-50'}`}>{String(diff.days).padStart(2, '0')}</Typography>
                        <Typography className={`text-[8px] sm:text-[10px] font-mono uppercase font-bold mt-1 tracking-widest ${nostalgiaMode ? 'text-[#fdfcf8]/60' : 'text-amber-50/60'}`}>Days</Typography>
                      </div>
                      <div className={`flex-1 flex flex-col items-center justify-center rounded-lg py-2.5 px-1 shadow-lg ${nostalgiaMode ? 'bg-[#3c2f1f]' : 'bg-amber-950'}`}>
                        <Typography className={`text-lg sm:text-xl md:text-2xl font-mono font-black tracking-tighter leading-none ${nostalgiaMode ? 'text-[#fdfcf8]' : 'text-amber-50'}`}>{String(diff.hours).padStart(2, '0')}</Typography>
                        <Typography className={`text-[8px] sm:text-[10px] font-mono uppercase font-bold mt-1 tracking-widest ${nostalgiaMode ? 'text-[#fdfcf8]/60' : 'text-amber-50/60'}`}>Hrs</Typography>
                      </div>
                      <div className={`flex-1 flex flex-col items-center justify-center rounded-lg py-2.5 px-1 shadow-lg ${nostalgiaMode ? 'bg-[#3c2f1f]' : 'bg-amber-950'}`}>
                        <Typography className={`text-lg sm:text-xl md:text-2xl font-mono font-black tracking-tighter leading-none ${nostalgiaMode ? 'text-[#fdfcf8]' : 'text-amber-50'}`}>{String(diff.mins).padStart(2, '0')}</Typography>
                        <Typography className={`text-[8px] sm:text-[10px] font-mono uppercase font-bold mt-1 tracking-widest ${nostalgiaMode ? 'text-[#fdfcf8]/60' : 'text-amber-50/60'}`}>Min</Typography>
                      </div>
                      <div className={`flex-1 flex flex-col items-center justify-center rounded-lg py-2.5 px-1 shadow-lg ${nostalgiaMode ? 'bg-[#3c2f1f]' : 'bg-amber-950'}`}>
                        <Typography className={`text-lg sm:text-xl md:text-2xl font-mono font-black tracking-tighter leading-none ${nostalgiaMode ? 'text-[#fdfcf8]' : 'text-amber-50'}`}>{String(diff.secs).padStart(2, '0')}</Typography>
                        <Typography className={`text-[8px] sm:text-[10px] font-mono uppercase font-bold mt-1 tracking-widest ${nostalgiaMode ? 'text-[#fdfcf8]/60' : 'text-amber-50/60'}`}>Sec</Typography>
                      </div>
                    </div>
                  </div>
                </Box>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add Date Card */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsCreateOpen(true)}
          className="flex-shrink-0 cursor-pointer"
        >
          <Box className={`w-36 h-[180px] rounded-xl shadow-sm border-2 border-dashed flex flex-col p-3 transition-all duration-500 group relative overflow-hidden backdrop-blur-sm ${nostalgiaMode
              ? 'border-amber-900/25 bg-[#faf6eb]/80 hover:bg-amber-900/10 hover:border-amber-900/40'
              : 'border-amber-400/40 bg-gradient-to-br from-amber-50/50 to-amber-100/30 hover:border-amber-500/60 hover:shadow-xl hover:shadow-amber-500/20'
            }`}>
            <div className="flex-grow flex items-center justify-center">
              <div className={`p-3 rounded-full transition-transform duration-500 group-hover:scale-110 group-hover:rotate-90 ${nostalgiaMode ? 'bg-[#3c2f1f]/5 text-amber-800' : 'bg-white text-amber-600'}`}>
                <Plus size={24} strokeWidth={2.5} />
              </div>
            </div>
            <Typography className="text-[11px] font-display font-black tracking-wider text-center text-amber-950 uppercase mt-2">
              Save Date
            </Typography>
          </Box>
        </motion.div>
      </div>

      <Dialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
              p: 2,
              backgroundColor: nostalgiaMode ? '#f4efe2' : '#ffffff',
            }
          }
        }}
      >
        <DialogTitle className="font-display font-black text-amber-950 text-lg sm:text-xl md:text-2xl pb-1">
          Save a Date
        </DialogTitle>
        <DialogContent className="space-y-4 pt-2">
          <TextField
            autoFocus
            label="What are we counting?"
            type="text"
            fullWidth
            variant="outlined"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. Wedding Anniversary"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': { borderColor: 'rgba(217, 119, 6, 0.2)' },
                '&.Mui-focused fieldset': { borderColor: '#d97706' },
              },
            }}
          />
          <TextField
            label="Date"
            type="date"
            fullWidth
            variant="outlined"
            slotProps={{ inputLabel: { shrink: true } }}
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            disabled={isSubmitting}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': { borderColor: 'rgba(217, 119, 6, 0.2)' },
                '&.Mui-focused fieldset': { borderColor: '#d97706' },
              },
            }}
          />
        </DialogContent>
        <DialogActions className="px-6 pb-2">
          <Button onClick={() => setIsCreateOpen(false)} disabled={isSubmitting} className="text-amber-700 font-bold rounded-full">
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isSubmitting || !newTitle.trim() || !newDate} variant="contained" className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-full">
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!selectedMilestone}
        onClose={() => setSelectedMilestone(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
              p: 3,
              backgroundColor: nostalgiaMode ? '#f4efe2' : '#ffffff',
            }
          }
        }}
      >
        {selectedMilestone && (() => {
          const diff = getTimeDifference(selectedMilestone.date);
          return (
            <Box className="space-y-6 select-none">
              <div className="flex justify-between items-start">
                <div>
                  <Typography className={`text-xl sm:text-2xl md:text-3xl font-display font-black leading-tight ${nostalgiaMode ? 'text-[#3c2f1f]' : 'text-amber-950'}`}>
                    {selectedMilestone.title}
                  </Typography>
                  <Typography className="text-xs sm:text-sm md:text-base font-mono tracking-[0.1em] text-amber-600/70 font-bold uppercase mt-1">
                    {new Date(selectedMilestone.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </Typography>
                </div>
                <IconButton
                  onClick={() => {
                    handleDelete(selectedMilestone._id);
                    setSelectedMilestone(null);
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-500 rounded-full p-3 transition-colors"
                  title="Delete this date"
                >
                  <Trash2 size={20} />
                </IconButton>
              </div>

              <div>
                <Typography className="text-[10px] sm:text-xs md:text-sm font-mono uppercase text-amber-600/70 mb-3 font-bold tracking-widest text-center">
                  {diff.isPast ? 'Time Elapsed' : 'Time Remaining'}
                </Typography>
                
                <div className="flex gap-3 w-full justify-between">
                  <div className={`flex-1 flex flex-col items-center justify-center rounded-xl py-6 px-2 shadow-xl ${nostalgiaMode ? 'bg-[#3c2f1f]' : 'bg-amber-950'}`}>
                    <Typography className={`text-3xl sm:text-4xl md:text-5xl sm:text-5xl font-mono font-black tracking-tighter leading-none ${nostalgiaMode ? 'text-[#fdfcf8]' : 'text-amber-50'}`}>{String(diff.days).padStart(2, '0')}</Typography>
                    <Typography className={`text-[10px] sm:text-xs font-mono uppercase font-bold mt-3 tracking-widest ${nostalgiaMode ? 'text-[#fdfcf8]/60' : 'text-amber-50/60'}`}>Days</Typography>
                  </div>
                  <div className={`flex-1 flex flex-col items-center justify-center rounded-xl py-6 px-2 shadow-xl ${nostalgiaMode ? 'bg-[#3c2f1f]' : 'bg-amber-950'}`}>
                    <Typography className={`text-3xl sm:text-4xl md:text-5xl sm:text-5xl font-mono font-black tracking-tighter leading-none ${nostalgiaMode ? 'text-[#fdfcf8]' : 'text-amber-50'}`}>{String(diff.hours).padStart(2, '0')}</Typography>
                    <Typography className={`text-[10px] sm:text-xs font-mono uppercase font-bold mt-3 tracking-widest ${nostalgiaMode ? 'text-[#fdfcf8]/60' : 'text-amber-50/60'}`}>Hrs</Typography>
                  </div>
                  <div className={`flex-1 flex flex-col items-center justify-center rounded-xl py-6 px-2 shadow-xl ${nostalgiaMode ? 'bg-[#3c2f1f]' : 'bg-amber-950'}`}>
                    <Typography className={`text-3xl sm:text-4xl md:text-5xl sm:text-5xl font-mono font-black tracking-tighter leading-none ${nostalgiaMode ? 'text-[#fdfcf8]' : 'text-amber-50'}`}>{String(diff.mins).padStart(2, '0')}</Typography>
                    <Typography className={`text-[10px] sm:text-xs font-mono uppercase font-bold mt-3 tracking-widest ${nostalgiaMode ? 'text-[#fdfcf8]/60' : 'text-amber-50/60'}`}>Min</Typography>
                  </div>
                  <div className={`flex-1 flex flex-col items-center justify-center rounded-xl py-6 px-2 shadow-xl ${nostalgiaMode ? 'bg-[#3c2f1f]' : 'bg-amber-950'}`}>
                    <Typography className={`text-3xl sm:text-4xl md:text-5xl sm:text-5xl font-mono font-black tracking-tighter leading-none ${nostalgiaMode ? 'text-[#fdfcf8]' : 'text-amber-50'}`}>{String(diff.secs).padStart(2, '0')}</Typography>
                    <Typography className={`text-[10px] sm:text-xs font-mono uppercase font-bold mt-3 tracking-widest ${nostalgiaMode ? 'text-[#fdfcf8]/60' : 'text-amber-50/60'}`}>Sec</Typography>
                  </div>
                </div>
              </div>
            </Box>
          );
        })()}
      </Dialog>
    </Box>
  );
}
