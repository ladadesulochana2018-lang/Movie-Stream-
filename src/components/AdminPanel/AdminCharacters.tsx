import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Layers,
  Image as ImageIcon,
  ExternalLink,
  Flame,
  Check,
  Film,
  Zap,
  Star,
  Tv,
  Crown,
  Heart,
  Compass,
  Upload,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CharacterItem } from '../../types';
import { CharacterModal } from '../CharacterModal';
import { saveMediaBlob } from '../../utils/persistentStorage';

const PRESET_QUICK_CHARACTERS = [
  { name: 'POKEMON PIKACHU', franchise: 'Pokemon Masters', search: 'Pokemon', img: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=500&q=80', dome: 'from-[#d97706] to-[#78350f]', ground: '#eab308' },
  { name: 'JUJUTSU KAISEN', franchise: 'Jujutsu High Special Grade', search: 'Jujutsu', img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80', dome: 'from-[#312e81] to-[#0f172a]', ground: '#dc2626' },
  { name: 'SOLO LEVELING', franchise: 'Shadow Monarch Arise', search: 'Solo Leveling', img: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&q=80', dome: 'from-[#1e40af] to-[#020617]', ground: '#8b5cf6' },
  { name: 'SHINCHAN', franchise: 'Kasukabe Defense Force', search: 'Shinchan', img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&q=80', dome: 'from-[#b91c1c] to-[#450a0a]', ground: '#facc15' },
  { name: 'OGGY & COCKROACHES', franchise: 'Cartoon Slapstick', search: 'Oggy', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80', dome: 'from-[#0284c7] to-[#1e293b]', ground: '#3b82f6' },
  { name: 'CHHOTA BHEEM', franchise: 'Dholakpur Warriors', search: 'Chhota Bheem', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80', dome: 'from-[#c2410c] to-[#7c2d12]', ground: '#ea580c' },
  { name: 'DEATH NOTE', franchise: 'Kira vs L Mystery', search: 'Death Note', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80', dome: 'from-[#374151] to-[#111827]', ground: '#dc2626' },
  { name: 'SPIDERMAN', franchise: 'Marvel Web Warriors', search: 'Spider-Man', img: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&q=80', dome: 'from-[#1e3a8a] to-[#0f172a]', ground: '#dc2626' },
  { name: 'BEN 10', franchise: 'Alien Force Omnitrix', search: 'Ben 10', img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&q=80', dome: 'from-[#047857] to-[#064e3b]', ground: '#22c55e' },
  { name: 'TRANSFORMERS', franchise: 'Autobots Cybertron', search: 'Transformers', img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80', dome: 'from-[#312e81] to-[#18181b]', ground: '#eab308' },
  { name: 'DRAGON BALL', franchise: 'Super Saiyan Warriors', search: 'Dragon Ball', img: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&q=80', dome: 'from-[#d97706] to-[#78350f]', ground: '#fbbf24' },
  { name: 'NARUTO', franchise: 'Hidden Leaf Ninja', search: 'Naruto', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80', dome: 'from-[#c2410c] to-[#7c2d12]', ground: '#f97316' },
  { name: 'ONE PIECE', franchise: 'Straw Hat Pirates', search: 'One Piece', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80', dome: 'from-[#b91c1c] to-[#450a0a]', ground: '#f59e0b' },
  { name: 'DEMON SLAYER', franchise: 'Kimetsu no Yaiba', search: 'Demon Slayer', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80', dome: 'from-[#0f766e] to-[#134e4a]', ground: '#14b8a6' },
  { name: 'ATTACK ON TITAN', franchise: 'Survey Corps Titans', search: 'Attack on Titan', img: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=500&q=80', dome: 'from-[#374151] to-[#111827]', ground: '#84cc16' },
  { name: 'DORAEMON', franchise: 'Gadget Cat 22nd Century', search: 'Doraemon', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80', dome: 'from-[#0369a1] to-[#1e293b]', ground: '#60a5fa' },
  { name: 'BEYBLADE', franchise: 'Burst Turbo Spin', search: 'Beyblade', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80', dome: 'from-[#0284c7] to-[#0c4a6e]', ground: '#38bdf8' },
  { name: 'SLUGTERRA', franchise: 'Slugterra Caverns', search: 'Slugterra', img: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&q=80', dome: 'from-[#1e40af] to-[#172554]', ground: '#ea580c' }
];

export const AdminCharacters: React.FC = () => {
  const { 
    characters, 
    addCharacter, 
    updateCharacter, 
    deleteCharacter, 
    resetCharactersToDefault, 
    setSelectedCategory, 
    setSearchQuery, 
    setCurrentView,
    appBranding,
    updateAppBranding
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<CharacterItem | null>(null);

  // Section Header Branding States
  const [sectionTitleInput, setSectionTitleInput] = useState(appBranding.characterSectionTitle || 'Character & Toon Universes');
  const [sectionSubtitleInput, setSectionSubtitleInput] = useState(appBranding.characterSectionSubtitle || 'Click any character arch to explore movies, anime episodes and series');
  const [sectionLogoUrlInput, setSectionLogoUrlInput] = useState(appBranding.characterSectionLogoUrl || '');
  const [sectionIconInput, setSectionIconInput] = useState(appBranding.characterSectionIcon || 'flame');
  const [headerSavedSuccess, setHeaderSavedSuccess] = useState(false);
  const [isUploadingHeaderLogo, setIsUploadingHeaderLogo] = useState(false);
  const headerLogoFileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when appBranding changes
  useEffect(() => {
    setSectionTitleInput(appBranding.characterSectionTitle || 'Character & Toon Universes');
    setSectionSubtitleInput(appBranding.characterSectionSubtitle || 'Click any character arch to explore movies, anime episodes and series');
    setSectionLogoUrlInput(appBranding.characterSectionLogoUrl || '');
    setSectionIconInput(appBranding.characterSectionIcon || 'flame');
  }, [appBranding.characterSectionTitle, appBranding.characterSectionSubtitle, appBranding.characterSectionLogoUrl, appBranding.characterSectionIcon]);

  const handleSaveHeaderBranding = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateAppBranding({
      characterSectionTitle: sectionTitleInput.trim() || 'Character & Toon Universes',
      characterSectionSubtitle: sectionSubtitleInput.trim() || 'Click any character arch to explore movies, anime episodes and series',
      characterSectionLogoUrl: sectionLogoUrlInput.trim(),
      characterSectionIcon: sectionIconInput
    });
    setHeaderSavedSuccess(true);
    setTimeout(() => setHeaderSavedSuccess(false), 2500);
  };

  const handleHeaderLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('Logo file exceeds 25MB. Please choose a smaller image.');
      return;
    }

    setIsUploadingHeaderLogo(true);
    try {
      const blobUrl = URL.createObjectURL(file);
      await saveMediaBlob('character_header_logo', file, { type: 'image', name: file.name });
      setSectionLogoUrlInput(blobUrl);
      updateAppBranding({
        characterSectionLogoUrl: blobUrl
      });
      setHeaderSavedSuccess(true);
      setTimeout(() => setHeaderSavedSuccess(false), 2500);
    } catch (err: any) {
      console.error('Failed to upload character section logo:', err);
      alert('Failed to process image: ' + (err?.message || 'Error'));
    } finally {
      setIsUploadingHeaderLogo(false);
    }
  };

  const ICON_OPTIONS = [
    { key: 'flame', label: 'Flame / Hot', icon: Flame },
    { key: 'sparkles', label: 'Sparkles', icon: Sparkles },
    { key: 'tv', label: 'TV / Toon', icon: Tv },
    { key: 'film', label: 'Cinema / Film', icon: Film },
    { key: 'zap', label: 'Lightning / Zap', icon: Zap },
    { key: 'star', label: 'Star VIP', icon: Star },
    { key: 'crown', label: 'Crown / Royal', icon: Crown },
    { key: 'compass', label: 'Universe Compass', icon: Compass }
  ];

  // Custom Red Slider states for Presets container
  const [presetsScrollProgress, setPresetsScrollProgress] = useState(0);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const presetsScrollRef = useRef<HTMLDivElement>(null);
  const sliderTrackRef = useRef<HTMLDivElement>(null);

  const filteredCharacters = characters.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.franchise.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.searchKeyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Scroll sync for preset slider
  const handlePresetsScroll = useCallback(() => {
    if (!presetsScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = presetsScrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      const progress = Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100));
      setPresetsScrollProgress(progress);
    }
  }, []);

  useEffect(() => {
    const el = presetsScrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handlePresetsScroll, { passive: true });
    handlePresetsScroll();
    return () => el.removeEventListener('scroll', handlePresetsScroll);
  }, [handlePresetsScroll]);

  const scrollPresets = (direction: 'left' | 'right') => {
    if (!presetsScrollRef.current) return;
    const scrollAmount = 240;
    presetsScrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleSliderInteraction = (clientX: number) => {
    if (!sliderTrackRef.current || !presetsScrollRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const ratio = clickX / rect.width;
    const { scrollWidth, clientWidth } = presetsScrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    presetsScrollRef.current.scrollTo({
      left: ratio * maxScroll,
      behavior: 'smooth'
    });
  };

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    setIsDraggingSlider(true);
    handleSliderInteraction(e.clientX);
  };

  const handleSliderMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingSlider) return;
    handleSliderInteraction(e.clientX);
  };

  const handleSliderMouseUp = () => {
    setIsDraggingSlider(false);
  };

  const handleOpenAdd = () => {
    setEditingCharacter(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (char: CharacterItem) => {
    setEditingCharacter(char);
    setIsModalOpen(true);
  };

  const handleSave = (charData: Omit<CharacterItem, 'id'> | CharacterItem) => {
    if ('id' in charData && charData.id) {
      updateCharacter(charData.id, charData);
    } else {
      addCharacter(charData);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the carousel?`)) {
      deleteCharacter(id);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all character arches to default initial list?')) {
      resetCharactersToDefault();
    }
  };

  const handleTestUniverse = (char: CharacterItem) => {
    setSearchQuery(char.searchKeyword);
    setSelectedCategory('All');
    setCurrentView('movies');
  };

  return (
    <div 
      className="space-y-6 select-none"
      onMouseUp={handleSliderMouseUp}
      onMouseLeave={handleSliderMouseUp}
    >
      
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Toonstream Style Character Arch Universe
          </div>
          <h2 className="text-2xl font-black text-white font-display">
            Characters & Universes Manager
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage continuous round carousel arches, custom images, dome gradients & 1-click filter links.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Character & Image
          </button>
        </div>
      </div>

      {/* ⭐ SECTION LOGO, TITLE & DESCRIPTION CUSTOMIZATION CARD ⭐ */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white font-display">
                Section Header Branding (Logo, Title & Description)
              </h3>
              <p className="text-[11px] text-zinc-400">
                Change the Logo Icon, Main Heading Name, and Subtitle Description shown above the Character Carousel.
              </p>
            </div>
          </div>

          {headerSavedSuccess && (
            <div className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved & Updated Live!
            </div>
          )}
        </div>

        {/* Live Header Preview Bar */}
        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3">
          <div className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider shrink-0 hidden sm:block">
            Live Preview:
          </div>
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {sectionLogoUrlInput ? (
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-black/60 border border-zinc-700 p-0.5 shrink-0 shadow-md">
                <img 
                  src={sectionLogoUrlInput} 
                  alt="Section Logo" 
                  className="w-full h-full object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 text-white shadow-md shrink-0">
                {(() => {
                  const CurrentIcon = ICON_OPTIONS.find(i => i.key === sectionIconInput)?.icon || Flame;
                  return <CurrentIcon className="w-4 h-4" />;
                })()}
              </div>
            )}
            <div className="min-w-0">
              <h4 className="text-sm font-black text-white truncate">
                {sectionTitleInput || 'Character & Toon Universes'}
              </h4>
              <p className="text-[11px] text-zinc-400 truncate">
                {sectionSubtitleInput || 'Click any character arch to explore movies, anime episodes and series'}
              </p>
            </div>
          </div>
        </div>

        {/* Inputs Form */}
        <form onSubmit={handleSaveHeaderBranding} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Section Title Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Edit3 className="w-3 h-3 text-red-500" /> Section Title / Heading Name
            </label>
            <input
              type="text"
              placeholder="e.g. Character & Toon Universes, Anime Heroes, Cartoon World..."
              value={sectionTitleInput}
              onChange={(e) => setSectionTitleInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-red-500 text-white text-xs font-bold focus:outline-none transition-all placeholder-zinc-600"
            />
          </div>

          {/* Section Subtitle Description Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Edit3 className="w-3 h-3 text-red-500" /> Description / Subtitle
            </label>
            <input
              type="text"
              placeholder="e.g. Click any character arch to explore movies, anime episodes and series"
              value={sectionSubtitleInput}
              onChange={(e) => setSectionSubtitleInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-red-500 text-white text-xs focus:outline-none transition-all placeholder-zinc-600"
            />
          </div>

          {/* Custom Section Logo (File Upload or Image URL) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3 h-3 text-red-500" /> Custom Section Logo / Image
              </span>
              {sectionLogoUrlInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSectionLogoUrlInput('');
                    updateAppBranding({ characterSectionLogoUrl: '' });
                  }}
                  className="text-[10px] text-zinc-500 hover:text-red-400 font-bold transition-colors cursor-pointer"
                >
                  Remove Logo (Use Icon)
                </button>
              )}
            </label>

            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/logo.png (or upload below)"
                value={sectionLogoUrlInput}
                onChange={(e) => setSectionLogoUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-red-500 text-white text-xs focus:outline-none transition-all placeholder-zinc-600"
              />

              <label 
                htmlFor="character-section-logo-upload"
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition-all border border-zinc-700"
              >
                {isUploadingHeaderLogo ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </>
                )}
              </label>
              <input
                id="character-section-logo-upload"
                type="file"
                ref={headerLogoFileInputRef}
                accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.gif"
                onChange={handleHeaderLogoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Default Icon Selector (if no custom logo uploaded) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-amber-500" /> Choose Default Section Icon
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {ICON_OPTIONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = sectionIconInput === item.key && !sectionLogoUrlInput;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setSectionIconInput(item.key);
                      setSectionLogoUrlInput('');
                    }}
                    className={`p-1.5 rounded-xl border text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
                      isSelected
                        ? 'bg-red-600/30 border-red-500 text-red-300 shadow-sm shadow-red-600/20'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                    title={item.label}
                  >
                    <IconComponent className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.label.split('/')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Row */}
          <div className="md:col-span-2 flex justify-end pt-1">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-3.5 h-3.5" /> Save Section Title & Logo
            </button>
          </div>
        </form>
      </div>

      {/* Quick Add Presets Section with Custom Red Slider Bar (Matching User's Request) */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            QUICK 1-CLICK CHARACTER PRESETS (CLICK TO ADD):
          </span>
          <button
            onClick={handleOpenAdd}
            className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Custom Upload Form
          </button>
        </div>

        {/* Horizontal Presets Buttons Container */}
        <div 
          ref={presetsScrollRef}
          className="flex gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth"
        >
          {PRESET_QUICK_CHARACTERS.map((preset) => {
            const alreadyAdded = characters.some(c => c.name.toUpperCase() === preset.name.toUpperCase());
            return (
              <button
                key={preset.name}
                onClick={() => {
                  if (alreadyAdded) {
                    alert(`${preset.name} is already in your carousel!`);
                    return;
                  }
                  addCharacter({
                    name: preset.name,
                    franchise: preset.franchise,
                    searchKeyword: preset.search,
                    characterImg: preset.img,
                    domeColor: preset.dome,
                    groundColor: preset.ground,
                    glowColor: 'rgba(220, 38, 38, 0.4)'
                  });
                }}
                disabled={alreadyAdded}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  alreadyAdded 
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:text-white hover:border-red-500 hover:bg-zinc-850 shadow-sm'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${alreadyAdded ? 'bg-zinc-600' : 'bg-red-500'}`} />
                <span>+ {preset.name}</span>
                {alreadyAdded && <span className="text-[10px] text-zinc-500 font-normal">(Added)</span>}
              </button>
            );
          })}
        </div>

        {/* ⭐ EXACT CUSTOM SLIDE BAR FOR PRESETS (From User Image) ⭐ */}
        <div className="w-full flex items-center gap-2.5 pt-1">
          
          {/* Left Arrow Button ◀ */}
          <button
            type="button"
            onClick={() => scrollPresets('left')}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-red-500 hover:text-red-400 active:scale-90 transition-all cursor-pointer p-0"
            aria-label="Slide Left"
            title="Scroll Left"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <polygon points="18,4 6,12 18,20" />
            </svg>
          </button>

          {/* Slider Bar Track (matching user image with rounded pill border) */}
          <div 
            ref={sliderTrackRef}
            onMouseDown={handleSliderMouseDown}
            onMouseMove={handleSliderMouseMove}
            className="relative flex-1 h-3.5 bg-zinc-950 border border-zinc-700 hover:border-zinc-500 rounded-full cursor-pointer overflow-hidden p-0.5 transition-colors shadow-inner"
          >
            {/* Red Sliding Capsule Thumb */}
            <div 
              className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 shadow-[0_0_10px_rgba(220,38,38,0.7)] transition-all duration-100"
              style={{
                width: '26%',
                marginLeft: `${presetsScrollProgress * 0.74}%`
              }}
            />
          </div>

          {/* Right Arrow Button ▶ */}
          <button
            type="button"
            onClick={() => scrollPresets('right')}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-red-500 hover:text-red-400 active:scale-90 transition-all cursor-pointer p-0"
            aria-label="Slide Right"
            title="Scroll Right"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <polygon points="6,4 18,12 6,20" />
            </svg>
          </button>

        </div>

      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-900">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, franchise, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400 font-semibold">
          <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-bold">
            Total Active Cards: <span className="text-red-500">{characters.length}</span>
          </span>
        </div>
      </div>

      {/* Characters Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredCharacters.map((char) => (
          <div 
            key={char.id}
            className="group relative p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col items-center shadow-lg overflow-hidden"
          >
            
            {/* Quick Action Overlay Buttons */}
            <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => handleOpenEdit(char)}
                title="Edit Character"
                className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(char.id, char.name)}
                title="Delete Character"
                className="p-1 rounded-lg bg-red-950 hover:bg-red-900 text-red-400 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dome Mini Card Representation */}
            <div className="pt-2 flex flex-col items-center">
              <div 
                className={`relative w-[100px] h-[135px] rounded-t-[50px] bg-gradient-to-b ${char.domeColor} overflow-hidden shadow-lg border border-white/20`}
              >
                {/* Curved Hill */}
                <div 
                  className="absolute -bottom-4 inset-x-[-15%] h-14 rounded-t-full opacity-90"
                  style={{ backgroundColor: char.groundColor }}
                />

                {/* Character Cutout */}
                <img 
                  src={char.characterImg} 
                  alt={char.name}
                  className="absolute inset-0 w-full h-full object-cover object-top filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.7)]"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Black Label Pill */}
              <div className="relative -mt-3 z-10">
                <div className="px-2.5 py-1 rounded-lg bg-black border border-zinc-700 shadow-xl min-w-[75px] text-center">
                  <span className="text-[9px] font-black text-white tracking-wider uppercase font-display whitespace-nowrap">
                    {char.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Franchise Info */}
            <div className="w-full mt-2.5 text-center">
              <p className="text-[11px] font-bold text-zinc-300 truncate">
                {char.franchise}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">
                Tag: #{char.searchKeyword}
              </p>
            </div>

            {/* Quick Test / Filter Button */}
            <button
              onClick={() => handleTestUniverse(char)}
              className="mt-3 w-full py-1.5 rounded-xl bg-zinc-900 hover:bg-red-600 text-zinc-400 hover:text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" /> Test Universe
            </button>

          </div>
        ))}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-zinc-950 border border-zinc-900 space-y-3">
          <ImageIcon className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-zinc-300">No Characters Found</h3>
          <p className="text-xs text-zinc-500">
            {searchTerm ? 'No characters match your search query.' : 'Click "Add New Character & Image" to add your first character card.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Character
          </button>
        </div>
      )}

      {/* Add / Edit Character Modal */}
      <CharacterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        characterToEdit={editingCharacter}
      />

    </div>
  );
};
