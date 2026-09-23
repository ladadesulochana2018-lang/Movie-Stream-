import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Sparkles, Volume2, VolumeX, FastForward, Film, Tv, Clapperboard, Zap, Flame, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SplashIntroProps {
  onComplete: () => void;
}

// Universal Web Audio Synthesizer + Custom Audio Player for Splash Intro
export const playSplashSoundEffect = (
  theme: 'cinema_tadum' | 'cyber_synth' | 'golden_orchestral' | 'anime_spark' | 'custom_audio' | 'none',
  customUrl?: string
) => {
  if (theme === 'none') return;

  if (theme === 'custom_audio' && customUrl) {
    try {
      const audio = new Audio(customUrl);
      audio.volume = 0.8;
      audio.play().catch(err => console.warn('Custom audio playback note:', err));
      return;
    } catch (e) {
      console.warn('Custom audio error:', e);
    }
  }

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (theme === 'cyber_synth') {
      // Sci-Fi Cyber sweep + Resonance Arpeggio + Laser zap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now); // A2
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.35); // A5
      osc.frequency.exponentialRampToValueAtTime(220, now + 1.2);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.4);
      filter.frequency.exponentialRampToValueAtTime(300, now + 1.6);
      filter.Q.value = 4;

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.1);

      // Digital sparkle chime at 0.3s
      const chord = [587.33, 880, 1174.66]; // D5, A5, D6
      chord.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + 0.25 + idx * 0.08);
        g.gain.setValueAtTime(0.001, now + 0.25 + idx * 0.08);
        g.gain.linearRampToValueAtTime(0.08, now + 0.3 + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + 0.25 + idx * 0.08);
        o.stop(now + 1.8);
      });
      return;
    }

    if (theme === 'golden_orchestral') {
      // Golden Orchestral Brass / Majestic Swell
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'triangle';
      osc2.type = 'sawtooth';

      // Warm Fifth Chord C2 -> G2 -> C4
      osc1.frequency.setValueAtTime(65.41, now);
      osc2.frequency.setValueAtTime(98.00, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.9);
      filter.frequency.exponentialRampToValueAtTime(200, now + 2.6);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.9);
      osc2.stop(now + 2.9);

      // Golden chime finish
      const chime = ctx.createOscillator();
      const cGain = ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(1046.5, now + 0.5); // C6
      cGain.gain.setValueAtTime(0.001, now + 0.5);
      cGain.gain.linearRampToValueAtTime(0.15, now + 0.6);
      cGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
      chime.connect(cGain);
      cGain.connect(ctx.destination);
      chime.start(now + 0.5);
      chime.stop(now + 2.5);
      return;
    }

    if (theme === 'anime_spark') {
      // High-energy Shonen lightning impact + sparkle burst
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(150, now);
      osc1.frequency.exponentialRampToValueAtTime(50, now + 0.4);

      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Power-up rising ascending run
      [330, 440, 659, 880, 1318].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + 0.1 + idx * 0.06);
        g.gain.setValueAtTime(0.001, now + 0.1 + idx * 0.06);
        g.gain.linearRampToValueAtTime(0.12, now + 0.14 + idx * 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + 0.1 + idx * 0.06);
        o.stop(now + 1.8);
      });
      return;
    }

    // Default: Cinema "Ta-Dum" hit (Deep Sub-Bass + High Shimmer)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const filter1 = ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(65, now); // Low C
    osc1.frequency.exponentialRampToValueAtTime(32, now + 1.6);

    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(450, now);
    filter1.frequency.exponentialRampToValueAtTime(80, now + 1.8);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.35, now + 0.15);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 2.3);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(523.25, now + 0.1); // C5
    osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.5); // C6 shimmer

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.12, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 1.9);

    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(130.81, now + 0.45); // C3
    gain3.gain.setValueAtTime(0.001, now + 0.45);
    gain3.gain.linearRampToValueAtTime(0.2, now + 0.55);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.45);
    osc3.stop(now + 2.5);
  } catch (err) {
    console.warn('Splash audio synthesis note:', err);
  }
};

