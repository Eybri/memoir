import React from 'react';
import { Box, Typography, IconButton, Button, Stack } from '@mui/material';
import { Calendar, Edit2, Play, Trash2, Check, X } from 'lucide-react';

interface Album {
  _id: string;
  title: string;
  coverPhotoUrl: string;
  createdAt?: string;
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
  startSlideshow
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
          <span className="bg-amber-500 text-amber-950 font-mono text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
            Memory Album
          </span>
          
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="font-display font-black text-white text-3xl sm:text-5xl bg-white/10 border-b-2 border-amber-500 outline-none px-2 py-1 rounded-t-lg max-w-md"
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
              <Typography variant="h2" className="font-display font-black text-white text-3xl sm:text-5xl leading-tight">
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

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/70 text-xs font-mono font-bold">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-400" />
              <span>Created {album.createdAt ? new Date(album.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}</span>
            </div>
            <span>•</span>
            <span>{albumPhotosCount} Captured Moment{albumPhotosCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} className="flex-shrink-0">
          {albumPhotosCount > 0 && (
            <Button
              variant="contained"
              onClick={startSlideshow}
              startIcon={<Play size={16} strokeWidth={3} />}
              className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-display font-black text-xs uppercase tracking-wider rounded-full px-6 py-3 shadow-lg shadow-amber-500/20"
            >
              Slideshow
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={handleDeleteAlbum}
            startIcon={<Trash2 size={16} />}
            className="border-red-500/40 hover:border-red-600 text-red-400 hover:bg-red-950/20 font-display font-bold text-xs uppercase tracking-wider rounded-full px-6 py-3 backdrop-blur-sm"
          >
            Delete Album
          </Button>
        </Stack>
      </div>
    </Box>
  );
}
