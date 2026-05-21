'use client';

import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = true
}: ConfirmDialogProps) {
  return (
    <Dialog 
      open={open} 
      onClose={onCancel}
      slotProps={{
        paper: {
          sx: { borderRadius: '16px', padding: 1, minWidth: '300px' }
        }
      }}
    >
      <DialogTitle>
        <Typography className="font-display font-black text-amber-950 text-lg">
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography className="text-sm text-gray-700">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        <Button 
          onClick={onCancel} 
          className="text-gray-500 hover:bg-gray-50 rounded-full font-bold px-4"
        >
          {cancelText}
        </Button>
        <Button 
          onClick={() => {
            onConfirm();
            onCancel();
          }} 
          variant="contained" 
          className={`rounded-full font-bold px-5 shadow-none ${
            isDestructive 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-amber-600 hover:bg-amber-700 text-white'
          }`}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
