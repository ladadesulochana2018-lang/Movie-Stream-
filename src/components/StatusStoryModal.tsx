import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Camera, 
  CheckCircle2, 
  Sparkles, 
  Video as VideoIcon, 
  ArrowLeft,
  Trash2,
  Plus,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { defaultInitialStatusStories } from '../context/AppContext';
import { StatusStoryItem } from '../types';
import { saveMediaBlob, deleteMediaBlob, resolvePlayableUrl } from '../utils/persistentStorage';

interface StatusStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatusStoryModal: React.FC<StatusStoryModalProps> = ({ isOpen, onClose }) => {
  const { appBranding, updateAppBranding, isAdmin } = useApp();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Default to true so browser autoplay doesn't block video
  const [progress, setProgress] = useState(0);
  const [showUploadDrawer, setShowUploadDrawer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Active status stories list
  const stories: StatusStoryItem[] = (appBranding.statusStories && appBranding.statusStories.length > 0)
    ? appBranding.statusStories
    : defaultInitialStatusStories;

  // Resolved playable URLs (e.g. converting indexeddb:// or media:// into live blob URLs)
  const [resolvedStories, setResolvedStories] = useState<StatusStoryItem[]>(stories);

  // Upload state
  const [statusUrl, setStatusUrl] = useState('');
  const [statusTitle, setStatusTitle] = useState('');
  const [statusType, setStatusType] = useState<'video' | 'image'>('video');
  const [statusCaption, setStatusCaption] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadMode, setUploadMode] = useState<'append' | 'replace'>('append');

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  // Resolve all story URLs when stories change or modal opens
  useEffect(() => {
    let isCancelled = false;
    async function resolveAll() {
      const resolved = await Promise.all(
        stories.map(async (st) => {
          try {
            const playableUrl = await resolvePlayableUrl(st.url);
            return { ...st, url: playableUrl || st.url };
          } catch {
            return st;
          }
        })
      );
      if (!isCancelled) {
        setResolvedStories(resolved);
      }
    }
    resolveAll();
    return () => {
      isCancelled = true;
    };
  }, [appBranding.statusStories]);

  const currentStory: StatusStoryItem = resolvedStories[activeStoryIndex] || resolvedStories[0] || defaultInitialStatusStories[0];

  // Effective media URL & type
  const effectiveMediaUrl = currentStory?.url || '';
  const effectiveMediaType = currentStory?.type || 'video';
  const effectivePoster = currentStory?.poster || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80';

  // Sync state with appBranding when opened
  useEffect(() => {
    if (isOpen) {
      setActiveStoryIndex(0);
      setVideoError(false);
      setIsLoading(true);
      setIsPlaying(true);
      setIsMuted(true); // Start muted so mobile browser permits instant autoplay
      setShowUploadDrawer(false); // Always keep upload drawer closed on open
      setStatusTitle('');
      setStatusCaption('');
      setStatusUrl('');
    }
  }, [isOpen]);

  // Handle video autoplay execution reliably without race conditions
  useEffect(() => {
    let isCancelled = false;

    if (isOpen && effectiveMediaType === 'video' && videoRef.current && effectiveMediaUrl) {
      const video = videoRef.current;
      video.muted = isMuted;
      
      const attemptPlay = async () => {
        try {
          if (isCancelled) return;
          await video.play();
          if (!isCancelled) {
            setIsPlaying(true);
            setIsLoading(false);
          }
        } catch (err: any) {
          if (isCancelled) return;
          // Ignore AbortError caused by rapid user navigation
          if (err?.name !== 'AbortError') {
            console.warn("Autoplay notice:", err?.message || 'Autoplay restricted');
          }
          // Fallback to muted autoplay
          try {
            video.muted = true;
            setIsMuted(true);
            await video.play();
            if (!isCancelled) {
              setIsPlaying(true);
              setIsLoading(false);
            }
          } catch {
            if (!isCancelled) {
              setIsLoading(false);
            }
          }
        }
      };

      attemptPlay();
    }

    return () => {
      isCancelled = true;
    };
  }, [isOpen, effectiveMediaUrl, effectiveMediaType, activeStoryIndex]);

