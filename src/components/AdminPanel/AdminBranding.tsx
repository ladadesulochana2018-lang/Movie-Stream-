import React, { useState } from 'react';
import { 
  AppWindow, 
  Upload, 
  Image as ImageIcon, 
  RefreshCw, 
  CheckCircle2, 
  Play, 
  Sparkles, 
  Tag, 
  Eye, 
  X,
  Type,
  Layout,
  Video,
  Loader2,
  Volume2,
  VolumeX,
  Music,
  Film,
  Zap,
  Flame,
  Crown,
  Clock,
  Radio,
  Sliders,
  Trash2,
  Plus,
  Layers
} from 'lucide-react';
import { useApp, defaultInitialStatusStories } from '../../context/AppContext';
import { saveMediaBlob, deleteMediaBlob } from '../../utils/persistentStorage';
import { StatusStoryItem } from '../../types';
import { playSplashSoundEffect } from '../SplashIntro';

export const AdminBranding: React.FC = () => {
  const { appBranding, updateAppBranding, resetAppBranding, replaySplashIntro } = useApp();
  
  const [nameInput, setNameInput] = useState(appBranding.appName);
  const [taglineInput, setTaglineInput] = useState(appBranding.appTagline);
  const [logoUrlInput, setLogoUrlInput] = useState(appBranding.appLogoUrl || '');
  const [sidebarImageUrlInput, setSidebarImageUrlInput] = useState(appBranding.sidebarHeaderImageUrl || '');
  
  // WhatsApp Video Status Story state
  const [statusMediaUrlInput, setStatusMediaUrlInput] = useState(appBranding.statusMediaUrl || '');
  const [statusCaptionInput, setStatusCaptionInput] = useState(appBranding.statusCaption || '');
  const [statusTypeInput, setStatusTypeInput] = useState<'video' | 'image'>(appBranding.statusMediaType || 'video');
  const [statusActiveInput, setStatusActiveInput] = useState(appBranding.statusActive !== false);

  // Splash Animation & Sound state
  const [splashEnabledInput, setSplashEnabledInput] = useState(appBranding.splashEnabled !== false);
  const [splashSoundEnabledInput, setSplashSoundEnabledInput] = useState(appBranding.splashSoundEnabled !== false);
  const [splashThemeInput, setSplashThemeInput] = useState<'cinematic_red' | 'cyberpunk_neon' | 'golden_imax' | 'anime_action'>(
    appBranding.splashTheme || 'cinematic_red'
  );
  const [splashSoundThemeInput, setSplashSoundThemeInput] = useState<'cinema_tadum' | 'cyber_synth' | 'golden_orchestral' | 'anime_spark' | 'custom_audio' | 'none'>(
    appBranding.splashSoundTheme || 'cinema_tadum'
  );
  const [splashCustomAudioUrlInput, setSplashCustomAudioUrlInput] = useState(appBranding.splashCustomAudioUrl || '');
  const [splashDurationInput, setSplashDurationInput] = useState<number>(appBranding.splashDurationSeconds || 3.2);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Audio test preview helper
  const handleTestSound = (themeKey: 'cinema_tadum' | 'cyber_synth' | 'golden_orchestral' | 'anime_spark' | 'custom_audio') => {
    setPlayingAudioId(themeKey);
    playSplashSoundEffect(themeKey, splashCustomAudioUrlInput);
    setTimeout(() => setPlayingAudioId(null), 2500);
  };

  // Custom audio file uploader
  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Audio file size exceeds 15MB. Please choose a smaller MP3 or WAV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSplashCustomAudioUrlInput(dataUrl);
      setSplashSoundThemeInput('custom_audio');
      updateAppBranding({
        splashCustomAudioUrl: dataUrl,
        splashSoundTheme: 'custom_audio',
        splashSoundEnabled: true
      });
      showNotification();
    };
    reader.readAsDataURL(file);
  };

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setLogoUrlInput(dataUrl);
        updateAppBranding({ appLogoUrl: dataUrl });
        showNotification();
      };
      reader.readAsDataURL(file);
    }
  };

  // Sidebar header banner file upload handler
  const handleSidebarImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSidebarImageUrlInput(dataUrl);
        updateAppBranding({ sidebarHeaderImageUrl: dataUrl });
        showNotification();
      };
      reader.readAsDataURL(file);
    }
  };

  // Status Video/Photo upload handler (Supports multiple status stories: Status 1, Status 2, Status 3...)
  const handleStatusUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileNameLower = file.name.toLowerCase();
    const isVideo = file.type.startsWith('video') || /\.(mp4|mov|webm|mkv|3gp|avi|m4v)$/i.test(fileNameLower);
    const isImg = file.type.startsWith('image') || /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(fileNameLower);

    if (!isVideo && !isImg) {
      alert('Please select a valid Video (MP4, MOV, WebM, 3GP, MKV) or Image file.');
      return;
    }

    if (file.size > 150 * 1024 * 1024) {
      alert('File size exceeds 150MB. Please select a smaller video/photo.');
      return;
    }

    try {
      const storyId = `story_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const mediaBlobUrl = URL.createObjectURL(file);
      const detectedType: 'video' | 'image' = isVideo ? 'video' : 'image';
      
      await saveMediaBlob(`status_media_${storyId}`, file, { type: detectedType, name: file.name });

      const currentStories = (appBranding.statusStories && appBranding.statusStories.length > 0)
        ? appBranding.statusStories 
        : defaultInitialStatusStories;

      const newStory: StatusStoryItem = {
        id: storyId,
        title: `Status #${currentStories.length + 1}`,
        url: mediaBlobUrl,
        type: detectedType,
        caption: statusCaptionInput || `🔥 4K Status Update #${currentStories.length + 1}`,
        poster: detectedType === 'video' 
          ? 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80' 
          : mediaBlobUrl,
        createdAt: new Date().toISOString()
      };

      const updatedStories = [...currentStories, newStory];

      setStatusMediaUrlInput(mediaBlobUrl);
      setStatusTypeInput(detectedType);

      updateAppBranding({
        statusStories: updatedStories,
        statusMediaUrl: newStory.url,
        statusMediaType: newStory.type,
        statusCaption: newStory.caption,
        statusActive: true,
        statusCreatedAt: new Date().toISOString()
      });

      showNotification();
    } catch (err: any) {
      console.error('Failed to save status media:', err);
      alert('Failed to process media file: ' + (err?.message || 'Error'));
    }
  };

  const handleDeleteStatusStory = (storyId: string) => {
    const currentStories = (appBranding.statusStories && appBranding.statusStories.length > 0)
      ? appBranding.statusStories 
      : defaultInitialStatusStories;

    if (currentStories.length <= 1) {
      alert('At least 1 status must remain. Please upload a new status before deleting this.');
      return;
    }

    const updated = currentStories.filter(s => s.id !== storyId);
    deleteMediaBlob(`status_media_${storyId}`).catch(() => {});

    updateAppBranding({
      statusStories: updated,
      statusMediaUrl: updated[0]?.url || '',
      statusMediaType: updated[0]?.type || 'video',
      statusCaption: updated[0]?.caption || '',
      statusActive: updated.length > 0
    });
    showNotification();
  };

  const showNotification = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppBranding({
      appName: nameInput || 'MOVIE STREAM',
      appTagline: taglineInput || 'Watch Movies & Anime',
      appLogoUrl: logoUrlInput,
      sidebarHeaderImageUrl: sidebarImageUrlInput,
      statusMediaUrl: statusMediaUrlInput,
      statusCaption: statusCaptionInput,
      statusMediaType: statusTypeInput,
      statusActive: statusActiveInput,
      splashEnabled: splashEnabledInput,
      splashSoundEnabled: splashSoundEnabledInput,
      splashTheme: splashThemeInput,
      splashSoundTheme: splashSoundThemeInput,
      splashCustomAudioUrl: splashCustomAudioUrlInput,
      splashDurationSeconds: splashDurationInput
    });
    showNotification();
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset App Name, Logo, and Startup Animation to default?')) {
      resetAppBranding();
      setNameInput('MOVIE STREAM');
      setTaglineInput('Watch Movies & Anime');
      setLogoUrlInput('');
      setSidebarImageUrlInput('');
      setSplashEnabledInput(true);
      setSplashSoundEnabledInput(true);
      setSplashThemeInput('cinematic_red');
      setSplashSoundThemeInput('cinema_tadum');
      setSplashCustomAudioUrlInput('');
      setSplashDurationInput(3.2);
      showNotification();
    }
  };

  const triggerLivePreview = () => {
    updateAppBranding({
      appName: nameInput || 'MOVIE STREAM',
      appTagline: taglineInput || 'Watch Movies & Anime',
      appLogoUrl: logoUrlInput,
      splashEnabled: true,
      splashSoundEnabled: splashSoundEnabledInput,
      splashTheme: splashThemeInput,
      splashSoundTheme: splashSoundThemeInput,
      splashCustomAudioUrl: splashCustomAudioUrlInput,
      splashDurationSeconds: splashDurationInput
    });
    replaySplashIntro();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border border-red-500/30 rounded-3xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400">
              <AppWindow className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white tracking-wide">App Branding, Logo & Sidebar Image</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Customize your OTT App Name, Tagline, Icon, and Sidebar Header Banner Image in real-time.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Updated & Applied!</span>
          </div>
        )}
      </div>

      {/* Live Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Navbar Header Preview */}
        <div className="p-5 bg-black border border-zinc-800 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-red-400">
              <Eye className="w-4 h-4" /> Navbar Header Preview
            </span>
            <span className="text-[10px] bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800 text-emerald-400 font-mono">
              LIVE
            </span>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3">
              {appBranding.appLogoUrl ? (
                <img 
                  src={appBranding.appLogoUrl} 
                  alt="App Logo" 
                  className="w-9 h-9 rounded-xl object-cover border border-red-500/50 shadow-lg shadow-red-600/20"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-red-500 to-rose-400 flex items-center justify-center shadow-lg shadow-red-600/30">
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </div>
              )}

              <div className="flex flex-col text-left">
                <span className="font-black text-base tracking-wider text-white font-display leading-none">
                  {appBranding.appName}
                </span>
                <span className="text-[9px] text-zinc-400 font-semibold tracking-widest uppercase mt-0.5">
                  {appBranding.appTagline}
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-extrabold text-[11px]">
              VIP
            </span>
          </div>
        </div>

        {/* Sidebar Banner Image Preview */}
        <div className="p-5 bg-black border border-zinc-800 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-sky-400">
              <Layout className="w-4 h-4" /> Solid Black Sidebar Drawer Preview
            </span>
            <span className="text-[10px] bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800 text-emerald-400 font-mono">
              LIVE
            </span>
          </div>

          <div className="p-4 bg-black border border-zinc-800 rounded-2xl space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <div className="flex items-center gap-2">
                {appBranding.appLogoUrl ? (
                  <img src={appBranding.appLogoUrl} alt="Logo" className="w-6 h-6 rounded-lg object-cover border border-red-500/50" />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center">
                    <Play className="w-3 h-3 text-white fill-white" />
                  </div>
                )}
                <span className="text-xs font-black text-white">{appBranding.appName}</span>
              </div>
              <span className="text-[10px] text-zinc-500">Solid Pitch Black</span>
            </div>

            {appBranding.sidebarHeaderImageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-zinc-800 h-24">
                <img src={appBranding.sidebarHeaderImageUrl} alt="Sidebar Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-2.5 flex flex-col justify-end">
                  <span className="text-xs font-black text-white">{appBranding.appName}</span>
                  <span className="text-[9px] text-zinc-300 font-bold uppercase">{appBranding.appTagline}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-center text-xs text-zinc-500 italic">
                No Sidebar Banner Uploaded (Default Black Menu Display)
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Main Configuration Form */}
      <form onSubmit={handleSave} className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-3xl space-y-6">
        
        {/* App Name & Tagline Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-red-500" /> App Name (Title)
            </label>
            <input 
              type="text" 
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                updateAppBranding({ appName: e.target.value });
              }}
              placeholder="e.g. CINESTREAM, MOVIEHUB"
              className="w-full bg-zinc-950 border border-zinc-800 text-white font-bold text-sm px-4 py-3 rounded-2xl focus:outline-none focus:border-red-500 transition-colors"
              required
            />
            <p className="text-[11px] text-zinc-500">
              Changes the main name displayed in the top navbar and sidebar navigation.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-amber-500" /> App Tagline / Subtitle
            </label>
            <input 
              type="text" 
              value={taglineInput}
              onChange={(e) => {
                setTaglineInput(e.target.value);
                updateAppBranding({ appTagline: e.target.value });
              }}
              placeholder="e.g. OTT Premium, Watch Movies Online"
              className="w-full bg-zinc-950 border border-zinc-800 text-white font-bold text-sm px-4 py-3 rounded-2xl focus:outline-none focus:border-red-500 transition-colors"
            />
            <p className="text-[11px] text-zinc-500">
              Displays directly underneath the app name in small uppercase letters.
            </p>
          </div>

        </div>

        {/* Option 1: Logo Photo Upload */}
        <div className="space-y-4 pt-4 border-t border-zinc-800/80">
          <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-rose-500" /> 1. App Icon / Logo Photo Upload
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* File Upload Box */}
            <div className="border-2 border-dashed border-zinc-800 hover:border-red-500/80 rounded-2xl p-5 bg-zinc-950/60 flex flex-col items-center justify-center text-center transition-all group relative cursor-pointer">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleLogoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-10 h-10 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white mb-0.5">Click to Upload App Logo</span>
              <span className="text-[10px] text-zinc-500">PNG, JPG, WEBP, SVG (Max 5MB)</span>
            </div>

            {/* Direct Image URL Option */}
            <div className="space-y-2 bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 flex flex-col justify-center">
              <span className="text-xs font-bold text-zinc-300">Or Paste Logo Web URL</span>
              <input 
                type="url" 
                value={logoUrlInput}
                onChange={(e) => {
                  setLogoUrlInput(e.target.value);
                  updateAppBranding({ appLogoUrl: e.target.value });
                }}
                placeholder="https://example.com/logo.png"
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-red-500"
              />

              {/* Preset Icon Selector */}
              <div className="pt-2 border-t border-zinc-900 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-400">Featured App Icons:</span>
                <button
                  type="button"
                  onClick={() => {
                    const url = '/src/assets/images/movie_stream_app_icon_1788152392265.jpg';
                    setLogoUrlInput(url);
                    updateAppBranding({ appLogoUrl: url, appName: 'MOVIE STREAM' });
                    setNameInput('MOVIE STREAM');
                    showNotification();
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900 border border-red-500/40 hover:border-red-500 text-zinc-200 text-[10px] font-bold cursor-pointer"
                >
                  <img src="/src/assets/images/movie_stream_app_icon_1788152392265.jpg" alt="Icon" className="w-4 h-4 rounded-md object-cover" />
                  <span>Movie Stream Official 3D Icon</span>
                </button>
              </div>

              {logoUrlInput && (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <img src={logoUrlInput} alt="Preview" referrerPolicy="no-referrer" className="w-7 h-7 rounded-lg object-cover border border-zinc-700" />
                    <span className="text-[10px] text-emerald-400 font-bold">Logo Active</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setLogoUrlInput('');
                      updateAppBranding({ appLogoUrl: '' });
                      showNotification();
                    }}
                    className="p-1 rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white transition-colors text-[11px] flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Option 2: Sidebar Header Banner Image Upload */}
        <div className="space-y-4 pt-4 border-t border-zinc-800/80">
          <div>
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-sky-400" /> 2. Sidebar Header Banner Image (App Name ke under Sidebar Photo)
            </label>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Upload an image to show right under the App Name inside the solid black left navigation menu sidebar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sidebar Banner File Upload */}
            <div className="border-2 border-dashed border-zinc-800 hover:border-sky-500/80 rounded-2xl p-5 bg-zinc-950/60 flex flex-col items-center justify-center text-center transition-all group relative cursor-pointer">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleSidebarImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-10 h-10 rounded-2xl bg-sky-600/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white mb-0.5">Upload Sidebar Banner Image</span>
              <span className="text-[10px] text-zinc-500">Appears under App Name in Sidebar Menu</span>
            </div>

            {/* Sidebar Image URL */}
            <div className="space-y-2 bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 flex flex-col justify-center">
              <span className="text-xs font-bold text-zinc-300">Or Paste Banner Web URL</span>
              <input 
                type="url" 
                value={sidebarImageUrlInput}
                onChange={(e) => {
                  setSidebarImageUrlInput(e.target.value);
                  updateAppBranding({ sidebarHeaderImageUrl: e.target.value });
                }}
                placeholder="https://example.com/sidebar-banner.jpg"
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-sky-500"
              />

              {sidebarImageUrlInput && (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <img src={sidebarImageUrlInput} alt="Preview" className="w-10 h-6 rounded object-cover border border-zinc-700" />
                    <span className="text-[10px] text-sky-400 font-bold">Sidebar Banner Active</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setSidebarImageUrlInput('');
                      updateAppBranding({ sidebarHeaderImageUrl: '' });
                      showNotification();
                    }}
                    className="p-1 rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white transition-colors text-[11px] flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Clear Banner
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Option 2: WhatsApp-style Video Status Story Upload */}
        <div className="space-y-3 pt-3 border-t border-zinc-800/80">
          <div>
            <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Status Stories ({appBranding.statusStories?.length || 1} Active)
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Multi-Story Enabled
              </span>
            </label>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Upload multiple Status Stories (Status 1, Status 2, Status 3...). They play sequentially with segmented WhatsApp-style progress bars.
            </p>
          </div>

          {/* List of currently active status stories */}
          {appBranding.statusStories && appBranding.statusStories.length > 0 && (
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-2">
              <div className="text-[10px] font-bold text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3 text-emerald-400" /> Active Status Stories List
                </span>
                <span className="text-[9px] text-zinc-500">
                  {appBranding.statusStories.length} total active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {appBranding.statusStories.map((st, idx) => (
                  <div 
                    key={st.id || idx}
                    className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-white truncate flex items-center gap-1">
                          <span>{st.title || `Status #${idx + 1}`}</span>
                          <span className="text-[8px] text-zinc-400 uppercase font-mono">({st.type})</span>
                        </div>
                        <div className="text-[8px] text-zinc-400 truncate">{st.caption}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteStatusStory(st.id)}
                      className="p-1.5 rounded-md bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Delete this status story"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* Status Video / Photo File Upload */}
            <div className="border border-dashed border-zinc-800 hover:border-emerald-500/80 rounded-xl p-3 bg-zinc-950/60 flex flex-col items-center justify-center text-center transition-all group relative cursor-pointer">
              <input 
                type="file" 
                accept="video/*,image/*,video/mp4,video/quicktime,video/webm,video/3gpp,video/mkv,.mp4,.mov,.webm,.mkv,.3gp,.avi,.jpg,.jpeg,.png,.webp"
                onChange={handleStatusUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-8 h-8 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform mb-1">
                <Upload className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-white">+ Add Next Status Video / Photo</span>
              <span className="text-[9px] text-zinc-500">Adds Status #{(appBranding.statusStories?.length || 0) + 1} without overwriting</span>
            </div>

            {/* Status Details & Media URL */}
            <div className="space-y-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 flex flex-col justify-center">
              
              {/* Quick Preset Video Selector */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-400 flex items-center justify-between">
                  <span>Quick 1-Click Status Presets</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const currentStories = (appBranding.statusStories && appBranding.statusStories.length > 0)
                        ? appBranding.statusStories 
                        : defaultInitialStatusStories;
                      const storyId = `story_${Date.now()}_naruto`;
                      const newStory: StatusStoryItem = {
                        id: storyId,
                        title: 'Naruto 4K',
                        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                        type: 'video',
                        caption: '🔥 Naruto Shippuden Hindi Dubbed - Streaming Now!',
                        poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80'
                      };
                      updateAppBranding({ statusStories: [...currentStories, newStory], statusActive: true });
                      showNotification();
                    }}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-emerald-950/80 border border-zinc-800 hover:border-emerald-500/60 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[9px] font-bold text-white truncate">+ Naruto 4K</div>
                    <div className="text-[7px] text-zinc-400">Add Story</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const currentStories = (appBranding.statusStories && appBranding.statusStories.length > 0)
                        ? appBranding.statusStories 
                        : defaultInitialStatusStories;
                      const storyId = `story_${Date.now()}_demon`;
                      const newStory: StatusStoryItem = {
                        id: storyId,
                        title: 'Demon Slayer',
                        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                        type: 'video',
                        caption: '🎬 Watch New Anime & Movie Releases in Full HD!',
                        poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80'
                      };
                      updateAppBranding({ statusStories: [...currentStories, newStory], statusActive: true });
                      showNotification();
                    }}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-emerald-950/80 border border-zinc-800 hover:border-emerald-500/60 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[9px] font-bold text-white truncate">+ Anime Action</div>
                    <div className="text-[7px] text-zinc-400">Add Story</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const currentStories = (appBranding.statusStories && appBranding.statusStories.length > 0)
                        ? appBranding.statusStories 
                        : defaultInitialStatusStories;
                      const storyId = `story_${Date.now()}_vip`;
                      const newStory: StatusStoryItem = {
                        id: storyId,
                        title: 'VIP Special',
                        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                        type: 'video',
                        caption: '✨ CINESTREAM Premium VIP - Unlimited Movies!',
                        poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80'
                      };
                      updateAppBranding({ statusStories: [...currentStories, newStory], statusActive: true });
                      showNotification();
                    }}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-emerald-950/80 border border-zinc-800 hover:border-emerald-500/60 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[9px] font-bold text-white truncate">+ Movie Teaser</div>
                    <div className="text-[7px] text-zinc-400">Add Story</div>
                  </button>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-zinc-300">Status Caption</span>
                <input 
                  type="text" 
                  value={statusCaptionInput}
                  onChange={(e) => {
                    setStatusCaptionInput(e.target.value);
                  }}
                  placeholder="e.g. 🔥 New 4K Status Update!"
                  className="w-full bg-zinc-900 border border-zinc-800 text-white text-[10px] px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button 
                  type="button"
                  onClick={() => {
                    updateAppBranding({ 
                      statusStories: defaultInitialStatusStories,
                      statusMediaUrl: defaultInitialStatusStories[0].url,
                      statusActive: true 
                    });
                    showNotification();
                  }}
                  className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-emerald-400" /> Reset Default 3 Stories
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Startup Cinematic Splash Animation & Sound Studio (Admin Only) */}
        <div className="p-6 bg-gradient-to-b from-zinc-950 to-black border border-zinc-800 rounded-3xl shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Website Startup Intro Animation & Sound (Admin Customizer)</span>
              </div>
              <p className="text-xs text-zinc-400">
                Jab bhi koi visitor website kholega ya page refresh karega, use yeh cinematic intro animation & sound dikhega.
              </p>
            </div>
            
            <button
              type="button"
              onClick={triggerLivePreview}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-red-600/30 cursor-pointer self-start sm:self-auto hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Preview Live Animation</span>
            </button>
          </div>

          {/* Master Animation ON / OFF Control Card */}
          <div className={`p-5 rounded-3xl border-2 transition-all ${
            splashEnabledInput 
              ? 'bg-emerald-950/20 border-emerald-500/50 shadow-xl shadow-emerald-950/40' 
              : 'bg-zinc-950/80 border-rose-900/60 shadow-xl'
          }`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  splashEnabledInput 
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-600'
                }`}>
                  <Film className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-white">Startup Intro Animation Status</span>
                    {splashEnabledInput ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-black font-black text-[10px] uppercase tracking-wider animate-pulse">
                        <CheckCircle2 className="w-3 h-3" /> ON (Active)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-900/70 border border-rose-700 text-rose-300 font-bold text-[10px] uppercase tracking-wider">
                        <VolumeX className="w-3 h-3" /> OFF (Disabled)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    {splashEnabledInput 
                      ? 'Animation ON hai: Website open/refresh hone par cinematic intro animation aur sound play hoga.' 
                      : 'Animation OFF hai: Website turant direct open hogi, koi startup animation nahi dikhega.'}
                  </p>
                </div>
              </div>

              {/* Direct 1-Click Fast Toggle Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSplashEnabledInput(true);
                    updateAppBranding({ splashEnabled: true });
                    showNotification();
                  }}
                  className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    splashEnabledInput
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" /> Turn ON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSplashEnabledInput(false);
                    updateAppBranding({ splashEnabled: false });
                    showNotification();
                  }}
                  className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    !splashEnabledInput
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  <X className="w-3.5 h-3.5" /> Turn OFF
                </button>
              </div>
            </div>
          </div>

          {/* Master Sound & Animation Detail Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
              splashEnabledInput 
                ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700' 
                : 'bg-zinc-950/40 border-zinc-900 opacity-60'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Visual Intro Animation</span>
                  <span className="text-[11px] text-zinc-400">Show 3D graphics on site startup</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={splashEnabledInput}
                onChange={(e) => {
                  const val = e.target.checked;
                  setSplashEnabledInput(val);
                  updateAppBranding({ splashEnabled: val });
                }}
                className="w-5 h-5 accent-red-600 rounded cursor-pointer"
              />
            </label>

            <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
              splashSoundEnabledInput && splashEnabledInput
                ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700' 
                : 'bg-zinc-950/40 border-zinc-900 opacity-60'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  {splashSoundEnabledInput ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Cinematic Sound Effect</span>
                  <span className="text-[11px] text-zinc-400">Play intro audio on website load</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={splashSoundEnabledInput}
                onChange={(e) => {
                  const val = e.target.checked;
                  setSplashSoundEnabledInput(val);
                  updateAppBranding({ splashSoundEnabled: val });
                }}
                className="w-5 h-5 accent-red-600 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* 1. Animation Style (4 Themes) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Layout className="w-4 h-4 text-red-500" />
                <span>1. Select Animation Theme (4 Visual Styles)</span>
              </label>
              <span className="text-[11px] text-zinc-500 font-mono">Current: {splashThemeInput.replace('_', ' ').toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Option A: Cinematic Red (Netflix Style) */}
              <div
                onClick={() => setSplashThemeInput('cinematic_red')}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  splashThemeInput === 'cinematic_red'
                    ? 'bg-gradient-to-b from-red-950/70 to-zinc-900 border-red-500 shadow-lg shadow-red-500/20 scale-[1.02]'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/40">
                    <Film className="w-4 h-4" />
                  </div>
                  {splashThemeInput === 'cinematic_red' && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black uppercase">
                      Active
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Cinematic Red</h4>
                <p className="text-[10px] text-zinc-400 leading-snug">
                  Netflix / Hollywood OTT style with red anamorphic beams & 3D rotating emblem.
                </p>
              </div>

              {/* Option B: Cyberpunk Neon (Sci-Fi Style) */}
              <div
                onClick={() => setSplashThemeInput('cyberpunk_neon')}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  splashThemeInput === 'cyberpunk_neon'
                    ? 'bg-gradient-to-b from-cyan-950/70 to-zinc-900 border-cyan-400 shadow-lg shadow-cyan-400/20 scale-[1.02]'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500 flex items-center justify-center text-black shadow-md shadow-cyan-500/40">
                    <Zap className="w-4 h-4 fill-black" />
                  </div>
                  {splashThemeInput === 'cyberpunk_neon' && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-black text-[9px] font-black uppercase">
                      Active
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Cyberpunk Neon</h4>
                <p className="text-[10px] text-zinc-400 leading-snug">
                  Futuristic electric cyan & purple neon grid lasers with holographic wave.
                </p>
              </div>

              {/* Option C: Golden IMAX Premiere */}
              <div
                onClick={() => setSplashThemeInput('golden_imax')}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  splashThemeInput === 'golden_imax'
                    ? 'bg-gradient-to-b from-amber-950/70 to-zinc-900 border-amber-400 shadow-lg shadow-amber-400/20 scale-[1.02]'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-black shadow-md shadow-amber-500/40">
                    <Crown className="w-4 h-4 fill-black" />
                  </div>
                  {splashThemeInput === 'golden_imax' && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-black uppercase">
                      Active
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Golden IMAX</h4>
                <p className="text-[10px] text-zinc-400 leading-snug">
                  Luxury golden stardust, champagne amber spotlights & metallic reflection.
                </p>
              </div>

              {/* Option D: Anime Action Burst */}
              <div
                onClick={() => setSplashThemeInput('anime_action')}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  splashThemeInput === 'anime_action'
                    ? 'bg-gradient-to-b from-orange-950/70 to-zinc-900 border-orange-500 shadow-lg shadow-orange-500/20 scale-[1.02]'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/40">
                    <Flame className="w-4 h-4 fill-white" />
                  </div>
                  {splashThemeInput === 'anime_action' && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-black uppercase">
                      Active
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Anime Action</h4>
                <p className="text-[10px] text-zinc-400 leading-snug">
                  Shonen anime speedlines, fiery comic burst & high-energy charge aura.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Sound Effects Selection & Live Audio Tests */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Music className="w-4 h-4 text-amber-400" />
                <span>2. Select Startup Sound Effect & Audio Presets</span>
              </label>
              <span className="text-[11px] text-zinc-500 font-mono">Test audio instantly</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Sound 1: Cinema Ta-Dum */}
              <div 
                onClick={() => { setSplashSoundThemeInput('cinema_tadum'); setSplashSoundEnabledInput(true); }}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  splashSoundThemeInput === 'cinema_tadum'
                    ? 'bg-zinc-900 border-red-500 shadow-md'
                    : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Cinema 'Ta-Dum'</span>
                    {splashSoundThemeInput === 'cinema_tadum' && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400">Deep Sub-bass + Chime chord</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleTestSound('cinema_tadum'); }}
                  className="px-2.5 py-1 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Test Cinema Ta-Dum Sound"
                >
                  <Play className={`w-3 h-3 ${playingAudioId === 'cinema_tadum' ? 'animate-spin' : ''}`} />
                  <span>{playingAudioId === 'cinema_tadum' ? 'Playing...' : 'Test'}</span>
                </button>
              </div>

              {/* Sound 2: Cyber Synth Sweep */}
              <div 
                onClick={() => { setSplashSoundThemeInput('cyber_synth'); setSplashSoundEnabledInput(true); }}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  splashSoundThemeInput === 'cyber_synth'
                    ? 'bg-zinc-900 border-cyan-400 shadow-md'
                    : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Cyber Synth Arp</span>
                    {splashSoundThemeInput === 'cyber_synth' && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400">Sci-Fi resonance zap & chord</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleTestSound('cyber_synth'); }}
                  className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 border border-cyan-400/40 text-cyan-300 hover:text-black text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Test Cyber Synth Sound"
                >
                  <Play className={`w-3 h-3 ${playingAudioId === 'cyber_synth' ? 'animate-spin' : ''}`} />
                  <span>{playingAudioId === 'cyber_synth' ? 'Playing...' : 'Test'}</span>
                </button>
              </div>

              {/* Sound 3: Golden IMAX Orchestral */}
              <div 
                onClick={() => { setSplashSoundThemeInput('golden_orchestral'); setSplashSoundEnabledInput(true); }}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  splashSoundThemeInput === 'golden_orchestral'
                    ? 'bg-zinc-900 border-amber-400 shadow-md'
                    : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Golden Orchestral</span>
                    {splashSoundThemeInput === 'golden_orchestral' && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400">Majestic brass swell</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleTestSound('golden_orchestral'); }}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500 border border-amber-400/40 text-amber-300 hover:text-black text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Test Golden Orchestral Sound"
                >
                  <Play className={`w-3 h-3 ${playingAudioId === 'golden_orchestral' ? 'animate-spin' : ''}`} />
                  <span>{playingAudioId === 'golden_orchestral' ? 'Playing...' : 'Test'}</span>
                </button>
              </div>

              {/* Sound 4: Anime Power Chime */}
              <div 
                onClick={() => { setSplashSoundThemeInput('anime_spark'); setSplashSoundEnabledInput(true); }}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  splashSoundThemeInput === 'anime_spark'
                    ? 'bg-zinc-900 border-orange-500 shadow-md'
                    : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Anime Power Chime</span>
                    {splashSoundThemeInput === 'anime_spark' && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400">High-energy lightning hit</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleTestSound('anime_spark'); }}
                  className="px-2.5 py-1 rounded-xl bg-orange-500/20 hover:bg-orange-500 border border-orange-400/40 text-orange-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Test Anime Sound"
                >
                  <Play className={`w-3 h-3 ${playingAudioId === 'anime_spark' ? 'animate-spin' : ''}`} />
                  <span>{playingAudioId === 'anime_spark' ? 'Playing...' : 'Test'}</span>
                </button>
              </div>

              {/* Sound 5: Custom Audio / MP3 File */}
              <div 
                onClick={() => { setSplashSoundThemeInput('custom_audio'); setSplashSoundEnabledInput(true); }}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  splashSoundThemeInput === 'custom_audio'
                    ? 'bg-zinc-900 border-purple-400 shadow-md'
                    : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Custom MP3 Audio</span>
                    {splashSoundThemeInput === 'custom_audio' && (
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400">Upload or URL link</span>
                </div>
                {splashCustomAudioUrlInput ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleTestSound('custom_audio'); }}
                    className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500 border border-purple-400/40 text-purple-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Play className={`w-3 h-3 ${playingAudioId === 'custom_audio' ? 'animate-spin' : ''}`} />
                    <span>{playingAudioId === 'custom_audio' ? 'Playing...' : 'Test'}</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-zinc-500">No file</span>
                )}
              </div>

              {/* Sound 6: Silent Mute */}
              <div 
                onClick={() => { setSplashSoundThemeInput('none'); setSplashSoundEnabledInput(false); }}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  splashSoundThemeInput === 'none' || !splashSoundEnabledInput
                    ? 'bg-zinc-900 border-zinc-600 shadow-md'
                    : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-white block">Mute / Silent</span>
                  <span className="text-[10px] text-zinc-400">Play intro without audio</span>
                </div>
                <VolumeX className="w-4 h-4 text-zinc-500" />
              </div>
            </div>

            {/* Custom Audio Upload & URL Input (when Custom Audio is chosen) */}
            {splashSoundThemeInput === 'custom_audio' && (
              <div className="p-4 bg-zinc-950 border border-purple-500/30 rounded-2xl space-y-3 mt-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-300 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-purple-400" />
                    <span>Upload Custom Intro Sound (MP3 / WAV)</span>
                  </label>
                  {splashCustomAudioUrlInput && (
                    <button
                      type="button"
                      onClick={() => setSplashCustomAudioUrlInput('')}
                      className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                    >
                      Clear Audio
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900 border border-dashed border-purple-400/40 rounded-xl text-xs font-bold text-purple-300 hover:bg-zinc-800 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose MP3 File</span>
                      <input 
                        type="file" 
                        accept="audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/*" 
                        onChange={handleCustomAudioUpload}
                        className="hidden" 
                      />
                    </label>
                  </div>

                  <div>
                    <input 
                      type="text"
                      value={splashCustomAudioUrlInput}
                      onChange={(e) => setSplashCustomAudioUrlInput(e.target.value)}
                      placeholder="Or paste Direct MP3 Audio URL"
                      className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Duration Selector */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-400" />
                <span>3. Animation Display Duration</span>
              </label>
              <p className="text-[11px] text-zinc-400">Kitni der tak startup intro screen dikhayi de</p>
            </div>

            <div className="flex items-center gap-2">
              {[
                { val: 2.5, label: '2.5s (Fast)' },
                { val: 3.2, label: '3.2s (Standard)' },
                { val: 4.0, label: '4.0s (Cinematic)' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setSplashDurationInput(opt.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    splashDurationInput === opt.val
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit & Reset Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
          <button 
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Reset All Branding
          </button>

          <button 
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Save & Apply Branding
          </button>
        </div>

      </form>

    </div>
  );
};
