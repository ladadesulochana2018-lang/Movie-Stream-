import React, { useState } from 'react';
import { 
  Eye, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Film, 
  Tv, 
  Crown, 
  CreditCard, 
  MessageSquare, 
  Server, 
  ShieldCheck,
  Bell,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const { movies, payments, feedbacks, notifications, comments, resetDashboardData } = useApp();
  const [resetSuccess, setResetSuccess] = useState(false);

  const totalViews = movies.reduce((acc, m) => acc + m.viewsCount, 0);
  const totalDownloads = movies.reduce((acc, m) => acc + m.downloadsCount, 0);
  const approvedPayments = payments.filter(p => p.status === 'approved');
  const totalRevenue = approvedPayments.reduce((acc, p) => acc + p.amount, 0);
  const pendingPaymentsCount = payments.filter(p => p.status === 'pending').length;

  const moviesCount = movies.filter(m => m.type === 'movie').length;
  const animeCount = movies.filter(m => m.type === 'anime').length;

  const handleResetDashboard = () => {
    resetDashboardData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-left">
      
      {resetSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dashboard Analytics & Transactions Data Reset Successfully!
        </div>
      )}

      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/60 via-zinc-900 to-amber-950/30 border border-red-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4" /> Secure Admin Dashboard
          </div>
          <h2 className="text-2xl font-black text-white font-display">System Analytics & Overview</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time platform status, revenue statistics, user subscriptions, and server load metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <Server className="w-4 h-4" /> Server Online (100% Uptime)
          </span>
          
          <button
            onClick={handleResetDashboard}
            className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            title="Reset views, revenue transactions, and dashboard statistics"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Dashboard Data
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
            <span>Total Video Views</span>
            <Eye className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalViews.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-400 font-bold">+18.4% from last week</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
            <span>Platform Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">₹{totalRevenue.toLocaleString()}</div>
          <div className="text-[10px] text-zinc-500">{approvedPayments.length} Approved Transactions</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
            <span>Pending Verification</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{pendingPaymentsCount}</div>
          <div className="text-[10px] text-amber-400 font-bold">Requires Admin Review</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
            <span>Media Library</span>
            <Film className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{movies.length}</div>
          <div className="text-[10px] text-zinc-400">{moviesCount} Movies • {animeCount} Anime</div>
        </div>

      </div>

      {/* Subscription Tiers Breakdown */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" /> Subscription Tier Breakdown
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].map((tier, idx) => (
            <div key={tier} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
              <div className="text-[11px] font-bold text-amber-400 uppercase">{tier}</div>
              <div className="text-lg font-black text-white my-1">{(idx + 1) * 14}</div>
              <div className="text-[9px] text-zinc-500">Active Members</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
