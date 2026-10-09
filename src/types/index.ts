export type Role = 'admin' | 'user';

export type ContentType = 'movie' | 'anime';

export interface Subtitle {
  lang: string;
  label: string;
  src: string;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl?: string;
  skipIntroStart?: number; // in seconds
  skipIntroEnd?: number;
  skipCreditsStart?: number;
}

export interface DownloadLinks {
  gdrive?: string;
  onedrive?: string;
  dropbox?: string;
  direct?: string;
  zipFile?: string;
}

export interface Movie {
  id: string;
  title: string;
  type: ContentType;
  description: string;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string;
  videoUrl: string;
  category: string; // e.g. 'Trending', 'Popular', 'Anime Shonen', 'New Release'
  genres: string[];
  language: string;
  releaseDate: string;
  imdbRating: number;
  ageRating: string; // e.g. 'PG-13', 'TV-MA', '16+'
  tags: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isPremiumOnly?: boolean;
  episodes?: Episode[];
  downloadLinks?: DownloadLinks;
  subtitles?: Subtitle[];
  viewsCount: number;
  likesCount: number;
  downloadsCount: number;
  createdAt: string;
}

export interface MovieRating {
  movieId: string;
  userId: string;
  username?: string;
  rating: number; // 1 to 5
  updatedAt: string;
}

export interface MovieRatingStats {
  averageRating: number;
  totalRatings: number;
  userRating: number | null;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface UserRecord {
  uid: string;
  email: string;
  username: string;
  role: Role;
  plan: string;
  status: 'Active' | 'Banned' | 'Inactive';
  regDate: string;
}

export interface UserSubscription {
  planId: string;
  planName: string;
  expiresAt: string;
  active: boolean;
}

export interface WatchHistoryItem {
  movieId: string;
  episodeId?: string;
  progressSeconds: number;
  durationSeconds: number;
  lastWatchedAt: string;
  completed?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  avatarUrl: string;
  bannerUrl?: string;
  role: Role;
  subscription: UserSubscription;
  isBlocked: boolean;
  isBanned: boolean;
  registrationDate: string;
  lastLogin: string;
  pinCode?: string;
  watchHistory: WatchHistoryItem[];
  favorites: string[]; // movieIds
  playlist: string[]; // movieIds
  downloads: string[]; // movieIds
}

export interface SubscriptionPlan {
  id: string;
  name: string; // Bronze, Silver, Gold, Platinum, Diamond
  price: number; // In INR / USD
  durationDays: number; // 7, 15, 30, 60, 90, 180, 365, or custom
  features: string[];
  videoQuality: string; // e.g. '720p HD', '1080p Full HD', '4K Ultra HD + HDR'
  downloadLimit: number; // max downloads per day
  devicesCount: number;
  adsEnabled: boolean;
  premiumMoviesAccess: boolean;
  animeAccess: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  minAmount: number;
  maxUses: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
}

export interface PaymentGatewayConfig {
  directUpiEnabled: boolean;
  upiId: string; // e.g., "cinestream@ybl" or admin PhonePe/GPay ID
  merchantName: string;
  qrCodeUrl: string; // QR code image URL or base64
  razorpayEnabled: boolean;
  razorpayKeyId: string; // e.g., "rzp_live_xxxxxxxx" or "rzp_test_xxxx"
  razorpaySecret?: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  amount: number;
  paymentMethod: 'PhonePe UPI' | 'Google Pay' | 'Paytm' | 'UPI Direct' | 'Razorpay' | 'Bank Transfer' | string;
  transactionId: string;
  screenshotUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  createdAt: string;
}

export interface AdFormatItem {
  enabled: boolean;
  adUnitId: string;
  targetUrl: string;
  scriptCode?: string;
  rewardValue?: number;
}

export interface AdsConfig {
  adMobId: string;
  adUnitId: string;
  adScript: string;
  enabled: boolean;
  frequencyMinutes: number; // e.g. 2, 5, 10
  skipDelaySeconds: number; // default 5
  
  // Specific AdMob Formats
  bannerAd?: AdFormatItem;
  interstitialAd?: AdFormatItem;
  rewardedInterstitialAd?: AdFormatItem;
  rewardedAd?: AdFormatItem;
  nativeAdvancedAd?: AdFormatItem;
  appOpenAd?: AdFormatItem;
}

export interface CommentItem {
  id: string;
  movieId: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'spam';
  isPinned?: boolean;
  likes: number;
  replies?: CommentItem[];
}

export interface FeedbackItem {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'open' | 'solved';
  reply?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  target: 'all' | 'premium' | 'free';
  movieId?: string;
  createdAt: string;
  readBy: string[];
}

export interface MovieRequestItem {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  type: ContentType;
  message?: string;
  status: 'pending' | 'added' | 'rejected';
  createdAt: string;
}

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  isConfigured: boolean;
}

export interface StatusStoryItem {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'image';
  caption: string;
  poster?: string;
  createdAt?: string;
}

export interface AppBranding {
  appName: string;
  appTagline: string;
  appLogoUrl: string;
  sidebarHeaderImageUrl?: string;
  // WhatsApp-style Video/Photo Status Story (Single & Multi-Status Playlist)
  statusMediaUrl?: string;
  statusMediaType?: 'video' | 'image';
  statusCaption?: string;
  statusActive?: boolean;
  statusCreatedAt?: string;
  statusStories?: StatusStoryItem[];
  // Character Section Branding (Header Logo, Title & Description)
  characterSectionTitle?: string;
  characterSectionSubtitle?: string;
  characterSectionLogoUrl?: string;
  characterSectionIcon?: string; // e.g. 'flame', 'sparkles', 'film', 'zap', 'star', 'tv'
  // Startup Splash Intro Animation
  splashEnabled?: boolean;
  splashSoundEnabled?: boolean;
  splashTheme?: 'cinematic_red' | 'cyberpunk_neon' | 'golden_imax' | 'anime_action';
  splashSoundTheme?: 'cinema_tadum' | 'cyber_synth' | 'golden_orchestral' | 'anime_spark' | 'custom_audio' | 'none';
  splashCustomAudioUrl?: string;
  splashDurationSeconds?: number;
}

export interface CharacterItem {
  id: string;
  name: string;
  franchise: string;
  domeColor: string; // Tailwind gradient classes or CSS color
  groundColor: string; // Hex color for curved hill
  characterImg: string;
  searchKeyword: string;
  glowColor: string;
}

