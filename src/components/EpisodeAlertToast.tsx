import React, { useEffect } from 'react';
import { Play, Bell, X, Sparkles, CheckCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const EpisodeAlertToast: React.FC = () => {
  const { episodeAlertToast, dismissEpisodeAlertToast, startPlaying } = useApp();

  useEffect(() => {
    if (!episodeAlertToast) return;
    const timer = setTimeout(() => {
      dismissEpisodeAlertToast();
    }, 9000);
    return () => clearTimeout(timer);
  }, [episodeAlertToast, dismissEpisodeAlertToast]);

  if (!episodeAlertToast) return null;

  const { movie, episode, isWatchlist } = episodeAlertToast;

  const handlePlay = () => {
    dismissEpisodeAlertToast();
    startPlaying(movie, episode);
  };

  return (
    <div className="fixed top-18 sm:top-20 right-3 sm:right-6 z-[100] max-w-sm sm:max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/95 border-2 border-red-500/80 shadow-2xl shadow-red-600/30 backdrop-blur-xl flex items-start gap-3.5 text-left">
        {/* Poster Thumbnail */}
        <div className="relative w-14 sm:w-16 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-700">
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center p-1">
            <span className="text-[9px] font-black text-amber-400">EP {episode.episodeNumber}</span>
          </div>
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[9px] uppercase tracking-wider shadow">
              <Bell className="w-2.5 h-2.5 animate-bounce" />
              {isWatchlist ? 'Watchlist Alert' : 'New Anime Episode'}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> Just Added
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-black text-white truncate leading-tight">
            {movie.title}
          </h4>

          <p className="text-[11px] text-zinc-300 line-clamp-1 font-medium">
            Episode {episode.episodeNumber}: {episode.title}
          </p>

          <div className="flex items-center gap-2 pt-1.5">
            <button
              onClick={handlePlay}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Watch Now</span>
            </button>
            <button
              onClick={dismissEpisodeAlertToast}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={dismissEpisodeAlertToast}
          className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
          title="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
