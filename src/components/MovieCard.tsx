import React from 'react';
import { Play, Plus, Check, Star, Lock, Heart } from 'lucide-react';
import { Movie } from '../types';
import { useApp } from '../context/AppContext';

export const MovieCard: React.FC<{ movie: Movie; progressPercentage?: number }> = ({ movie, progressPercentage }) => {
  const { setSelectedMovie, startPlaying, currentUser, toggleFavorite, togglePlaylist } = useApp();

  if (!movie) return null;

  const isFavorite = currentUser?.favorites?.includes(movie.id) || false;
  const inPlaylist = currentUser?.playlist?.includes(movie.id) || false;

  return (
    <div 
      className="group relative flex-shrink-0 w-44 sm:w-52 md:w-60 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 hover:border-red-500/50 shadow-xl transition-all duration-300 hover:scale-105 hover:z-20 cursor-pointer"
      onClick={() => setSelectedMovie(movie)}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
        <img 
          src={movie.posterUrl} 
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        
        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          {movie.isPremiumOnly ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-black font-extrabold text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-md">
              <Lock className="w-3 h-3" /> VIP
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-zinc-900/80 border border-zinc-700/80 text-zinc-300 font-extrabold text-[10px]">
              HD
            </span>
          )}

          <span className="px-2 py-0.5 rounded-md bg-black/80 text-amber-400 font-bold text-[10px] flex items-center gap-1 backdrop-blur-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {movie.imdbRating}
          </span>
        </div>

        {/* Watch Progress Bar (For Continue Watching Row) */}
        {progressPercentage !== undefined && progressPercentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800 z-10">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-r-full" 
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
          </div>
        )}

        {/* Hover Quick Overlay Action Buttons */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-left">
          <div className="flex items-center gap-2 mb-2">
            <button 
              onClick={(e) => { e.stopPropagation(); startPlaying(movie); }}
              className="p-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/50 hover:scale-110 transition-transform"
              title="Play"
            >
              <Play className="w-4 h-4 fill-white ml-0.5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); toggleFavorite(movie.id); }}
              className={`p-2 rounded-full border backdrop-blur-md transition-all ${
                isFavorite 
                  ? 'bg-rose-600/30 border-rose-500 text-rose-400' 
                  : 'bg-zinc-900/80 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
              title="Favorite"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-400' : ''}`} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); togglePlaylist(movie.id); }}
              className={`p-2 rounded-full border backdrop-blur-md transition-all ${
                inPlaylist 
                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-400' 
                  : 'bg-zinc-900/80 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
              title="Playlist"
            >
              {inPlaylist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-xs font-bold text-white truncate">{movie.title}</div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1">
            <span className="capitalize">{movie.type}</span>
            <span>•</span>
            <span>{movie.genres[0]}</span>
            <span>•</span>
            <span>{movie.ageRating}</span>
          </div>
        </div>
      </div>

      {/* Card Base Metadata */}
      <div className="p-3 text-left space-y-1">
        <div className="flex items-center justify-between gap-1">
          <h3 className="text-xs font-bold text-zinc-100 truncate group-hover:text-red-400 transition-colors flex-1">
            {movie.title}
          </h3>
          <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5 shrink-0">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {movie.imdbRating}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-zinc-400">
          <span className="capitalize px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-semibold">{movie.type}</span>
          <span className="truncate text-zinc-400 text-[10px]">{movie.genres[0]}</span>
          <span className="text-zinc-500 font-mono">{movie.releaseDate.split('-')[0]}</span>
        </div>
      </div>
    </div>
  );
};
