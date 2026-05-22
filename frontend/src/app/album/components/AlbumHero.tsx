import React from 'react';
import { Box, Typography, IconButton, Button, Stack } from '@mui/material';
import { Calendar, Edit2, Play, Trash2, Check, X, UserPlus } from 'lucide-react';

interface Album {
  _id: string;
  title: string;
  coverPhotoUrl: string;
  createdAt?: string;
  userId?: any;
  sharedWith?: any[];
}

interface AlbumHeroProps {
  album: Album;
  albumPhotosCount: number;
  coverUrl: string;
  nostalgiaMode: boolean;
  isEditingTitle: boolean;
  editedTitle: string;
  setEditedTitle: (title: string) => void;
  setIsEditingTitle: (editing: boolean) => void;
  handleRenameAlbum: () => void;
  handleDeleteAlbum: () => void;
  startSlideshow: () => void;
  onInviteClick?: () => void;
  onRemoveCollaborator?: (userId: string, userName: string) => void;
  currentUser?: any;
}

export default function AlbumHero({
  album,
  albumPhotosCount,
  coverUrl,
  nostalgiaMode,
  isEditingTitle,
  editedTitle,
  setEditedTitle,
  setIsEditingTitle,
  handleRenameAlbum,
  handleDeleteAlbum,
  startSlideshow,
  onInviteClick,
  onRemoveCollaborator,
  currentUser
}: AlbumHeroProps) {
  return (
    <Box 
      className="relative w-full h-[320px] sm:h-[400px] rounded-2xl overflow-hidden shadow-2xl border border-amber-900/10 flex items-end p-8 sm:p-12"
    >
      {/* Cover Photo */}
      <img 
        src={coverUrl} 
        alt={album.title} 
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ${
          nostalgiaMode ? 'sepia-[0.2] contrast-95 brightness-90' : 'brightness-95'
        }`}
      />
      {/* Cinematic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

      {/* Album Info & Controls inside Cover */}
      <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-3 max-w-xl">
          <span className="bg-amber-500 text-amber-950 font-mono text-[9px] sm:text-[11px] sm:text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
            Memory Album
          </span>
          
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="font-display font-black text-white text-2xl sm:text-3xl md:text-4xl sm:text-4xl md:text-5xl bg-white/10 border-b-2 border-amber-500 outline-none px-2 py-1 rounded-t-lg max-w-md w-full"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameAlbum();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
              />
              <IconButton onClick={handleRenameAlbum} className="bg-amber-500 text-amber-950 hover:bg-amber-600 p-2">
                <Check size={20} />
              </IconButton>
              <IconButton onClick={() => setIsEditingTitle(false)} className="bg-white/10 text-white hover:bg-white/20 p-2">
                <X size={20} />
              </IconButton>
            </div>
          ) : (
            <div className="flex items-center gap-3 group">
              <Typography variant="h2" className="font-display font-black text-white text-2xl sm:text-3xl md:text-4xl sm:text-4xl md:text-5xl leading-tight">
                {album.title}
              </Typography>
              <IconButton 
                onClick={() => {
                  setEditedTitle(album.title);
                  setIsEditingTitle(true);
                }}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white/10 text-white hover:bg-white/20 p-1.5 sm:p-2 rounded-full flex-shrink-0"
                title="Rename Album"
              >
                <Edit2 size={14} className="sm:w-4 sm:h-4" />
              </IconButton>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/70 text-[10px] sm:text-xs md:text-sm sm:text-sm font-mono font-bold">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-400" />
              <span>Created {album.createdAt ? new Date(album.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}</span>
            </div>
            <span>•</span>
            <span>{albumPhotosCount} Captured Moment{albumPhotosCount !== 1 ? 's' : ''}</span>
          </div>

          {/* Shared Album Indicators */}
          {currentUser && album.userId && (album.userId === currentUser.id || album.userId._id === currentUser.id) && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-white/60 text-[10px] sm:text-xs sm:text-xs font-bold uppercase tracking-widest">Shared With:</span>
              <div className="flex items-center">
                <div className="flex -space-x-1.5 mr-3">
                  {album.sharedWith && album.sharedWith.length > 0 ? album.sharedWith.map(sw => {
                    const nameStr = typeof sw === 'string' ? '' : (sw.name || '');
                    return (
                      <button 
                        key={sw._id || sw} 
                        onClick={() => onRemoveCollaborator?.(sw._id || sw, nameStr)}
                        className="w-6 h-6 rounded-full bg-amber-600 border border-white/20 text-[9px] sm:text-[11px] flex items-center justify-center text-white font-bold shadow-md z-10 uppercase hover:bg-red-500 hover:scale-110 hover:z-20 transition-all focus:outline-none" 
                        title={`Remove ${nameStr || 'User'}`}
                      >
                        {nameStr ? nameStr.substring(0, 2) : 'U'}
                      </button>
                    );
                  }) : (
                    <span className="text-white/40 text-[10px] sm:text-xs sm:text-xs italic ml-1 mr-1">Just you</span>
                  )}
                </div>
                <button 
                  onClick={onInviteClick} 
                  className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md shadow-lg border border-white/30 ml-1 transition-all hover:scale-105 outline-none" 
                  title="Invite Friends"
                >
                  <UserPlus size={18} strokeWidth={2.5} className="text-white ml-[2px]" />
                </button>
              </div>
            </div>
          )}
          {currentUser && album.userId && album.userId !== currentUser.id && album.userId._id !== currentUser.id && (
            <div className="flex items-center gap-2 pt-2">
              <div className="px-2 py-1 bg-white/10 backdrop-blur-md rounded border border-white/10 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[8px] sm:text-[10px] text-white font-bold uppercase">
                  {album.userId.name ? album.userId.name.substring(0, 2) : 'U'}
                </div>
                <span className="text-white/90 text-[10px] sm:text-xs sm:text-xs font-bold tracking-wide">Shared by {album.userId.name || 'Unknown'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} className="flex-shrink-0 flex-wrap justify-end">
          {albumPhotosCount > 0 && (
            <Button
              variant="contained"
              onClick={startSlideshow}
              startIcon={<Play size={16} strokeWidth={3} />}
              className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-display font-black text-[10px] sm:text-xs sm:text-xs md:text-sm uppercase tracking-wider rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-lg shadow-amber-500/20"
            >
              Slideshow
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={handleDeleteAlbum}
            startIcon={<Trash2 size={16} />}
            className="border-red-500/40 hover:border-red-600 text-red-400 hover:bg-red-950/20 font-display font-bold text-[10px] sm:text-xs sm:text-xs md:text-sm uppercase tracking-wider rounded-full px-4 sm:px-6 py-2 sm:py-3 backdrop-blur-sm"
          >
            Delete Album
          </Button>
        </Stack>
      </div>
    </Box>
  );
}
