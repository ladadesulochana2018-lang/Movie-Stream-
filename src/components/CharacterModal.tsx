import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  Check, 
  Eye, 
  Link2, 
  FolderUp, 
  Palette, 
  Trash2,
  RefreshCw,
  Search,
  Edit3
} from 'lucide-react';
import { CharacterItem } from '../types';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (charData: Omit<CharacterItem, 'id'> | CharacterItem) => void;
  characterToEdit?: CharacterItem | null;
}

const PRESET_DOME_GRADIENTS = [
  { label: 'Deep Blue', class: 'from-[#1e40af] to-[#172554]', ground: '#ea580c', glow: 'rgba(30, 64, 175, 0.4)' },
  { label: 'Crimson Red', class: 'from-[#1e3a8a] to-[#0f172a]', ground: '#dc2626', glow: 'rgba(220, 38, 38, 0.4)' },
  { label: 'Cyber Violet', class: 'from-[#312e81] to-[#18181b]', ground: '#eab308', glow: 'rgba(234, 179, 8, 0.4)' },
  { label: 'Alien Emerald', class: 'from-[#047857] to-[#064e3b]', ground: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)' },
  { label: 'Sky Cyan', class: 'from-[#0284c7] to-[#0c4a6e]', ground: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)' },
  { label: 'Prehistoric Ocean', class: 'from-[#0369a1] to-[#1e293b]', ground: '#60a5fa', glow: 'rgba(96, 165, 250, 0.4)' },
  { label: 'Ninja Ember', class: 'from-[#c2410c] to-[#7c2d12]', ground: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' },
  { label: 'Pirate Ruby', class: 'from-[#b91c1c] to-[#450a0a]', ground: '#f59e0b', glow: 'rgba(185, 28, 28, 0.4)' },
  { label: 'Saiyan Gold', class: 'from-[#d97706] to-[#78350f]', ground: '#fbbf24', glow: 'rgba(217, 119, 6, 0.4)' },
  { label: 'Hashira Teal', class: 'from-[#0f766e] to-[#134e4a]', ground: '#14b8a6', glow: 'rgba(20, 184, 166, 0.4)' },
  { label: 'Titan Obsidian', class: 'from-[#374151] to-[#111827]', ground: '#84cc16', glow: 'rgba(132, 204, 22, 0.4)' }
];

// Rich Curated Cutouts Gallery with high-res transparent/character visuals
const CHARACTER_CUTOUTS_GALLERY = [
  { 
    name: 'SLUGTERRA', 
    franchise: 'Slugterra Caverns', 
    search: 'Slugterra', 
    img: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&q=80', 
    dome: 'from-[#1e40af] to-[#172554]', 
    ground: '#ea580c' 
  },
  { 
    name: 'SPIDERMAN', 
    franchise: 'Marvel Universe', 
    search: 'Spider-Man', 
    img: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&q=80', 
    dome: 'from-[#1e3a8a] to-[#0f172a]', 
    ground: '#dc2626' 
  },
  { 
    name: 'TRANSFORMERS', 
    franchise: 'Autobots Cybertron', 
    search: 'Transformers', 
    img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80', 
    dome: 'from-[#312e81] to-[#18181b]', 
    ground: '#eab308' 
  },
  { 
    name: 'BEN 10', 
    franchise: 'Alien Force Omnitrix', 
    search: 'Ben 10', 
    img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&q=80', 
    dome: 'from-[#047857] to-[#064e3b]', 
    ground: '#22c55e' 
  },
  { 
    name: 'BEYBLADE', 
    franchise: 'Beyblade Burst Turbo', 
    search: 'Beyblade', 
    img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80', 
    dome: 'from-[#0284c7] to-[#0c4a6e]', 
    ground: '#38bdf8' 
  },
  { 
    name: 'DORAEMON', 
    franchise: 'Gadget Cat 22nd Century', 
    search: 'Doraemon', 
    img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80', 
    dome: 'from-[#0369a1] to-[#1e293b]', 
    ground: '#60a5fa' 
  },
  { 
    name: 'NARUTO', 
    franchise: 'Hidden Leaf Ninja', 
    search: 'Naruto', 
    img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80', 
    dome: 'from-[#c2410c] to-[#7c2d12]', 
    ground: '#f97316' 
  },
  { 
    name: 'ONE PIECE', 
    franchise: 'Straw Hat Pirates', 
    search: 'One Piece', 
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80', 
    dome: 'from-[#b91c1c] to-[#450a0a]', 
    ground: '#f59e0b' 
  },
  { 
    name: 'DRAGON BALL', 
    franchise: 'Super Saiyan Warriors', 
    search: 'Dragon Ball', 
    img: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&q=80', 
    dome: 'from-[#d97706] to-[#78350f]', 
    ground: '#fbbf24' 
  },
  { 
    name: 'DEMON SLAYER', 
    franchise: 'Kimetsu no Yaiba', 
    search: 'Demon Slayer', 
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80', 
    dome: 'from-[#0f766e] to-[#134e4a]', 
    ground: '#14b8a6' 
  },
  { 
    name: 'POKEMON PIKACHU', 
    franchise: 'Pokemon Masters', 
    search: 'Pokemon', 
    img: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=500&q=80', 
    dome: 'from-[#d97706] to-[#78350f]', 
    ground: '#eab308' 
  },
  { 
    name: 'JUJUTSU KAISEN', 
    franchise: 'Jujutsu High Special Grade', 
    search: 'Jujutsu', 
    img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80', 
    dome: 'from-[#312e81] to-[#0f172a]', 
    ground: '#dc2626' 
  },
  { 
    name: 'SOLO LEVELING', 
    franchise: 'Shadow Monarch Arise', 
    search: 'Solo Leveling', 
    img: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&q=80', 
    dome: 'from-[#1e40af] to-[#020617]', 
    ground: '#8b5cf6' 
  },
  { 
    name: 'ATTACK ON TITAN', 
    franchise: 'Survey Corps Titans', 
    search: 'Attack on Titan', 
    img: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=500&q=80', 
    dome: 'from-[#374151] to-[#111827]', 
    ground: '#84cc16' 
  },
  { 
    name: 'OGGY & COCKROACHES', 
    franchise: 'Cartoon Slapstick', 
    search: 'Oggy', 
    img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80', 
    dome: 'from-[#0284c7] to-[#1e293b]', 
    ground: '#3b82f6' 
  },
  { 
    name: 'SHINCHAN', 
    franchise: 'Kasukabe Defense Force', 
    search: 'Shinchan', 
    img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&q=80', 
    dome: 'from-[#b91c1c] to-[#450a0a]', 
    ground: '#facc15' 
  }
];

export const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  characterToEdit
}) => {
  const [name, setName] = useState(characterToEdit?.name || '');
  const [franchise, setFranchise] = useState(characterToEdit?.franchise || '');
  const [searchKeyword, setSearchKeyword] = useState(characterToEdit?.searchKeyword || '');
  const [characterImg, setCharacterImg] = useState(characterToEdit?.characterImg || '');
  const [domeColor, setDomeColor] = useState(characterToEdit?.domeColor || PRESET_DOME_GRADIENTS[0].class);
  const [groundColor, setGroundColor] = useState(characterToEdit?.groundColor || PRESET_DOME_GRADIENTS[0].ground);
  const [glowColor, setGlowColor] = useState(characterToEdit?.glowColor || PRESET_DOME_GRADIENTS[0].glow);
  
  // 3 Image Options Selection Tab: 'upload' | 'url' | 'gallery'
  const [imageOptionTab, setImageOptionTab] = useState<'upload' | 'url' | 'gallery'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [galleryFilter, setGalleryFilter] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Sync state if editing
  React.useEffect(() => {
    if (characterToEdit) {
      setName(characterToEdit.name);
      setFranchise(characterToEdit.franchise);
      setSearchKeyword(characterToEdit.searchKeyword);
      setCharacterImg(characterToEdit.characterImg);
      setDomeColor(characterToEdit.domeColor);
      setGroundColor(characterToEdit.groundColor);
      setGlowColor(characterToEdit.glowColor);
      setUploadedFileName('');
    } else {
      setName('');
      setFranchise('');
      setSearchKeyword('');
      setCharacterImg('');
      setDomeColor(PRESET_DOME_GRADIENTS[0].class);
      setGroundColor(PRESET_DOME_GRADIENTS[0].ground);
      setGlowColor(PRESET_DOME_GRADIENTS[0].glow);
      setUploadedFileName('');
    }
  }, [characterToEdit, isOpen]);

  // Focus name input when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Option 1: File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP, GIF, SVG).');
      return;
    }

    setIsUploading(true);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCharacterImg(event.target.result as string);
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      alert('Error reading image file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Option 3: Gallery item selection
  const handleSelectFromGallery = (item: typeof CHARACTER_CUTOUTS_GALLERY[0]) => {
    setCharacterImg(item.img);
    setName(item.name);
    setFranchise(item.franchise);
    setSearchKeyword(item.search);
    setDomeColor(item.dome);
    setGroundColor(item.ground);
  };

  const handleClearImage = () => {
    setCharacterImg('');
    setUploadedFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a character/series name');
      nameInputRef.current?.focus();
      return;
    }
    if (!characterImg.trim()) {
      alert('Please provide an image using one of the 3 options (Upload, URL, or Gallery)');
      return;
    }

    const payload = {
      ...(characterToEdit ? { id: characterToEdit.id } : {}),
      name: name.trim().toUpperCase(),
      franchise: franchise.trim() || `${name.trim()} Universe`,
      searchKeyword: searchKeyword.trim() || name.trim(),
      characterImg: characterImg.trim(),
      domeColor,
      groundColor,
      glowColor
    };

    onSave(payload as any);
    onClose();
  };

  const filteredGallery = CHARACTER_CUTOUTS_GALLERY.filter(item => 
    item.name.toLowerCase().includes(galleryFilter.toLowerCase()) ||
    item.franchise.toLowerCase().includes(galleryFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden my-8 text-left">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-display">
                {characterToEdit ? 'Edit Character Card' : 'Add New Character & Universe'}
              </h2>
              <p className="text-xs text-zinc-400">
                Toonstream Arched Dome Card with 3 Image Upload Options
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form & Live Preview */}
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Form Inputs (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Character Name & Franchise */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Character / Universe Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. BEN 10, SPIDERMAN, DRAGON BALL"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!searchKeyword) setSearchKeyword(e.target.value);
                  }}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500 transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Subtitle / Franchise Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alien Force Omnitrix"
                  value={franchise}
                  onChange={(e) => setFranchise(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500 transition-all"
                />
              </div>
            </div>

            {/* Search Keyword Filter */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                Search & Filter Keyword <span className="text-zinc-500 font-normal">(Card click filters matching anime / movies)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ben 10, Spider-Man, Naruto"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500 transition-all"
              />
            </div>

            {/* ⭐ 3 IMAGE ADD OPTIONS TABS (Admin Special) ⭐ */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-red-500" />
                  Select Image Mode (3 Options):
                </label>
                {characterImg && (
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Image
                  </button>
                )}
              </div>

              {/* 3 Tabs Selection */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setImageOptionTab('upload')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
                    imageOptionTab === 'upload'
                      ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <FolderUp className="w-4 h-4" />
                  <span>1. File Upload</span>
                </button>

                <button
                  type="button"
                  onClick={() => setImageOptionTab('url')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
                    imageOptionTab === 'url'
                      ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                  <span>2. Web URL</span>
                </button>

                <button
                  type="button"
                  onClick={() => setImageOptionTab('gallery')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
                    imageOptionTab === 'gallery'
                      ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>3. Cutout Gallery</span>
                </button>
              </div>

              {/* TAB 1: FILE UPLOAD CONTENT */}
              {imageOptionTab === 'upload' && (
                <div className="space-y-3 pt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-700 hover:border-red-500 hover:bg-red-600/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
                  >
                    <div className="p-3 rounded-full bg-zinc-800 text-red-500 mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-white">
                      Click to Browse or Drag Image File Here
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Supports PNG, JPG, JPEG, WEBP, SVG
                    </p>
                    {uploadedFileName && (
                      <span className="mt-3 px-3 py-1 rounded-lg bg-green-950 text-green-400 border border-green-800 text-[11px] font-mono">
                        Selected: {uploadedFileName}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: WEB URL CONTENT */}
              {imageOptionTab === 'url' && (
                <div className="space-y-3 pt-2">
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="Paste image web link (https://...)"
                      value={characterImg}
                      onChange={(e) => setCharacterImg(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Paste any direct image link from Imgur, Google, or Wiki fandoms.
                  </p>
                </div>
              )}

              {/* TAB 3: CUTOUT GALLERY CONTENT */}
              {imageOptionTab === 'gallery' && (
                <div className="space-y-3 pt-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search gallery by character..."
                      value={galleryFilter}
                      onChange={(e) => setGalleryFilter(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                    {filteredGallery.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleSelectFromGallery(item)}
                        className={`group p-1.5 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                          characterImg === item.img 
                            ? 'border-red-500 bg-red-600/20 ring-1 ring-red-500' 
                            : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-700'
                        }`}
                      >
                        <img 
                          src={item.img} 
                          alt={item.name} 
                          className="w-10 h-10 object-cover rounded-lg mb-1"
                        />
                        <span className="text-[9px] font-bold text-zinc-300 truncate w-full">
                          {item.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Dome Gradient Theme Presets */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Select Arched Dome Color Theme:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_DOME_GRADIENTS.map((p) => {
                  const isSelected = domeColor === p.class && groundColor === p.ground;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setDomeColor(p.class);
                        setGroundColor(p.ground);
                        setGlowColor(p.glow);
                      }}
                      className={`p-2 rounded-xl flex items-center gap-2 border transition-all cursor-pointer text-left ${
                        isSelected 
                          ? 'border-red-500 bg-zinc-900 shadow-md ring-1 ring-red-500' 
                          : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-gradient-to-br ${p.class} border border-white/20 flex-shrink-0`} />
                      <span className="text-[11px] font-bold text-zinc-300 truncate">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Ground Color input */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-zinc-400">
                Ground Arch Base Color:
              </label>
              <input
                type="color"
                value={groundColor.startsWith('#') ? groundColor : '#ea580c'}
                onChange={(e) => setGroundColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs text-zinc-500 font-mono">{groundColor}</span>
            </div>

          </div>

          {/* Right Live Preview Box (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs font-black text-zinc-400 uppercase tracking-wider mb-4">
              <Eye className="w-4 h-4 text-red-500" />
              Live Dome Card Preview
            </div>

            {/* Live Arched Card Replica */}
            <div className="relative flex flex-col items-center pt-2 select-none">
              
              {/* Dome Arch Card */}
              <div 
                className={`relative w-[140px] h-[190px] rounded-t-[70px] bg-gradient-to-b ${domeColor} overflow-hidden shadow-2xl border border-white/20`}
                style={{
                  boxShadow: `0 12px 30px -5px ${glowColor}`
                }}
              >
                {/* Curved Hill Ground */}
                <div 
                  className="absolute -bottom-6 inset-x-[-15%] h-20 rounded-t-full opacity-90"
                  style={{ backgroundColor: groundColor }}
                />

                {/* Character Cutout */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {characterImg ? (
                    <img 
                      src={characterImg} 
                      alt={name || 'Preview'}
                      className="w-full h-full object-cover object-top filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.7)]"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-400 gap-1">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                      <span className="text-[10px]">No Image Selected</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Black Label Pill with Direct Click to Edit */}
              <div className="relative -mt-3.5 z-10 group cursor-pointer" onClick={() => nameInputRef.current?.focus()} title="Click to edit name">
                <div className="px-3.5 py-1.5 rounded-xl bg-black border border-zinc-700 group-hover:border-red-500 shadow-2xl flex items-center justify-center gap-1.5 min-w-[110px] transition-all">
                  <span className="text-[11px] font-black text-white tracking-wider uppercase font-display whitespace-nowrap">
                    {name.trim() || 'CHARACTER'}
                  </span>
                  <Edit3 className="w-2.5 h-2.5 text-zinc-500 group-hover:text-red-400" />
                </div>
              </div>

              {/* Franchise Subtitle */}
              <span className="text-[10px] font-semibold text-zinc-400 mt-2 text-center px-2">
                {franchise.trim() || 'Franchise / Universe'}
              </span>

            </div>

            {/* Quick Name Change Inputs Directly on Preview Box */}
            <div className="w-full mt-5 pt-4 border-t border-zinc-800/90 space-y-2.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold text-white flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-red-500" />
                  <span>Change Card Name Here:</span>
                </label>
                {name && (
                  <button
                    type="button"
                    onClick={() => {
                      setName('');
                      nameInputRef.current?.focus();
                    }}
                    className="text-[10px] text-zinc-500 hover:text-red-400 font-bold transition-colors cursor-pointer"
                  >
                    Clear Name
                  </button>
                )}
              </div>

              {/* Direct Name Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter Character Name (e.g. BEN 10, NARUTO)..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!searchKeyword) setSearchKeyword(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 hover:border-zinc-600 focus:border-red-500 text-white text-xs font-bold focus:outline-none transition-all placeholder-zinc-600"
                />
              </div>

              {/* Direct Subtitle Input */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                  Change Subtitle / Franchise:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special Grade / Alien Force"
                  value={franchise}
                  onChange={(e) => setFranchise(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 hover:border-zinc-600 focus:border-red-500 text-white text-xs focus:outline-none transition-all placeholder-zinc-600"
                />
              </div>

              {/* Quick 1-Click Popular Name Suggestions */}
              <div className="pt-1">
                <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider block mb-1.5">
                  Quick Name Presets:
                </span>
                <div className="flex flex-wrap gap-1">
                  {['JUJUTSU KAISEN', 'SOLO LEVELING', 'BEN 10', 'SPIDERMAN', 'POKEMON', 'NARUTO', 'DRAGON BALL', 'SLUGTERRA'].map((presetName) => (
                    <button
                      key={presetName}
                      type="button"
                      onClick={() => {
                        setName(presetName);
                        if (!searchKeyword) setSearchKeyword(presetName);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold border transition-all cursor-pointer ${
                        name.toUpperCase() === presetName
                          ? 'bg-red-600/30 border-red-500 text-red-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      {presetName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="lg:col-span-12 flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer border border-zinc-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {characterToEdit ? 'Save Changes' : 'Add Character to Carousel'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
