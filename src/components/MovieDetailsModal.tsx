import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeft,
  Play, 
  Plus, 
  Check, 
  Star, 
  Download, 
  Share2, 
  MessageSquare, 
  Heart, 
  ExternalLink, 
  Lock, 
  Send, 
  FileText, 
  ListPlus, 
  Flag,
  Film,
  Bell
} from 'lucide-react';
import { Movie, Episode } from '../types';
import { useApp } from '../context/AppContext';
import { MovieRatingWidget } from './MovieRatingWidget';

export const MovieDetailsModal: React.FC = () => {
  const { 
    selectedMovie, 
    setSelectedMovie, 
    startPlaying, 
    currentUser, 
    toggleFavorite, 
    togglePlaylist, 
    toggleDownload,
    comments,
    addComment,
    movies,
    submitMovieRequest,
    setIsAuthModalOpen,
    getMovieRatingStats
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'ratings' | 'episodes' | 'downloads' | 'comments'>('overview');
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMovie(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedMovie]);

  if (!selectedMovie) return null;

  const movie = selectedMovie;
  const isFavorite = currentUser?.favorites?.includes(movie.id) || false;
  const inPlaylist = currentUser?.playlist?.includes(movie.id) || false;
  const isDownloaded = currentUser?.downloads?.includes(movie.id) || false;

  const ratingStats = getMovieRatingStats(movie.id);
  const movieComments = comments.filter(c => c.movieId === movie.id);
  const relatedMovies = movies.filter(m => m.id !== movie.id && m.genres.some(g => movie.genres.includes(g))).slice(0, 4);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!newCommentText.trim()) return;
    addComment(movie.id, newCommentText);
    setNewCommentText('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReport = () => {
    submitMovieRequest(`[Report Issue] ${movie.title}`, movie.type, 'User reported broken link or playback issue.');
    setReportSuccess(true);
    setTimeout(() => setReportSuccess(false), 3000);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedMovie(null);
      }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-start p-2 sm:p-4 overflow-y-auto animate-in fade-in"
    >
      {/* Floating Top Fixed Header (Always pinned to top of screen, never scrolls away) */}
      <div className="sticky top-2 z-50 w-full max-w-4xl py-2.5 px-4 my-2 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 shrink-0">
        <button 
          onClick={() => setSelectedMovie(null)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Browse (Exit)</span>
        </button>

        <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px] sm:max-w-md">
          {movie.title}
        </span>

        <button 
          onClick={() => setSelectedMovie(null)}
          className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
        >
          <span className="hidden sm:inline">Close</span>
          <X className="w-4 h-4 text-red-400" />
        </button>
      </div>

      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl text-left mb-12">
        
        {/* Modal Hero Banner */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-zinc-950">
          <img 
            src={movie.bannerUrl || movie.posterUrl} 
            alt={movie.title}
            className="w-full h-full object-cover object-center filter brightness-90" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-transparent to-transparent" />

          {/* Banner Details */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src={movie.posterUrl} 
                alt={movie.title} 
                className="w-20 h-28 sm:w-28 sm:h-40 rounded-xl object-cover border-2 border-zinc-700 shadow-xl hidden sm:block"
              />
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white font-extrabold text-[10px] uppercase">
                    {movie.type}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold text-xs flex items-center gap-1 shadow-sm" title="IMDb Rating">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> IMDb {movie.imdbRating}
                  </span>
                  <button
                    onClick={() => setActiveTab('ratings')}
                    className="px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-500/25 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                    title="5-Star Audience Rating · Click to View Ratings & Rate"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{ratingStats.totalRatings > 0 ? `${ratingStats.averageRating.toFixed(1)} ★` : 'Rate Title'}</span>
                    <span className="text-[10px] text-zinc-300 font-normal">
                      ({ratingStats.totalRatings})
                    </span>
                  </button>
                  <span className="text-xs text-zinc-300 font-semibold">{movie.ageRating}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                  {movie.title}
                </h2>
                <p className="text-xs text-zinc-400 mt-1 font-medium">
                  {movie.language} • Released {movie.releaseDate}
                </p>
              </div>
            </div>

            {/* Quick Play & Action */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button 
                onClick={() => { setSelectedMovie(null); startPlaying(movie, selectedEpisode || undefined); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Play Now
              </button>
              <button 
                onClick={() => toggleFavorite(movie.id)}
                className={`p-2.5 rounded-xl border transition-all ${isFavorite ? 'bg-rose-600/20 border-rose-500 text-rose-400' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}
                title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-400' : ''}`} />
              </button>
              <button 
                onClick={() => togglePlaylist(movie.id)}
                className={`p-2.5 rounded-xl border transition-all ${inPlaylist ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}
                title={inPlaylist ? 'In Watchlist' : 'Add to Watchlist'}
              >
                {inPlaylist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setActiveTab('ratings')}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all cursor-pointer text-xs font-bold ${
                  ratingStats.userRating 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10' 
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-amber-400 hover:border-amber-500/50'
                }`}
                title={ratingStats.userRating ? `You rated ${ratingStats.userRating} / 5 stars · Click to update` : 'Rate this title (1-5 stars)'}
              >
                <Star className={`w-4 h-4 ${ratingStats.userRating ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
                <span>{ratingStats.userRating ? `Rated ${ratingStats.userRating}★` : 'Rate'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 border-b border-zinc-800 bg-zinc-900/50 overflow-x-auto slim-scrollbar">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${activeTab === 'overview' ? 'border-red-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('ratings')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === 'ratings' ? 'border-red-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Ratings & Reviews</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              {ratingStats.totalRatings > 0 ? `${ratingStats.averageRating.toFixed(1)} ★` : 'Rate'}
            </span>
          </button>
          {movie.episodes && movie.episodes.length > 0 && (
            <button 
              onClick={() => setActiveTab('episodes')}
              className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${activeTab === 'episodes' ? 'border-red-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
            >
              Episodes ({movie.episodes.length})
            </button>
          )}
          <button 
            onClick={() => setActiveTab('downloads')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${activeTab === 'downloads' ? 'border-red-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
          >
            Downloads & Links
          </button>
          <button 
            onClick={() => setActiveTab('comments')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${activeTab === 'comments' ? 'border-red-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
          >
            Comments ({movieComments.length})
          </button>
        </div>

        {/* Modal Tab Contents */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[60vh] sm:max-h-[65vh] overflow-y-auto slim-scrollbar">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-300 mb-2">Synopsis</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">{movie.description}</p>
              </div>

              {/* Tags & Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/60 border border-zinc-800 p-4 rounded-2xl">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Category</div>
                  <div className="text-xs font-bold text-white mt-0.5">{movie.category}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Views</div>
                  <div className="text-xs font-bold text-white mt-0.5">{movie.viewsCount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Likes</div>
                  <div className="text-xs font-bold text-white mt-0.5">{movie.likesCount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Downloads</div>
                  <div className="text-xs font-bold text-white mt-0.5">{movie.downloadsCount.toLocaleString()}</div>
                </div>
              </div>

              {/* 5-Star Rating Component & Community Average Review Widget */}
              <MovieRatingWidget 
                movieId={movie.id} 
                movieTitle={movie.title} 
              />

              {/* Action utilities */}
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copiedLink ? 'Link Copied!' : 'Share Link'}
                </button>

                <button 
                  onClick={handleReport}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors"
                >
                  <Flag className="w-3.5 h-3.5 text-amber-400" />
                  {reportSuccess ? 'Issue Reported!' : 'Report Issue'}
                </button>
              </div>

              {/* Related Movies */}
              {relatedMovies.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-zinc-300 mb-3">You May Also Like</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {relatedMovies.map(rm => (
                      <div 
                        key={rm.id}
                        onClick={() => setSelectedMovie(rm)}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 cursor-pointer hover:border-red-500 transition-colors"
                      >
                        <img src={rm.posterUrl} alt={rm.title} className="w-full h-28 object-cover rounded-lg mb-2" />
                        <div className="text-xs font-bold text-white truncate">{rm.title}</div>
                        <div className="text-[10px] text-zinc-500">{rm.genres[0]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: RATINGS & REVIEWS */}
          {activeTab === 'ratings' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <MovieRatingWidget 
                movieId={movie.id} 
                movieTitle={movie.title} 
              />
            </div>
          )}

          {/* TAB 2: EPISODES (ANIME) */}
          {activeTab === 'episodes' && movie.episodes && (
            <div className="space-y-3">
              {/* Watchlist Episode Alert Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-red-600/20 text-red-500">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">
                      {inPlaylist ? 'Watchlist Episode Notifications Active' : 'Get Notified on New Episodes'}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {inPlaylist
                        ? 'Real-time browser notifications will pop up when new episodes drop.'
                        : 'Add this anime to your Watchlist to receive instant browser alerts.'}
                    </span>
                  </div>
                </div>

                {!inPlaylist ? (
                  <button
                    onClick={() => togglePlaylist(movie.id)}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-[11px] cursor-pointer shadow-md shadow-red-600/20 transition-all flex items-center gap-1 self-start sm:self-auto"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add to Watchlist</span>
                  </button>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase flex items-center gap-1 self-start sm:self-auto">
                    <Check className="w-3 h-3" /> Watchlist Active
                  </span>
                )}
              </div>

              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                All Episodes ({movie.episodes.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {movie.episodes.map(ep => (
                  <div 
                    key={ep.id}
                    onClick={() => { setSelectedMovie(null); startPlaying(movie, ep); }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-red-500 cursor-pointer transition-all group"
                  >
                    <div className="relative w-24 h-14 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0">
                      <img src={ep.thumbnailUrl || movie.bannerUrl} alt={ep.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-red-600/80 transition-colors">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-red-400">EP {ep.episodeNumber}</div>
                      <div className="text-xs font-bold text-white truncate">{ep.title}</div>
                      <div className="text-[10px] text-zinc-500">{ep.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DOWNLOADS & LINKS */}
          {activeTab === 'downloads' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/30 to-zinc-900 border border-red-900/40">
                <div className="flex items-center gap-2 text-sm font-bold text-red-400 mb-1">
                  <Download className="w-4 h-4" /> High Speed Multi-Host Download Server
                </div>
                <p className="text-xs text-zinc-400">
                  Select your preferred download host or direct ZIP package. All links are scanned for viruses.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a 
                  href={movie.downloadLinks?.gdrive || '#'}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => toggleDownload(movie.id)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                      GD
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Google Drive</div>
                      <div className="text-[10px] text-zinc-500">Fast Cloud Mirror</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500" />
                </a>

                <a 
                  href={movie.downloadLinks?.zipFile || '#'}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => toggleDownload(movie.id)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-amber-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                      ZIP
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Full Movie/Episode ZIP</div>
                      <div className="text-[10px] text-zinc-500">Includes Subtitles & Posters</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-zinc-500" />
                </a>

                <a 
                  href={movie.downloadLinks?.direct || movie.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => toggleDownload(movie.id)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      MP4
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Direct Video Link</div>
                      <div className="text-[10px] text-zinc-500">1080p Ultra HD Stream</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 4: COMMENTS */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder={currentUser ? "Write a comment..." : "Sign in to leave a comment"}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  disabled={!currentUser}
                  className="flex-1 bg-zinc-950 border border-zinc-800 text-xs text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-red-500"
                />
                <button 
                  type="submit" 
                  disabled={!currentUser}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Post
                </button>
              </form>

              <div className="space-y-3 pt-2">
                {movieComments.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-4 text-center">No comments yet. Be the first to start the discussion!</p>
                ) : (
                  movieComments.map(c => (
                    <div key={c.id} className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <img src={c.userAvatar} alt={c.username} className="w-6 h-6 rounded-full" />
                          <span className="text-xs font-bold text-white">{c.username}</span>
                          {c.isPinned && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold">
                              Pinned
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed pl-8">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Exit Bar */}
        <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between gap-4">
          <span className="text-xs text-zinc-500">Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">ESC</kbd> or click outside to exit</span>
          <button 
            onClick={() => setSelectedMovie(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-red-500" />
            <span>Back to Browse (Exit)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
