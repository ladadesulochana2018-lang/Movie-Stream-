import React, { useState } from 'react';
import { Movie } from './types';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MovieSlider } from './components/MovieSlider';
import { MovieCard } from './components/MovieCard';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { VideoPlayer } from './components/VideoPlayer';
import { SubscriptionModal } from './components/SubscriptionModal';
import { AuthModal } from './components/AuthModal';
import { AppLockModal } from './components/AppLockModal';
import { UserProfile } from './components/UserProfile';
import { AdminLayout } from './components/AdminPanel/AdminLayout';
import { AlphabetDirectory } from './components/AlphabetDirectory';
import { CharacterArchCarousel } from './components/CharacterArchCarousel';
import { StorageUsageBar } from './components/StorageUsageBar';
import { SplashIntro } from './components/SplashIntro';
import { Film, Tv, Flame, Star, Sparkles, Search, Clapperboard, Layers, Home, User, Download, ShieldCheck, Crown } from 'lucide-react';

const MainContent: React.FC = () => {
  const { 
    movies, 
    currentUser, 
    isAdmin,
    playingMovie, 
    currentView, 
    setCurrentView,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    selectedCategory,
    setSelectedCategory,
    selectedLetter,
    setSelectedLetter,
    setIsAuthModalOpen,
    showSplashIntro,
    setShowSplashIntro,
    appBranding
  } = useApp();
  
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Filter movies based on category, genre, letter, and search query
  const filteredMovies = movies.filter(m => {
    if (!m) return false;
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory || (selectedCategory === 'Anime' && m.type === 'anime') || (selectedCategory === 'Movies' && m.type === 'movie');
    const matchesGenre = selectedGenre === 'All' || (m.genres && m.genres.includes(selectedGenre));
    const matchesSearch = !searchQuery || (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase())) || (m.genres && m.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesLetter = !selectedLetter || selectedLetter === 'All' || (
      selectedLetter === '#'
        ? /^[^a-zA-Z]/.test(m.title.trim())
        : m.title.trim().toUpperCase().startsWith(selectedLetter.toUpperCase())
    );
    return matchesCategory && matchesGenre && matchesSearch && matchesLetter;
  });

  // Category specific lists
  const moviesOnly = movies.filter(m => m && (m.type === 'movie' || m.category === 'Movies'));
  const animeOnly = movies.filter(m => m && (m.type === 'anime' || m.category === 'Anime'));
  const trendingMovies = movies.filter(m => m && m.isTrending);
  const animeSeries = movies.filter(m => m && m.type === 'anime');
  const latestMovies = [...movies].filter(Boolean).sort((a, b) => new Date(b.releaseDate || '').getTime() - new Date(a.releaseDate || '').getTime());
  const recommendedMovies = movies.filter(m => m && m.imdbRating >= 8.5);

  // Playlist & Downloads
  const playlistMovies = movies.filter(m => m && currentUser?.playlist?.includes(m.id));
  const downloadedMovies = movies.filter(m => m && currentUser?.downloads?.includes(m.id));

  // Continue watching list from history: filter valid in-progress items and sort by most recent timestamp
  const validHistoryItems = (currentUser?.watchHistory || [])
    .filter(h => {
      if (!h || h.completed) return false;
      if (h.progressSeconds < 5) return false;
      if (h.durationSeconds > 0 && h.progressSeconds / h.durationSeconds >= 0.95) return false;
      return true;
    })
    .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime());

  // Deduplicate movies by ID maintaining most recently watched order
  const continueWatchingMovies = validHistoryItems
    .map(h => movies.find(m => m && m.id === h.movieId))
    .filter((m, idx, arr): m is Movie => Boolean(m) && arr.findIndex(item => item?.id === m?.id) === idx);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white relative">
      
      {/* Navigation Header */}
      <Navbar onOpenSubscription={() => setIsSubscriptionModalOpen(true)} />

      {/* ADMIN VIEW */}
      {currentView === 'admin' && (
        <div className="pt-20">
          {isAdmin ? (
            <AdminLayout onBackToSite={() => setCurrentView('home')} />
          ) : (
            <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white font-display">Access Restricted</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                You do not have admin permissions. The Admin Panel is strictly visible to authorized administrators only.
              </p>
              <button 
                onClick={() => setCurrentView('home')} 
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Back to Movies
              </button>
            </div>
          )}
        </div>
      )}

      {/* USER PROFILE VIEW */}
      {currentView === 'profile' && (
        <div className="pt-20">
          <UserProfile onOpenSubscription={() => setIsSubscriptionModalOpen(true)} />
        </div>
      )}

      {/* MAIN VIEWS (HOME, MOVIES, ANIME, TRENDING, MY LIST, DOWNLOADS) */}
      {currentView !== 'admin' && currentView !== 'profile' && (
        <main className="pb-20 pt-16">
          
          {/* Hero Banner (Only on Home View without active search query) */}
          {currentView === 'home' && !searchQuery && <HeroBanner />}

          <div className="px-4 lg:px-8 max-w-[1600px] mx-auto pt-6 space-y-8">
            
            {/* Category / Genre Quick Filters Bar (Shown on Home, Movies, Anime, Trending) */}
            {['home', 'movies', 'anime', 'trending'].includes(currentView) && (
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-950/80 border border-zinc-900 p-4 rounded-2xl backdrop-blur-md">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1.5 md:pb-0 slim-scrollbar">
                  {['All', 'Action', 'Sci-Fi', 'Fantasy', 'Shonen', 'Romance', 'Drama', 'Supernatural'].map(genre => (
                    <button 
                      key={genre}
                      onClick={() => {
                        setSelectedGenre(genre);
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedGenre === genre
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>

                {/* Quick Search Box */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search titles, genres..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            )}

            {/* SEARCH OR GENRE OR ALPHABET FILTER RESULTS */}
            {(searchQuery || selectedGenre !== 'All' || (selectedLetter && selectedLetter !== 'All')) ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
                    <Clapperboard className="w-5 h-5 text-red-500" />
                    {selectedLetter && selectedLetter !== 'All'
                      ? `Letter "${selectedLetter}" Results (${filteredMovies.length})`
                      : `Filtered Results (${filteredMovies.length})`}
                  </h2>
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedGenre('All'); setSelectedLetter('All'); }}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>

                {filteredMovies.length === 0 ? (
                  <div className="text-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800/80 space-y-3">
                    <p className="text-zinc-400 text-sm">No movies or anime match your filter.</p>
                    <button 
                      onClick={() => { setSearchQuery(''); setSelectedGenre('All'); setSelectedLetter('All'); }}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-500 cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredMovies.map(m => (
                      <MovieCard key={m.id} movie={m} />
                    ))}
                  </div>
                )}
              </div>
            ) : currentView === 'movies' ? (
              /* MOVIES TAB VIEW */
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <Film className="w-6 h-6 text-red-500" />
                  <div>
                    <h1 className="text-2xl font-black text-white font-display">Movies Library</h1>
                    <p className="text-xs text-zinc-400">Explore full length HD movies, blockbusters and classics</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {moviesOnly.map(m => (
                    <MovieCard key={m.id} movie={m} />
                  ))}
                </div>
              </div>
            ) : currentView === 'anime' ? (
              /* ANIME TAB VIEW */
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <Tv className="w-6 h-6 text-amber-400" />
                  <div>
                    <h1 className="text-2xl font-black text-white font-display">Anime Series & Movies</h1>
                    <p className="text-xs text-zinc-400">Popular anime shows, Japanese dubs/subs and latest episodes</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {animeOnly.map(m => (
                    <MovieCard key={m.id} movie={m} />
                  ))}
                </div>
              </div>
            ) : currentView === 'trending' ? (
              /* TRENDING TAB VIEW */
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <Flame className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h1 className="text-2xl font-black text-white font-display">Trending Now</h1>
                    <p className="text-xs text-zinc-400">Most watched movies and anime series this week</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {trendingMovies.map(m => (
                    <MovieCard key={m.id} movie={m} />
                  ))}
                </div>
              </div>
            ) : currentView === 'playlist' ? (
              /* MY LIST TAB VIEW */
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <Layers className="w-6 h-6 text-purple-400" />
                  <div>
                    <h1 className="text-2xl font-black text-white font-display">My Watchlist</h1>
                    <p className="text-xs text-zinc-400">Your saved movies and anime series for quick access</p>
                  </div>
                </div>
                {playlistMovies.length === 0 ? (
                  <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-zinc-800/60 space-y-4">
                    <p className="text-zinc-400 text-sm">Your watchlist is currently empty.</p>
                    <button 
                      onClick={() => setCurrentView('home')}
                      className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-500 shadow-lg shadow-red-600/30"
                    >
                      Browse Movies & Anime
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {playlistMovies.map(m => (
                      <MovieCard key={m.id} movie={m} />
                    ))}
                  </div>
                )}
              </div>
            ) : currentView === 'downloads' ? (
              /* DOWNLOADS TAB VIEW */
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <Clapperboard className="w-6 h-6 text-sky-400" />
                  <div>
                    <h1 className="text-2xl font-black text-white font-display">Downloaded Content</h1>
                    <p className="text-xs text-zinc-400">Downloaded titles for offline viewing</p>
                  </div>
                </div>

                {/* Storage Usage Progress Bar & Device Space Manager */}
                <StorageUsageBar />

                {downloadedMovies.length === 0 ? (
                  <div className="text-center py-16 bg-zinc-900/30 rounded-3xl border border-zinc-800/60 space-y-4">
                    <p className="text-zinc-400 text-sm">No downloaded videos yet.</p>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">Click the download button on any movie or anime to save it for offline watching.</p>
                    <button 
                      onClick={() => setCurrentView('home')}
                      className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-500 shadow-lg shadow-red-600/30 cursor-pointer"
                    >
                      Explore Content
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {downloadedMovies.map(m => (
                      <MovieCard key={m.id} movie={m} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* HOME DEFAULT MULTI-ROW SLIDERS */
              <div className="space-y-10">
                {continueWatchingMovies.length > 0 && (
                  <MovieSlider title="Continue Watching" movies={continueWatchingMovies} isContinueWatching icon={<Film className="w-5 h-5 text-sky-400" />} />
                )}

                {/* Toonstream Style Continuous Round Character Arch Carousel */}
                <CharacterArchCarousel />

                <MovieSlider title="Trending Movies" movies={trendingMovies} icon={<Flame className="w-5 h-5 text-red-500" />} />
                
                <MovieSlider title="Popular Anime Series" movies={animeSeries} icon={<Tv className="w-5 h-5 text-amber-400" />} />

                <MovieSlider title="Recently Added" movies={latestMovies} icon={<Sparkles className="w-5 h-5 text-emerald-400" />} />

                <MovieSlider title="Top Rated Recommendations" movies={recommendedMovies} icon={<Star className="w-5 h-5 text-amber-400" />} />
              </div>
            )}

            {/* A to Z Alphabetical Directory Bar (Shown above footer) */}
            <AlphabetDirectory />

          </div>
        </main>
      )}

      {/* Startup Cinematic Splash Animation */}
      {showSplashIntro && appBranding.splashEnabled !== false && (
        <SplashIntro onComplete={() => setShowSplashIntro(false)} />
      )}

      {/* Global Modals & Player */}
      <MovieDetailsModal onOpenSubscription={() => setIsSubscriptionModalOpen(true)} />
      {playingMovie && <VideoPlayer />}
      <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} />
      <AuthModal />
      <AppLockModal />

      {/* Mobile Fixed Bottom Navigation Bar (Ultra-convenient 1-Tap Access for All Users) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/90 px-3 py-2 flex items-center justify-around shadow-2xl">
        <button 
          onClick={() => {
            setCurrentView('home');
            setSelectedCategory('All');
            setSelectedGenre('All');
            setSearchQuery('');
          }}
          className={`flex flex-col items-center gap-1 py-0.5 px-2 rounded-xl transition-all ${
            currentView === 'home' ? 'text-red-500 font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px]">Home</span>
        </button>

        <button 
          onClick={() => {
            setCurrentView('trending');
            setSelectedCategory('All');
            setSearchQuery('');
          }}
          className={`flex flex-col items-center gap-1 py-0.5 px-2 rounded-xl transition-all ${
            currentView === 'trending' ? 'text-red-500 font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span className="text-[10px]">Trending</span>
        </button>

        <button 
          onClick={() => {
            setCurrentView('playlist');
            setSearchQuery('');
          }}
          className={`flex flex-col items-center gap-1 py-0.5 px-2 rounded-xl transition-all ${
            currentView === 'playlist' ? 'text-purple-400 font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px]">Watchlist</span>
        </button>

        <button 
          onClick={() => {
            setCurrentView('downloads');
            setSearchQuery('');
          }}
          className={`flex flex-col items-center gap-1 py-0.5 px-2 rounded-xl transition-all ${
            currentView === 'downloads' ? 'text-sky-400 font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Download className="w-4 h-4" />
          <span className="text-[10px]">Downloads</span>
        </button>

        {/* Mobile Profile / Sign In Button */}
        {currentUser ? (
          <button 
            onClick={() => setCurrentView('profile')}
            className={`flex flex-col items-center gap-1 py-0.5 px-2 rounded-xl transition-all ${
              currentView === 'profile' ? 'text-red-500 font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.username}
              className="w-4 h-4 rounded-full object-cover border border-red-500/70"
            />
            <span className="text-[10px] truncate max-w-[50px]">Profile</span>
          </button>
        ) : (
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="flex flex-col items-center gap-1 py-0.5 px-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white transition-all cursor-pointer font-bold"
          >
            <User className="w-4 h-4" />
            <span className="text-[10px]">Sign In</span>
          </button>
        )}
      </div>

      {/* Footer */}
      <footer className="py-8 pb-24 md:pb-8 border-t border-zinc-900 text-center text-xs text-zinc-500 space-y-2">
        <p>© 2026 CineStream Premium OTT • Designed with Red Accent & Glassmorphism UI</p>
        <p className="text-[10px] text-zinc-600">Built for High Quality Movie & Anime Streaming with Full Admin Controls</p>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
