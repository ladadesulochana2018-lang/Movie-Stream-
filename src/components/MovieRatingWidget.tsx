import React, { useState } from 'react';
import { Star, CheckCircle, RotateCcw, UserCheck, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MovieRatingWidgetProps {
  movieId: string;
  movieTitle: string;
  className?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: '1.0 · Poor',
  2: '2.0 · Fair',
  3: '3.0 · Good',
  4: '4.0 · Very Good',
  5: '5.0 · Masterpiece!'
};

export const MovieRatingWidget: React.FC<MovieRatingWidgetProps> = ({
  movieId,
  movieTitle,
  className = ''
}) => {
  const { getMovieRatingStats, rateMovie, removeMovieRating, currentUser, setIsAuthModalOpen } = useApp();

  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const stats = getMovieRatingStats(movieId);
  const { averageRating, totalRatings, userRating, distribution } = stats;

  const currentDisplayStar = hoveredStar !== null ? hoveredStar : (userRating || 0);

  const handleRate = (star: number) => {
    rateMovie(movieId, star);
    const label = RATING_LABELS[star] || `${star}.0`;
    setFeedbackMessage(`Rated ${label} ⭐!`);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  const handleRemoveRating = () => {
    removeMovieRating(movieId);
    setFeedbackMessage('Rating removed.');
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 2500);
  };

  return (
    <div className={`bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 text-left ${className}`}>
      
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800/80">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Audience & Community Rating</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real user feedback and 5-star community reviews for {movieTitle}
          </p>
        </div>

        {userRating && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              Your Vote: {userRating}/5 ★
            </span>
            <button
              onClick={handleRemoveRating}
              className="text-[10px] text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1 p-1"
              title="Remove your rating"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Average Score Display & Star Distribution Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 py-4 items-center">
        
        {/* Left Column: Big Average Rating Score */}
        <div className="md:col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-amber-400 font-display tracking-tight">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-zinc-500 text-sm font-bold">/ 5.0</span>
          </div>

          {/* Average Stars Visual (Precision Meter) */}
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((starIdx) => {
              const fillPercentage = Math.max(0, Math.min(1, averageRating - (starIdx - 1))) * 100;
              return (
                <div key={starIdx} className="relative w-5 h-5 flex items-center justify-center">
                  {/* Empty star outline */}
                  <Star className="w-5 h-5 text-zinc-700" />
                  {/* Filled star overlay with clipping */}
                  {fillPercentage > 0 && (
                    <div 
                      className="absolute inset-0 overflow-hidden" 
                      style={{ width: `${fillPercentage}%` }}
                    >
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-xs text-zinc-400 font-medium">
            Based on <span className="font-bold text-zinc-200">{totalRatings.toLocaleString()}</span> user {totalRatings === 1 ? 'rating' : 'ratings'}
          </div>

          <div className="mt-2 text-[11px] text-zinc-500">
            {averageRating >= 4.5 ? '⭐ Highly acclaimed by audience' : averageRating >= 4.0 ? '👍 Generally favorable reviews' : '✨ Mixed audience reception'}
          </div>
        </div>

        {/* Right Column: Rating Distribution Bars */}
        <div className="md:col-span-7 space-y-1.5 bg-zinc-900/20 p-3.5 rounded-xl border border-zinc-800/40">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star as 1 | 2 | 3 | 4 | 5] || 0;
            const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2.5 text-xs">
                <span className="w-7 text-right font-bold text-zinc-400 flex items-center justify-end gap-1 text-[11px]">
                  <span>{star}</span>
                  <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                </span>

                {/* Bar */}
                <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="w-16 text-right flex items-center justify-end gap-1 text-[11px] text-zinc-400">
                  <span className="font-semibold text-zinc-300">{percentage}%</span>
                  <span className="text-[10px] text-zinc-500">({count})</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Interactive Rating Area: Rate This Movie */}
      <div className="mt-2 pt-4 border-t border-zinc-800/80 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{userRating ? 'Update Your Rating:' : 'Rate This Title:'}</span>
              {currentDisplayStar > 0 && (
                <span className="text-amber-400 font-extrabold text-xs">
                  {RATING_LABELS[currentDisplayStar]}
                </span>
              )}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {currentUser 
                ? `Logged in as ${currentUser.username} • Tap stars to submit`
                : 'Guest viewer • Click any star to cast your vote'}
            </div>
          </div>

          {/* Star Buttons */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= currentDisplayStar;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  aria-label={`Rate ${star} out of 5 stars`}
                  className="p-1 rounded-lg hover:bg-zinc-800/80 transition-all cursor-pointer transform hover:scale-125 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <Star 
                    className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-150 ${
                      isFilled 
                        ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' 
                        : 'text-zinc-600 hover:text-zinc-400'
                    }`} 
                  />
                </button>
              );
            })}
          </div>

        </div>

        {/* Feedback message banner */}
        {feedbackMessage && (
          <div className="mt-3 py-1.5 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {!currentUser && (
          <div className="mt-2.5 pt-2 border-t border-zinc-800/40 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Want your ratings saved across all devices?</span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer"
            >
              Sign in now →
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
