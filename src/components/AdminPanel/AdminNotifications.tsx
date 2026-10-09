import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, Trash2, RotateCcw, MessageSquare, Sparkles, Tv, ListVideo } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminNotifications: React.FC = () => {
  const { 
    notifications, 
    sendNotification, 
    deleteNotification, 
    clearAllNotifications, 
    resetNotifications,
    movies,
    browserNotifPermission,
    requestBrowserNotificationPermission,
    sendWatchlistEpisodeNotification,
    isWatchlistNotifEnabled
  } = useApp();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<'all' | 'premium' | 'free'>('all');
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Watchlist Episode Trigger State
  const animeList = movies.filter(m => m.type === 'anime');
  const [animeEpisodeId, setAnimeEpisodeId] = useState(animeList[0]?.id || '');
  const [animeEpNum, setAnimeEpNum] = useState<number>(1);
  const [animeEpTitle, setAnimeEpTitle] = useState('New Epic Episode');
  const [epTriggerSuccess, setEpTriggerSuccess] = useState(false);

  const handleTriggerEpisodeNotification = (forceAll: boolean = false) => {
    const selectedAnime = movies.find(m => m.id === animeEpisodeId) || animeList[0];
    if (!selectedAnime) return;

    const sampleEp = {
      id: `ep_alert_${Date.now()}`,
      episodeNumber: animeEpNum,
      title: animeEpTitle.trim() || `Episode ${animeEpNum}`,
      duration: '24m',
      videoUrl: selectedAnime.videoUrl || 'https://media.w3.org/2010/05/bunny/movie.mp4'
    };

    sendWatchlistEpisodeNotification(selectedAnime, sampleEp, forceAll);
    setEpTriggerSuccess(true);
    setTimeout(() => setEpTriggerSuccess(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    sendNotification(title, body, target, selectedMovieId || undefined);
    setTitle('');
    setBody('');
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  const handleResetNotifications = () => {
    resetNotifications();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-left max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white font-display">Push Notification Center</h2>
          <p className="text-xs text-zinc-400">Broadcast FCM notifications and manage active user alerts.</p>
        </div>
        <button
          type="button"
          onClick={handleResetNotifications}
          className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-400 hover:text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto shadow-lg"
          title="Reset notification bar and clear all messages"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Notification Bar</span>
        </button>
      </div>

      {resetSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Notification bar successfully reset! All repeated messages have been cleared.
        </div>
      )}

      {/* --- WATCHLIST ANIME EPISODE ALERT DISPATCHER & TESTER --- */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-600/20 text-red-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">Anime Watchlist New Episode Alert Dispatcher</span>
              <p className="text-[10px] text-zinc-400">Send real-time browser notifications when an episode of an anime in user's Watchlist is added.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {browserNotifPermission === 'granted' ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Browser Active
              </span>
            ) : browserNotifPermission === 'denied' ? (
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-black">
                Blocked in Browser
              </span>
            ) : (
              <button
                type="button"
                onClick={() => requestBrowserNotificationPermission()}
                className="px-2.5 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white text-[10px] font-extrabold cursor-pointer transition-colors shadow-sm"
              >
                Enable Browser Permission
              </button>
            )}
          </div>
        </div>

        {epTriggerSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Episode alert dispatched! Native browser notification & in-app notification sent.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="font-bold text-zinc-300 block mb-1">Target Anime Series</label>
            <select
              value={animeEpisodeId}
              onChange={(e) => {
                setAnimeEpisodeId(e.target.value);
                const found = movies.find(m => m.id === e.target.value);
                if (found) {
                  setAnimeEpNum((found.episodes?.length || 0) + 1);
                  setAnimeEpTitle(`Episode ${(found.episodes?.length || 0) + 1}`);
                }
              }}
              className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl font-bold focus:outline-none focus:border-red-500"
            >
              {animeList.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="font-bold text-zinc-300 block mb-1">Episode Number</label>
            <input 
              type="number"
              min={1}
              value={animeEpNum}
              onChange={(e) => setAnimeEpNum(parseInt(e.target.value) || 1)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl focus:outline-none focus:border-red-500 font-bold"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="font-bold text-zinc-300 block mb-1">Episode Title</label>
            <input 
              type="text"
              value={animeEpTitle}
              onChange={(e) => setAnimeEpTitle(e.target.value)}
              placeholder="e.g. Battle of the Upper Moons"
              className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleTriggerEpisodeNotification(false)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notify Watchlist Subscribers</span>
          </button>

          <button
            type="button"
            onClick={() => handleTriggerEpisodeNotification(true)}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-extrabold text-xs flex items-center gap-2 border border-zinc-700 cursor-pointer transition-all"
            title="Fire a test notification directly to your device right now"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Test Browser Alert on My Device</span>
          </button>
        </div>
      </div>

      {/* Broadcast Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
          <Send className="w-4 h-4 text-red-500" />
          <span className="font-bold text-white text-sm">Send New Broadcast</span>
        </div>

        <div>
          <label className="font-bold text-zinc-300 block mb-1">Notification Title *</label>
          <input 
            type="text" 
            required
            placeholder="🎬 New Movie Released: Interstellar 4K"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-xl focus:outline-none focus:border-red-500"
          />
        </div>

        <div>
          <label className="font-bold text-zinc-300 block mb-1">Notification Message *</label>
          <textarea 
            required
            rows={3}
            placeholder="Watch now in Ultra HD with dual audio tracks..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-xl focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-zinc-300 block mb-1">Target Audience</label>
            <select 
              value={target}
              onChange={(e) => setTarget(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-xl font-bold"
            >
              <option value="all">All Registered Users</option>
              <option value="premium">VIP Premium Members Only</option>
              <option value="free">Free Tier Users Only</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-zinc-300 block mb-1">Attach Movie / Anime (Optional)</label>
            <select 
              value={selectedMovieId}
              onChange={(e) => setSelectedMovieId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-xl"
            >
              <option value="">None</option>
              {movies.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>
        </div>

        <button 
          type="submit"
          className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-xl shadow-red-600/30 flex items-center gap-2 cursor-pointer"
        >
          <Send className="w-4 h-4" /> Send Push Notification
        </button>

        {sentSuccess && (
          <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Notification Broadcasted Successfully!
          </p>
        )}
      </form>

      {/* Active Notifications Management List */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-500" />
            <span className="font-bold text-white text-sm">Active Notifications ({notifications.length})</span>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={handleResetNotifications}
              className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1 p-1 hover:bg-zinc-800 rounded-lg cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="py-6 text-center text-zinc-500">
            <p className="text-xs font-semibold text-zinc-400">No Active Notifications</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">Notification bar is clean. Send a new message above to broadcast.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {notifications.map(n => (
              <div 
                key={n.id}
                className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-start justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-400 text-xs">{n.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800 text-zinc-400 uppercase">
                      {n.target}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-xs leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-zinc-500">
                    Sent on {new Date(n.createdAt).toLocaleString()} • Read by {n.readBy?.length || 0} users
                  </p>
                </div>
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-900 cursor-pointer transition-colors shrink-0"
                  title="Delete this notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
