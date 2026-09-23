import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  X, 
  ArrowLeft,
  FastForward, 
  Settings, 
  Subtitles, 
  ListVideo, 
  SkipForward, 
  Monitor, 
  Clock, 
  Sparkles,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Episode } from '../types';
import { resolvePlayableUrl, isGoogleDriveUrl, formatGoogleDrivePreviewUrl } from '../utils/persistentStorage';

export const VideoPlayer: React.FC = () => {
  const { 
    playingMovie, 
    playingEpisode, 
    closePlayer, 
    updateWatchProgress, 
    currentUser, 
    adsConfig,
    startPlaying
  } = useApp();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedQuality, setSelectedQuality] = useState<string>('1080p Full HD');
  const [selectedSub, setSelectedSub] = useState<string>('Off');

  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Animated tactile click feedback (center pulse icon)
  const [clickFeedback, setClickFeedback] = useState<{ type: 'play' | 'pause' | 'seek_fwd' | 'seek_back'; id: number } | null>(null);

  // Resume toast banner state
  const [resumeBanner, setResumeBanner] = useState<{ visible: boolean; time: number } | null>(null);

  // Tracking and milestone refs to avoid state loop re-renders
  const lastLoggedSecRef = useRef<number>(-1);
  const loggedMilestonesRef = useRef<Set<string>>(new Set());
  const isTrailerRef = useRef<boolean>(false);
  const currentEpIdRef = useRef<string | undefined>(playingEpisode?.id);
  const playingMovieIdRef = useRef<string | undefined>(playingMovie?.id);

  // Ad Interstitial state
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [adCountdown, setAdCountdown] = useState(adsConfig.skipDelaySeconds || 5);
  const [canSkipAd, setCanSkipAd] = useState(false);
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize refs for cleanup handlers
  useEffect(() => {
    isTrailerRef.current = isPlayingTrailer;
    currentEpIdRef.current = playingEpisode?.id;
    playingMovieIdRef.current = playingMovie?.id;
  }, [isPlayingTrailer, playingEpisode?.id, playingMovie?.id]);

  // Helper to accurately persist playback progress directly to watchHistory
  const logProgressAtCurrentTimestamp = (targetCur?: number, targetDur?: number, isFinished?: boolean) => {
    if (isTrailerRef.current || !playingMovieIdRef.current) return;
    
    const cur = targetCur !== undefined ? targetCur : (videoRef.current?.currentTime || 0);
    const dur = targetDur !== undefined ? targetDur : (videoRef.current?.duration || 0);
    
    // Only log if video has a valid duration and user watched at least 3 seconds (or is explicitly completed)
    if (dur > 0 && (cur >= 3 || isFinished)) {
      updateWatchProgress(playingMovieIdRef.current, cur, dur, currentEpIdRef.current, isFinished);
    }
  };

  // Reset controls hide timer on activity
  const triggerControlsVisibility = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showSettingsMenu && !showEpisodeDrawer) {
          setShowControls(false);
        }
      }, 3500);
    }
  }, [isPlaying, showSettingsMenu, showEpisodeDrawer]);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    } else {
      triggerControlsVisibility();
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, triggerControlsVisibility]);

  // Flash central visual feedback icon
  const showActionFeedback = (type: 'play' | 'pause' | 'seek_fwd' | 'seek_back') => {
    setClickFeedback({ type, id: Date.now() });
    setTimeout(() => {
      setClickFeedback(prev => prev && prev.type === type ? null : prev);
    }, 650);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (!videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
        showActionFeedback('pause');
        logProgressAtCurrentTimestamp();
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
          showActionFeedback('play');
        }).catch(() => {
          // If browser restricted autoplay without mute, mute and start
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().then(() => {
              setIsPlaying(true);
              showActionFeedback('play');
            }).catch(() => {});
          }
        });
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.muted = false;
        videoRef.current.volume = volume > 0 ? volume : 1;
        setIsMuted(false);
      } else {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleSkipTime = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      showActionFeedback(seconds > 0 ? 'seek_fwd' : 'seek_back');
      logProgressAtCurrentTimestamp(newTime, videoRef.current.duration);
    }
  };

  // Keyboard Shortcuts (Space/K = Play/Pause, Arrows = Seek/Vol, F = Fullscreen, M = Mute, Esc = Exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (e.target as HTMLElement)?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      if (e.code === 'Space' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        handleSkipTime(-10);
      } else if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleSkipTime(10);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const nextVol = Math.min(1, parseFloat((volume + 0.1).toFixed(1)));
        setVolume(nextVol);
        if (videoRef.current) {
          videoRef.current.volume = nextVol;
          videoRef.current.muted = false;
          setIsMuted(false);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextVol = Math.max(0, parseFloat((volume - 0.1).toFixed(1)));
        setVolume(nextVol);
        if (videoRef.current) {
          videoRef.current.volume = nextVol;
          if (nextVol === 0) {
            videoRef.current.muted = true;
            setIsMuted(true);
          }
        }
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape' && !document.fullscreenElement) {
        logProgressAtCurrentTimestamp();
        closePlayer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isMuted, closePlayer]);

  // Flush progress when navigating away or closing the window/tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      logProgressAtCurrentTimestamp();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      logProgressAtCurrentTimestamp();
    };
  }, []);

  if (!playingMovie) return null;

  const currentEp = playingEpisode || (playingMovie.episodes && playingMovie.episodes.length > 0 ? playingMovie.episodes[0] : null);
  const mainVideoSrc = currentEp ? currentEp.videoUrl : playingMovie.videoUrl;

  // Auto Trailer Play First Logic
  useEffect(() => {
    const trailer = playingMovie?.trailerUrl;
    if (trailer && trailer.trim() !== '' && trailer !== mainVideoSrc) {
      setIsPlayingTrailer(true);
    } else {
      setIsPlayingTrailer(false);
    }
    setVideoError(false);
    loggedMilestonesRef.current.clear();
    lastLoggedSecRef.current = -1;
  }, [playingMovie?.id, currentEp?.id]);

  const activeVideoSrc = isPlayingTrailer && playingMovie?.trailerUrl ? playingMovie.trailerUrl : mainVideoSrc;

  const [resolvedVideoSrc, setResolvedVideoSrc] = useState<string>(activeVideoSrc || '');

  useEffect(() => {
    let isMounted = true;
    if (!activeVideoSrc) {
      setResolvedVideoSrc('');
      return;
    }
    resolvePlayableUrl(activeVideoSrc).then((resolved) => {
      if (isMounted) {
        setResolvedVideoSrc(resolved || activeVideoSrc);
      }
    }).catch(() => {
      if (isMounted) setResolvedVideoSrc(activeVideoSrc);
    });
    return () => { isMounted = false; };
  }, [activeVideoSrc]);

  const isGoogleDrive = isGoogleDriveUrl(resolvedVideoSrc);

  // Check if resolvedVideoSrc is direct video file or external web/embed URL
  const isDirectVideoFile = Boolean(
    !isGoogleDrive &&
    resolvedVideoSrc && 
    (
      resolvedVideoSrc.startsWith('blob:') || 
      resolvedVideoSrc.startsWith('data:video') || 
      /\.(mp4|webm|ogg|mkv|mov|m3u8|mpd)($|\?)/i.test(resolvedVideoSrc)
    )
  );

  const isYouTubeUrl = Boolean(
    resolvedVideoSrc && (resolvedVideoSrc.includes('youtube.com') || resolvedVideoSrc.includes('youtu.be'))
  );

  const isWebEmbedUrl = Boolean(
    resolvedVideoSrc && !isDirectVideoFile && !isYouTubeUrl && (isGoogleDrive || resolvedVideoSrc.startsWith('http://') || resolvedVideoSrc.startsWith('https://'))
  );

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1&rel=0`;
      }
      if (url.includes('watch?v=')) {
        const id = url.split('watch?v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1&rel=0`;
      }
      if (url.includes('/embed/')) {
        return url;
      }
    } catch (e) {}
    return url;
  };

  const getEmbedSourceUrl = (url: string) => {
    if (!url) return '';
    if (isYouTubeUrl) return getYouTubeEmbedUrl(url);
    if (isGoogleDriveUrl(url)) {
      return formatGoogleDrivePreviewUrl(url);
    }
    return url;
  };

  const handleSkipTrailer = () => {
    setIsPlayingTrailer(false);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }, 150);
  };

  const handleVideoEnded = () => {
    if (isPlayingTrailer) {
      setIsPlayingTrailer(false);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      }, 150);
    } else {
      setIsPlaying(false);
      if (videoRef.current) {
        logProgressAtCurrentTimestamp(videoRef.current.duration, videoRef.current.duration, true);
      }
    }
  };

  // Auto-Resume logic from watchHistory with non-intrusive toast UI
  useEffect(() => {
    if (!isPlayingTrailer && currentUser?.watchHistory && videoRef.current) {
      const match = currentUser.watchHistory.find(
        h => h.movieId === playingMovie.id && h.episodeId === currentEp?.id
      );
      if (
        match && 
        match.progressSeconds >= 10 && 
        (!match.completed) && 
        (match.durationSeconds === 0 || match.progressSeconds < match.durationSeconds - 20)
      ) {
        videoRef.current.currentTime = match.progressSeconds;
        setCurrentTime(match.progressSeconds);
        setResumeBanner({ visible: true, time: match.progressSeconds });

        const timer = setTimeout(() => {
          setResumeBanner(prev => prev ? { ...prev, visible: false } : null);
        }, 6000);
        return () => clearTimeout(timer);
      }
    }
  }, [playingMovie.id, currentEp?.id, isPlayingTrailer]);

  const handleStartOver = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setResumeBanner(null);
      logProgressAtCurrentTimestamp(0, duration || 100);
    }
  };

  // Ads Timer trigger for Free Users
  useEffect(() => {
    const isFreeUser = !currentUser?.subscription?.active;
    if (isFreeUser && adsConfig.enabled) {
      const intervalMs = (adsConfig.frequencyMinutes || 2) * 60 * 1000;
      adTimerRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
          logProgressAtCurrentTimestamp();
        }
        setShowAdOverlay(true);
        setAdCountdown(adsConfig.skipDelaySeconds || 5);
        setCanSkipAd(false);
      }, intervalMs);
    }
    return () => {
      if (adTimerRef.current) clearTimeout(adTimerRef.current);
    };
  }, [adsConfig, currentUser]);

  useEffect(() => {
    if (showAdOverlay && adCountdown > 0) {
      const timer = setTimeout(() => setAdCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showAdOverlay && adCountdown === 0) {
      setCanSkipAd(true);
    }
  }, [showAdOverlay, adCountdown]);

  const handleSkipAd = () => {
    setShowAdOverlay(false);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isPlayingTrailer) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 0;
      setCurrentTime(cur);
      if (dur > 0) setDuration(dur);

      const roundedCur = Math.floor(cur);

      const earlyMilestones = [5, 10, 30, 60];
      for (const m of earlyMilestones) {
        const milestoneKey = `sec_${m}`;
        if (roundedCur >= m && !loggedMilestonesRef.current.has(milestoneKey)) {
          loggedMilestonesRef.current.add(milestoneKey);
          updateWatchProgress(playingMovie.id, cur, dur, currentEp?.id);
          lastLoggedSecRef.current = roundedCur;
          return;
        }
      }

      if (dur > 60) {
        const percentMilestones = [
          { key: 'pct_25', frac: 0.25 },
          { key: 'pct_50', frac: 0.50 },
          { key: 'pct_75', frac: 0.75 },
          { key: 'pct_90', frac: 0.90 },
          { key: 'pct_95', frac: 0.95 }
        ];

        for (const pm of percentMilestones) {
          if (cur >= dur * pm.frac && !loggedMilestonesRef.current.has(pm.key)) {
            loggedMilestonesRef.current.add(pm.key);
            const isCompleted = pm.frac >= 0.95;
            updateWatchProgress(playingMovie.id, cur, dur, currentEp?.id, isCompleted);
            lastLoggedSecRef.current = roundedCur;
            return;
          }
        }
      }

      if (roundedCur > 0 && roundedCur % 5 === 0 && roundedCur !== lastLoggedSecRef.current) {
        lastLoggedSecRef.current = roundedCur;
        updateWatchProgress(playingMovie.id, cur, dur, currentEp?.id);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleSeekEnd = () => {
    if (videoRef.current) {
      logProgressAtCurrentTimestamp(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.error(err));
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleExitPlayer = () => {
    logProgressAtCurrentTimestamp();
    closePlayer();
  };

  // Skip Intro check
  const showSkipIntro = currentEp && currentEp.skipIntroStart && currentEp.skipIntroEnd &&
    currentTime >= currentEp.skipIntroStart && currentTime <= currentEp.skipIntroEnd;

  const handleSkipIntro = () => {
    if (videoRef.current && currentEp?.skipIntroEnd) {
      videoRef.current.currentTime = currentEp.skipIntroEnd;
      logProgressAtCurrentTimestamp(currentEp.skipIntroEnd, videoRef.current.duration);
    }
  };

  const handleNextEpisode = () => {
    if (!playingMovie.episodes) return;
    if (videoRef.current) {
      logProgressAtCurrentTimestamp(videoRef.current.duration, videoRef.current.duration, true);
    }
    const currentIndex = playingMovie.episodes.findIndex(e => e.id === currentEp?.id);
    if (currentIndex >= 0 && currentIndex < playingMovie.episodes.length - 1) {
      const nextEp = playingMovie.episodes[currentIndex + 1];
      startPlaying(playingMovie, nextEp);
    }
  };

  // Main stage click handler: Clicking directly on video or stage immediately stops/plays video
  const handleStageClick = (e: React.MouseEvent) => {
    // If an embed or Google Drive/YouTube video is active, iframe handles its own interactions
    if (isYouTubeUrl || isWebEmbedUrl || isGoogleDrive) {
      return;
    }
    const target = e.target as HTMLElement;
    // Prevent toggle if clicking on buttons, sliders, menus, drawers, or banner buttons
    if (
      target.closest('button') || 
      target.closest('input') || 
      target.closest('.no-stage-click')
    ) {
      return;
    }
    togglePlay();
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden select-none cursor-pointer"
      onMouseMove={triggerControlsVisibility}
      onTouchStart={triggerControlsVisibility}
      onClick={handleStageClick}
    >
      {/* Video Element or Web/YouTube/Google Drive Embed */}
      {(isYouTubeUrl || isWebEmbedUrl || isGoogleDrive) ? (
        <iframe
          src={getEmbedSourceUrl(resolvedVideoSrc || '')}
          title={playingMovie.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          className="w-full h-full border-0 pointer-events-auto bg-black"
        />
      ) : (
        <video 
          ref={videoRef}
          src={resolvedVideoSrc || undefined}
          autoPlay
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onPause={() => { setIsPlaying(false); logProgressAtCurrentTimestamp(); }}
          onPlay={() => setIsPlaying(true)}
          onSeeked={handleSeekEnd}
          onEnded={handleVideoEnded}
          onError={() => {
            if (isPlayingTrailer) {
              console.warn('Trailer failed to load, automatically skipping to main video');
              handleSkipTrailer();
              return;
            }
            console.warn('Video load error occurred on source:', resolvedVideoSrc);
            setVideoError(true);
          }}
          className="w-full h-full object-contain cursor-pointer"
        />
      )}

      {/* Video Load Error Fallback Banner */}
      {videoError && (
        <div className="no-stage-click absolute inset-0 z-40 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-red-950/60 border border-red-800 flex items-center justify-center text-red-500 mb-4 shadow-2xl animate-pulse">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-white font-display mb-1">
            {isGoogleDrive ? 'Google Drive Playback / Permission Notice' : 'Video Playback / Stream Issue'}
          </h3>
          <p className="text-xs text-zinc-300 max-w-md mb-5 leading-relaxed">
            {isGoogleDrive ? (
              <>
                Google Drive video load nahi ho pa raha hai. Kripya Google Drive file sharing mein <strong>&quot;Anyone with the link&quot;</strong> (Public Viewer) access on karein, ya direct new tab mein play karein.
              </>
            ) : (
              'Yeh video stream load nahi ho pa rahi hai. Kripya alternate stream check karein ya direct video link open karein.'
            )}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-md">
            {isGoogleDrive && (
              <a
                href={activeVideoSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Google Drive</span>
              </a>
            )}
            <button
              onClick={() => {
                setVideoError(false);
                setIsPlayingTrailer(false);
                setResolvedVideoSrc('https://media.w3.org/2010/05/bunny/movie.mp4');
                setTimeout(() => {
                  if (videoRef.current) {
                    videoRef.current.load();
                    videoRef.current.play().catch(() => {});
                    setIsPlaying(true);
                  }
                }, 100);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play Sample Video</span>
            </button>
            <button
              onClick={() => {
                setVideoError(false);
                if (videoRef.current) {
                  videoRef.current.load();
                  videoRef.current.play().catch(() => {});
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              Retry Loading
            </button>
            <button
              onClick={handleExitPlayer}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
            >
              Back to Browse
            </button>
          </div>
        </div>
      )}

      {/* Animated Center Ripple Action Indicator (Appears when user clicks to Stop / Play / Seek) */}
      {clickFeedback && (
        <div 
          key={clickFeedback.id}
          className="pointer-events-none absolute inset-0 flex items-center justify-center z-40 animate-ping-once"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black/70 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl text-white transform transition-all">
            {clickFeedback.type === 'pause' && <Pause className="w-10 h-10 fill-white text-white" />}
            {clickFeedback.type === 'play' && <Play className="w-10 h-10 fill-white text-white ml-1" />}
            {clickFeedback.type === 'seek_fwd' && (
              <div className="flex flex-col items-center">
                <RotateCw className="w-8 h-8 text-red-400" />
                <span className="text-[10px] font-mono font-bold mt-1">+10s</span>
              </div>
            )}
            {clickFeedback.type === 'seek_back' && (
              <div className="flex flex-col items-center">
                <RotateCcw className="w-8 h-8 text-red-400" />
                <span className="text-[10px] font-mono font-bold mt-1">-10s</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Large Center Play/Pause Overlay Button when Paused (Stopped) - Native HTML5 video only */}
      {!isPlaying && !videoError && !isYouTubeUrl && !isWebEmbedUrl && !isGoogleDrive && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 backdrop-blur-sm border-2 border-red-400/40 transform transition-transform hover:scale-110">
            <Play className="w-10 h-10 fill-white ml-1.5" />
          </div>
        </div>
      )}

      {/* Auto-Resume Notification Banner */}
      {resumeBanner && resumeBanner.visible && (
        <div className="no-stage-click absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/95 border border-red-500/40 text-white px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3.5 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-500" />
            <span className="text-xs font-semibold text-zinc-200">
              Resumed from <span className="font-bold font-mono text-red-400">{formatTime(resumeBanner.time)}</span>
            </span>
          </div>
          <button 
            onClick={handleStartOver}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-zinc-300 hover:text-white transition-all cursor-pointer border border-zinc-700"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Start Over</span>
          </button>
          <button 
            onClick={() => setResumeBanner(null)}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Trailer Status Badge & Skip Banner Overlay */}
      {isPlayingTrailer && (
        <div className="no-stage-click absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-amber-600/95 via-orange-600/95 to-red-600/95 text-white px-4 py-2 rounded-2xl shadow-2xl border border-amber-400/40 backdrop-blur-md flex items-center gap-3 max-w-[92vw]">
          <div className="flex items-center gap-2 text-xs font-black">
            <span className="px-2 py-0.5 rounded-lg bg-black/50 text-amber-300 font-mono text-[10px] uppercase tracking-wider shrink-0">
              🎬 TRAILER FIRST
            </span>
            <span className="hidden sm:inline text-white/90 font-medium text-xs">
              Official Trailer Playing • Main Video Starts Automatically After Trailer
            </span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); handleSkipTrailer(); }}
            className="px-3.5 py-1.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-amber-100 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shrink-0"
          >
            <span>Play Main Video</span>
            <SkipForward className="w-3.5 h-3.5 fill-black" />
          </button>
        </div>
      )}

      {/* Floating Quick Exit Button when controls are hidden */}
      {!showControls && (
        <button 
          onClick={(e) => { e.stopPropagation(); handleExitPlayer(); }}
          className="no-stage-click fixed top-3 left-3 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs shadow-xl backdrop-blur-md active:scale-95 transition-all cursor-pointer opacity-80 hover:opacity-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>
      )}

      {/* Top Header Overlay */}
      <div className={`no-stage-click absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/95 via-black/60 to-transparent flex items-center justify-between transition-opacity duration-300 z-30 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExitPlayer}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            title="Exit Video Player"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Browse</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white font-display leading-tight">{playingMovie.title}</h2>
            {currentEp && (
              <span className="text-xs text-red-400 font-semibold">
                Episode {currentEp.episodeNumber}: {currentEp.title}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isGoogleDrive && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <span>Google Drive Video</span>
              <a
                href={activeVideoSrc}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-amber-200 hover:text-white underline font-bold flex items-center gap-1 ml-1"
                title="Google Drive open karke check karein ki permission 'Anyone with the link' public hai ya nahi"
              >
                <span>Check Access</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {activeVideoSrc && activeVideoSrc.startsWith('http') && !isGoogleDrive && (
            <a
              href={activeVideoSrc}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
              title="Open stream source in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Open Link</span>
            </a>
          )}

          {playingMovie.episodes && playingMovie.episodes.length > 0 && (
            <button 
              onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-700 text-xs font-bold text-white hover:bg-zinc-800 cursor-pointer"
            >
              <ListVideo className="w-4 h-4 text-red-400" />
              Episodes
            </button>
          )}

          <button 
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className="p-2 rounded-full bg-zinc-900/80 border border-zinc-700 text-zinc-200 hover:text-white cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Skip Intro Overlay Button */}
      {showSkipIntro && (
        <button 
          onClick={handleSkipIntro}
          className="no-stage-click absolute bottom-28 right-8 z-40 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-2xl flex items-center gap-2 animate-bounce cursor-pointer"
        >
          <FastForward className="w-4 h-4" />
          Skip Intro
        </button>
      )}

      {/* Settings Dropdown Drawer */}
      {showSettingsMenu && (
        <div className="no-stage-click absolute top-20 right-8 z-40 w-64 bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 text-left shadow-2xl backdrop-blur-xl">
          <div className="text-xs font-bold text-white mb-3 pb-1 border-b border-zinc-800 flex items-center justify-between">
            <span>Playback Settings</span>
            <button onClick={() => setShowSettingsMenu(false)} className="text-zinc-500 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="text-zinc-400 mb-1 font-semibold">Video Quality</div>
              <div className="flex flex-wrap gap-1">
                {['4K Ultra HD', '1080p Full HD', '720p HD', '480p'].map(q => (
                  <button 
                    key={q} 
                    onClick={() => setSelectedQuality(q)}
                    className={`px-2 py-1 rounded-md border text-[10px] font-bold cursor-pointer ${selectedQuality === q ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-zinc-400 mb-1 font-semibold">Playback Speed</div>
              <div className="flex gap-1">
                {[0.5, 1.0, 1.25, 1.5, 2.0].map(s => (
                  <button 
                    key={s} 
                    onClick={() => handleSpeedChange(s)}
                    className={`px-2 py-1 rounded-md border text-[10px] font-bold cursor-pointer ${playbackSpeed === s ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Episode Drawer */}
      {showEpisodeDrawer && playingMovie.episodes && (
        <div className="no-stage-click absolute top-20 right-8 z-40 w-80 max-h-[70vh] bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 text-left shadow-2xl backdrop-blur-xl overflow-y-auto">
          <div className="text-xs font-bold text-white mb-3 pb-2 border-b border-zinc-800 flex items-center justify-between">
            <span>Select Episode</span>
            <button onClick={() => setShowEpisodeDrawer(false)} className="text-zinc-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-2">
            {playingMovie.episodes.map(ep => (
              <div 
                key={ep.id}
                onClick={() => { startPlaying(playingMovie, ep); setShowEpisodeDrawer(false); }}
                className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  currentEp?.id === ep.id ? 'bg-red-950/40 border-red-600 text-white font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="text-xs font-black text-red-500">EP {ep.episodeNumber}</div>
                <div className="truncate text-xs flex-1">{ep.title}</div>
                <div className="text-[10px] text-zinc-500">{ep.duration}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className={`no-stage-click absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-3 transition-opacity duration-300 z-30 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Google Drive / Web Embed Quick Actions Bar */}
        {(isGoogleDrive || isYouTubeUrl || isWebEmbedUrl) && (
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-zinc-900/90 border border-zinc-800/80 p-3 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-white">
                {isGoogleDrive ? 'Google Drive Player' : isYouTubeUrl ? 'YouTube Embed' : 'Web Stream'}
              </span>
              <span className="text-[11px] text-zinc-400 hidden sm:inline">• Player controls are inside video frame</span>
            </div>
            <div className="flex items-center gap-2">
              {isGoogleDrive && (
                <a
                  href={activeVideoSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Drive</span>
                </a>
              )}
              <button
                onClick={handleExitPlayer}
                className="px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>
        )}

        {/* Timeline Slider - Native HTML5 video only */}
        {!isGoogleDrive && !isYouTubeUrl && !isWebEmbedUrl && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-zinc-300">{formatTime(currentTime)}</span>
            <input 
              type="range" 
              min="0" 
              max={duration || 100} 
              value={currentTime} 
              onChange={handleSeek}
              onMouseUp={handleSeekEnd}
              onTouchEnd={handleSeekEnd}
              className="flex-1 h-1.5 bg-zinc-800 accent-red-600 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-zinc-400">{formatTime(duration)}</span>
          </div>
        )}

        {/* Buttons Bar - Native HTML5 video only */}
        {!isGoogleDrive && !isYouTubeUrl && !isWebEmbedUrl && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Play/Pause (Stop/Start) Toggle Button */}
            <button 
              onClick={togglePlay} 
              className="p-2 sm:p-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white hover:scale-110 active:scale-95 transition-all shadow-lg shadow-red-600/40 cursor-pointer"
              title={isPlaying ? "Pause / Stop Video (Space)" : "Play Video (Space)"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </button>

            {/* Rewind 10s */}
            <button 
              onClick={() => handleSkipTime(-10)} 
              className="text-zinc-300 hover:text-white p-1 rounded-lg hover:bg-zinc-800/80 transition-colors cursor-pointer"
              title="Rewind 10 seconds (Left Arrow)"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Forward 10s */}
            <button 
              onClick={() => handleSkipTime(10)} 
              className="text-zinc-300 hover:text-white p-1 rounded-lg hover:bg-zinc-800/80 transition-colors cursor-pointer"
              title="Forward 10 seconds (Right Arrow)"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Volume Control with Slider */}
            <div 
              className="relative flex items-center gap-1.5"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button 
                onClick={toggleMute}
                className="text-zinc-300 hover:text-white p-1 rounded-lg hover:bg-zinc-800/80 transition-colors cursor-pointer"
                title={isMuted ? "Unmute (M)" : "Mute (M)"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              {/* Volume Slider */}
              <div className={`transition-all duration-200 flex items-center ${showVolumeSlider ? 'w-20 opacity-100 ml-1' : 'w-0 opacity-0 overflow-hidden'}`}>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1.5 bg-zinc-700 accent-red-500 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Next Episode Button */}
            {playingMovie.episodes && (
              <button 
                onClick={handleNextEpisode} 
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-zinc-300 hover:text-white cursor-pointer px-2 py-1 rounded-lg hover:bg-zinc-800/60"
              >
                <SkipForward className="w-4 h-4 text-red-400" /> Next Episode
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
              {selectedQuality}
            </span>

            <button 
              onClick={toggleFullscreen} 
              className="text-zinc-300 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800/80 transition-colors cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
        )}
      </div>

      {/* Free User Google Ad Overlay Interstitial */}
      {showAdOverlay && (
        <div className="no-stage-click absolute inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Google AdMob Interstitial
            </div>
            <h3 className="text-lg font-black text-white font-display mb-2">
              Sponsored Advertisement
            </h3>
            
            <div className="w-full h-48 rounded-2xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-800 border border-zinc-700/60 p-4 flex flex-col justify-between my-4 relative overflow-hidden">
              <div className="text-left">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-[10px]">
                  Ad • Google Network
                </span>
                <div className="text-sm font-bold text-white mt-2">Upgrade to CineStream VIP</div>
                <div className="text-xs text-zinc-400 mt-1">Enjoy 4K Ultra HD Streaming, Unlimited Downloads & Zero Ads!</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500">Ad ID: {adsConfig.adUnitId}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-zinc-400 font-medium">
                {!canSkipAd ? `Skip Ad in ${adCountdown}s` : 'Ad Finished'}
              </span>

              {canSkipAd ? (
                <button 
                  onClick={handleSkipAd}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                >
                  Skip Ad
                </button>
              ) : (
                <button disabled className="px-6 py-2.5 rounded-xl bg-zinc-800 text-zinc-500 font-bold text-xs cursor-not-allowed">
                  Skip Ad ({adCountdown}s)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

