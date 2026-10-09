import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Movie, 
  UserProfile, 
  UserRecord,
  SubscriptionPlan, 
  Coupon, 
  PaymentTransaction, 
  PaymentGatewayConfig,
  AdsConfig, 
  FeedbackItem, 
  NotificationItem, 
  CommentItem, 
  Episode,
  MovieRequestItem,
  FirebaseConfigState,
  AppBranding,
  WatchHistoryItem,
  CharacterItem,
  StatusStoryItem,
  MovieRating,
  MovieRatingStats
} from '../types';
import { 
  initialMovies, 
  initialSubscriptionPlans, 
  initialCoupons, 
  initialAdsConfig, 
  initialPayments, 
  initialFeedback, 
  initialNotifications, 
  sampleAdminUser,
  initialCharacters,
  initialMovieRatings
} from '../data/initialData';
import { 
  checkIsAdminEmail, 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  initFirebaseService,
  saveMovieToFirestore,
  deleteMovieFromFirestore,
  subscribeToFirestoreMovies
} from '../services/firebaseConfig';
import { 
  saveProfileToIndexedDB, 
  getProfileFromIndexedDB, 
  getMediaBlobUrl, 
  deleteMediaBlob,
  saveSingleMovieToIndexedDB,
  deleteSingleMovieFromIndexedDB,
  saveMoviesToIndexedDB,
  clearMoviesFromIndexedDB,
  getMoviesFromIndexedDB,
  getCustomMoviesFromIndexedDB,
  saveSingleCharacterToIndexedDB,
  deleteSingleCharacterFromIndexedDB,
  saveCharactersToIndexedDB,
  getCharactersFromIndexedDB,
  sanitizeVideoUrl
} from '../utils/persistentStorage';

export function sanitizeMovieRecord(m: Movie): Movie {
  if (!m) return m;
  return {
    ...m,
    videoUrl: sanitizeVideoUrl(m.videoUrl),
    trailerUrl: sanitizeVideoUrl(m.trailerUrl),
    episodes: (m.episodes || []).map(ep => ({
      ...ep,
      videoUrl: sanitizeVideoUrl(ep.videoUrl)
    })),
    downloadLinks: m.downloadLinks ? {
      ...m.downloadLinks,
      direct: sanitizeVideoUrl(m.downloadLinks.direct)
    } : undefined
  };
}

export interface EpisodeAlertToastData {
  movie: Movie;
  episode: Episode;
  isWatchlist: boolean;
}

interface AppContextType {
  // Navigation & View
  currentView: string;
  setCurrentView: (view: string) => void;
  
  // Theme
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;

  // App Lock
  isAppLocked: boolean;
  pinCode: string;
  setPinCode: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
  lockApp: () => void;

  // Current User & Auth
  currentUser: UserProfile | null;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loginUser: (email: string, pass: string, customUsername?: string) => boolean;
  signupUser: (email: string, pass: string, username: string) => boolean;
  logoutUser: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  // User Management
  allUsers: UserRecord[];
  addUser: (user: Omit<UserRecord, 'uid' | 'regDate'>) => void;
  updateUser: (uid: string, updates: Partial<UserRecord>) => void;
  deleteUser: (uid: string) => void;
  toggleBanUser: (uid: string) => void;
  resetUsersData: () => void;

  // Content (Movies & Anime)
  movies: Movie[];
  addMovie: (movie: Omit<Movie, 'id' | 'viewsCount' | 'likesCount' | 'downloadsCount' | 'createdAt'>) => void;
  updateMovie: (id: string, updates: Partial<Movie>, syncToCloud?: boolean) => void;
  deleteMovie: (id: string) => void;
  deleteAllMovies: () => void;
  resetMoviesData: () => void;

  // Active Modals & Players
  selectedMovie: Movie | null;
  setSelectedMovie: (movie: Movie | null) => void;
  playingMovie: Movie | null;
  playingEpisode: Episode | null;
  startPlaying: (movie: Movie, episode?: Episode) => void;
  closePlayer: () => void;
  
  // User Actions (Watchlist, Favorites, History)
  toggleFavorite: (movieId: string) => void;
  togglePlaylist: (movieId: string) => void;
  toggleDownload: (movieId: string) => void;
  updateWatchProgress: (movieId: string, progressSeconds: number, durationSeconds: number, episodeId?: string, completed?: boolean) => void;
  removeWatchHistoryItem: (movieId: string, episodeId?: string) => void;
  clearWatchHistory: () => void;

  // Subscription & Pricing
  plans: SubscriptionPlan[];
  updatePlan: (plan: SubscriptionPlan) => void;
  addPlan: (plan: SubscriptionPlan) => void;
  deletePlan: (id: string) => void;

  // Coupons
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;

  // Payments
  payments: PaymentTransaction[];
  submitPayment: (planId: string, planName: string, amount: number, method: PaymentTransaction['paymentMethod'], txId: string, screenshotUrl?: string) => void;
  updatePaymentStatus: (txId: string, status: PaymentTransaction['status']) => void;
  paymentGatewayConfig: PaymentGatewayConfig;
  updatePaymentGatewayConfig: (updates: Partial<PaymentGatewayConfig>) => void;

  // Ads Config
  adsConfig: AdsConfig;
  updateAdsConfig: (updates: Partial<AdsConfig>) => void;

