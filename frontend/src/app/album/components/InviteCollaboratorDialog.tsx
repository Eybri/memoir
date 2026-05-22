import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Avatar, IconButton } from '@mui/material';
import { UserPlus, CheckCircle2, Circle } from 'lucide-react';
import { fetchFriends, UserBasic } from '@/lib/api';

interface InviteCollaboratorDialogProps {
  open: boolean;
  onClose: () => void;
  onInvite: (selectedUserIds: string[]) => void;
  currentCollaborators: string[]; // array of user IDs already in the album
  nostalgiaMode: boolean;
}

export default function InviteCollaboratorDialog({ open, onClose, onInvite, currentCollaborators, nostalgiaMode }: InviteCollaboratorDialogProps) {
  const [friends, setFriends] = useState<UserBasic[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadFriends();
      setSelectedIds(new Set());
    }
  }, [open]);

  const loadFriends = async () => {
    setIsLoading(true);
    try {
      const data = await fetchFriends();
      setFriends(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const availableFriends = friends.filter(f => !currentCollaborators.includes(f._id));

  const handleToggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleInvite = () => {
    onInvite(Array.from(selectedIds));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      <DialogTitle className="font-display font-black text-amber-950 text-lg sm:text-xl md:text-2xl pb-1 flex items-center gap-2">
        <UserPlus size={24} className="text-amber-600" /> Invite Friends
      </DialogTitle>
      <DialogContent className="space-y-4 pt-2 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-900/10">
        {isLoading ? (
          <Typography className="text-center text-[10px] sm:text-xs md:text-sm text-amber-900/60 py-4">Loading friends...</Typography>
        ) : availableFriends.length === 0 ? (
          <Typography className="text-center text-[10px] sm:text-xs md:text-sm text-amber-900/60 py-4 italic">
            No more friends available to invite.
          </Typography>
        ) : (
          <div className="space-y-2 mt-2">
            {availableFriends.map(f => {
              const fInitials = f.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
              const isSelected = selectedIds.has(f._id);
              
              return (
                <div 
                  key={f._id} 
                  onClick={() => handleToggle(f._id)}
                  className={`flex justify-between items-center p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected 
                      ? 'bg-amber-50 border-amber-500 shadow-sm' 
                      : 'bg-white border-amber-900/5 hover:border-amber-900/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: nostalgiaMode ? '#5c4a3d' : '#f59e0b', fontSize: '12px', fontWeight: 'bold' }}>{fInitials}</Avatar>
                    <div>
                      <Typography className="text-xs sm:text-sm md:text-base font-bold text-amber-950">{f.name}</Typography>
                      <Typography className="text-[10px] sm:text-xs text-amber-900/60">{f.email}</Typography>
                    </div>
                  </div>
                  <IconButton size="small" className={isSelected ? 'text-amber-600' : 'text-amber-900/20'}>
                    {isSelected ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </IconButton>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
      <DialogActions className="px-6 pb-2 pt-4 border-t border-amber-900/10 mt-2">
        <Button onClick={onClose} className="text-amber-700 font-bold rounded-full">
          Cancel
        </Button>
        <Button 
          onClick={handleInvite} 
          disabled={selectedIds.size === 0} 
          variant="contained" 
          className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-900/10 text-white font-bold rounded-full shadow-none"
        >
          Invite {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
