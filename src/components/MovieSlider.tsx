import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';
import { useApp } from '../context/AppContext';

interface MovieSliderProps {
  title: string;
  icon?: React.ReactNode;
  movies: Movie[];
  isContinueWatching?: boolean;
}

export const MovieSlider: React.FC<MovieSliderProps> = ({ title, icon, movies, isContinueWatching }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useApp();

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.75;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative py-4 px-4 lg:px-8 text-left group/row">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 font-display tracking-tight">
          {icon || <Sparkles className="w-5 h-5 text-red-500" />}
          {title}
          <span className="text-xs font-normal text-zinc-500 ml-2 font-sans">
            ({movies.length})
          </span>
        </h2>

        {/* Carousel Arrow Controls */}
        <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
          <button 
            onClick={() => scroll('left')}
            className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Slider track */}
      <div 
        ref={sliderRef}
        className="flex items-center gap-3 md:gap-4 overflow-x-auto scrollbar-none py-2 pr-4 scroll-smooth"
      >
        {movies.map(movie => {
          if (!movie || !movie.id) return null;
          let progressPercent = 0;
          if (isContinueWatching && currentUser?.watchHistory) {
            const h = currentUser.watchHistory.find(item => item.movieId === movie.id);
            if (h && h.durationSeconds > 0) {
              progressPercent = (h.progressSeconds / h.durationSeconds) * 100;
            }
          }
          return (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              progressPercentage={isContinueWatching ? progressPercent : undefined} 
            />
          );
        })}
      </div>
    </div>
  );
};
