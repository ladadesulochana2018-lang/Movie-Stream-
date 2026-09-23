import React, { useState } from 'react';
import { 
  Flame, 
  Sparkles, 
  Film, 
  Zap, 
  Star, 
  Tv,
  Crown,
  Heart,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CharacterItem } from '../types';

export const CharacterArchCarousel: React.FC = () => {
  const { 
    characters, 
    appBranding,
    setSearchQuery, 
    setSelectedGenre, 
    setSelectedLetter
  } = useApp();

  const [isPaused, setIsPaused] = useState(false);

  const handleCharacterClick = (char: CharacterItem) => {
    setSelectedLetter('All');
    setSelectedGenre('All');
    setSearchQuery(char.searchKeyword);

    // Smooth scroll to results
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Dynamic Icon selector
  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'film':
        return <Film className="w-5 h-5" />;
      case 'zap':
        return <Zap className="w-5 h-5" />;
      case 'star':
        return <Star className="w-5 h-5" />;
      case 'tv':
        return <Tv className="w-5 h-5" />;
      case 'crown':
        return <Crown className="w-5 h-5" />;
      case 'heart':
        return <Heart className="w-5 h-5" />;
      case 'compass':
        return <Compass className="w-5 h-5" />;
      case 'flame':
      default:
        return <Flame className="w-5 h-5" />;
    }
  };

  const title = appBranding.characterSectionTitle || 'Character & Toon Universes';
  const subtitle = appBranding.characterSectionSubtitle || 'Click any character arch to explore movies, anime episodes and series';
  const logoUrl = appBranding.characterSectionLogoUrl;
  const iconKey = appBranding.characterSectionIcon || 'flame';

  // Ensure there are enough items for a seamless continuous loop
  const listToLoop = characters.length > 0 ? characters : [];
  const displayItems = listToLoop.length < 8 
    ? [...listToLoop, ...listToLoop, ...listToLoop] 
    : [...listToLoop, ...listToLoop];

  return (
    <section className="relative w-full py-4 overflow-hidden text-left select-none">
      
      {/* Header section with Dynamic Title, Subtitle and Logo/Icon */}
      <div className="flex items-center justify-between gap-3 mb-3 px-2">
        <div className="flex items-center gap-2.5">
          {logoUrl ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/50 border border-zinc-800 p-0.5 shrink-0 shadow-lg shadow-red-600/20">
              <img 
                src={logoUrl} 
                alt="Character Section Logo" 
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 text-white shadow-lg shadow-red-600/30 shrink-0">
              {renderIcon(iconKey)}
            </div>
          )}
          
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white font-display tracking-wide">
              {title}
            </h2>
            <p className="text-xs text-zinc-400">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Infinite Continuous Carousel Wrapper */}
      <div 
        className="relative w-full overflow-hidden py-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Ambient Gradient Masks on Left & Right Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none" />

        {/* The Continuous Infinite Sliding Strip */}
        <div 
          className="flex gap-4 sm:gap-6 animate-continuous-scroll"
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {displayItems.map((char, index) => (
            <div
              key={`${char.id}-${index}`}
              onClick={() => handleCharacterClick(char)}
              className="group relative flex-shrink-0 cursor-pointer transition-all duration-300 hover:scale-105"
              style={{ width: '145px' }}
            >
              {/* Outer Glow container */}
              <div className="relative w-full flex flex-col items-center pt-3">
                {/* DOME / ARCHED CARD BACKGROUND */}
                <div 
                  className={`relative w-[130px] sm:w-[140px] h-[175px] sm:h-[190px] rounded-t-[65px] sm:rounded-t-[70px] bg-gradient-to-b ${char.domeColor} overflow-hidden shadow-2xl border border-white/10 group-hover:border-white/30 transition-all`}
                  style={{
                    boxShadow: `0 10px 25px -5px ${char.glowColor || 'rgba(0,0,0,0.5)'}`
                  }}
                >
                  {/* Subtle Inner Glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />

                  {/* Arched Ground / Semicircle Base */}
                  <div 
                    className="absolute -bottom-6 inset-x-[-15%] h-20 rounded-t-full opacity-90 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: char.groundColor }}
                  />

                  {/* Character Illustration / Cutout overlapping the Dome */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img 
                      src={char.characterImg} 
                      alt={char.name}
                      className="w-full h-full object-cover object-top filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.7)] group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.opacity = '0.7';
                      }}
                    />
                  </div>

                  {/* Radial shine light on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 group-hover:via-white/15 to-transparent transition-opacity duration-300" />
                </div>

                {/* BLACK LABEL PILL AT BOTTOM */}
                <div className="relative -mt-3.5 z-10">
                  <div className="px-3.5 py-1.5 rounded-xl bg-black border border-zinc-700/80 shadow-2xl group-hover:border-red-500 group-hover:bg-zinc-950 transition-all duration-300 flex items-center justify-center">
                    <span className="text-[11px] sm:text-xs font-black text-white tracking-wider uppercase font-display whitespace-nowrap drop-shadow">
                      {char.name}
                    </span>
                  </div>
                </div>

                {/* Subtitle tag on hover */}
                <span className="text-[10px] font-semibold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  {char.franchise}
                </span>

              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
