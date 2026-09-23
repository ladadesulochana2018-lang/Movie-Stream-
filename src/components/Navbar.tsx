import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Play, 
  Search, 
  Bell, 
  User, 
  ShieldCheck, 
  Lock, 
  LogOut, 
  Film, 
  Tv, 
  TrendingUp, 
  ListPlus, 
  Download, 
  Crown, 
  X,
  Menu,
  Video,
  Camera,
  Sparkles,
  Eye,
  Plus,
  CheckCheck,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusStoryModal } from './StatusStoryModal';

export const Navbar: React.FC<{ onOpenSubscription: () => void }> = ({ onOpenSubscription }) => {
  const { 
    currentView, 
    setCurrentView, 
    currentUser, 
    isAdmin, 
    setIsAuthModalOpen, 
    logoutUser, 
    searchQuery, 
    setSearchQuery,
    setSelectedGenre,
    setSelectedCategory,
    lockApp,
    pinCode,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    resetNotifications,
    appBranding,
    setSelectedMovie,
    movies,
    replaySplashIntro,
    toggleSplashAnimation
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStatusStoryOpen, setIsStatusStoryOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when sidebar drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const isNotifItemRead = (n: any) => {
    if (currentUser?.uid) {
      return n.readBy && n.readBy.includes(currentUser.uid);
    }
    try {
      const saved = localStorage.getItem('cinestream_read_notifs_ids');
      const readIds = saved ? JSON.parse(saved) : [];
      return readIds.includes(n.id);
    } catch (e) {
      return false;
    }
  };

  const unreadNotifs = notifications.filter(n => !isNotifItemRead(n));

  const handleNavClick = (view: string, category: string = 'All') => {
    setCurrentView(view);
    setSearchQuery('');
    setSelectedGenre('All');
    setSelectedCategory(category);
    setIsMobileMenuOpen(false);
    setIsNotifOpen(false);
    setIsProfileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl px-2 sm:px-6 py-2 border-b border-zinc-800/80 transition-all">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-1 sm:gap-4">
        
        {/* Left Branding & Sidebar Menu Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 sm:p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 group"
            title="Open Navigation Menu"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-xs font-bold text-zinc-300">Menu</span>
          </button>

          <button 
            onClick={() => handleNavClick('home', 'All')} 
            className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer shrink-0 select-none"
          >
            {appBranding.appLogoUrl ? (
              <img 
                src={appBranding.appLogoUrl} 
                alt="Movie Stream Logo" 
                referrerPolicy="no-referrer"
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg object-cover border border-red-500/50 shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform shrink-0"
              />
            ) : (
              <img 
                src="/src/assets/images/movie_stream_app_icon_1788152392265.jpg" 
                alt="Movie Stream" 
                referrerPolicy="no-referrer"
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg object-cover border border-red-500/50 shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform shrink-0"
              />
            )}
            <div className="flex flex-col text-left shrink-0">
              <span className="font-black text-xs sm:text-base tracking-wide sm:tracking-wider text-white flex items-center gap-0.5 font-display leading-none whitespace-nowrap">
                {appBranding.appName}
              </span>
              <span className="hidden sm:block text-[8px] sm:text-[9px] text-zinc-400 font-semibold tracking-widest uppercase mt-0.5 whitespace-nowrap">
                {appBranding.appTagline}
              </span>
            </div>
          </button>
        </div>

        {/* Right Controls: Status Story Button, VIP, Notifications, Profile / Sign In */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
          
          {/* Status Story Video Button */}
          <button 
            onClick={() => setIsStatusStoryOpen(true)}
            className="flex items-center gap-1 px-1.5 sm:px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 hover:text-white hover:bg-emerald-900 font-bold text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-sm shadow-emerald-950/40 group"
            title="Watch Video Status / Story"
          >
            <Video className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="hidden md:inline">Status</span>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>

          {/* Quick Downloads Button (Desktop & Tablet only) */}
          <button 
            onClick={() => handleNavClick('downloads', 'All')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              currentView === 'downloads'
                ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/30'
                : 'bg-zinc-900 border-zinc-800 text-sky-400 hover:text-white hover:bg-zinc-800'
            }`}
            title="Downloads"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Downloads</span>
          </button>

          {/* Upgrade VIP Button */}
          <button 
            onClick={onOpenSubscription}
            className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-extrabold text-[11px] sm:text-xs shadow-sm shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
            title="VIP Membership"
          >
            <Crown className="w-3.5 h-3.5 fill-black shrink-0" />
            <span>VIP</span>
          </button>

          {/* Admin Dashboard Pill (Large screens) */}
          {isAdmin && (
            <button 
              onClick={() => handleNavClick('admin')}
              className="hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white font-semibold text-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Admin</span>
            </button>
          )}

          {/* Notifications Dropdown Toggle */}
          <div className="relative shrink-0" ref={notifRef}>
            <button 
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileMenuOpen(false);
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 relative transition-colors cursor-pointer shrink-0"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-600 text-white font-bold text-[9px] sm:text-[10px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-auto sm:mt-2 w-[calc(100vw-1rem)] max-w-sm sm:w-84 bg-zinc-900/98 border border-zinc-800 rounded-2xl shadow-2xl p-3.5 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-red-500" />
                    <span className="text-xs sm:text-sm font-bold text-white">Notifications</span>
                    {unreadNotifs.length > 0 && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold bg-red-600/30 text-red-400 border border-red-500/40 rounded-full">
                        {unreadNotifs.length} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {notifications.length > 0 && (
                      <>
                        <button 
                          onClick={markAllNotificationsRead}
                          title="Mark all as read"
                          className="px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-emerald-400 transition-colors text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span>Read all</span>
                        </button>
                        <button 
                          onClick={resetNotifications}
                          title="Reset & Clear all notifications"
                          className="px-2 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-900/50 transition-colors text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => setIsNotifOpen(false)}
                      className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 cursor-pointer ml-0.5"
                      title="Close"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <div className="py-7 text-center text-zinc-500 space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600">
                      <Bell className="w-4 h-4 opacity-70" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-300">Notification Bar Reset</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Koi pending notification nahi hai. Sabhi messages clear hain.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {notifications.map(n => {
                      const isRead = isNotifItemRead(n);
                      return (
                        <div 
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.movieId) {
                              const found = movies.find(m => m.id === n.movieId);
                              if (found) {
                                setSelectedMovie(found);
                                setIsNotifOpen(false);
                              }
                            }
                          }}
                          className={`group relative p-2.5 rounded-xl text-left border cursor-pointer transition-all ${
                            isRead
                              ? 'bg-zinc-950/40 border-zinc-800/60 text-zinc-400 hover:border-zinc-700' 
                              : 'bg-red-950/25 border-red-800/40 text-white font-medium hover:border-red-600/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-xs font-bold text-red-400 leading-snug flex-1">{n.title}</div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(n.id);
                              }}
                              className="text-zinc-500 hover:text-red-400 p-1 rounded-lg hover:bg-zinc-800 transition-colors opacity-80 group-hover:opacity-100"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-[11px] text-zinc-300 mt-1 leading-relaxed">{n.body}</div>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-800/40 text-[9px] text-zinc-500">
                            <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {n.movieId && (
                              <span className="text-red-400 hover:underline font-semibold">Watch Now →</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile / Auth Toggle (ALWAYS CLEARLY VISIBLE & UNCLIPPED ON ALL SCREENS) */}
          {currentUser ? (
            <div className="relative shrink-0" ref={profileRef}>
              <button 
                onClick={() => {
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                  setIsNotifOpen(false);
                }}
                className="flex items-center gap-1.5 p-1 pl-1 pr-1.5 sm:pr-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer shrink-0"
              >
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.username}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover border border-red-500/50 shrink-0" 
                />
                <span className="text-xs font-medium text-zinc-200 hidden lg:inline max-w-[100px] truncate">
                  {currentUser.username}
                </span>
              </button>

              {isProfileMenuOpen && (
                <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-auto sm:mt-2 w-[calc(100vw-1.5rem)] max-w-xs sm:w-64 bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 text-left backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-zinc-800 mb-1 flex items-start justify-between">
                    <div className="min-w-0 pr-2">
                      <div className="text-sm font-bold text-white truncate">{currentUser.username}</div>
                      <div className="text-xs text-zinc-400 truncate">{currentUser.email}</div>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        <Crown className="w-3 h-3" />
                        {currentUser.subscription?.planName || 'Free Plan'}
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button 
                    onClick={() => { handleNavClick('profile'); setIsProfileMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-red-400" />
                    My Account & Settings
                  </button>

                  {isAdmin && (
                    <button 
                      onClick={() => { handleNavClick('admin'); setIsProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Admin Control Panel
                    </button>
                  )}

                  {pinCode && (
                    <button 
                      onClick={() => { lockApp(); setIsProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-amber-400" />
                      Lock Screen (PIN)
                    </button>
                  )}

                  {isAdmin && (
                    <button 
                      onClick={() => { toggleSplashAnimation(); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors cursor-pointer"
                      title="Admin Only: Toggle Startup Animation ON or OFF"
                    >
                      <div className="flex items-center gap-2.5">
                        <Film className="w-4 h-4 text-red-400" />
                        <span>Intro Animation (Admin)</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        appBranding.splashEnabled !== false 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {appBranding.splashEnabled !== false ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  )}

                  {isAdmin && appBranding.splashEnabled !== false && (
                    <button 
                      onClick={() => { replaySplashIntro(); setIsProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Preview Intro Animation
                    </button>
                  )}

                  <div className="my-1 border-t border-zinc-800" />

                  <button 
                    onClick={() => { logoutUser(); setIsProfileMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] sm:text-xs shadow-md shadow-red-600/30 transition-all cursor-pointer whitespace-nowrap shrink-0"
              title="Sign In / Register"
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* LEFT SIDEBAR SLIDE-OVER DRAWER (Portal to document.body) */}
      {isMobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex">
          {/* Dark Opaque Backdrop Overlay */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md animate-in fade-in"
          />

          {/* Left Sidebar Menu Drawer - Solid Pitch Black */}
          <div className="relative z-10 w-72 sm:w-80 h-full bg-black border-r border-zinc-800/90 shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-left duration-200 overflow-y-auto">
            <div className="space-y-5">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  {appBranding.appLogoUrl ? (
                    <img 
                      src={appBranding.appLogoUrl} 
                      alt="Logo" 
                      className="w-8 h-8 rounded-xl object-cover border border-red-500/50 shadow-lg shadow-red-600/30" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center shadow-lg shadow-red-600/30">
                      <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                    </div>
                  )}
                  <span className="font-black text-base text-white font-display">
                    {appBranding.appName}
                  </span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Custom Sidebar Banner Card with Logo Overlay & WhatsApp Status Ring */}
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800/90 shadow-2xl group bg-zinc-950">
                <img 
                  src={appBranding.sidebarHeaderImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80'} 
                  alt="Sidebar Banner" 
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500 brightness-90" 
                />
                
                {/* Overlay Logo over Banner Image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-3 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    
                    {/* App Logo Overlaid over Banner Image with WhatsApp Ring */}
                    <button 
                      onClick={() => setIsStatusStoryOpen(true)}
                      className="group/logo relative p-0.5 rounded-2xl bg-gradient-to-tr from-emerald-500 via-green-400 to-teal-300 shadow-xl ring-2 ring-emerald-500/80 hover:scale-105 transition-transform cursor-pointer"
                      title="Click to view WhatsApp Status Video Story"
                    >
                      {appBranding.appLogoUrl ? (
                        <img 
                          src={appBranding.appLogoUrl} 
                          alt="App Logo" 
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-xl object-cover border-2 border-black" 
                        />
                      ) : (
                        <img 
                          src="/src/assets/images/movie_stream_app_icon_1788152392265.jpg" 
                          alt="Movie Stream Logo" 
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-xl object-cover border-2 border-black" 
                        />
                      )}
                    </button>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-white tracking-wider font-display drop-shadow-md block">
                      {appBranding.appName}
                    </span>
                    <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest drop-shadow-sm">
                      {appBranding.appTagline}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logo & Status Options: Admin gets logo/admin option, Users get Watch Status Story */}
              <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5 text-left">
                <div className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider flex items-center justify-between px-1">
                  <span>{isAdmin ? 'Logo & Status Options' : 'Featured Video Status'}</span>
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                </div>

                <div className={`grid ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'} gap-1.5`}>
                  {/* Option 1: Admin Panel / Logo (Only for Admin) */}
                  {isAdmin && (
                    <button 
                      onClick={() => {
                        handleNavClick('admin');
                        setIsMobileMenuOpen(false);
                      }}
                      className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 hover:text-white text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-1 text-[10px] font-bold text-red-400">
                        <Eye className="w-3 h-3" /> Option 1: Logo
                      </div>
                    </button>
                  )}

                  {/* Option 2: WhatsApp Video Status (Watch Status for Users) */}
                  <button 
                    onClick={() => {
                      setIsStatusStoryOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-left transition-colors cursor-pointer w-full"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5" /> {isAdmin ? 'Option 2: Video Status' : 'Watch 4K Video Status'}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Sidebar Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input 
                  type="text" 
                  placeholder="Search movies, anime..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (currentView === 'admin' || currentView === 'profile') {
                      setCurrentView('home');
                    }
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white pl-9 pr-8 py-2 rounded-xl focus:outline-none focus:border-red-500 shadow-inner"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Navigation Items List */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-1">
                  Menu Navigation
                </div>
                <button 
                  onClick={() => { handleNavClick('home', 'All'); setIsMobileMenuOpen(false); }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${currentView === 'home' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'}`}
                >
                  <Play className="w-4 h-4 text-red-400" />
                  <span>Home Page</span>
                </button>

                <button 
                  onClick={() => { handleNavClick('movies', 'Movies'); setIsMobileMenuOpen(false); }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${currentView === 'movies' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'}`}
                >
                  <Film className="w-4 h-4 text-red-400" />
                  <span>Movies</span>
                </button>

                <button 
                  onClick={() => { handleNavClick('anime', 'Anime'); setIsMobileMenuOpen(false); }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${currentView === 'anime' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'}`}
                >
                  <Tv className="w-4 h-4 text-amber-400" />
                  <span>Anime</span>
                </button>

                <button 
                  onClick={() => { handleNavClick('trending', 'All'); setIsMobileMenuOpen(false); }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${currentView === 'trending' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'}`}
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Trending Content</span>
                </button>

                <button 
                  onClick={() => { handleNavClick('playlist', 'All'); setIsMobileMenuOpen(false); }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${currentView === 'playlist' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'}`}
                >
                  <ListPlus className="w-4 h-4 text-purple-400" />
                  <span>My Watchlist</span>
                </button>

                <button 
                  onClick={() => { handleNavClick('downloads', 'All'); setIsMobileMenuOpen(false); }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${currentView === 'downloads' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'}`}
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>Offline Downloads</span>
                </button>

                <div className="pt-2 space-y-2">
                  <button 
                    onClick={() => { onOpenSubscription(); setIsMobileMenuOpen(false); }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-600 text-zinc-950 shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <Crown className="w-4 h-4 fill-zinc-950" />
                    <span>VIP Membership Upgrade</span>
                  </button>

                  {isAdmin && (
                    <button 
                      onClick={() => { toggleSplashAnimation(); }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Film className="w-4 h-4 text-red-400" />
                        <span>Intro Animation (Admin)</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        appBranding.splashEnabled !== false 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {appBranding.splashEnabled !== false ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  )}

                  {isAdmin && appBranding.splashEnabled !== false && (
                    <button 
                      onClick={() => { replaySplashIntro(); setIsMobileMenuOpen(false); }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Preview Intro Animation</span>
                    </button>
                  )}
                </div>

                {isAdmin && (
                  <button 
                    onClick={() => { handleNavClick('admin'); setIsMobileMenuOpen(false); }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-red-500" />
                    <span>Admin Control Panel</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar User Footer */}
            <div className="pt-4 border-t border-zinc-800">
              {currentUser ? (
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={currentUser.avatarUrl} 
                      alt={currentUser.username}
                      className="w-8 h-8 rounded-lg object-cover border border-red-500/50 shrink-0" 
                    />
                    <div className="min-w-0 text-left">
                      <div className="text-xs font-bold text-white truncate">{currentUser.username}</div>
                      <div className="text-[10px] text-amber-400 font-bold capitalize">
                        {currentUser.subscription?.planName || 'Free Plan'}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => { logoutUser(); setIsMobileMenuOpen(false); }}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="w-full py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-500 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                >
                  Sign In / Create Account
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* WhatsApp-Style Status Story Modal */}
      <StatusStoryModal 
        isOpen={isStatusStoryOpen} 
        onClose={() => setIsStatusStoryOpen(false)} 
      />
    </nav>
  );
};
