import React, { useState, useMemo } from 'react';
import { Sparkles, Film, Tv, Clapperboard, X, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MovieCard } from './MovieCard';
import { Movie } from '../types';

const ALPHABETS = [
  '#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 
  'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

export const AlphabetDirectory: React.FC = () => {
  const { movies, selectedLetter, setSelectedLetter, setSelectedMovie } = useApp();
  const [activeFilterType, setActiveFilterType] = useState<'all' | 'anime' | 'movie'>('all');

  // Compute counts per letter for visual feedback
  const letterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALPHABETS.forEach(char => {
      counts[char] = 0;
    });

    movies.forEach(m => {
      if (!m || !m.title) return;
      const firstChar = m.title.trim().charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstChar)) {
        counts[firstChar] = (counts[firstChar] || 0) + 1;
      } else {
        counts['#'] = (counts['#'] || 0) + 1;
      }
    });

    return counts;
  }, [movies]);

  // Filter movies matching the selected letter and sub-type
  const matchingMovies = useMemo(() => {
    if (!selectedLetter || selectedLetter === 'All') return [];

    return movies.filter(m => {
      if (!m || !m.title) return false;

      // Type filter
      if (activeFilterType === 'anime' && m.type !== 'anime') return false;
      if (activeFilterType === 'movie' && m.type !== 'movie') return false;

      // Alphabet match
      const title = m.title.trim();
      if (selectedLetter === '#') {
        return /^[^a-zA-Z]/.test(title);
      }
      return title.toUpperCase().startsWith(selectedLetter.toUpperCase());
    });
  }, [movies, selectedLetter, activeFilterType]);

  const handleLetterClick = (letter: string) => {
    if (selectedLetter === letter) {
      setSelectedLetter('All'); // Toggle off
    } else {
      setSelectedLetter(letter);
      // Smooth scroll to the results section if letter selected
      const el = document.getElementById('alphabet-directory-results');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  return (
    <section id="alphabet-directory-section" className="w-full pt-6 pb-2 text-left">
      {/* Directory Card Container matching the uploaded design */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl bg-[#0a0a12]/95 border border-zinc-800/80 shadow-2xl p-5 sm:p-7 backdrop-blur-xl overflow-hidden">
        
        {/* Subtle Ambient Background Accent */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-800/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white font-display tracking-wide flex items-center gap-2">
                A to Z Alphabetical Directory
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase">
                  A-Z Index
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Click any letter to instantly browse all Anime, Movies & Series starting with that alphabet
              </p>
            </div>
          </div>

          {/* Sub Type Filter & Reset */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-zinc-900/90 rounded-xl p-1 border border-zinc-800">
              <button
                onClick={() => setActiveFilterType('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilterType === 'all'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilterType('anime')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeFilterType === 'anime'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Tv className="w-3 h-3" /> Anime
              </button>
              <button
                onClick={() => setActiveFilterType('movie')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeFilterType === 'movie'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Film className="w-3 h-3" /> Movies
              </button>
            </div>

            {selectedLetter && selectedLetter !== 'All' && (
              <button
                onClick={() => setSelectedLetter('All')}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700"
              >
                <X className="w-3.5 h-3.5" /> Clear ({selectedLetter})
              </button>
            )}
          </div>
        </div>

        {/* ALPHABET BAR (Exact style from user's Image 1 & 2) */}
        <div className="relative z-10 pt-5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
            
            {/* "All" button */}
            <button
              onClick={() => setSelectedLetter('All')}
              className={`px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer tracking-wider ${
                !selectedLetter || selectedLetter === 'All'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 scale-105 border border-red-500'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              ALL
            </button>

            {/* A-Z Alphabet Pills */}
            {ALPHABETS.map((char) => {
              const isSelected = selectedLetter === char;
              const count = letterCounts[char] || 0;
              const hasItems = count > 0;

              return (
                <button
                  key={char}
                  onClick={() => handleLetterClick(char)}
                  title={`${count} titles start with '${char}'`}
                  className={`relative min-w-[32px] sm:min-w-[40px] h-9 sm:h-10 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center tracking-wider ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 scale-110 border border-red-500 z-20'
                      : hasItems
                      ? 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800/90 hover:border-red-500/40'
                      : 'bg-zinc-950/60 text-zinc-600 hover:text-zinc-400 border border-zinc-900 hover:border-zinc-800'
                  }`}
                >
                  {char}

                  {/* Dot indicator if items exist */}
                  {hasItems && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-500/80" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* LIVE RESULTS SECTION WHEN A LETTER IS SELECTED */}
        {selectedLetter && selectedLetter !== 'All' && (
          <div id="alphabet-directory-results" className="relative z-10 mt-6 pt-6 border-t border-zinc-800/70 space-y-4">
            
            {/* Result Header Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-red-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                  {selectedLetter}
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white font-display">
                    {matchingMovies.length} {matchingMovies.length === 1 ? 'Title' : 'Titles'} Starting With "{selectedLetter}"
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Showing {activeFilterType === 'all' ? 'Anime, Movies & Series' : activeFilterType === 'anime' ? 'Anime Series' : 'Movies'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLetter('All')}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
              >
                Close Directory Results <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Grid of Movie Cards */}
            {matchingMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-2">
                {matchingMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-zinc-950/60 rounded-2xl border border-zinc-900 space-y-3">
                <p className="text-zinc-300 text-sm font-semibold">
                  No {activeFilterType === 'all' ? 'content' : activeFilterType} starting with "{selectedLetter}" found.
                </p>
                <p className="text-xs text-zinc-500">
                  Try clicking other letters like 
                  <button onClick={() => setSelectedLetter('A')} className="text-red-400 font-bold mx-1 hover:underline">A</button>, 
                  <button onClick={() => setSelectedLetter('D')} className="text-red-400 font-bold mx-1 hover:underline">D</button>, 
                  <button onClick={() => setSelectedLetter('J')} className="text-red-400 font-bold mx-1 hover:underline">J</button>, 
                  <button onClick={() => setSelectedLetter('N')} className="text-red-400 font-bold mx-1 hover:underline">N</button>, or 
                  <button onClick={() => setSelectedLetter('S')} className="text-red-400 font-bold mx-1 hover:underline">S</button>
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
