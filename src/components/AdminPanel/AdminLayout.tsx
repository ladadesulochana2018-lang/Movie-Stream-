import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Film, 
  Users, 
  Crown, 
  CreditCard, 
  Ticket, 
  Sparkles, 
  MessageSquare, 
  Bell, 
  Database,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
  AppWindow,
  Zap,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { AdminMovies } from './AdminMovies';
import { AdminUsers } from './AdminUsers';
import { AdminSubscriptions } from './AdminSubscriptions';
import { AdminPayments } from './AdminPayments';
import { AdminCoupons } from './AdminCoupons';
import { AdminAds } from './AdminAds';
import { AdminCommentsFeedback } from './AdminCommentsFeedback';
import { AdminNotifications } from './AdminNotifications';
import { AdminFirebaseConfig } from './AdminFirebaseConfig';
import { AdminBranding } from './AdminBranding';
import { AdminCharacters } from './AdminCharacters';
import { useApp } from '../../context/AppContext';

export const AdminLayout: React.FC<{ onBackToSite: () => void }> = ({ onBackToSite }) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'characters' | 'movies' | 'users' | 'subscriptions' | 'payments' | 'coupons' | 'ads' | 'comments' | 'notifications' | 'firebase' | 'branding'
  >('dashboard');

  const { payments, characters, appBranding, toggleSplashAnimation, replaySplashIntro } = useApp();
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const isSplashOn = appBranding.splashEnabled !== false;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'characters', label: 'Character & Arch Carousel', icon: Sparkles },
    { id: 'movies', label: 'Movies & Anime', icon: Film },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'subscriptions', label: 'Membership Plans', icon: Crown },
    { id: 'payments', label: 'Payment Verifications', icon: CreditCard, badge: pendingPayments },
    { id: 'coupons', label: 'Promo Coupons', icon: Ticket },
    { id: 'ads', label: 'Google Ads & AdMob', icon: Sparkles },
    { id: 'comments', label: 'Comments & Feedback', icon: MessageSquare },
    { id: 'notifications', label: 'Push Notifications', icon: Bell },
    { id: 'branding', label: 'App Name & Logo Icon', icon: AppWindow },
    { id: 'firebase', label: 'Firebase Config', icon: Database }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4 lg:px-8 max-w-[1600px] mx-auto">
      
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={onBackToSite}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 text-xs font-black shadow-lg shadow-red-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> ← Back to Main Site
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-zinc-400">Admin Panel Active</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Animation ON / OFF Switch */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
            <span className="text-[11px] font-bold text-zinc-400 pl-2 hidden md:inline">Intro Animation:</span>
            <button
              onClick={() => toggleSplashAnimation()}
              title="Click to Turn Startup Animation ON or OFF"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                isSplashOn
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                  : 'bg-rose-950/80 border border-rose-800 text-rose-300'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>{isSplashOn ? 'Animation: ON' : 'Animation: OFF'}</span>
            </button>
            {isSplashOn && (
              <button
                onClick={replaySplashIntro}
                title="Preview Startup Animation"
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-amber-400" />
              </button>
            )}
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-red-950/40 border border-red-600/40 text-red-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" /> Root Admin
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Navigation Drawer */}
        <div className="lg:col-span-1 space-y-1 bg-zinc-950/60 p-3 rounded-3xl border border-zinc-900 h-fit">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/20' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black font-black text-[10px]">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Right Active Tab Content Area */}
        <div className="lg:col-span-4 min-h-[600px]">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'characters' && <AdminCharacters />}
          {activeTab === 'movies' && <AdminMovies />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'subscriptions' && <AdminSubscriptions />}
          {activeTab === 'payments' && <AdminPayments />}
          {activeTab === 'coupons' && <AdminCoupons />}
          {activeTab === 'ads' && <AdminAds />}
          {activeTab === 'comments' && <AdminCommentsFeedback />}
          {activeTab === 'notifications' && <AdminNotifications />}
          {activeTab === 'branding' && <AdminBranding />}
          {activeTab === 'firebase' && <AdminFirebaseConfig />}
        </div>

      </div>

      {/* Persistent Floating Back to Main Website Button */}
      <button 
        onClick={onBackToSite}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-2xl shadow-red-600/40 border border-red-500/50 backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95"
        title="Return to Main Website"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>← Back to Website</span>
      </button>

    </div>
  );
};
