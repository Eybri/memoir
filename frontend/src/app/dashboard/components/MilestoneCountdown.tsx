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

  useEffect(() => {
    loadMilestones();
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

  // Helper to calculate time difference in years and months
  const getTimeDifference = (dateString: string) => {
    const targetDate = new Date(dateString);
    const now = new Date();
    
    // Total months difference
    let months = (targetDate.getFullYear() - now.getFullYear()) * 12;
    months -= now.getMonth();
    months += targetDate.getMonth();
    
    // Adjust for days
    if (now.getDate() > targetDate.getDate()) {
      months -= 1;
    }

    const isPast = months < 0;
    const absMonths = Math.abs(months);
    const years = Math.floor(absMonths / 12);
    const remainingMonths = absMonths % 12;

    return {
      years,
      months: remainingMonths,
      isPast
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
        {/* Add Date Card */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsCreateOpen(true)}
          className="flex-shrink-0 cursor-pointer pl-1 pt-2 pb-2"
        >
          <Box className={`w-36 h-[140px] rounded-2xl shadow-sm border-2 border-dashed flex flex-col p-3 transition-all duration-500 group relative overflow-hidden backdrop-blur-sm ${nostalgiaMode
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
                className="flex-shrink-0 pt-2 pb-2 relative group"
              >
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(milestone._id);
                  }}
                  className="absolute -top-1 -right-1 z-20 bg-red-50 hover:bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  size="small"
                  sx={{ width: 24, height: 24 }}
                >
                  <Trash2 size={12} />
                </IconButton>
                
                <Box className={`w-36 h-[140px] rounded-2xl shadow-md border flex flex-col p-4 transition-all duration-500 relative overflow-hidden ${nostalgiaMode
                    ? 'border-amber-900/10 bg-[#fdfcf8] hover:border-amber-900/20'
                    : 'border-amber-500/20 bg-white hover:border-amber-400 hover:shadow-lg'
                  }`}>
                  <Typography className={`text-[12px] font-display font-black tracking-tight leading-tight line-clamp-2 ${nostalgiaMode ? 'text-[#3c2f1f]' : 'text-amber-950'}`}>
                    {milestone.title}
                  </Typography>
                  <Typography className="text-[9px] font-mono tracking-[0.1em] text-amber-600/70 font-bold uppercase mt-1">
                    {new Date(milestone.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Typography>

                  <div className="flex-grow flex flex-col justify-end">
                    <div className="flex items-end gap-1">
                      {diff.years > 0 && (
                        <div className="text-center">
                          <Typography className="text-2xl font-display font-black leading-none text-amber-600">
                            {diff.years}
                          </Typography>
                          <Typography className="text-[8px] font-mono uppercase text-amber-900/40 font-bold">
                            Yrs
                          </Typography>
                        </div>
                      )}
                      <div className="text-center">
                        <Typography className="text-2xl font-display font-black leading-none text-amber-600">
                          {diff.months}
                        </Typography>
                        <Typography className="text-[8px] font-mono uppercase text-amber-900/40 font-bold">
                          Mos
                        </Typography>
                      </div>
                    </div>
                    <Typography className="text-[8px] font-mono uppercase text-amber-600/70 mt-1 font-bold">
                      {diff.isPast ? 'Since' : 'To Go'}
                    </Typography>
                  </div>
                </Box>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Dialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              p: 2,
              backgroundColor: nostalgiaMode ? '#f4efe2' : '#ffffff',
            }
          }
        }}
      >
        <DialogTitle className="font-display font-black text-amber-950 text-xl pb-1">
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
    </Box>
  );
}
