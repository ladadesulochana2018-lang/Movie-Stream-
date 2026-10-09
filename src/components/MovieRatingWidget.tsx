import React, { useState } from 'react';
import { Star, CheckCircle, RotateCcw, UserCheck, MessageSquare, ThumbsUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MovieRatingWidgetProps {
  movieId: string;
  movieTitle: string;
  className?: string;
  compact?: boolean;
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
  className = '',
  compact = false
}) => {
  const { 
    getMovieRatingStats, 
    rateMovie, 
    removeMovieRating, 
    movieRatings, 
    currentUser, 
    setIsAuthModalOpen 
  } = useApp();

  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const stats = getMovieRatingStats(movieId);
  const { averageRating, totalRatings, userRating, distribution } = stats;

  const currentDisplayStar = hoveredStar !== null ? hoveredStar : (userRating || 0);

  // All community ratings for this specific movie
  const movieReviews = movieRatings.filter(r => r.movieId === movieId);

  const handleRate = (star: number) => {
    rateMovie(movieId, star);
    const label = RATING_LABELS[star] || `${star}.0`;
    setFeedbackMessage(`Thanks! You rated ${label} ⭐`);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  const handleRemoveRating = () => {
    removeMovieRating(movieId);
    setFeedbackMessage('Your rating has been cleared.');
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 2500);
  };

  return (
    <div className={`bg-zinc-950/85 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 text-left ${className}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800/80">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Audience & Community Rating</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            5-Star community ratings and user feedback for <span className="text-zinc-200 font-semibold">{movieTitle}</span>
          </p>
        </div>

        {userRating ? (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
              <UserCheck className="w-3.5 h-3.5" />
              Your Vote: {userRating}/5 ★
            </span>
            <button
              onClick={handleRemoveRating}
              className="text-[10px] text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1 p-1 cursor-pointer"
              title="Remove your rating"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-zinc-500 font-medium self-start sm:self-auto">
            Not rated by you yet
          </span>
        )}
      </div>

      {/* Main Grid: Average Score Display & Star Distribution Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 py-4 items-center">
        
        {/* Left Column: Big Average Rating Score */}
        <div className="md:col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-amber-400 font-display tracking-tight">
              {totalRatings > 0 ? averageRating.toFixed(1) : '—'}
            </span>
            <span className="text-zinc-500 text-sm font-bold">/ 5.0</span>
          </div>

          {/* Average Stars Visual (Precision Meter) */}
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((starIdx) => {
              const fillPercentage = totalRatings > 0 
                ? Math.max(0, Math.min(1, averageRating - (starIdx - 1))) * 100 
                : 0;
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
                      <Star className="w-5 h-5 min-w-[20px] max-w-none text-amber-400 fill-amber-400 shrink-0" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-xs text-zinc-400 font-medium">
            {totalRatings > 0 ? (
              <>Based on <span className="font-bold text-zinc-200">{totalRatings.toLocaleString()}</span> user {totalRatings === 1 ? 'rating' : 'ratings'}</>
            ) : (
              <span className="text-zinc-400">No user ratings yet · Be the first!</span>
            )}
          </div>

          <div className="mt-2 text-[11px] text-zinc-500">
            {totalRatings === 0 
              ? '✨ Rate below to establish the first community score'
              : averageRating >= 4.5 
                ? '⭐ Highly acclaimed by audience' 
                : averageRating >= 4.0 
                  ? '👍 Generally favorable reviews' 
                  : averageRating >= 3.0
                    ? '✨ Mixed audience reception'
                    : '⚡ Critical user reception'}
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
                : 'Tap any star to cast your vote (saved locally)'}
            </div>
          </div>

          {/* Star Buttons - wrap container with onMouseLeave to prevent flickering */}
          <div 
            onMouseLeave={() => setHoveredStar(null)}
            className="flex items-center gap-1.5 self-start sm:self-auto bg-zinc-950/60 p-1.5 rounded-xl border border-zinc-800/60"
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= currentDisplayStar;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  aria-label={`Rate ${star} out of 5 stars`}
                  className="p-1 rounded-lg hover:bg-zinc-800 transition-all cursor-pointer transform hover:scale-125 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
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
            <span>Want your ratings synced across all devices?</span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer"
            >
              Sign in now →
            </button>
          </div>
        )}

      </div>

      {/* Community Ratings List */}
      {!compact && (
        <div className="mt-4 pt-4 border-t border-zinc-800/70">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5 text-red-500" />
              <span>Community Votes ({movieReviews.length})</span>
            </h4>
            <span className="text-[10px] text-zinc-500">
              {movieReviews.length > 0 ? 'Verified audience members' : 'Be first to rate'}
            </span>
          </div>

          {movieReviews.length === 0 ? (
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
              No ratings recorded yet. Tap any star above to cast the first vote!
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto slim-scrollbar pr-1">
              {movieReviews.map((r, i) => {
                const isMyReview = (currentUser && r.userId === currentUser.uid) || r.username?.includes('You');
                return (
                  <div 
                    key={`${r.userId}_${i}`}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                      isMyReview 
                        ? 'bg-amber-500/5 border-amber-500/30' 
                        : 'bg-zinc-900/40 border-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-amber-600 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0 uppercase">
                        {(r.username || 'U').charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{r.username || 'Guest Viewer'}</span>
                          {isMyReview && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {new Date(r.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-zinc-950/80 px-2 py-1 rounded-lg border border-zinc-800">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-3 h-3 ${star <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-amber-400 ml-1">
                        {r.rating}.0
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
