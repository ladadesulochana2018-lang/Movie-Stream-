import React, { useState } from 'react';
import { Play, Info, Plus, Check, Star, ShieldAlert, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import { Movie } from '../types';
import { useApp } from '../context/AppContext';
import { isGoogleDriveUrl, formatGoogleDrivePreviewUrl, sanitizeVideoUrl } from '../utils/persistentStorage';

export const HeroBanner: React.FC<{ movie?: Movie }> = ({ movie: propMovie }) => {
  const { movies, setSelectedMovie, startPlaying, currentUser, togglePlaylist } = useApp();
  const [showTrailer, setShowTrailer] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const movie = propMovie || movies.find(m => m.isFeatured) || movies[0];

  if (!movie) return null;

  const inPlaylist = currentUser?.playlist?.includes(movie.id) || false;

  return (
    <div className="relative w-full h-[70vh] min-h-[480px] max-h-[720px] bg-zinc-950 overflow-hidden select-none">
      {/* Background Image / Video Backdrop */}
      <div className="absolute inset-0">
        <img 
          src={movie.bannerUrl || movie.posterUrl} 
          alt={movie.title}
          className="w-full h-full object-cover object-center scale-105 filter brightness-90 animate-pulse-slow" 
        />
        {/* Dark Vignette Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-radial-vignette opacity-80" />
      </div>

      {/* Hero Content */}
      <div className="absolute bottom-12 left-0 right-0 max-w-7xl mx-auto px-4 lg:px-8 z-10 flex flex-col items-start gap-4">
        
        {/* Badges & Tags */}
        <div className="flex flex-wrap items-center gap-2">
          {movie.isFeatured && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-lg shadow-red-600/30">
              <Sparkles className="w-3.5 h-3.5" /> Featured Spot
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-md bg-zinc-900/80 border border-zinc-700 text-amber-400 font-bold text-xs flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {movie.imdbRating} IMDb
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-zinc-900/80 border border-zinc-700 text-zinc-300 font-bold text-xs">
            {movie.ageRating}
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-red-950/60 border border-red-800/50 text-red-300 font-bold text-xs uppercase">
            {movie.type}
          </span>
          <span className="text-xs text-zinc-400 font-medium">
            {movie.language}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-2xl font-display drop-shadow-2xl text-left">
          {movie.title}
        </h1>

        {/* Genres */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-zinc-300">
          {movie.genres.map(g => (
            <span key={g} className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
              {g}
            </span>
          ))}
        </div>

        {/* Synopsis */}
        <p className="text-sm md:text-base text-zinc-300/90 max-w-xl line-clamp-3 text-left font-normal leading-relaxed">
          {movie.description}
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button 
            onClick={() => startPlaying(movie)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-xl shadow-red-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            Watch Now
          </button>

          <button 
            onClick={() => setSelectedMovie(movie)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-white font-bold text-sm backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Info className="w-5 h-5 text-zinc-300" />
            More Info
          </button>

          <button 
            onClick={() => togglePlaylist(movie.id)}
            className={`p-3 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
              inPlaylist 
                ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400' 
                : 'bg-zinc-900/80 border-zinc-700/80 text-white hover:bg-zinc-800'
            }`}
            title={inPlaylist ? 'In My List' : 'Add to My List'}
          >
            {inPlaylist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>

          {movie.trailerUrl && (
            <button 
              onClick={() => setShowTrailer(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs backdrop-blur-md"
            >
              Watch Trailer
            </button>
          )}
        </div>
      </div>

      {/* Trailer Popup Modal */}
      {showTrailer && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-red-500 fill-red-500" />
                {movie.title} — Official Trailer
              </span>
              <button 
                onClick={() => setShowTrailer(false)}
                className="p-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              {movie.trailerUrl && (isGoogleDriveUrl(movie.trailerUrl) || movie.trailerUrl.includes('youtube') || movie.trailerUrl.includes('youtu.be')) ? (
                <iframe
                  src={
                    isGoogleDriveUrl(movie.trailerUrl) 
                      ? formatGoogleDrivePreviewUrl(movie.trailerUrl) 
                      : movie.trailerUrl.includes('watch?v=')
                        ? `https://www.youtube.com/embed/${movie.trailerUrl.split('watch?v=')[1]?.split('&')[0]}?autoplay=1`
                        : movie.trailerUrl.includes('youtu.be/')
                          ? `https://www.youtube.com/embed/${movie.trailerUrl.split('youtu.be/')[1]?.split('?')[0]}?autoplay=1`
                          : movie.trailerUrl
                  }
                  title={`${movie.title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <video 
                  src={sanitizeVideoUrl(movie.trailerUrl)} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