  // Comments & Feedback & Notifications
  comments: CommentItem[];
  addComment: (movieId: string, content: string) => void;
  updateCommentStatus: (commentId: string, status: CommentItem['status'], isPinned?: boolean) => void;
  deleteComment: (commentId: string) => void;
  feedbacks: FeedbackItem[];
  submitFeedback: (subject: string, message: string) => void;
  replyFeedback: (id: string, reply: string) => void;
  deleteFeedback: (id: string) => void;
  notifications: NotificationItem[];
  sendNotification: (title: string, body: string, target: 'all' | 'premium' | 'free', movieId?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  resetNotifications: () => void;

  // Browser Notifications & Watchlist Anime Alerts
  browserNotifPermission: NotificationPermission | 'unsupported';
  isWatchlistNotifEnabled: boolean;
  toggleWatchlistNotif: () => void;
  requestBrowserNotificationPermission: () => Promise<boolean>;
  sendWatchlistEpisodeNotification: (movie: Movie, episode: Episode, forceAlert?: boolean) => boolean;
  addEpisodeToMovie: (movieId: string, episodeData: Omit<Episode, 'id'> | Episode, notifyWatchlistUsers?: boolean) => void;
  episodeAlertToast: EpisodeAlertToastData | null;
  dismissEpisodeAlertToast: () => void;

  // 5-Star Movie Ratings & Community Score
  movieRatings: MovieRating[];
  rateMovie: (movieId: string, rating: number) => void;
  removeMovieRating: (movieId: string) => void;
  getMovieRatingStats: (movieId: string) => MovieRatingStats;

  // Movie Requests
  movieRequests: MovieRequestItem[];
  submitMovieRequest: (title: string, type: 'movie' | 'anime', message?: string) => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedGenre: string;
  setSelectedGenre: (g: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedLetter: string;
  setSelectedLetter: (l: string) => void;

  // Character & Universe Items
  characters: CharacterItem[];
  addCharacter: (char: Omit<CharacterItem, 'id'> | CharacterItem) => void;
  updateCharacter: (id: string, updates: Partial<CharacterItem>) => void;
  deleteCharacter: (id: string) => void;
  resetCharactersToDefault: () => void;

  // Firebase Config State
  firebaseConfig: FirebaseConfigState | null;
  saveCustomFirebaseConfig: (config: Omit<FirebaseConfigState, 'isConfigured'>) => boolean;

  // App Branding & Customization
  appBranding: AppBranding;
  updateAppBranding: (updates: Partial<AppBranding>) => void;
  resetAppBranding: () => void;

  // Startup Splash Animation
  showSplashIntro: boolean;
  setShowSplashIntro: (show: boolean) => void;
  replaySplashIntro: () => void;
  toggleSplashAnimation: (forceState?: boolean) => void;
  toggleSplashSound: (forceState?: boolean) => void;

  // System & Dashboard Reset
  resetDashboardData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'cinestream_auth_session_v4';
const LOCAL_USERS_PROFILES_KEY = 'cinestream_user_profiles_v2';
const LOCAL_MOVIES_KEY = 'cinestream_movies_list';
const LOCAL_CUSTOM_MOVIES_KEY = 'cinestream_custom_movies_v2';
const LOCAL_DELETED_MOVIE_IDS_KEY = 'cinestream_deleted_movie_ids_v1';
const LOCAL_CHARACTERS_KEY = 'cinestream_characters_v2';
const LOCAL_CUSTOM_CHARACTERS_KEY = 'cinestream_custom_characters_v2';
const LOCAL_DELETED_CHARACTER_IDS_KEY = 'cinestream_deleted_character_ids_v1';
const LOCAL_PLANS_KEY = 'cinestream_plans_list';
const LOCAL_COUPONS_KEY = 'cinestream_coupons_list';
const LOCAL_PAYMENTS_KEY = 'cinestream_payments_list';
const LOCAL_PAYMENT_GATEWAY_KEY = 'cinestream_payment_gateway_config';
const LOCAL_ADS_KEY = 'cinestream_ads_config';
const LOCAL_PIN_KEY = 'cinestream_app_lock_pin';
const LOCAL_BRANDING_KEY = 'cinestream_app_branding';
const LOCAL_USERS_KEY = 'cinestream_admin_users_v2';
const LOCAL_NOTIFICATIONS_KEY = 'cinestream_notifications_v4';
const LOCAL_READ_NOTIFS_KEY = 'cinestream_read_notifs_ids';
const LOCAL_WATCHLIST_NOTIF_KEY = 'cinestream_watchlist_notifs_enabled';
const LOCAL_MOVIE_RATINGS_KEY = 'cinestream_movie_ratings_v1';

const initialDefaultUsers: UserRecord[] = [
  { uid: 'u_1', email: 'admin@gmail.com', username: 'CineAdmin', role: 'admin', plan: 'Diamond Admin VIP', status: 'Active', regDate: '2024-01-01' },
  { uid: 'u_2', email: 'ladaderahul@gmail.com', username: 'Rahul Lada', role: 'admin', plan: 'Diamond Admin VIP', status: 'Active', regDate: '2024-02-10' },
  { uid: 'u_3', email: 'subscriber1@gmail.com', username: 'Alex Streamer', role: 'user', plan: 'Gold Plan (90 Days)', status: 'Active', regDate: '2024-05-15' },
  { uid: 'u_4', email: 'animefan99@gmail.com', username: 'Otaku99', role: 'user', plan: 'Silver Plan (30 Days)', status: 'Active', regDate: '2024-06-20' },
  { uid: 'u_5', email: 'freeuser@gmail.com', username: 'FreeViewer', role: 'user', plan: 'Free Tier', status: 'Active', regDate: '2024-07-01' }
];

const initialPaymentGatewayConfig: PaymentGatewayConfig = {
  directUpiEnabled: true,
  upiId: 'cinestream@ybl',
  merchantName: 'CineStream VIP OTT',
  qrCodeUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
  razorpayEnabled: true,
  razorpayKeyId: 'rzp_test_99887766554433',
  razorpaySecret: 'razorpay_secret_live'
};

export const defaultInitialStatusStories: StatusStoryItem[] = [
  {
    id: 'story_naruto',
    title: 'Naruto Shippuden 4K',
    url: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    type: 'video',
    caption: '🔥 Naruto Shippuden (Hindi Dubbed) - Streaming Now in 4K!',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'story_anime',
    title: 'Demon Slayer 4K',
    url: 'https://media.w3.org/2010/05/bunny/movie.mp4',
    type: 'video',
    caption: '⚔️ Demon Slayer: Hashira Training Arc - Ultra HD Quality!',
    poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'story_vip',
    title: 'CineStream VIP',
    url: 'https://media.w3.org/2010/05/video/movie_300.mp4',
    type: 'video',
    caption: '✨ Upgrade to VIP for Ad-Free Unlimited Movies & Anime!',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
    createdAt: new Date().toISOString()
  }
];

const initialBranding: AppBranding = {
  appName: 'MOVIE STREAM',
  appTagline: 'Watch Movies & Anime',
  appLogoUrl: '/src/assets/images/movie_stream_app_icon_1788152392265.jpg',
  sidebarHeaderImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80',
  statusMediaUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
  statusMediaType: 'video',
  statusCaption: '🔥 Watch our latest 4K Releases & Trending Status Stories!',
  statusActive: true,
  statusCreatedAt: new Date().toISOString(),
  statusStories: defaultInitialStatusStories,
  characterSectionTitle: 'Character & Toon Universes',
  characterSectionSubtitle: 'Click any character arch to explore movies, anime episodes and series',
  characterSectionLogoUrl: '',
  characterSectionIcon: 'flame'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>('dark');
  
  // App Lock PIN
  const [pinCode, setPinCodeState] = useState<string>(() => localStorage.getItem(LOCAL_PIN_KEY) || '');
  const [isAppLocked, setIsAppLocked] = useState<boolean>(false);

  // User State
  const [allUsers, setAllUsers] = useState<UserRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialDefaultUsers;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only return if it is a genuinely saved logged-in user object with an email
        if (parsed && typeof parsed === 'object' && parsed.email) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading saved user session:', e);
    }
    // Public / Production default: Every visitor starts as a Guest (not logged in, zero admin permissions)
    return null;
  });

  const isMoviesHydratedRef = useRef(false);
  const isCharactersHydratedRef = useRef(false);

  // Check and restore from IndexedDB if available & purge legacy session keys
  useEffect(() => {
    try {
      localStorage.removeItem('cinestream_user_session');
      localStorage.removeItem('moviestream_user');
      localStorage.removeItem('cinestream_user_profiles_v1');
    } catch (e) {}

    if (currentUser?.email) {
      getProfileFromIndexedDB(currentUser.email).then(savedProfile => {
        if (savedProfile) {
          setCurrentUser(prev => {
            if (!prev) return savedProfile;
            return {
              ...savedProfile,
              ...prev,
              avatarUrl: prev.avatarUrl || savedProfile.avatarUrl,
              bannerUrl: prev.bannerUrl || savedProfile.bannerUrl,
              username: prev.username || savedProfile.username
            };
          });
        }
      }).catch(err => console.warn('IndexedDB initial load note:', err));
    }

    // Hydrate movies from IndexedDB if available (so custom added movies survive 5MB localStorage limit & refresh)
    Promise.all([getMoviesFromIndexedDB(), getCustomMoviesFromIndexedDB()]).then(([savedMovies, savedCustom]) => {
      const deletedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_DELETED_MOVIE_IDS_KEY) || '[]');
      const allIndexedMovies = [...(savedMovies || []), ...(savedCustom || [])];
      if (allIndexedMovies.length > 0) {
        setMovies(prev => {
          const map = new Map<string, Movie>();
          // Base movies that are not deleted
          initialMovies.filter(m => !deletedIds.includes(m.id)).forEach(m => map.set(m.id, m));
          // IndexedDB movies (including custom added ones)
          allIndexedMovies.filter(m => !deletedIds.includes(m.id)).forEach(m => map.set(m.id, m));
          // Any items added during current react lifecycle
          prev.filter(m => !deletedIds.includes(m.id)).forEach(m => {
            if (!map.has(m.id)) map.set(m.id, m);
          });
          const merged = Array.from(map.values()).map(sanitizeMovieRecord);
          try {
            const sanitized = merged.map(m => ({
              ...m,
              posterUrl: m.posterUrl && m.posterUrl.length > 50000 ? `media://poster_${m.id}` : m.posterUrl,
              bannerUrl: m.bannerUrl && m.bannerUrl.length > 50000 ? `media://banner_${m.id}` : m.bannerUrl
            }));
            localStorage.setItem(LOCAL_MOVIES_KEY, JSON.stringify(sanitized));
          } catch (e) {}
          return merged;
        });
      }
      isMoviesHydratedRef.current = true;
    }).catch(err => {
      console.warn('IndexedDB movies initial load note:', err);
      isMoviesHydratedRef.current = true;
    });