  // Progress Bar for Image or Video
  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setIsPlaying(true);
      return;
    }

    let interval: any;
    if (effectiveMediaType === 'image' && isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            if (activeStoryIndex < resolvedStories.length - 1) {
              setActiveStoryIndex(i => i + 1);
              return 0;
            }
            return 100;
          }
          return prev + 2;
        });
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isPlaying, effectiveMediaType, activeStoryIndex, resolvedStories.length]);

  // Video Time update listener
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || 1;
      const pct = (current / total) * 100;
      setProgress(pct);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => {});
          }
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  // Mobile & Desktop Robust Upload handler (Admin only)
  // Supports uploading multiple status stories (Status 1, Status 2, Status 3...) without deleting previous ones!
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect format from MIME type or file extension (critical for mobile Android/iOS)
    const fileNameLower = file.name.toLowerCase();
    const isVideo = file.type.startsWith('video') || /\.(mp4|mov|webm|mkv|3gp|avi|m4v)$/i.test(fileNameLower);
    const isImg = file.type.startsWith('image') || /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(fileNameLower);

    if (!isVideo && !isImg) {
      alert('Please select a valid Video (MP4, MOV, WebM, 3GP, MKV) or Image file.');
      return;
    }

    // Support videos up to 150MB
    if (file.size > 150 * 1024 * 1024) {
      alert('File size exceeds 150MB. Please select a smaller video/photo.');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Create unique story ID so status 1 is NOT overwritten by status 2!
      const storyId = `story_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const mediaBlobUrl = URL.createObjectURL(file);
      const detectedType: 'video' | 'image' = isVideo ? 'video' : 'image';
      
      // 2. Persist media blob to IndexedDB with unique key for cross-session survival
      await saveMediaBlob(`status_media_${storyId}`, file, { type: detectedType, name: file.name });

      const newStoryNumber = uploadMode === 'append' ? stories.length + 1 : activeStoryIndex + 1;
      const cleanTitle = statusTitle.trim() || `Status #${newStoryNumber}`;
      const cleanCaption = statusCaption.trim() || `🔥 4K Status Update #${newStoryNumber}`;

      const newStory: StatusStoryItem = {
        id: storyId,
        title: cleanTitle,
        url: mediaBlobUrl,
        type: detectedType,
        caption: cleanCaption,
        poster: detectedType === 'video' 
          ? 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80' 
          : mediaBlobUrl,
        createdAt: new Date().toISOString()
      };

      // 3. Append to list (so status 1 is preserved, status 2 is added, status 3 is added!)
      let updatedStories: StatusStoryItem[];
      if (uploadMode === 'replace' && stories.length > 0) {
        updatedStories = [...stories];
        updatedStories[activeStoryIndex] = newStory;
      } else {
        updatedStories = [...stories, newStory];
      }

      updateAppBranding({
        statusStories: updatedStories,
        statusMediaUrl: updatedStories[0]?.url,
        statusMediaType: updatedStories[0]?.type,
        statusCaption: updatedStories[0]?.caption,
        statusActive: true,
        statusCreatedAt: new Date().toISOString()
      });

      // Jump to the newly added story
      const nextIndex = uploadMode === 'replace' ? activeStoryIndex : updatedStories.length - 1;
      setActiveStoryIndex(nextIndex);
      setProgress(0);
      setVideoError(false);
      setIsLoading(false);
      setIsPlaying(true);
      setUploadSuccess(true);
      setUploadMessage(`Status #${newStoryNumber} Published! Total: ${updatedStories.length} active status stories.`);

      // Reset form fields
      setStatusTitle('');
      setStatusCaption('');
      setStatusUrl('');

      setTimeout(() => {
        setUploadSuccess(false);
        setIsUploading(false);
      }, 1800);

    } catch (err: any) {
      console.error('Video upload error:', err);
      alert('Failed to process video: ' + (err?.message || 'Unknown error'));
      setIsUploading(false);
    }
  };

  const handleSaveStatusForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!statusUrl.trim()) return;

    const storyId = `story_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newStoryNumber = uploadMode === 'append' ? stories.length + 1 : activeStoryIndex + 1;
    const cleanTitle = statusTitle.trim() || `Status #${newStoryNumber}`;
    const cleanCaption = statusCaption.trim() || `🔥 4K Status Update #${newStoryNumber}`;

    const newStory: StatusStoryItem = {
      id: storyId,
      title: cleanTitle,
      url: statusUrl.trim(),
      type: statusType,
      caption: cleanCaption,
      poster: statusType === 'video' 
        ? 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80' 
        : statusUrl.trim(),
      createdAt: new Date().toISOString()
    };

    let updatedStories: StatusStoryItem[];
    if (uploadMode === 'replace' && stories.length > 0) {
      updatedStories = [...stories];
      updatedStories[activeStoryIndex] = newStory;
    } else {
      updatedStories = [...stories, newStory];
    }

    updateAppBranding({
      statusStories: updatedStories,
      statusMediaUrl: updatedStories[0]?.url,
      statusMediaType: updatedStories[0]?.type,
      statusCaption: updatedStories[0]?.caption,
      statusActive: true,
      statusCreatedAt: new Date().toISOString()
    });

    const nextIndex = uploadMode === 'replace' ? activeStoryIndex : updatedStories.length - 1;
    setActiveStoryIndex(nextIndex);
    setProgress(0);
    setVideoError(false);
    setIsLoading(false);
    setIsPlaying(true);
    setUploadSuccess(true);
    setUploadMessage(`Status #${newStoryNumber} Saved! Total: ${updatedStories.length} active status stories.`);

    // Reset form fields
    setStatusTitle('');
    setStatusCaption('');
    setStatusUrl('');

    setTimeout(() => {
      setUploadSuccess(false);
    }, 1800);
  };

  // Delete a specific status story (Admin only)
  const handleDeleteStory = async (storyIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (stories.length <= 1) {
      alert('You must have at least 1 status story. Add a new one before removing this.');
      return;
    }

    const updatedStories = stories.filter(s => s.id !== storyIdToDelete);
    deleteMediaBlob(`status_media_${storyIdToDelete}`).catch(() => {});

    updateAppBranding({
      statusStories: updatedStories,
      statusMediaUrl: updatedStories[0]?.url || '',
      statusMediaType: updatedStories[0]?.type || 'video',
      statusCaption: updatedStories[0]?.caption || '',
      statusActive: updatedStories.length > 0
    });

    if (activeStoryIndex >= updatedStories.length) {
      setActiveStoryIndex(Math.max(0, updatedStories.length - 1));
    }
    setProgress(0);
  };

  // Reset to default presets
  const handleResetToPresets = () => {
    if (!isAdmin) return;
    if (confirm('Reset all status stories back to default 4K presets?')) {
      updateAppBranding({
        statusStories: defaultInitialStatusStories,
        statusMediaUrl: defaultInitialStatusStories[0].url,
        statusMediaType: defaultInitialStatusStories[0].type,
        statusCaption: defaultInitialStatusStories[0].caption,
        statusActive: true,
        statusCreatedAt: new Date().toISOString()
      });
      setActiveStoryIndex(0);
      setProgress(0);
      setUploadSuccess(true);
      setUploadMessage('Reset to 3 default 4K status stories!');
      setTimeout(() => setUploadSuccess(false), 1500);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
      
      {/* WhatsApp Status Story Compact Player Container */}
      <div className="relative w-[340px] max-w-[92vw] h-[520px] max-h-[86vh] my-auto bg-black rounded-3xl border border-zinc-800 shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Story Top Progress Bar & Header */}
        <div className="absolute top-0 left-0 right-0 z-30 p-3 bg-gradient-to-b from-black/95 via-black/80 to-transparent space-y-2">
          {/* Multi-story segmented progress bar: 1 segment per status! */}
          <div className="flex gap-1 w-full">
            {resolvedStories.map((story, idx) => (
              <button 
                key={story.id || idx} 
                onClick={() => {
                  setActiveStoryIndex(idx);
                  setProgress(0);
                  setIsLoading(true);
                  setVideoError(false);
                }}
                className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:bg-white/40 transition-colors"
                title={`Status ${idx + 1}: ${story.title}`}
              >
                <div 
                  className="h-full bg-emerald-500 transition-all duration-100 ease-linear rounded-full"
                  style={{ 
                    width: idx === activeStoryIndex ? `${progress}%` : idx < activeStoryIndex ? '100%' : '0%' 
                  }}
                />
              </button>
            ))}
          </div>

          {/* Story Header */}
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button 
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 hover:bg-black/90 text-white font-bold text-[11px] backdrop-blur-md cursor-pointer transition-transform active:scale-95 border border-white/20 shadow-md"
              title="Back to App"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Back</span>
            </button>

            {/* App Branding Info & Status Counter */}
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-emerald-500 via-green-400 to-teal-300 ring-1 ring-emerald-500/50 shrink-0">
                {appBranding.appLogoUrl ? (
                  <img 
                    src={appBranding.appLogoUrl} 
                    alt="App Logo" 
                    className="w-7 h-7 rounded-full object-cover border border-black" 
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center border border-black">
                    <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                  </div>
                )}
              </div>

              <div className="text-left min-w-0">
                <div className="text-[11px] font-black text-white flex items-center gap-1 truncate">
                  <span className="truncate">{currentStory.title}</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[8px] font-extrabold uppercase shrink-0">
                    {activeStoryIndex + 1}/{resolvedStories.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Control Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={toggleMute}
                className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md cursor-pointer transition-transform active:scale-90"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              <button 
                onClick={togglePlayPause}
                className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md cursor-pointer transition-transform active:scale-90"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              </button>

              <button 
                onClick={onClose}
                className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md cursor-pointer transition-transform active:scale-90"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Media Content Display */}
        <div className="relative flex-1 bg-zinc-950 flex items-center justify-center overflow-hidden">
          {/* Background Poster Image so frame is NEVER black */}
          <img 
            src={effectivePoster} 
            alt="Story Backdrop" 
            className="absolute inset-0 w-full h-full object-cover opacity-70 blur-xs scale-105"
          />

          {/* Media Player */}
          {effectiveMediaType === 'image' ? (
            <img 
              src={effectiveMediaUrl} 
              alt="Status Story" 
              className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setVideoError(true);
                setIsLoading(false);
              }}
            />
          ) : (
            <video 
              ref={videoRef}
              src={effectiveMediaUrl} 
              poster={effectivePoster}
              autoPlay
              playsInline
              muted={isMuted}
              onLoadedData={() => setIsLoading(false)}
              onCanPlay={() => setIsLoading(false)}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => {
                // Automatically move to the next status!
                if (activeStoryIndex < resolvedStories.length - 1) {
                  setActiveStoryIndex(prev => prev + 1);
                  setProgress(0);
                } else {
                  setProgress(100);
                  setIsPlaying(false);
                }
              }}
              onError={() => {
                console.warn('Video status playback issue on element');
                setVideoError(true);
                setIsLoading(false);
              }}
              className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
            />
          )}

          {/* Sound Unmute Prompt Badge */}
          {isMuted && effectiveMediaType === 'video' && (
            <button
              onClick={toggleMute}
              className="absolute bottom-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/90 hover:bg-black border border-emerald-500/80 text-emerald-400 text-[10px] font-extrabold backdrop-blur-md flex items-center gap-1.5 cursor-pointer shadow-lg animate-bounce"
            >
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
              <span>Tap for Sound</span>
            </button>
          )}

          {/* Central Play/Pause / Error Retry Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <button
                onClick={() => {
                  setVideoError(false);
                  setIsPlaying(true);
                  if (videoRef.current) {
                    videoRef.current.play().catch(() => {
                      if (videoRef.current) {
                        videoRef.current.muted = true;
                        setIsMuted(true);
                        videoRef.current.play().catch(() => {});
                      }
                    });
                  }
                }}
                className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform"
                title="Play Video"
              >
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </button>
            </div>
          )}

          {/* Left / Right Click to Navigate Stories */}
          <div className="absolute inset-0 flex z-10 pointer-events-auto">
            <div 
              onClick={() => {
                if (activeStoryIndex > 0) {
                  setActiveStoryIndex(prev => prev - 1);
                  setProgress(0);
                } else if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  setProgress(0);
                }
              }} 
              className="w-1/2 h-full cursor-pointer opacity-0 hover:bg-white/5 transition-opacity"
              title="Previous Story"
            />
            <div 
              onClick={() => {
                if (activeStoryIndex < resolvedStories.length - 1) {
                  setActiveStoryIndex(prev => prev + 1);
                  setProgress(0);
                } else {
                  togglePlayPause();
                }
              }} 
              className="w-1/2 h-full cursor-pointer opacity-0 hover:bg-white/5 transition-opacity"
              title="Next Story"
            />
          </div>
        </div>

        {/* Story Footer & Controls */}
        <div className="p-3 bg-gradient-to-t from-black via-black/90 to-transparent z-30 space-y-2 text-left">
          <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-md text-[11px] font-bold text-white shadow-lg">
            {currentStory.caption}
          </div>

          {/* Action Row: Back to App Button (Full width for Users) + Upload Status Button (ONLY for Admin) */}
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className={`py-2 px-3 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-zinc-700 active:scale-95 shadow-md ${isAdmin ? 'shrink-0' : 'w-full'}`}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-zinc-300" />
              <span>Back to App</span>
            </button>

            {isAdmin && (
              <button 
                onClick={() => setShowUploadDrawer(true)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer border border-emerald-400/30 truncate active:scale-95"
                title="Admin: Manage & Upload Multiple Status Stories"
              >
                <Camera className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Manage / Add Status ({resolvedStories.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Upload & Multiple Status Management Drawer - STRICTLY Admin Only */}
        {isAdmin && showUploadDrawer && (
          <div className="absolute inset-0 z-50 bg-zinc-950/98 border border-zinc-800 rounded-3xl p-3 shadow-2xl flex flex-col justify-between animate-in slide-in-from-bottom overflow-y-auto">
            <div className="space-y-2.5 text-left">
              {/* Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                <div>
                  <h3 className="text-[12px] font-black text-white flex items-center gap-1.5">
                    <VideoIcon className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Status Stories
                  </h3>
                  <p className="text-[9px] text-zinc-400">Keep 2, 3 or more status stories active simultaneously</p>
                </div>
                <button 
                  onClick={() => setShowUploadDrawer(false)}
                  className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {uploadSuccess && (
                <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{uploadMessage || 'Status Published!'}</span>
                </div>
              )}

              {/* ACTIVE STATUS PLAYLIST: See all 1st, 2nd, 3rd statuses & Delete individual ones */}
              <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-zinc-300 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-emerald-400" /> Active Stories ({stories.length})
                  </span>
                  <button 
                    type="button"
                    onClick={handleResetToPresets}
                    className="text-[9px] text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                    title="Reset to 3 standard 4K demo statuses"
                  >
                    Reset Presets
                  </button>
                </div>

                {/* List of active stories */}
                <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                  {stories.map((st, idx) => {
                    const isCurrent = idx === activeStoryIndex;
                    return (
                      <div 
                        key={st.id || idx}
                        onClick={() => {
                          setActiveStoryIndex(idx);
                          setProgress(0);
                        }}
                        className={`flex items-center justify-between p-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                          isCurrent 
                            ? 'bg-emerald-950/60 border-emerald-500/70 text-white' 
                            : 'bg-zinc-950/70 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold shrink-0 ${
                            isCurrent ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-bold truncate flex items-center gap-1">
                              <span>{st.title}</span>
                              {st.type === 'image' ? (
                                <ImageIcon className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                              ) : (
                                <VideoIcon className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                              )}
                            </div>
                            <div className="text-[8px] text-zinc-400 truncate">{st.caption}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          {isCurrent && (
                            <span className="px-1 py-0.2 rounded bg-emerald-500/30 text-emerald-400 text-[7px] font-bold uppercase">
                              Active
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteStory(st.id, e)}
                            className="p-1 rounded bg-zinc-800 hover:bg-rose-600/90 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="Delete this status"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upload Mode: Append as New Status vs Replace */}
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => setUploadMode('append')}
                  className={`flex-1 py-1 px-2 rounded-md font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    uploadMode === 'append' 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Plus className="w-3 h-3" /> Add Next Status ({stories.length + 1}th)
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('replace')}
                  className={`py-1 px-2 rounded-md font-bold text-center transition-all cursor-pointer ${
                    uploadMode === 'replace' 
                      ? 'bg-amber-600 text-white shadow-sm' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Replace currently selected status"
                >
                  Replace #{activeStoryIndex + 1}
                </button>
              </div>

              {/* Option 1: File Selector (Upload from gallery or PC) */}
              <div className="p-2 rounded-lg bg-zinc-900/90 border border-dashed border-zinc-800 hover:border-emerald-500/50 flex items-center justify-between gap-2">
                <div className="text-left">
                  <div className="text-[10px] font-bold text-white">Select Video or Photo</div>
                  <div className="text-[8px] text-zinc-400">
                    {uploadMode === 'append' ? `Will be added as Status #${stories.length + 1}` : `Will replace Status #${activeStoryIndex + 1}`}
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer shrink-0 active:scale-95 disabled:opacity-50"
                >
                  <Camera className="w-3 h-3" />
                  <span>{isUploading ? 'Uploading...' : 'Select File'}</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="video/*,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Option 2: Custom URL & Caption Form */}
              <form onSubmit={handleSaveStatusForm} className="space-y-1.5 pt-0.5">
                <div className="text-[9px] font-bold text-zinc-400">Or Add via Direct URL:</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <input 
                    type="text" 
                    placeholder="Title (e.g. Status 2)"
                    value={statusTitle}
                    onChange={(e) => setStatusTitle(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-[10px] text-white p-1.5 px-2 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                  <input 
                    type="text" 
                    placeholder="Caption (e.g. New Trailer)"
                    value={statusCaption}
                    onChange={(e) => setStatusCaption(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-[10px] text-white p-1.5 px-2 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <input 
                    type="url" 
                    placeholder="https://example.com/video.mp4"
                    value={statusUrl}
                    onChange={(e) => setStatusUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-[10px] text-white p-1.5 px-2 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-1.5">
                  <button 
                    type="button"
                    onClick={() => setStatusType('video')}
                    className={`flex-1 py-1 text-[9px] font-bold rounded-md border ${statusType === 'video' ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                  >
                    Video
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStatusType('image')}
                    className={`flex-1 py-1 text-[9px] font-bold rounded-md border ${statusType === 'image' ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                  >
                    Photo
                  </button>
                </div>

                <button 
                  type="submit"
                  disabled={!statusUrl.trim()}
                  className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-extrabold text-[10px] transition-all cursor-pointer shadow-sm shadow-emerald-600/30 active:scale-95"
                >
                  {uploadMode === 'append' ? `+ Add as Status #${stories.length + 1}` : `Save & Replace Status #${activeStoryIndex + 1}`}
                </button>
              </form>

              {/* Option 3: Quick 1-Click Presets */}
              <div className="space-y-1 pt-1 border-t border-zinc-800/80">
                <div className="text-[9px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span>1-Click 4K Presets</span>
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {defaultInitialStatusStories.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const storyId = `story_${Date.now()}_${idx}`;
                        const newPresetStory: StatusStoryItem = {
                          ...preset,
                          id: storyId
                        };
                        const updated = uploadMode === 'append' ? [...stories, newPresetStory] : (() => {
                          const c = [...stories];
                          c[activeStoryIndex] = newPresetStory;
                          return c;
                        })();
                        updateAppBranding({
                          statusStories: updated,
                          statusMediaUrl: updated[0]?.url,
                          statusActive: true
                        });
                        setActiveStoryIndex(uploadMode === 'append' ? updated.length - 1 : activeStoryIndex);
                        setUploadSuccess(true);
                        setUploadMessage(`Added "${preset.title}"! Total: ${updated.length}`);
                        setTimeout(() => setUploadSuccess(false), 1500);
                      }}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-emerald-950/80 border border-zinc-800 hover:border-emerald-500/60 text-left transition-all cursor-pointer group"
                    >
                      <div className="text-[9px] font-bold text-zinc-200 group-hover:text-emerald-300 truncate">
                        {preset.title}
                      </div>
                      <div className="text-[7px] text-zinc-500 flex items-center gap-0.5">
                        <VideoIcon className="w-2 h-2 text-emerald-400" /> + Add
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800 text-center">
              <button
                type="button"
                onClick={() => setShowUploadDrawer(false)}
                className="w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-[10px] cursor-pointer"
              >
                Done & Return to Story Player
              </button>
            </div>
          </div>
        )}

      </div>

    </div>,
    document.body
  );
};
