import React, { useState, useRef } from 'react';
import { 
  User, 
  Crown, 
  History, 
  Heart, 
  ListPlus, 
  Download, 
  Lock, 
  MessageSquare, 
  Film, 
  ShieldCheck, 
  KeyRound, 
  Send,
  Sparkles,
  Settings,
  Camera,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
  Trash2,
  Play,
  Clock,
  RotateCcw,
  Check,
  Edit2,
  Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MovieCard } from './MovieCard';
import { StorageUsageBar } from './StorageUsageBar';
import { compressImage } from '../utils/imageCompressor';

export const UserProfile: React.FC<{ onOpenSubscription: () => void }> = ({ onOpenSubscription }) => {
  const { 
    currentUser, 
    updateUserProfile, 
    movies, 
    pinCode, 
    setPinCode, 
    submitFeedback, 
    submitMovieRequest,
    setIsAuthModalOpen,
    isAdmin,
    removeWatchHistoryItem,
    clearWatchHistory,
    startPlaying,
    appBranding,
    toggleSplashAnimation,
    toggleSplashSound,
    replaySplashIntro,
    browserNotifPermission,
    requestBrowserNotificationPermission,
    sendWatchlistEpisodeNotification,
    isWatchlistNotifEnabled,
    toggleWatchlistNotif
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('Profile Picture Updated Successfully!');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [bannerUrlInput, setBannerUrlInput] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState(currentUser?.username || '');

  const [activeTab, setActiveTab] = useState<'favorites' | 'playlist' | 'history' | 'downloads' | 'settings' | 'upload_photo'>('favorites');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=CineAdmin',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=MovieFanatic'
  ];

  const presetBanners = [
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80'
  ];
  const [newPin, setNewPin] = useState(pinCode);
  const [pinSaved, setPinSaved] = useState(false);

  const [fbSubject, setFbSubject] = useState('');
  const [fbMessage, setFbMessage] = useState('');
  const [fbSent, setFbSent] = useState(false);

  const [reqTitle, setReqTitle] = useState('');
  const [reqType, setReqType] = useState<'movie' | 'anime'>('movie');
  const [reqSent, setReqSent] = useState(false);

  if (!currentUser) {
    return (
      <div className="pt-28 pb-16 px-4 max-w-xl mx-auto text-center space-y-4">
        <User className="w-16 h-16 text-zinc-600 mx-auto" />
        <h2 className="text-2xl font-black text-white">Sign In Required</h2>
        <p className="text-xs text-zinc-400">Sign in or create an account to view your watch history, favorites, and settings.</p>
        <button 
          onClick={() => setIsAuthModalOpen(true)}
          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress avatar to max 360x360 Web JPEG (~30KB) to ensure flawless persistence and zero quota errors
      const compressedDataUrl = await compressImage(file, 360, 360, 0.85);
      updateUserProfile({ avatarUrl: compressedDataUrl });
      setUploadMessage('Profile Avatar Photo Saved Successfully!');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Image compression failed:', err);
      // Fallback
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          updateUserProfile({ avatarUrl: reader.result as string });
          setUploadMessage('Profile Avatar Photo Saved Successfully!');
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlAvatarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarUrlInput) return;
    updateUserProfile({ avatarUrl: avatarUrlInput });
    setAvatarUrlInput('');
    setUploadMessage('Profile Avatar URL Saved Successfully!');
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress cover banner to max 1280x720 Web JPEG (~70KB)
      const compressedDataUrl = await compressImage(file, 1280, 720, 0.82);
      updateUserProfile({ bannerUrl: compressedDataUrl });
      setUploadMessage('Cover Banner Saved Successfully!');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Banner compression failed:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          updateUserProfile({ bannerUrl: reader.result as string });
          setUploadMessage('Cover Banner Saved Successfully!');
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerUrlInput) return;
    updateUserProfile({ bannerUrl: bannerUrlInput });
    setBannerUrlInput('');
    setUploadMessage('Cover Banner URL Saved Successfully!');
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    updateUserProfile({ username: usernameInput.trim() });
    setIsEditingUsername(false);
    setUploadMessage('Display Name Updated Successfully!');
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const favoriteMovies = movies.filter(m => currentUser.favorites?.includes(m.id));
  const playlistMovies = movies.filter(m => currentUser.playlist?.includes(m.id));
  const downloadedMovies = movies.filter(m => currentUser.downloads?.includes(m.id));

  const historyMovieIds = currentUser.watchHistory?.map(h => h.movieId) || [];
  const historyMovies = movies.filter(m => historyMovieIds.includes(m.id));

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinCode(newPin);
    setPinSaved(true);
    setTimeout(() => setPinSaved(false), 2000);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbSubject || !fbMessage) return;
    submitFeedback(fbSubject, fbMessage);
    setFbSubject('');
    setFbMessage('');
    setFbSent(true);
    setTimeout(() => setFbSent(false), 3000);
  };

  const handleMovieRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle) return;
    submitMovieRequest(reqTitle, reqType);
    setReqTitle('');
    setReqSent(true);
    setTimeout(() => setReqSent(false), 3000);
  };

  return (
    <div className="pt-16 sm:pt-20 pb-20 px-4 lg:px-8 max-w-7xl mx-auto text-left space-y-6">
      
      {uploadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {uploadMessage}
        </div>
      )}

      {/* Profile Header Box with Cover Banner */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden relative">
        
        {/* Cover Banner Area */}
        <div className="relative h-44 sm:h-52 w-full bg-gradient-to-r from-zinc-950 via-zinc-900 to-red-950/50 group overflow-hidden border-b border-zinc-800/80">
          {currentUser.bannerUrl ? (
            <img 
              src={currentUser.bannerUrl} 
              alt="Profile Banner" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/30 via-zinc-900 to-black text-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>
              <ImageIcon className="w-8 h-8 text-zinc-500 mb-1" />
              <p className="text-xs font-bold text-zinc-300">Add Profile Cover Banner</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Upload a custom cover image to personalize your profile banner</p>
            </div>
          )}

          {/* Banner Edit / Add Button */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            <button 
              onClick={() => bannerFileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-black/75 hover:bg-black/95 text-white font-extrabold text-xs backdrop-blur-md border border-white/20 shadow-xl flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Upload / Change Profile Cover Banner"
            >
              <Camera className="w-3.5 h-3.5 text-red-400" />
              <span>{currentUser.bannerUrl ? 'Change Banner' : '+ Add Banner'}</span>
            </button>
            <input 
              type="file"
              ref={bannerFileInputRef}
              accept="image/*"
              onChange={handleBannerFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Profile Info Row Below Cover Banner */}
        <div className="p-6 sm:p-8 pt-3 sm:pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto">
            
            {/* Clickable Avatar Container overlapping bottom edge of banner */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer shrink-0 -mt-14 sm:-mt-16" 
              title="Click to Upload Profile Picture"
            >
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.username} 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-zinc-900 shadow-2xl transition-all group-hover:brightness-75"
              />
              <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all border-4 border-zinc-900">
                <Camera className="w-6 h-6 text-white" />
                <span className="text-[9px] font-extrabold text-white mt-0.5 uppercase tracking-wider">Upload</span>
              </div>
              <button 
                type="button"
                className="absolute -bottom-1 -right-1 bg-red-600 hover:bg-red-500 text-white p-2 rounded-full border-2 border-zinc-900 shadow-lg transition-colors cursor-pointer"
                title="Upload Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </div>

            <div className="pt-1 sm:pt-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {isEditingUsername ? (
                  <form onSubmit={handleSaveUsername} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="bg-zinc-950 border border-red-500/80 rounded-xl px-3 py-1 text-sm font-bold text-white focus:outline-none"
                      autoFocus
                    />
                    <button 
                      type="submit"
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Save
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsEditingUsername(false)}
                      className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-white font-display">{currentUser.username}</h1>
                    <button 
                      onClick={() => {
                        setUsernameInput(currentUser.username);
                        setIsEditingUsername(true);
                      }}
                      className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                      title="Edit Display Name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {isAdmin && (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 font-bold text-[10px]">
                    Admin User
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{currentUser.email}</p>
              
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  <Crown className="w-3.5 h-3.5 fill-amber-400" />
                  {currentUser.subscription?.planName || 'Free Membership'}
                </div>

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-700/50"
                >
                  <Upload className="w-3.5 h-3.5 text-red-400" /> Photo
                </button>

                <button 
                  onClick={() => bannerFileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-700/50"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Cover Banner
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10 w-full md:w-auto">
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" /> Upload Photo & Banner
            </button>

            <button 
              onClick={onOpenSubscription}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              Upgrade VIP Plan
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-zinc-800 overflow-x-auto pb-1">
        <button 
          onClick={() => setActiveTab('upload_photo')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors shrink-0 rounded-t-xl ${activeTab === 'upload_photo' ? 'border-red-500 text-white bg-red-500/10' : 'border-transparent text-red-400 hover:text-red-300'}`}
        >
          <Camera className="w-4 h-4 text-red-500" /> Upload Photo & Banner
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors shrink-0 ${activeTab === 'favorites' ? 'border-red-500 text-white' : 'border-transparent text-zinc-400 hover:text-white'}`}
        >
          <Heart className="w-4 h-4 text-rose-400" /> Favorites ({favoriteMovies.length})
        </button>
        <button 
          onClick={() => setActiveTab('playlist')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors shrink-0 ${activeTab === 'playlist' ? 'border-red-500 text-white' : 'border-transparent text-zinc-400 hover:text-white'}`}
        >
          <ListPlus className="w-4 h-4 text-emerald-400" /> My List ({playlistMovies.length})
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors shrink-0 ${activeTab === 'history' ? 'border-red-500 text-white' : 'border-transparent text-zinc-400 hover:text-white'}`}
        >
          <History className="w-4 h-4 text-sky-400" /> Watch History ({historyMovies.length})
        </button>
        <button 
          onClick={() => setActiveTab('downloads')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors shrink-0 ${activeTab === 'downloads' ? 'border-red-500 text-white' : 'border-transparent text-zinc-400 hover:text-white'}`}
        >
          <Download className="w-4 h-4 text-purple-400" /> Downloads ({downloadedMovies.length})
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors shrink-0 ${activeTab === 'settings' ? 'border-red-500 text-white' : 'border-transparent text-zinc-400 hover:text-white'}`}
        >
          <Settings className="w-4 h-4 text-zinc-400" /> App Settings & Feedback
        </button>
      </div>

      {/* Tab Grid Outputs */}
      <div>
        {activeTab === 'upload_photo' && (
          <div className="space-y-6">
            
            {/* SECTION 1: Cover Banner Upload */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-emerald-400" /> Profile Cover Banner Customisation
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">Upload a widescreen banner image to display on top of your profile card.</p>
                </div>
                {currentUser.bannerUrl ? (
                  <img 
                    src={currentUser.bannerUrl} 
                    alt="Current Banner" 
                    className="w-28 h-14 rounded-xl object-cover border border-emerald-500/50 shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-14 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-bold">
                    No Banner
                  </div>
                )}
              </div>

              {/* Option 1: File Upload for Banner */}
              <div className="p-6 rounded-2xl bg-zinc-950 border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 transition-colors text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600/10 text-emerald-400 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Upload Cover Banner from Gallery / PC</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Recommended size 1200x400 (PNG, JPG, WEBP up to 12MB)</p>
                </div>
                <button 
                  onClick={() => bannerFileInputRef.current?.click()}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  <ImageIcon className="w-4 h-4" /> Select Banner Image File
                </button>
              </div>

              {/* Option 2: Quick Select Preset Banners */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Quick Select Movie / Anime Banners
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {presetBanners.map((url, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => {
                        updateUserProfile({ bannerUrl: url });
                        setUploadSuccess(true);
                        setTimeout(() => setUploadSuccess(false), 3000);
                      }}
                      className={`p-1 rounded-2xl bg-zinc-950 border transition-all cursor-pointer hover:scale-105 ${currentUser.bannerUrl === url ? 'border-emerald-500 ring-2 ring-emerald-500/50' : 'border-zinc-800 hover:border-zinc-700'}`}
                    >
                      <img src={url} alt={`Banner Preset ${idx}`} className="w-full h-16 sm:h-20 rounded-xl object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 3: Banner Image URL */}
              <form onSubmit={handleUrlBannerSubmit} className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="text-xs font-bold text-zinc-300">Or Paste Banner Image URL Link:</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    placeholder="https://example.com/movie-banner.jpg"
                    value={bannerUrlInput}
                    onChange={(e) => setBannerUrlInput(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                  <button 
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer shrink-0"
                  >
                    Save Banner
                  </button>
                </div>
              </form>
            </div>

            {/* SECTION 2: Profile Photo Upload */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Camera className="w-5 h-5 text-red-500" /> Profile Avatar Photo Customisation
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">Select a profile picture from your device, choose a preset avatar, or paste an image URL.</p>
                </div>
                <img 
                  src={currentUser.avatarUrl} 
                  alt="Current Profile" 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-red-500 shadow-xl"
                />
              </div>

              {/* Option 1: File Upload */}
              <div className="p-6 rounded-2xl bg-zinc-950 border-2 border-dashed border-zinc-800 hover:border-red-500/50 transition-colors text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-600/10 text-red-500 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Upload Avatar from Gallery / PC</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Supports PNG, JPG, WEBP, GIF up to 8MB</p>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/30"
                >
                  <Camera className="w-4 h-4" /> Select Avatar File
                </button>
              </div>

              {/* Option 2: Preset Avatars */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Quick Select Preset Avatars
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {presetAvatars.map((url, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => {
                        updateUserProfile({ avatarUrl: url });
                        setUploadSuccess(true);
                        setTimeout(() => setUploadSuccess(false), 3000);
                      }}
                      className={`p-1.5 rounded-2xl bg-zinc-950 border transition-all cursor-pointer hover:scale-105 ${currentUser.avatarUrl === url ? 'border-red-500 ring-2 ring-red-500/50' : 'border-zinc-800 hover:border-zinc-700'}`}
                    >
                      <img src={url} alt={`Avatar ${idx}`} className="w-full h-16 sm:h-20 rounded-xl object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 3: Image URL */}
              <form onSubmit={handleUrlAvatarSubmit} className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="text-xs font-bold text-zinc-300">Or Paste Avatar Image URL Link:</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    placeholder="https://example.com/my-photo.png"
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-red-500"
                  />
                  <button 
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs cursor-pointer shrink-0"
                  >
                    Save Avatar URL
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favoriteMovies.map(m => <MovieCard key={m.id} movie={m} />)}
            {favoriteMovies.length === 0 && <p className="col-span-full text-xs text-zinc-500 py-8 italic">No favorite movies saved yet.</p>}
          </div>
        )}

        {activeTab === 'playlist' && (
          <div className="space-y-4">
            {/* Watchlist Anime Episode Alerts Status Card */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 shrink-0 mt-0.5 sm:mt-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white">Watchlist Anime Episode Alerts</h4>
                    {browserNotifPermission === 'granted' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase">
                        Browser Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase">
                        Permission Needed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Receive instant desktop & phone browser notifications the second a new episode of any anime in your Watchlist is added.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {browserNotifPermission !== 'granted' && browserNotifPermission !== 'unsupported' ? (
                  <button
                    onClick={() => requestBrowserNotificationPermission()}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-md shadow-red-600/30 cursor-pointer transition-all"
                  >
                    Enable Browser Alerts
                  </button>
                ) : (
                  <button
                    onClick={toggleWatchlistNotif}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs cursor-pointer transition-colors"
                  >
                    {isWatchlistNotifEnabled ? 'Pause Alerts' : 'Resume Alerts'}
                  </button>
                )}

                <button
                  onClick={() => {
                    const sampleAnime = playlistMovies.find(m => m.type === 'anime') || movies.find(m => m.type === 'anime') || movies[0];
                    if (sampleAnime) {
                      const ep = {
                        id: `test_ep_${Date.now()}`,
                        episodeNumber: (sampleAnime.episodes?.length || 0) + 1,
                        title: 'Awakening of the Shadow Monarch',
                        duration: '24m',
                        videoUrl: sampleAnime.videoUrl
                      };
                      sendWatchlistEpisodeNotification(sampleAnime, ep, true);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 font-extrabold text-xs cursor-pointer transition-colors flex items-center gap-1.5"
                  title="Test notification right now on your device"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test Alert</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {playlistMovies.map(m => <MovieCard key={m.id} movie={m} />)}
              {playlistMovies.length === 0 && <p className="col-span-full text-xs text-zinc-500 py-8 italic">Your Watchlist is empty. Add anime series to start receiving episode notifications!</p>}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {currentUser.watchHistory && currentUser.watchHistory.length > 0 && (
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="text-xs text-zinc-400 font-medium">
                  Showing <span className="text-white font-bold">{currentUser.watchHistory.length}</span> logged playback session{currentUser.watchHistory.length > 1 ? 's' : ''}
                </div>
                <button 
                  onClick={clearWatchHistory}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 text-xs font-bold transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All History
                </button>
              </div>
            )}

            {(!currentUser.watchHistory || currentUser.watchHistory.length === 0) ? (
              <div className="text-center py-16 bg-zinc-900/30 rounded-3xl border border-zinc-800/60 space-y-3">
                <History className="w-10 h-10 text-zinc-600 mx-auto" />
                <p className="text-zinc-400 text-xs">No watch history available yet.</p>
                <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">Your playback progress, timestamps and finished titles will appear here automatically.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentUser.watchHistory.map((item, idx) => {
                  const movie = movies.find(m => m.id === item.movieId);
                  if (!movie) return null;

                  const episode = movie.episodes?.find(e => e.id === item.episodeId);
                  const progressPct = item.durationSeconds > 0 
                    ? Math.min(100, Math.round((item.progressSeconds / item.durationSeconds) * 100))
                    : 0;

                  const formatTimestamp = (secs: number) => {
                    const m = Math.floor(secs / 60);
                    const s = Math.floor(secs % 60);
                    return `${m}:${s < 10 ? '0' : ''}${s}`;
                  };

                  return (
                    <div 
                      key={`${item.movieId}-${item.episodeId || 'movie'}-${idx}`}
                      className="group relative flex gap-3 p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 hover:border-red-500/40 hover:bg-zinc-800/60 transition-all duration-300 shadow-md text-left"
                    >
                      {/* Movie Thumbnail */}
                      <div className="relative w-24 sm:w-28 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-950 shrink-0">
                        <img 
                          src={movie.posterUrl} 
                          alt={movie.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Play Overlay */}
                        <button 
                          onClick={() => startPlaying(movie, episode)}
                          className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </button>
                        {/* Progress Bar inside thumb */}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800">
                          <div 
                            className={`h-full ${item.completed ? 'bg-emerald-500' : 'bg-red-600'}`} 
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-xs font-bold text-white truncate leading-tight group-hover:text-red-400 transition-colors">
                              {movie.title}
                            </h4>
                            <button 
                              onClick={() => removeWatchHistoryItem(item.movieId, item.episodeId)}
                              className="text-zinc-500 hover:text-red-400 transition-colors p-0.5 cursor-pointer shrink-0"
                              title="Remove from history"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {episode && (
                            <p className="text-[11px] text-amber-400 font-medium truncate">
                              EP {episode.episodeNumber}: {episode.title}
                            </p>
                          )}

                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                            <Clock className="w-3 h-3 text-red-500" />
                            <span>
                              {formatTimestamp(item.progressSeconds)} / {formatTimestamp(item.durationSeconds || 0)}
                            </span>
                            <span className="text-zinc-600">•</span>
                            <span className="font-bold text-zinc-300">{progressPct}%</span>
                          </div>

                          <div className="pt-1">
                            {item.completed ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                                <Check className="w-3 h-3" /> Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold">
                                <RotateCcw className="w-3 h-3" /> In Progress
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Resume / Rewatch action */}
                        <div className="pt-2 flex items-center gap-2">
                          <button 
                            onClick={() => startPlaying(movie, episode)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-extrabold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md shadow-red-600/20"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>{item.completed ? 'Rewatch' : 'Resume'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'downloads' && (
          <div className="space-y-6">
            <StorageUsageBar />
            {downloadedMovies.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/30 rounded-3xl border border-zinc-800/60 space-y-3">
                <Download className="w-10 h-10 text-zinc-600 mx-auto" />
                <p className="text-zinc-400 text-xs">No offline downloads saved.</p>
                <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">Click the download button on any movie or series to save it for offline watching.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {downloadedMovies.map(m => <MovieCard key={m.id} movie={m} />)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Profile Picture Upload & Settings */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Camera className="w-4 h-4 text-red-500" /> Upload Profile Image
              </div>
              <p className="text-xs text-zinc-400">Upload a custom profile photo from your device or paste an image URL.</p>

              <div className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                <img 
                  src={currentUser.avatarUrl} 
                  alt="Avatar Preview" 
                  className="w-14 h-14 rounded-xl object-cover border border-red-500/50"
                />
                <div className="flex-1 space-y-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/20"
                  >
                    <Upload className="w-3.5 h-3.5" /> Select Local Image File
                  </button>
                </div>
              </div>

              <form onSubmit={handleUrlAvatarSubmit} className="space-y-2 pt-1">
                <label className="text-[11px] font-bold text-zinc-400">Or Paste Image URL:</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    placeholder="https://example.com/photo.jpg"
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-red-500"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </form>
            </div>

            {/* Startup Cinematic Animation & Audio Preferences (Admin Only) */}
            {isAdmin && (
              <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Film className="w-4 h-4 text-red-500" /> Startup Intro Animation
                    <span className="px-2 py-0.5 rounded-md bg-red-950/60 border border-red-800/60 text-red-400 text-[10px] font-bold">Admin Only</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    appBranding.splashEnabled !== false 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {appBranding.splashEnabled !== false ? 'Enabled (ON)' : 'Disabled (OFF)'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  {appBranding.splashEnabled !== false 
                    ? 'Global Intro Animation is ON. All users will see the cinematic intro on site launch.' 
                    : 'Global Intro Animation is OFF. Site will launch directly without any startup intro.'}
                </p>

                <div className="space-y-2.5 pt-1">
                  {/* 1-Click Toggle Switch Button */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSplashAnimation(true)}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        appBranding.splashEnabled !== false
                          ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                          : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" /> Turn Intro ON
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleSplashAnimation(false)}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        appBranding.splashEnabled === false
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                          : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Turn Intro OFF
                    </button>
                  </div>

                  {appBranding.splashEnabled !== false && (
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                      <span className="text-xs text-zinc-400">Preview cinematic intro:</span>
                      <button
                        type="button"
                        onClick={replaySplashIntro}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-amber-400" /> Play Preview
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* App Lock Security PIN */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Lock className="w-4 h-4 text-amber-400" /> App Lock PIN Security
              </div>
              <p className="text-xs text-zinc-400">Set a 4-digit PIN code to lock the application on launch.</p>
              
              <form onSubmit={handleSavePin} className="space-y-3">
                <input 
                  type="password"
                  maxLength={6}
                  placeholder="Enter 4-digit PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-red-500 font-mono tracking-widest text-center"
                />
                <button 
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs"
                >
                  Save PIN Code
                </button>
                {pinSaved && <p className="text-xs text-emerald-400 text-center font-bold">PIN Updated Successfully!</p>}
              </form>
            </div>

            {/* Request a Movie */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Film className="w-4 h-4 text-red-400" /> Request a Movie / Anime
              </div>
              <p className="text-xs text-zinc-400">Can't find a movie or anime? Request it and our team will add it.</p>

              <form onSubmit={handleMovieRequestSubmit} className="space-y-3">
                <input 
                  type="text" 
                  required
                  placeholder="Movie or Anime Title"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-red-500"
                />
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setReqType('movie')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${reqType === 'movie' ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}
                  >
                    Movie
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setReqType('anime')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${reqType === 'anime' ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}
                  >
                    Anime
                  </button>
                </div>
                <button 
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                >
                  Submit Request
                </button>
                {reqSent && <p className="text-xs text-emerald-400 text-center font-bold">Request Sent to Admin!</p>}
              </form>
            </div>

            {/* User Feedback */}
            <div className="col-span-1 md:col-span-2 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <MessageSquare className="w-4 h-4 text-sky-400" /> Send Feedback / Report Problem
              </div>
              
              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <input 
                  type="text" 
                  required
                  placeholder="Subject"
                  value={fbSubject}
                  onChange={(e) => setFbSubject(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-red-500"
                />
                <textarea 
                  required
                  rows={3}
                  placeholder="Describe your issue or suggestion..."
                  value={fbMessage}
                  onChange={(e) => setFbMessage(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-red-500"
                />
                <button 
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
                >
                  Send Feedback
                </button>
                {fbSent && <p className="text-xs text-emerald-400 font-bold">Feedback Sent to Admin!</p>}
              </form>
            </div>

          </div>
        )}
      </div>

      {/* Upload Photo & Banner Modal Popup */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-6 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-red-500" /> Upload Photo & Cover Banner
              </h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Current Banner & Avatar Preview */}
            <div className="relative rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
              <div className="h-24 w-full bg-zinc-900 relative">
                {currentUser.bannerUrl ? (
                  <img src={currentUser.bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[10px] font-bold">
                    No Cover Banner Set
                  </div>
                )}
              </div>
              <div className="p-4 pt-0 flex items-end gap-3 -mt-8 relative z-10">
                <img 
                  src={currentUser.avatarUrl} 
                  alt="Profile Preview" 
                  className="w-16 h-16 rounded-2xl object-cover border-4 border-zinc-950 shadow-md"
                />
                <div className="pb-1">
                  <p className="text-xs font-bold text-white">{currentUser.username}</p>
                  <p className="text-[11px] text-zinc-400">{currentUser.email}</p>
                </div>
              </div>
            </div>

            {/* Upload Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                onClick={() => {
                  bannerFileInputRef.current?.click();
                  setIsUploadModalOpen(false);
                }}
                className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <ImageIcon className="w-4 h-4" /> Select Cover Banner File
              </button>

              <button 
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsUploadModalOpen(false);
                }}
                className="py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/20"
              >
                <Camera className="w-4 h-4" /> Select Profile Photo File
              </button>
            </div>

            {/* Preset Banners */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Preset Movie / Anime Cover Banners:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {presetBanners.map((url, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      updateUserProfile({ bannerUrl: url });
                      setUploadSuccess(true);
                      setIsUploadModalOpen(false);
                      setTimeout(() => setUploadSuccess(false), 3000);
                    }}
                    className="p-1 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500 transition-all cursor-pointer hover:scale-105"
                  >
                    <img src={url} alt={`Banner Preset ${idx}`} className="w-full h-12 rounded-lg object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Preset Avatars */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-400" /> Preset Profile Avatars:
              </label>
              <div className="grid grid-cols-6 gap-2">
                {presetAvatars.map((url, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      updateUserProfile({ avatarUrl: url });
                      setUploadSuccess(true);
                      setIsUploadModalOpen(false);
                      setTimeout(() => setUploadSuccess(false), 3000);
                    }}
                    className="p-1 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-red-500 transition-all cursor-pointer hover:scale-105"
                  >
                    <img src={url} alt={`Preset ${idx}`} className="w-full h-10 rounded-lg object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Image URL Form */}
            <form 
              onSubmit={(e) => {
                handleUrlBannerSubmit(e);
                setIsUploadModalOpen(false);
              }} 
              className="space-y-2 pt-2 border-t border-zinc-800"
            >
              <label className="text-xs font-bold text-zinc-300">Paste Cover Banner Image URL:</label>
              <div className="flex gap-2">
                <input 
                  type="url" 
                  placeholder="https://example.com/banner.jpg"
                  value={bannerUrlInput}
                  onChange={(e) => setBannerUrlInput(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-emerald-500"
                />
                <button 
                  type="submit"
                  className="px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