    // Hydrate characters from IndexedDB
    getCharactersFromIndexedDB().then(savedChars => {
      if (savedChars && savedChars.length > 0) {
        setCharacters(prev => {
          const map = new Map<string, CharacterItem>();
          initialCharacters.forEach(c => map.set(c.id, c));
          savedChars.forEach(c => map.set(c.id, c));
          prev.forEach(c => {
            if (!map.has(c.id)) map.set(c.id, c);
          });
          return Array.from(map.values());
        });
      }
      isCharactersHydratedRef.current = true;
    }).catch(err => {
      console.warn('IndexedDB characters initial load note:', err);
      isCharactersHydratedRef.current = true;
    });
  }, []);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Movies
  const [movies, setMovies] = useState<Movie[]>(() => {
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_DELETED_MOVIE_IDS_KEY) || '[]');
      const saved = localStorage.getItem(LOCAL_MOVIES_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(m => !deletedIds.includes(m.id)).map(sanitizeMovieRecord);
        }
      }
      const customSaved = localStorage.getItem(LOCAL_CUSTOM_MOVIES_KEY);
      const filteredInitial = initialMovies.filter(m => !deletedIds.includes(m.id)).map(sanitizeMovieRecord);
      if (customSaved) {
        const parsedCustom = JSON.parse(customSaved);
        if (Array.isArray(parsedCustom) && parsedCustom.length > 0) {
          const map = new Map<string, Movie>();
          filteredInitial.forEach(m => map.set(m.id, m));
          parsedCustom.filter(m => !deletedIds.includes(m.id)).map(sanitizeMovieRecord).forEach(m => map.set(m.id, m));
          return Array.from(map.values());
        }
      }
      return filteredInitial;
    } catch (e) {
      console.warn('Initial movies fallback error:', e);
    }
    return initialMovies.map(sanitizeMovieRecord);
  });

  // Characters & Universes (Toonstream style arches)
  const [characters, setCharacters] = useState<CharacterItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CHARACTERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('localStorage read characters note:', e);
    }
    try {
      const customSaved = localStorage.getItem(LOCAL_CUSTOM_CHARACTERS_KEY);
      const deletedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_DELETED_CHARACTER_IDS_KEY) || '[]');
      const filteredInitial = initialCharacters.filter(c => !deletedIds.includes(c.id));
      if (customSaved) {
        const parsedCustom = JSON.parse(customSaved);
        if (Array.isArray(parsedCustom) && parsedCustom.length > 0) {
          const map = new Map<string, CharacterItem>();
          filteredInitial.forEach(c => map.set(c.id, c));
          parsedCustom.forEach(c => map.set(c.id, c));
          return Array.from(map.values());
        }
      }
      return filteredInitial;
    } catch (e) {
      console.warn('Initial characters fallback error:', e);
    }
    return initialCharacters;
  });

  // Plans
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_PLANS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialSubscriptionPlans;
  });

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_COUPONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialCoupons;
  });

  // Payments
  const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_PAYMENTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialPayments;
  });

  const [paymentGatewayConfig, setPaymentGatewayConfig] = useState<PaymentGatewayConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_PAYMENT_GATEWAY_KEY);
      if (saved) return { ...initialPaymentGatewayConfig, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
    return initialPaymentGatewayConfig;
  });

  const updatePaymentGatewayConfig = (updates: Partial<PaymentGatewayConfig>) => {
    setPaymentGatewayConfig(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem(LOCAL_PAYMENT_GATEWAY_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Ads
  const [adsConfig, setAdsConfig] = useState<AdsConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ADS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...initialAdsConfig,
          ...parsed,
          bannerAd: { ...initialAdsConfig.bannerAd, ...(parsed.bannerAd || {}) },
          interstitialAd: { ...initialAdsConfig.interstitialAd, ...(parsed.interstitialAd || {}) },
          rewardedInterstitialAd: { ...initialAdsConfig.rewardedInterstitialAd, ...(parsed.rewardedInterstitialAd || {}) },
          rewardedAd: { ...initialAdsConfig.rewardedAd, ...(parsed.rewardedAd || {}) },
          nativeAdvancedAd: { ...initialAdsConfig.nativeAdvancedAd, ...(parsed.nativeAdvancedAd || {}) },
          appOpenAd: { ...initialAdsConfig.appOpenAd, ...(parsed.appOpenAd || {}) },
        };
      }
    } catch (e) {
      console.error(e);
    }
    return initialAdsConfig;
  });

  // Feedback, Notifications, Comments, Requests
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(initialFeedback);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [guestReadNotifs, setGuestReadNotifs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_READ_NOTIFS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Browser Notification & Watchlist Anime Episode Alerts State
  const [browserNotifPermission, setBrowserNotifPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const [isWatchlistNotifEnabled, setIsWatchlistNotifEnabled] = useState<boolean>(() => {
    try {
      const val = localStorage.getItem(LOCAL_WATCHLIST_NOTIF_KEY);
      return val !== null ? val === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  const [episodeAlertToast, setEpisodeAlertToast] = useState<EpisodeAlertToastData | null>(null);

  const dismissEpisodeAlertToast = () => {
    setEpisodeAlertToast(null);
  };

  // Movie 5-Star User Ratings State
  const [movieRatings, setMovieRatings] = useState<MovieRating[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_MOVIE_RATINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialMovieRatings;
  });

  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: 'cm1',
      movieId: 'm1',
      userId: 'u_user1',
      username: 'DemonSlayerFan',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
      content: 'The animation quality in this arc is absolutely unmatched! Ufotable never fails.',
      createdAt: '2026-07-27T14:00:00Z',
      status: 'approved',
      isPinned: true,
      likes: 42
    }
  ]);
  const [movieRequests, setMovieRequests] = useState<MovieRequestItem[]>([]);

  // Active Modals & Players
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const [playingEpisode, setPlayingEpisode] = useState<Episode | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLetter, setSelectedLetter] = useState<string>('All');

  // Firebase Config
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfigState | null>(() => getSavedFirebaseConfig());

  // App Branding & Customization State
  const [appBranding, setAppBranding] = useState<AppBranding>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_BRANDING_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...initialBranding,
          ...parsed,
          statusStories: (parsed.statusStories && parsed.statusStories.length > 0)
            ? parsed.statusStories
            : initialBranding.statusStories
        };
      }
    } catch (e) {
      console.error(e);
    }
    return initialBranding;
  });

  // Startup Splash Intro Animation
  const [showSplashIntro, setShowSplashIntro] = useState<boolean>(() => {
    return true; // Always show on startup / page refresh
  });

  const replaySplashIntro = () => {
    setShowSplashIntro(true);
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(allUsers));
    } catch (e) {
      console.warn('localStorage error allUsers:', e);
    }
  }, [allUsers]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(currentUser));
        // Also save profile into persistent user profiles dictionary by email
        const profilesMapRaw = localStorage.getItem(LOCAL_USERS_PROFILES_KEY);
        const profilesMap: Record<string, UserProfile> = profilesMapRaw ? JSON.parse(profilesMapRaw) : {};
        profilesMap[currentUser.email.toLowerCase()] = currentUser;
        localStorage.setItem(LOCAL_USERS_PROFILES_KEY, JSON.stringify(profilesMap));
        
        // Also save to IndexedDB asynchronously
        saveProfileToIndexedDB(currentUser);

        // Keep allUsers in sync if username or avatar changed
        setAllUsers(prev => prev.map(u => {
          if (u.email.toLowerCase() === currentUser.email.toLowerCase() || u.uid === currentUser.uid) {
            return {
              ...u,
              username: currentUser.username,
              plan: currentUser.subscription?.planName || u.plan
            };
          }
          return u;
        }));
      } else {
        localStorage.removeItem(LOCAL_USER_KEY);
      }
    } catch (e) {
      console.warn('localStorage error user:', e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      const sanitized = movies.map(m => ({
        ...m,
        posterUrl: m.posterUrl && m.posterUrl.length > 50000 ? `media://poster_${m.id}` : m.posterUrl,
        bannerUrl: m.bannerUrl && m.bannerUrl.length > 50000 ? `media://banner_${m.id}` : m.bannerUrl
      }));
      localStorage.setItem(LOCAL_MOVIES_KEY, JSON.stringify(sanitized));
    } catch (e) {
      console.warn('localStorage error movies (likely quota exceeded):', e);
    }
    // Also persist custom added movies separately
    try {
      const customOnes = movies.filter(m => m.id.startsWith('m_') || !initialMovies.some(im => im.id === m.id));
      const sanitizedCustom = customOnes.map(m => ({
        ...m,
        posterUrl: m.posterUrl && m.posterUrl.length > 50000 ? `media://poster_${m.id}` : m.posterUrl,
        bannerUrl: m.bannerUrl && m.bannerUrl.length > 50000 ? `media://banner_${m.id}` : m.bannerUrl
      }));
      localStorage.setItem(LOCAL_CUSTOM_MOVIES_KEY, JSON.stringify(sanitizedCustom));
    } catch (e) {}

    // Only save full collection to IndexedDB after hydration is done, preventing empty overwrites
    if (isMoviesHydratedRef.current) {
      saveMoviesToIndexedDB(movies).catch(e => console.warn('IndexedDB saveMovies error:', e));
    }
  }, [movies]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CHARACTERS_KEY, JSON.stringify(characters));
    } catch (e) {
      console.warn('localStorage error characters:', e);
    }
    try {
      const customOnes = characters.filter(c => c.id.startsWith('char_') || !initialCharacters.some(ic => ic.id === c.id));
      localStorage.setItem(LOCAL_CUSTOM_CHARACTERS_KEY, JSON.stringify(customOnes));
    } catch (e) {}

    if (isCharactersHydratedRef.current) {
      saveCharactersToIndexedDB(characters).catch(e => console.warn('IndexedDB saveCharacters error:', e));
    }
  }, [characters]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_PLANS_KEY, JSON.stringify(plans));
    } catch (e) {
      console.warn('localStorage error plans:', e);
    }
  }, [plans]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_COUPONS_KEY, JSON.stringify(coupons));
    } catch (e) {
      console.warn('localStorage error coupons:', e);
    }
  }, [coupons]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify(payments));
    } catch (e) {
      console.warn('localStorage error payments:', e);
    }
  }, [payments]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_ADS_KEY, JSON.stringify(adsConfig));
    } catch (e) {
      console.warn('localStorage error ads:', e);
    }
  }, [adsConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.warn('localStorage error notifications:', e);
    }
  }, [notifications]);

  // Load persistent media from IndexedDB on mount (for mobile video/photo status survival across refreshes)
  useEffect(() => {
    async function loadPersistentStatusMedia() {
      try {
        const storedBlobUrl = await getMediaBlobUrl('status_media');
        
        // Fully restore all status stories from IndexedDB
        const rawStories = appBranding.statusStories || [];
        if (rawStories.length > 0) {
          const restoredStories = await Promise.all(
            rawStories.map(async (st) => {
              let liveUrl = st.url;
              let livePoster = st.poster;

              if (st.url && (st.url.startsWith('indexeddb://') || st.url.startsWith('media://'))) {
                const id = st.url.replace(/^(indexeddb:\/\/|media:\/\/)/, '');
                const blob = await getMediaBlobUrl(id);
                if (blob) liveUrl = blob;
              } else if (!st.url || st.url.startsWith('blob:')) {
                const blob = await getMediaBlobUrl(`status_media_${st.id}`);
                if (blob) liveUrl = blob;
              }

              if (st.poster && (st.poster.startsWith('indexeddb://') || st.poster.startsWith('media://'))) {
                const id = st.poster.replace(/^(indexeddb:\/\/|media:\/\/)/, '');
                const blob = await getMediaBlobUrl(id);
                if (blob) livePoster = blob;
              } else if (!st.poster || st.poster.startsWith('blob:')) {
                const blob = await getMediaBlobUrl(`status_media_${st.id}`);
                if (blob) livePoster = blob;
              }

              return {
                ...st,
                url: liveUrl,
                poster: livePoster
              };
            })
          );

          setAppBranding(prev => ({
            ...prev,
            statusMediaUrl: storedBlobUrl || restoredStories[0]?.url || prev.statusMediaUrl,
            statusStories: restoredStories
          }));
        } else if (storedBlobUrl) {
          setAppBranding(prev => ({
            ...prev,
            statusMediaUrl: storedBlobUrl
          }));
        }
      } catch (err) {
        console.warn('Failed loading status media from IndexedDB:', err);
      }
    }
    loadPersistentStatusMedia();
  }, []);

  useEffect(() => {
    try {
      // If statusMediaUrl or statusStories has large base64 or blob URL, sanitize for localStorage so mobile quota is never exceeded
      const sanitizedBranding: AppBranding = { ...appBranding };
      if (sanitizedBranding.statusMediaUrl && (sanitizedBranding.statusMediaUrl.startsWith('blob:') || sanitizedBranding.statusMediaUrl.length > 50000)) {
        sanitizedBranding.statusMediaUrl = 'indexeddb://status_media';
      }
      if (sanitizedBranding.statusStories && sanitizedBranding.statusStories.length > 0) {
        sanitizedBranding.statusStories = sanitizedBranding.statusStories.map(story => {
          const s = { ...story };
          if (s.url && (s.url.startsWith('blob:') || s.url.length > 50000)) {
            s.url = `indexeddb://status_media_${story.id}`;
          }
          if (s.poster && (s.poster.startsWith('blob:') || s.poster.length > 50000)) {
            s.poster = `indexeddb://status_poster_${story.id}`;
          }
          return s;
        });
      }
      localStorage.setItem(LOCAL_BRANDING_KEY, JSON.stringify(sanitizedBranding));
    } catch (e) {
      console.warn('localStorage error branding:', e);
    }
  }, [appBranding]);

  const updateAppBranding = (updates: Partial<AppBranding>) => {
    setAppBranding(prev => ({ ...prev, ...updates }));
  };

  const toggleSplashAnimation = (forceState?: boolean) => {
    setAppBranding(prev => {
      const nextVal = forceState !== undefined ? forceState : !(prev.splashEnabled !== false);
      const updated = { ...prev, splashEnabled: nextVal };
      try {
        localStorage.setItem(LOCAL_BRANDING_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const toggleSplashSound = (forceState?: boolean) => {
    setAppBranding(prev => {
      const nextVal = forceState !== undefined ? forceState : !(prev.splashSoundEnabled !== false);
      const updated = { ...prev, splashSoundEnabled: nextVal };
      try {
        localStorage.setItem(LOCAL_BRANDING_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const resetAppBranding = () => {
    deleteMediaBlob('status_media').catch(() => {});
    setAppBranding(initialBranding);
  };

  // Init Firebase service if config exists
  useEffect(() => {
    if (firebaseConfig) {
      initFirebaseService(firebaseConfig);
    }
  }, [firebaseConfig]);

  // Real-time Firestore Sync for Movies: Admin changes reflect instantly for all users & persist across signup/login
  useEffect(() => {
    const unsubscribe = subscribeToFirestoreMovies((firestoreMovies) => {
      if (!firestoreMovies || firestoreMovies.length === 0) return;
      try {
        const deletedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_DELETED_MOVIE_IDS_KEY) || '[]');
        setMovies(prev => {
          const map = new Map<string, Movie>();
          // Base demo movies
          initialMovies.filter(m => !deletedIds.includes(m.id)).forEach(m => map.set(m.id, m));
          // Existing in-memory movies
          prev.filter(m => !deletedIds.includes(m.id)).forEach(m => map.set(m.id, m));
          // Authoritative Firestore cloud movies added by Admin
          firestoreMovies.filter(m => !deletedIds.includes(m.id)).map(sanitizeMovieRecord).forEach(m => map.set(m.id, m));
          
          return Array.from(map.values());
        });
      } catch (e) {
        console.warn('Error merging Firestore real-time movies:', e);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [firebaseConfig]);

  const isAdmin = currentUser ? (checkIsAdminEmail(currentUser.email) || currentUser.role === 'admin') : false;

  const setTheme = (newTheme: 'dark' | 'light' | 'system') => {
    setThemeState(newTheme);
    const root = document.documentElement;
    if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  };

  const setPinCode = (pin: string) => {
    setPinCodeState(pin);
    localStorage.setItem(LOCAL_PIN_KEY, pin);
  };

  const verifyPin = (pin: string): boolean => {
    if (pin === pinCode) {
      setIsAppLocked(false);
      return true;
    }
    return false;
  };

  const lockApp = () => {
    if (pinCode) {
      setIsAppLocked(true);
    }
  };

  const addUser = (userData: Omit<UserRecord, 'uid' | 'regDate'>) => {
    const created: UserRecord = {
      ...userData,
      uid: `u_${Date.now()}`,
      regDate: new Date().toISOString().split('T')[0]
    };
    setAllUsers(prev => [created, ...prev]);
  };

  const updateUser = (uid: string, updates: Partial<UserRecord>) => {
    setAllUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...updates } : u));
    if (currentUser && currentUser.uid === uid) {
      updateUserProfile({
        role: updates.role || currentUser.role,
        isBanned: updates.status === 'Banned',
        subscription: updates.plan ? {
          ...currentUser.subscription,
          planName: updates.plan,
          active: updates.plan !== 'Free Tier'
        } : currentUser.subscription
      });
    }
  };

  const deleteUser = (uidOrEmail: string) => {
    setAllUsers(prev => {
      const updated = prev.filter(u => u.uid !== uidOrEmail && u.email.toLowerCase() !== uidOrEmail.toLowerCase());
      try {
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    if (currentUser && (currentUser.uid === uidOrEmail || currentUser.email.toLowerCase() === uidOrEmail.toLowerCase())) {
      logoutUser();
    }
  };

  const toggleBanUser = (uid: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.uid === uid) {
        const nextStatus = u.status === 'Banned' ? 'Active' : 'Banned';
        if (currentUser && currentUser.uid === uid) {
          updateUserProfile({ isBanned: nextStatus === 'Banned' });
        }
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const resetUsersData = () => {
    setAllUsers(initialDefaultUsers);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(initialDefaultUsers));
  };

  const loginUser = (email: string, pass: string, customUsername?: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const existingInList = allUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (existingInList && existingInList.status === 'Banned') {
      alert('Your account has been suspended/banned by Admin.');
      return false;
    }

    const isUserAdmin = checkIsAdminEmail(cleanEmail) || existingInList?.role === 'admin';
    const planName = existingInList?.plan || (isUserAdmin ? 'Diamond Admin VIP' : 'Free Tier');

    // Check if there is previously saved full profile data (avatar, banner, history, favorites) for this user
    let existingProfile: Partial<UserProfile> = {};
    try {
      const profilesMapRaw = localStorage.getItem(LOCAL_USERS_PROFILES_KEY);
      if (profilesMapRaw) {
        const profilesMap = JSON.parse(profilesMapRaw);
        if (profilesMap && profilesMap[cleanEmail]) {
          existingProfile = profilesMap[cleanEmail];
        }
      }
      // If logging in as sample admin user for the first time, carry over sampleAdminUser defaults if no saved profile
      if (Object.keys(existingProfile).length === 0 && (cleanEmail === sampleAdminUser.email.toLowerCase() || cleanEmail === 'ladaderahul@gmail.com')) {
        existingProfile = {
          ...sampleAdminUser,
          email: cleanEmail,
          username: customUsername || 'Rahul (Admin)'
        };
      }
    } catch (e) {
      console.warn('Error reading saved user profile:', e);
    }

    const userProfile: UserProfile = {
      uid: existingProfile.uid || existingInList?.uid || `u_${Date.now()}`,
      email: cleanEmail,
      username: customUsername || existingProfile.username || existingInList?.username || cleanEmail.split('@')[0],
      avatarUrl: existingProfile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
      bannerUrl: existingProfile.bannerUrl,
      pinCode: existingProfile.pinCode,
      role: isUserAdmin ? 'admin' : 'user',
      subscription: {
        planId: isUserAdmin ? 'p5' : (existingProfile.subscription?.planId || 'p0'),
        planName: planName,
        expiresAt: existingProfile.subscription?.expiresAt || '2030-12-31',
        active: planName !== 'Free Tier'
      },
      isBlocked: false,
      isBanned: existingInList?.status === 'Banned',
      registrationDate: existingProfile.registrationDate || existingInList?.regDate || new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString(),
      watchHistory: existingProfile.watchHistory || [],
      favorites: existingProfile.favorites || [],
      playlist: existingProfile.playlist || [],
      downloads: existingProfile.downloads || []
    };

    if (!existingInList) {
      const newUserRecord: UserRecord = {
        uid: userProfile.uid,
        email: cleanEmail,
        username: userProfile.username,
        role: userProfile.role,
        plan: planName,
        status: 'Active',
        regDate: userProfile.registrationDate
      };
      setAllUsers(prev => [newUserRecord, ...prev]);
    }

    setCurrentUser(userProfile);
    setIsAuthModalOpen(false);
    return true;
  };

  const signupUser = (email: string, pass: string, username: string): boolean => {
    return loginUser(email, pass, username);
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const addMovie = (movieData: Omit<Movie, 'id' | 'viewsCount' | 'likesCount' | 'downloadsCount' | 'createdAt'>) => {
    const newMovie: Movie = {
      ...movieData,
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      viewsCount: 0,
      likesCount: 0,
      downloadsCount: 0,
      releaseDate: movieData.releaseDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    // 0. Ensure deletedIds doesn't contain this new ID
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_DELETED_MOVIE_IDS_KEY) || '[]');
      if (deletedIds.includes(newMovie.id)) {
        localStorage.setItem(LOCAL_DELETED_MOVIE_IDS_KEY, JSON.stringify(deletedIds.filter(id => id !== newMovie.id)));
      }
    } catch (e) {}

    // 1. Direct synchronous save to custom movies in localStorage
    try {
      const existingCustom: Movie[] = JSON.parse(localStorage.getItem(LOCAL_CUSTOM_MOVIES_KEY) || '[]');
      const sanitized = {
        ...newMovie,
        posterUrl: newMovie.posterUrl && newMovie.posterUrl.length > 50000 ? `media://poster_${newMovie.id}` : newMovie.posterUrl,
        bannerUrl: newMovie.bannerUrl && newMovie.bannerUrl.length > 50000 ? `media://banner_${newMovie.id}` : newMovie.bannerUrl
      };
      localStorage.setItem(LOCAL_CUSTOM_MOVIES_KEY, JSON.stringify([sanitized, ...existingCustom.filter(m => m.id !== newMovie.id)]));
    } catch (e) {}

    // 2. Direct save to IndexedDB
    saveSingleMovieToIndexedDB(newMovie).catch(e => console.warn('Direct IndexedDB add movie warning:', e));

    // 3. Sync to Cloud Firestore in Real-Time (Immediately reflects across all devices and users)
    saveMovieToFirestore(newMovie).catch(e => console.warn('Firestore addMovie warning:', e));

    // 4. Update React state & localStorage
    setMovies(prev => {
      const nextMovies = [newMovie, ...prev.filter(m => m.id !== newMovie.id)];
      try {
        const sanitizedList = nextMovies.map(m => ({
          ...m,
          posterUrl: m.posterUrl && m.posterUrl.length > 50000 ? `media://poster_${m.id}` : m.posterUrl,
          bannerUrl: m.bannerUrl && m.bannerUrl.length > 50000 ? `media://banner_${m.id}` : m.bannerUrl
        }));
        localStorage.setItem(LOCAL_MOVIES_KEY, JSON.stringify(sanitizedList));
      } catch (e) {}
      return nextMovies;
    });

    // Send broadcast notification
    sendNotification(
      `🎬 New Release: ${newMovie.title}`,
      `Watch ${newMovie.title} now on CineStream in Ultra HD!`,
      newMovie.isPremiumOnly ? 'premium' : 'all',
      newMovie.id
    );
  };

  const updateMovie = (id: string, updates: Partial<Movie>, syncToCloud: boolean = false) => {
    setMovies(prev => {
      const target = prev.find(m => m.id === id);

      // Detect newly added episodes and notify Watchlist users
      if (target && updates.episodes && updates.episodes.length > (target.episodes || []).length) {
        const oldEpIds = new Set((target.episodes || []).map(e => e.id));
        const newlyAddedEps = updates.episodes.filter(e => !oldEpIds.has(e.id));
        newlyAddedEps.forEach(newEp => {
          sendWatchlistEpisodeNotification(target, newEp, false);
        });
      }

      const updated = prev.map(m => m.id === id ? { ...m, ...updates } : m);
      const updatedTarget = updated.find(m => m.id === id);
      if (updatedTarget) {
        saveSingleMovieToIndexedDB(updatedTarget).catch(() => {});
        if (syncToCloud) {
          saveMovieToFirestore(updatedTarget).catch(() => {});
        }
        try {
          const existingCustom: Movie[] = JSON.parse(localStorage.getItem(LOCAL_CUSTOM_MOVIES_KEY) || '[]');
          const idx = existingCustom.findIndex(m => m.id === id);
          if (idx >= 0) {
            existingCustom[idx] = updatedTarget;
            localStorage.setItem(LOCAL_CUSTOM_MOVIES_KEY, JSON.stringify(existingCustom));
          }
        } catch (e) {}
      }
      return updated;
    });
  };

  const deleteMovie = (id: string) => {
    deleteSingleMovieFromIndexedDB(id).catch(() => {});
    deleteMovieFromFirestore(id).catch(() => {});
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_DELETED_MOVIE_IDS_KEY) || '[]');
      if (!deletedIds.includes(id)) {
        localStorage.setItem(LOCAL_DELETED_MOVIE_IDS_KEY, JSON.stringify([...deletedIds, id]));
      }
      const existingCustom: Movie[] = JSON.parse(localStorage.getItem(LOCAL_CUSTOM_MOVIES_KEY) || '[]');
      localStorage.setItem(LOCAL_CUSTOM_MOVIES_KEY, JSON.stringify(existingCustom.filter(m => m.id !== id)));
    } catch (e) {}
    setMovies(prev => {
      const updated = prev.filter(m => m.id !== id);
      try {
        localStorage.setItem(LOCAL_MOVIES_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const deleteAllMovies = () => {
    clearMoviesFromIndexedDB().catch(() => {});
    try {
      localStorage.setItem(LOCAL_MOVIES_KEY, JSON.stringify([]));
      localStorage.setItem(LOCAL_CUSTOM_MOVIES_KEY, JSON.stringify([]));
      const allKnownIds = Array.from(new Set([...movies.map(m => m.id), ...initialMovies.map(m => m.id)]));
      localStorage.setItem(LOCAL_DELETED_MOVIE_IDS_KEY, JSON.stringify(allKnownIds));
    } catch (e) {}
    setMovies([]);
  };

  const resetMoviesData = () => {
    try {
      localStorage.removeItem(LOCAL_DELETED_MOVIE_IDS_KEY);
      localStorage.removeItem(LOCAL_CUSTOM_MOVIES_KEY);
      localStorage.setItem(LOCAL_MOVIES_KEY, JSON.stringify(initialMovies));
    } catch (e) {}
    saveMoviesToIndexedDB(initialMovies).catch(() => {});
    setMovies(initialMovies);
  };

  // Character Management Methods
  const addCharacter = (char: Omit<CharacterItem, 'id'> | CharacterItem) => {
    const newChar: CharacterItem = {
      id: 'char_' + Date.now(),
      ...char
    };

    try {
      const existingCustom: CharacterItem[] = JSON.parse(localStorage.getItem(LOCAL_CUSTOM_CHARACTERS_KEY) || '[]');
      localStorage.setItem(LOCAL_CUSTOM_CHARACTERS_KEY, JSON.stringify([newChar, ...existingCustom.filter(c => c.id !== newChar.id)]));
    } catch (e) {}

    saveSingleCharacterToIndexedDB(newChar).catch(() => {});
    setCharacters(prev => [newChar, ...prev.filter(c => c.id !== newChar.id)]);
  };

  const updateCharacter = (id: string, updates: Partial<CharacterItem>) => {
    setCharacters(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      const target = updated.find(c => c.id === id);
      if (target) {
        saveSingleCharacterToIndexedDB(target).catch(() => {});
        try {
          const existingCustom: CharacterItem[] = JSON.parse(localStorage.getItem(LOCAL_CUSTOM_CHARACTERS_KEY) || '[]');
          const idx = existingCustom.findIndex(c => c.id === id);
          if (idx >= 0) {
            existingCustom[idx] = target;
            localStorage.setItem(LOCAL_CUSTOM_CHARACTERS_KEY, JSON.stringify(existingCustom));
          }
        } catch (e) {}
      }
      return updated;
    });
  };

  const deleteCharacter = (id: string) => {
    deleteSingleCharacterFromIndexedDB(id).catch(() => {});
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_DELETED_CHARACTER_IDS_KEY) || '[]');
      if (!deletedIds.includes(id)) {
        localStorage.setItem(LOCAL_DELETED_CHARACTER_IDS_KEY, JSON.stringify([...deletedIds, id]));
      }
      const existingCustom: CharacterItem[] = JSON.parse(localStorage.getItem(LOCAL_CUSTOM_CHARACTERS_KEY) || '[]');
      localStorage.setItem(LOCAL_CUSTOM_CHARACTERS_KEY, JSON.stringify(existingCustom.filter(c => c.id !== id)));
    } catch (e) {}
    setCharacters(prev => prev.filter(c => c.id !== id));
  };

  const resetCharactersToDefault = () => {
    setCharacters(initialCharacters);
    try {
      localStorage.removeItem(LOCAL_CUSTOM_CHARACTERS_KEY);
      localStorage.removeItem(LOCAL_DELETED_CHARACTER_IDS_KEY);
      localStorage.setItem(LOCAL_CHARACTERS_KEY, JSON.stringify(initialCharacters));
    } catch (e) {
      console.error(e);
    }
  };

  const startPlaying = (movie: Movie, episode?: Episode) => {
    // Increment view count
    updateMovie(movie.id, { viewsCount: movie.viewsCount + 1 });
    setPlayingMovie(movie);
    setPlayingEpisode(episode || (movie.episodes && movie.episodes.length > 0 ? movie.episodes[0] : null));
  };

  const closePlayer = () => {
    setPlayingMovie(null);
    setPlayingEpisode(null);
  };

  const toggleFavorite = (movieId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const isFav = currentUser.favorites.includes(movieId);
    const updated = isFav
      ? currentUser.favorites.filter(id => id !== movieId)
      : [...currentUser.favorites, movieId];
    
    updateUserProfile({ favorites: updated });

    // Update movie likes count
    const target = movies.find(m => m.id === movieId);
    if (target) {
      updateMovie(movieId, { likesCount: isFav ? Math.max(0, target.likesCount - 1) : target.likesCount + 1 });
    }
  };

  const togglePlaylist = (movieId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const inPlaylist = currentUser.playlist.includes(movieId);
    const updated = inPlaylist
      ? currentUser.playlist.filter(id => id !== movieId)
      : [...currentUser.playlist, movieId];
    
    updateUserProfile({ playlist: updated });
  };

  const toggleDownload = (movieId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const isDownloaded = currentUser.downloads.includes(movieId);
    const updated = isDownloaded
      ? currentUser.downloads.filter(id => id !== movieId)
      : [...currentUser.downloads, movieId];

    updateUserProfile({ downloads: updated });

    const target = movies.find(m => m.id === movieId);
    if (target && !isDownloaded) {
      updateMovie(movieId, { downloadsCount: target.downloadsCount + 1 });
    }
  };

  const updateWatchProgress = (
    movieId: string, 
    progressSeconds: number, 
    durationSeconds: number, 
    episodeId?: string,
    completed?: boolean
  ) => {
    if (!currentUser) return;
    const history = [...currentUser.watchHistory];
    const existingIdx = history.findIndex(h => h.movieId === movieId && h.episodeId === episodeId);
    
    // Auto-calculate completion if at least 95% of the video duration has been watched
    const isCompleted = completed ?? (durationSeconds > 0 && progressSeconds / durationSeconds >= 0.95);

    const newItem: WatchHistoryItem = {
      movieId,
      episodeId,
      progressSeconds: Math.max(0, Math.round(progressSeconds)),
      durationSeconds: Math.max(0, Math.round(durationSeconds)),
      lastWatchedAt: new Date().toISOString(),
      completed: isCompleted
    };

    if (existingIdx >= 0) {
      // Remove existing and prepend at top so most recently watched is always first
      history.splice(existingIdx, 1);
    }
    history.unshift(newItem);

    updateUserProfile({ watchHistory: history });
  };

  const removeWatchHistoryItem = (movieId: string, episodeId?: string) => {
    if (!currentUser) return;
    const updated = currentUser.watchHistory.filter(h => !(h.movieId === movieId && h.episodeId === episodeId));
    updateUserProfile({ watchHistory: updated });
  };

  const clearWatchHistory = () => {
    if (!currentUser) return;
    updateUserProfile({ watchHistory: [] });
  };

  const updatePlan = (updatedPlan: SubscriptionPlan) => {
    setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
  };

  const addPlan = (newPlan: SubscriptionPlan) => {
    setPlans(prev => [...prev, newPlan]);
  };

  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  const addCoupon = (coupon: Coupon) => {
    setCoupons(prev => [...prev, coupon]);
  };

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCoupon = (id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  const submitPayment = (
    planId: string, 
    planName: string, 
    amount: number, 
    paymentMethod: PaymentTransaction['paymentMethod'], 
    transactionId: string, 
    screenshotUrl?: string
  ) => {
    const newTx: PaymentTransaction = {
      id: `tx_${Date.now()}`,
      userId: currentUser?.uid || 'u_guest',
      userEmail: currentUser?.email || 'guest@gmail.com',
      planId,
      planName,
      amount,
      paymentMethod,
      transactionId,
      screenshotUrl,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setPayments(prev => [newTx, ...prev]);
  };

  const updatePaymentStatus = (txId: string, status: PaymentTransaction['status']) => {
    setPayments(prev => prev.map(p => {
      if (p.id === txId) {
        if (status === 'approved') {
          // Upgrade user plan in allUsers
          setAllUsers(users => users.map(u => 
            u.email.toLowerCase() === p.userEmail.toLowerCase() ? { ...u, plan: p.planName } : u
          ));

          // If current user is this user, upgrade currentUser subscription
          if (currentUser && currentUser.email.toLowerCase() === p.userEmail.toLowerCase()) {
            const plan = plans.find(pl => pl.id === p.planId);
            const duration = plan ? plan.durationDays : 30;
            const expDate = new Date();
            expDate.setDate(expDate.getDate() + duration);
            updateUserProfile({
              subscription: {
                planId: p.planId,
                planName: p.planName,
                expiresAt: expDate.toISOString().split('T')[0],
                active: true
              }
            });
          }
        }
        return { ...p, status };
      }
      return p;
    }));
  };

  const updateAdsConfig = (updates: Partial<AdsConfig>) => {
    setAdsConfig(prev => ({ ...prev, ...updates }));
  };

  const addComment = (movieId: string, content: string) => {
    if (!currentUser) return;
    const newComment: CommentItem = {
      id: `cm_${Date.now()}`,
      movieId,
      userId: currentUser.uid,
      username: currentUser.username,
      userAvatar: currentUser.avatarUrl,
      content,
      createdAt: new Date().toISOString(),
      status: 'approved',
      likes: 0
    };
    setComments(prev => [newComment, ...prev]);
  };

  const updateCommentStatus = (commentId: string, status: CommentItem['status'], isPinned?: boolean) => {
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, status, isPinned: isPinned ?? c.isPinned } : c));
  };

  const deleteComment = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const submitFeedback = (subject: string, message: string) => {
    if (!currentUser) return;
    const newFb: FeedbackItem = {
      id: `fb_${Date.now()}`,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      subject,
      message,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    setFeedbacks(prev => [newFb, ...prev]);
  };

  const replyFeedback = (id: string, reply: string) => {
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, reply, status: 'solved' } : f));
  };

  const deleteFeedback = (id: string) => {
    setFeedbacks(prev => prev.filter(f => f.id !== id));
  };

  const sendNotification = (title: string, body: string, target: 'all' | 'premium' | 'free', movieId?: string) => {
    const newNotif: NotificationItem = {
      id: `n_${Date.now()}`,
      title,
      body,
      target,
      movieId,
      createdAt: new Date().toISOString(),
      readBy: []
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    if (currentUser?.uid) {
      setNotifications(prev => prev.map(n => {
        if (n.id === id && !n.readBy.includes(currentUser.uid)) {
          return { ...n, readBy: [...n.readBy, currentUser.uid] };
        }
        return n;
      }));
    } else {
      setGuestReadNotifs(prev => {
        if (!prev.includes(id)) {
          const updated = [...prev, id];
          try {
            localStorage.setItem(LOCAL_READ_NOTIFS_KEY, JSON.stringify(updated));
          } catch (e) {}
          return updated;
        }
        return prev;
      });
    }
  };

  const markAllNotificationsRead = () => {
    if (currentUser?.uid) {
      setNotifications(prev => prev.map(n => ({
        ...n,
        readBy: n.readBy.includes(currentUser.uid) ? n.readBy : [...n.readBy, currentUser.uid]
      })));
    } else {
      const allIds = notifications.map(n => n.id);
      setGuestReadNotifs(allIds);
      try {
        localStorage.setItem(LOCAL_READ_NOTIFS_KEY, JSON.stringify(allIds));
      } catch (e) {}
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setGuestReadNotifs([]);
    try {
      localStorage.removeItem(LOCAL_NOTIFICATIONS_KEY);
      localStorage.removeItem(LOCAL_READ_NOTIFS_KEY);
    } catch (e) {}
  };

  const resetNotifications = () => {
    clearAllNotifications();
  };

  const toggleWatchlistNotif = () => {
    setIsWatchlistNotifEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem(LOCAL_WATCHLIST_NOTIF_KEY, String(next));
      } catch (e) {}
      return next;
    });
  };

  const requestBrowserNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setBrowserNotifPermission('unsupported');
      return false;
    }
    try {
      const res = await Notification.requestPermission();
      setBrowserNotifPermission(res);
      if (res === 'granted') {
        setIsWatchlistNotifEnabled(true);
        try {
          localStorage.setItem(LOCAL_WATCHLIST_NOTIF_KEY, 'true');
        } catch (e) {}
        try {
          new Notification('⚡ CineStream Watchlist Alerts Enabled', {
            body: "You'll now receive instant browser notifications whenever a new episode of your Watchlist anime is added!",
            icon: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&q=80',
            tag: 'watchlist-notif-welcome'
          });
        } catch (err) {}
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Notification permission error:', err);
      return false;
    }
  };

  const sendWatchlistEpisodeNotification = (movie: Movie, episode: Episode, forceAlert: boolean = false): boolean => {
    const isAnime = movie.type === 'anime' || (movie.genres && movie.genres.some(g => g.toLowerCase().includes('anime')));
    const inWatchlist = currentUser?.playlist?.includes(movie.id) || false;

    // Trigger if forced (testing / admin simulator) or if it's an anime in user's Watchlist
    if (!forceAlert && (!isAnime || !inWatchlist)) {
      return false;
    }

    // 1. Show interactive in-app toast banner
    setEpisodeAlertToast({
      movie,
      episode,
      isWatchlist: inWatchlist
    });

    // 2. Add to in-app Notification Center log
    sendNotification(
      `⚡ New Episode: ${movie.title} (Ep ${episode.episodeNumber})`,
      `Episode ${episode.episodeNumber}: "${episode.title}" is now available to stream in your Watchlist!`,
      'all',
      movie.id
    );

    // 3. Trigger native browser notification
    if (isWatchlistNotifEnabled && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(`⚡ New Episode Alert: ${movie.title}`, {
          body: `Episode ${episode.episodeNumber}: "${episode.title}" has just dropped! Stream now in HD.`,
          icon: movie.posterUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&q=80',
          badge: movie.posterUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&q=80',
          tag: `watchlist-anime-ep-${movie.id}-${episode.id || episode.episodeNumber}`,
          renotify: true
        } as any);

        notif.onclick = () => {
          window.focus();
          startPlaying(movie, episode);
          notif.close();
        };
        return true;
      } catch (err) {
        console.warn('Native notification dispatch error:', err);
      }
    }
    return true;
  };

  const addEpisodeToMovie = (movieId: string, episodeData: Omit<Episode, 'id'> | Episode, notifyWatchlistUsers: boolean = true) => {
    const newEp: Episode = {
      ...episodeData,
      id: (episodeData as Episode).id || `ep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    };

    setMovies(prev => {
      const target = prev.find(m => m.id === movieId);
      if (!target) return prev;

      const existingEps = target.episodes || [];
      const updatedEpisodes = [...existingEps.filter(e => e.id !== newEp.id), newEp].sort((a, b) => a.episodeNumber - b.episodeNumber);
      const updatedMovie: Movie = {
        ...target,
        episodes: updatedEpisodes
      };

      saveSingleMovieToIndexedDB(updatedMovie).catch(() => {});
      saveMovieToFirestore(updatedMovie).catch(() => {});

      try {
        const existingCustom: Movie[] = JSON.parse(localStorage.getItem(LOCAL_CUSTOM_MOVIES_KEY) || '[]');
        const idx = existingCustom.findIndex(m => m.id === movieId);
        if (idx >= 0) {
          existingCustom[idx] = updatedMovie;
          localStorage.setItem(LOCAL_CUSTOM_MOVIES_KEY, JSON.stringify(existingCustom));
        }
      } catch (e) {}

      if (notifyWatchlistUsers) {
        sendWatchlistEpisodeNotification(updatedMovie, newEp, false);
      }

      return prev.map(m => m.id === movieId ? updatedMovie : m);
    });
  };

  const submitMovieRequest = (title: string, type: 'movie' | 'anime', message?: string) => {
    if (!currentUser) return;
    const newReq: MovieRequestItem = {
      id: `req_${Date.now()}`,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      title,
      type,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setMovieRequests(prev => [newReq, ...prev]);
  };

  // 5-Star Movie Ratings & Community Rating Stats
  const getMovieRatingStats = (movieId: string): MovieRatingStats => {
    // User-submitted ratings for this movie
    const ratingsForMovie = movieRatings.filter(r => r.movieId === movieId);
    const totalCount = ratingsForMovie.length;

    const distribution: { 5: number; 4: number; 3: number; 2: number; 1: number } = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    let totalScore = 0;
    ratingsForMovie.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      distribution[star] = (distribution[star] || 0) + 1;
      totalScore += star;
    });

    const avg = totalCount > 0 ? parseFloat((totalScore / totalCount).toFixed(1)) : 0;

    // Detect active viewer's personal rating
    const currentUserId = currentUser?.uid || (typeof window !== 'undefined' ? localStorage.getItem('cinestream_guest_uuid') : null);
    const userVote = ratingsForMovie.find(r => (currentUserId && r.userId === currentUserId) || (currentUser && r.userId === currentUser.uid));

    return {
      averageRating: avg,
      totalRatings: totalCount,
      userRating: userVote ? userVote.rating : null,
      distribution
    };
  };

  const rateMovie = (movieId: string, rating: number) => {
    const clampedRating = Math.min(5, Math.max(1, Math.round(rating)));
    let currentUserId = currentUser?.uid;
    if (!currentUserId && typeof window !== 'undefined') {
      let guestId = localStorage.getItem('cinestream_guest_uuid');
      if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('cinestream_guest_uuid', guestId);
      }
      currentUserId = guestId;
    }
    const effectiveUserId = currentUserId || 'guest_viewer';

    setMovieRatings(prev => {
      const existingIdx = prev.findIndex(r => r.movieId === movieId && (r.userId === effectiveUserId || (currentUser && r.userId === currentUser.uid)));
      const newRatingItem: MovieRating = {
        movieId,
        userId: effectiveUserId,
        username: currentUser?.username || 'Guest Viewer',
        rating: clampedRating,
        updatedAt: new Date().toISOString()
      };

      let updated: MovieRating[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = newRatingItem;
      } else {
        updated = [newRatingItem, ...prev];
      }

      try {
        localStorage.setItem(LOCAL_MOVIE_RATINGS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving movie rating:', e);
      }
      return updated;
    });
  };

  const removeMovieRating = (movieId: string) => {
    const currentUserId = currentUser?.uid || (typeof window !== 'undefined' ? localStorage.getItem('cinestream_guest_uuid') : null);
    if (!currentUserId && !currentUser) return;

    setMovieRatings(prev => {
      const updated = prev.filter(r => !(r.movieId === movieId && ((currentUserId && r.userId === currentUserId) || (currentUser && r.userId === currentUser.uid))));
      try {
        localStorage.setItem(LOCAL_MOVIE_RATINGS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const saveCustomFirebaseConfig = (config: Omit<FirebaseConfigState, 'isConfigured'>): boolean => {
    const success = saveFirebaseConfig(config);
    if (success) {
      setFirebaseConfig({ ...config, isConfigured: true });
    }
    return success;
  };

  const resetDashboardData = () => {
    setPayments([]);
    localStorage.removeItem(LOCAL_PAYMENTS_KEY);
    setMovies(prev => prev.map(m => ({ ...m, viewsCount: 0, downloadsCount: 0, likesCount: 0 })));
    setFeedbacks([]);
    setComments([]);
    setNotifications([]);
    setMovieRequests([]);
    setMovieRatings(initialMovieRatings);
    localStorage.removeItem(LOCAL_MOVIE_RATINGS_KEY);
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        theme,
        setTheme,
        isAppLocked,
        pinCode,
        setPinCode,
        verifyPin,
        lockApp,
        currentUser,
        isAdmin,
        isAuthModalOpen,
        setIsAuthModalOpen,
        loginUser,
        signupUser,
        logoutUser,
        updateUserProfile,
        allUsers,
        addUser,
        updateUser,
        deleteUser,
        toggleBanUser,
        resetUsersData,
        movies,
        addMovie,
        updateMovie,
        deleteMovie,
        deleteAllMovies,
        resetMoviesData,
        selectedMovie,
        setSelectedMovie,
        playingMovie,
        playingEpisode,
        startPlaying,
        closePlayer,
        toggleFavorite,
        togglePlaylist,
        toggleDownload,
        updateWatchProgress,
        removeWatchHistoryItem,
        clearWatchHistory,
        movieRatings,
        rateMovie,
        removeMovieRating,
        getMovieRatingStats,
        plans,
        updatePlan,
        addPlan,
        deletePlan,
        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        payments,
        submitPayment,
        updatePaymentStatus,
        paymentGatewayConfig,
        updatePaymentGatewayConfig,
        adsConfig,
        updateAdsConfig,
        comments,
        addComment,
        updateCommentStatus,
        deleteComment,
        feedbacks,
        submitFeedback,
        replyFeedback,
        deleteFeedback,
        notifications,
        sendNotification,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearAllNotifications,
        resetNotifications,
        browserNotifPermission,
        isWatchlistNotifEnabled,
        toggleWatchlistNotif,
        requestBrowserNotificationPermission,
        sendWatchlistEpisodeNotification,
        addEpisodeToMovie,
        episodeAlertToast,
        dismissEpisodeAlertToast,
        movieRequests,
        submitMovieRequest,
        searchQuery,
        setSearchQuery,
        selectedGenre,
        setSelectedGenre,
        selectedCategory,
        setSelectedCategory,
        selectedLetter,
        setSelectedLetter,
        characters,
        addCharacter,
        updateCharacter,
        deleteCharacter,
        resetCharactersToDefault,
        firebaseConfig,
        saveCustomFirebaseConfig,
        appBranding,
        updateAppBranding,
        resetAppBranding,
        showSplashIntro,
        setShowSplashIntro,
        replaySplashIntro,
        toggleSplashAnimation,
        toggleSplashSound,
        resetDashboardData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