export const SplashIntro: React.FC<SplashIntroProps> = ({ onComplete }) => {
  const { appBranding } = useApp();
  const theme = appBranding.splashTheme || 'cinematic_red';
  const soundTheme = appBranding.splashSoundTheme || 'cinema_tadum';
  const customAudioUrl = appBranding.splashCustomAudioUrl;
  const durationSeconds = appBranding.splashDurationSeconds || 3.2;

  const [progress, setProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(appBranding.splashSoundEnabled !== false);
  const [phase, setPhase] = useState<'initial' | 'impact' | 'reveal' | 'exit'>('initial');
  const soundTriggeredRef = useRef(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('impact');
      if (soundEnabled && !soundTriggeredRef.current) {
        soundTriggeredRef.current = true;
        playSplashSoundEffect(soundTheme, customAudioUrl);
      }
    }, 350);

    const t2 = setTimeout(() => {
      setPhase('reveal');
    }, 1100);

    // Progress counter
    const stepTime = (durationSeconds * 1000) / 28;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 6 + 3);
      });
    }, stepTime);

    // Auto complete
    const exitTimer = setTimeout(() => {
      setPhase('exit');
      setTimeout(() => {
        onComplete();
      }, 500);
    }, durationSeconds * 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        setPhase('exit');
        setTimeout(() => onComplete(), 150);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(exitTimer);
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete, soundEnabled, soundTheme, customAudioUrl, durationSeconds]);

  const handleManualSkip = () => {
    setPhase('exit');
    setTimeout(() => onComplete(), 150);
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      playSplashSoundEffect(soundTheme, customAudioUrl);
    }
  };

  // Theme visual parameters
  const getThemeStyles = () => {
    switch (theme) {
      case 'cyberpunk_neon':
        return {
          bgClass: 'bg-[#030712]',
          beamGradient: 'from-transparent via-cyan-400 to-transparent shadow-[0_0_45px_#22d3ee]',
          auraGradient: 'from-cyan-500/30 via-fuchsia-600/20 to-transparent',
          logoFrame: 'from-cyan-400 via-sky-500 to-fuchsia-700 shadow-cyan-500/50 border-cyan-300/50',
          titleGradient: 'from-cyan-200 via-white to-fuchsia-300',
          progressGradient: 'from-cyan-400 via-sky-500 to-fuchsia-500 shadow-[0_0_15px_#22d3ee]',
          badgeText: 'text-cyan-400',
          badgeBg: 'bg-cyan-950/60 border-cyan-500/30',
          accentText: 'text-cyan-400',
          statusLabel: 'CYBERSPACE ENGINE RUNTIME'
        };
      case 'golden_imax':
        return {
          bgClass: 'bg-[#080603]',
          beamGradient: 'from-transparent via-amber-400 to-transparent shadow-[0_0_45px_#fbbf24]',
          auraGradient: 'from-amber-500/35 via-yellow-700/20 to-transparent',
          logoFrame: 'from-amber-300 via-yellow-500 to-amber-950 shadow-amber-500/50 border-amber-300/60',
          titleGradient: 'from-amber-100 via-yellow-200 to-amber-500',
          progressGradient: 'from-amber-400 via-yellow-400 to-amber-600 shadow-[0_0_15px_#fbbf24]',
          badgeText: 'text-amber-400',
          badgeBg: 'bg-amber-950/60 border-amber-500/30',
          accentText: 'text-amber-400',
          statusLabel: 'IMAX PREMIERE MASTERING'
        };
      case 'anime_action':
        return {
          bgClass: 'bg-[#0a0505]',
          beamGradient: 'from-transparent via-orange-500 to-transparent shadow-[0_0_50px_#f97316]',
          auraGradient: 'from-red-600/40 via-orange-600/25 to-yellow-500/10',
          logoFrame: 'from-yellow-400 via-orange-500 to-red-900 shadow-orange-500/50 border-yellow-400/60',
          titleGradient: 'from-yellow-200 via-orange-100 to-red-400',
          progressGradient: 'from-yellow-400 via-orange-500 to-red-600 shadow-[0_0_15px_#f97316]',
          badgeText: 'text-orange-400',
          badgeBg: 'bg-orange-950/60 border-orange-500/30',
          accentText: 'text-orange-400',
          statusLabel: 'SHONEN STREAMING CHARGE'
        };
      case 'cinematic_red':
      default:
        return {
          bgClass: 'bg-[#050505]',
          beamGradient: 'from-transparent via-red-500 to-transparent shadow-[0_0_40px_#ef4444]',
          auraGradient: 'from-red-600/40 via-rose-700/20 to-transparent',
          logoFrame: 'from-red-500 via-rose-600 to-red-950 shadow-red-600/50 border-red-400/40',
          titleGradient: 'from-white via-zinc-100 to-zinc-400',
          progressGradient: 'from-red-600 via-rose-500 to-amber-400 shadow-[0_0_12px_#ef4444]',
          badgeText: 'text-red-400',
          badgeBg: 'bg-red-950/60 border-red-500/30',
          accentText: 'text-red-400',
          statusLabel: 'INITIALIZING THEATER'
        };
    }
  };

  const currentTheme = getThemeStyles();

  return (
    <AnimatePresence>
      {phase !== 'exit' && (
        <motion.div
          id="cinematic-splash-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08, filter: 'blur(14px)' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed inset-0 z-[99999] ${currentTheme.bgClass} text-white flex flex-col items-center justify-center overflow-hidden select-none`}
        >
          {/* Background Ambient Rays, Laser Grids & Light FX */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Anamorphic Beam */}
            <motion.div 
              initial={{ opacity: 0, scaleX: 0.2 }}
              animate={{ opacity: [0, 0.8, 0.45], scaleX: [0.2, 1.4, 1.2] }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[2px] bg-gradient-to-r ${currentTheme.beamGradient} blur-[1px]`}
            />

            {/* Pulsing Core Nebula */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.4, 1.3, 1], opacity: [0, 0.65, 0.4] }}
              transition={{ duration: 2.4, ease: 'easeOut' }}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-gradient-to-br ${currentTheme.auraGradient} blur-[110px]`}
            />

            {/* Special Anime Speedlines or Cyber Grid overlay */}
            {theme === 'cyberpunk_neon' && (
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d415_1px,transparent_1px),linear-gradient(to_bottom,#06b6d415_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />
            )}

            {theme === 'anime_action' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-15 bg-[radial-gradient(circle,rgba(249,115,22,0.6)_1px,transparent_1px)] bg-[size:28px_28px]"
              />
            )}

            {theme === 'golden_imax' && (
              <div className="absolute inset-0 bg-[radial-gradient(#fbbf2415_1px,transparent_1px)] [background-size:28px_28px] opacity-50" />
            )}

            {theme === 'cinematic_red' && (
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
            )}
          </div>

          {/* Top Controls: Sound Toggle & Skip Button */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
            <button
              id="splash-sound-toggle-btn"
              onClick={toggleSound}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white backdrop-blur-md transition-all cursor-pointer shadow-lg"
              title={soundEnabled ? 'Mute Intro Sound' : 'Enable Intro Sound'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className={`w-3.5 h-3.5 ${currentTheme.accentText} animate-pulse`} />
                  <span className="text-[11px]">Audio On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-[11px]">Audio Off</span>
                </>
              )}
            </button>

            <button
              id="splash-skip-btn"
              onClick={handleManualSkip}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            >
              <span>Skip Intro</span>
              <FastForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Central Logo & Branding Animation Stage */}
          <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center max-w-lg mx-auto">
            {/* Logo Container with 3D Reveal */}
            <motion.div
              initial={{ scale: 0.2, rotateY: 90, opacity: 0, filter: 'blur(16px)' }}
              animate={{ 
                scale: phase === 'initial' ? 0.6 : [0.6, 1.12, 1], 
                rotateY: 0, 
                opacity: 1, 
                filter: 'blur(0px)' 
              }}
              transition={{ 
                duration: 1.1, 
                ease: [0.19, 1, 0.22, 1] 
              }}
              className="relative mb-6"
            >
              {/* Outer Glowing Pulsing Ring */}
              <motion.div
                animate={{
                  scale: [1, 1.18, 1],
                  opacity: [0.5, 0.9, 0.5],
                  rotate: 360
                }}
                transition={{
                  scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 18, repeat: Infinity, ease: "linear" }
                }}
                className={`absolute -inset-4 rounded-3xl bg-gradient-to-tr ${currentTheme.auraGradient} blur-xl pointer-events-none`}
              />

              {/* Logo Frame */}
              <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-gradient-to-b ${currentTheme.logoFrame} shadow-2xl flex items-center justify-center overflow-hidden border`}>
                {appBranding.appLogoUrl ? (
                  <img
                    src={appBranding.appLogoUrl}
                    alt={appBranding.appName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-black via-zinc-900 to-zinc-950 rounded-2xl flex items-center justify-center">
                    {theme === 'cyberpunk_neon' && <Zap className="w-12 h-12 text-cyan-400 fill-cyan-400 drop-shadow-[0_0_15px_#22d3ee]" />}
                    {theme === 'golden_imax' && <CrownIcon className="w-12 h-12 text-amber-400 fill-amber-400 drop-shadow-[0_0_15px_#fbbf24]" />}
                    {theme === 'anime_action' && <Flame className="w-12 h-12 text-orange-400 fill-orange-400 drop-shadow-[0_0_15px_#f97316]" />}
                    {theme === 'cinematic_red' && <Play className="w-12 h-12 text-white fill-red-600 ml-1 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />}
                  </div>
                )}

                {/* Shimmer Light Sweep */}
                <motion.div
                  initial={{ x: '-150%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 1.6, delay: 0.7, ease: 'easeInOut' }}
                  className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 pointer-events-none"
                />
              </div>
            </motion.div>

            {/* App Name */}
            <motion.div
              initial={{ opacity: 0, y: 20, letterSpacing: '0.35em' }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                letterSpacing: '0.12em' 
              }}
              transition={{ duration: 1.0, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2 mb-3"
            >
              <h1 className={`text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b ${currentTheme.titleGradient} font-display tracking-wider uppercase drop-shadow-[0_4px_24px_rgba(255,255,255,0.2)]`}>
                {appBranding.appName || 'Movie Stream'}
              </h1>
            </motion.div>

            {/* Tagline / Badges */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col items-center gap-3 mb-8"
            >
              <p className="text-xs sm:text-sm text-zinc-400 font-medium max-w-sm leading-snug">
                {appBranding.appTagline || 'Premium 4K Movies & Anime Streaming Network'}
              </p>

              {/* Feature Chips */}
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full ${currentTheme.badgeBg} ${currentTheme.badgeText}`}>
                  <Sparkles className="w-2.5 h-2.5" />
                  Ultra HD 4K
                </span>
                <span className="text-zinc-600">•</span>
                <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full ${currentTheme.badgeBg} ${currentTheme.badgeText}`}>
                  <Film className="w-2.5 h-2.5" />
                  Movies
                </span>
                <span className="text-zinc-600">•</span>
                <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full ${currentTheme.badgeBg} ${currentTheme.badgeText}`}>
                  <Tv className="w-2.5 h-2.5" />
                  Anime
                </span>
              </div>
            </motion.div>

            {/* Progress Loader */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="w-full max-w-xs flex flex-col items-center gap-2"
            >
              <div className="w-full h-1.5 bg-zinc-900/90 rounded-full overflow-hidden p-0.5 border border-zinc-800/80 shadow-inner">
                <motion.div
                  className={`h-full bg-gradient-to-r ${currentTheme.progressGradient} rounded-full`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ ease: 'easeOut', duration: 0.2 }}
                />
              </div>

              <div className="flex items-center justify-between w-full text-[10px] text-zinc-500 font-mono font-semibold px-0.5">
                <span className="flex items-center gap-1 text-zinc-400">
                  <Clapperboard className={`w-3 h-3 ${currentTheme.accentText} animate-pulse`} />
                  {currentTheme.statusLabel}
                </span>
                <span className={`${currentTheme.accentText} font-bold`}>{Math.min(progress, 100)}%</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Watermark */}
          <div className="absolute bottom-6 text-[11px] text-zinc-600 font-mono tracking-widest uppercase flex items-center gap-2">
            <span>Dolby Vision</span>
            <span>•</span>
            <span>Spatial Audio</span>
            <span>•</span>
            <span>CineEngine v4</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CrownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V17H19V19Z"/>
  </svg>
);
