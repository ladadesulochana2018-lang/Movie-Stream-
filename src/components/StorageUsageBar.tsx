import React, { useState, useEffect } from 'react';
import { HardDrive, Trash2, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface StorageUsageBarProps {
  compact?: boolean;
}

export const StorageUsageBar: React.FC<StorageUsageBarProps> = ({ compact = false }) => {
  const { currentUser, updateUserProfile, movies } = useApp();

  const [usedBytes, setUsedBytes] = useState<number>(0);
  const [quotaBytes, setQuotaBytes] = useState<number>(10 * 1024 * 1024 * 1024); // default 10 GB quota fallback
  const [appDataBytes, setAppDataBytes] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const downloadedCount = currentUser?.downloads?.length || 0;
  const downloadedMovies = movies.filter(m => currentUser?.downloads?.includes(m.id));

  // Compute storage usage estimate
  const estimateStorage = async () => {
    setIsRefreshing(true);
    let localDataSize = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const val = localStorage.getItem(key) || '';
          localDataSize += (key.length + val.length) * 2; // UTF-16 approximate bytes
        }
      }
    } catch (e) {
      console.warn('Storage calculation error:', e);
    }
    setAppDataBytes(localDataSize);

    // Each downloaded title is estimated around ~480MB of cached offline video data
    const estimatedVideoBytes = downloadedCount * 480 * 1024 * 1024;
    const totalAppUsed = localDataSize + estimatedVideoBytes;
    setUsedBytes(totalAppUsed);

    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const actualQuota = estimate.quota || (10 * 1024 * 1024 * 1024);
        setQuotaBytes(actualQuota);
      } catch (err) {
        setQuotaBytes(15 * 1024 * 1024 * 1024);
      }
    } else {
      setQuotaBytes(15 * 1024 * 1024 * 1024);
    }

    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    estimateStorage();
  }, [downloadedCount, currentUser?.downloads]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const val = bytes / Math.pow(k, i);
    return `${val.toFixed(val >= 100 || i === 0 ? 0 : 1)} ${sizes[i]}`;
  };

  const percentage = quotaBytes > 0 
    ? Math.min(100, Math.max(1, Math.round((usedBytes / quotaBytes) * 100))) 
    : 0;

  const freeBytes = Math.max(0, quotaBytes - usedBytes);

  // Status Colors based on usage threshold
  const isHighUsage = percentage > 85;
  const isMediumUsage = percentage > 65;

  const getProgressBarColor = () => {
    if (isHighUsage) return 'from-amber-500 via-rose-500 to-red-600';
    if (isMediumUsage) return 'from-sky-500 via-amber-500 to-orange-500';
    return 'from-sky-500 via-teal-500 to-emerald-500';
  };

  const handleClearAllDownloads = () => {
    if (currentUser) {
      updateUserProfile({ downloads: [] });
    }
    // Also clear session caches if available
    try {
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
    } catch (e) {}

    setShowClearConfirm(false);
    setClearSuccess(true);
    setTimeout(() => {
      setClearSuccess(false);
      estimateStorage();
    }, 1800);
  };

  return (
    <div className="w-full bg-zinc-950/80 border border-zinc-850 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl text-left relative overflow-hidden">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border flex items-center justify-center ${
            isHighUsage 
              ? 'bg-red-500/10 border-red-500/30 text-red-400' 
              : isMediumUsage 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
              : 'bg-sky-500/10 border-sky-500/30 text-sky-400'
          }`}>
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black text-white tracking-wide">
                Local Storage & Offline Usage
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isHighUsage 
                  ? 'bg-red-600/20 text-red-400 border border-red-500/30' 
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}>
                {percentage}% used
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {downloadedCount === 0 
                ? 'No offline video files downloaded yet' 
                : `${downloadedCount} ${downloadedCount === 1 ? 'title' : 'titles'} saved (${formatBytes(downloadedCount * 480 * 1024 * 1024)} estimated)`
              }
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={estimateStorage}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Storage Status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-3 py-1.5 rounded-xl bg-red-600/10 border border-red-500/30 hover:bg-red-600/20 text-red-400 hover:text-red-300 font-extrabold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reset storage & clear offline cache"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Storage</span>
          </button>
        </div>
      </div>

      {/* Modern Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2 sm:h-2.5 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800/80 relative">
          <div 
            className={`h-full rounded-full bg-gradient-to-r ${getProgressBarColor()} transition-all duration-700 ease-out shadow-sm`}
            style={{ width: `${Math.max(percentage, 2)}%` }}
          />
        </div>

        {/* Storage Stats Row Below Progress Bar */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-0.5">
          <div className="flex items-center gap-2">
            <span className="text-zinc-200 font-bold font-sans">{formatBytes(usedBytes)}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-500">{formatBytes(quotaBytes)} total</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-sans font-bold">{formatBytes(freeBytes)} Available</span>
          </div>
        </div>
      </div>

      {/* Storage Breakdown Details Pills */}
      {!compact && (
        <div className="mt-3.5 pt-3 border-t border-zinc-900 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
          <div className="bg-zinc-900/60 rounded-xl px-3 py-2 border border-zinc-850 flex items-center justify-between">
            <span className="text-zinc-400">Offline Videos:</span>
            <span className="text-sky-400 font-bold font-mono">
              {formatBytes(downloadedCount * 480 * 1024 * 1024)}
            </span>
          </div>
          <div className="bg-zinc-900/60 rounded-xl px-3 py-2 border border-zinc-850 flex items-center justify-between">
            <span className="text-zinc-400">App Cache:</span>
            <span className="text-purple-400 font-bold font-mono">
              {formatBytes(appDataBytes || 45000)}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-zinc-900/60 rounded-xl px-3 py-2 border border-zinc-850 flex items-center justify-between">
            <span className="text-zinc-400">Device Quota:</span>
            <span className="text-zinc-300 font-bold font-mono">
              {formatBytes(quotaBytes)}
            </span>
          </div>
        </div>
      )}

      {/* Confirmation Modal when clearing storage */}
      {showClearConfirm && (
        <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-4 text-center z-20 animate-in fade-in">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-1 animate-bounce" />
          <h5 className="text-xs font-black text-white">Reset Storage & Clear Cache?</h5>
          <p className="text-[10px] text-zinc-400 max-w-xs mt-0.5 mb-3">
            This will reset downloaded offline files and clear local app caches to free up your device space.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAllDownloads}
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition-all cursor-pointer"
            >
              Yes, Reset Storage
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {clearSuccess && (
        <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-md rounded-2xl flex items-center justify-center gap-2 p-4 text-center z-20 text-emerald-300 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Device storage freed successfully!</span>
        </div>
      )}
    </div>
  );
};
