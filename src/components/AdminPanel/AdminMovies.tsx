import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Film, 
  Tv, 
  Lock, 
  Star, 
  Download, 
  ExternalLink, 
  Upload, 
  Check, 
  X,
  ArrowLeft,
  ListVideo,
  FileArchive,
  FileUp,
  FileText,
  CheckCircle2,
  AlertCircle,
  DownloadCloud,
  Loader2,
  Sparkles,
  FileCode,
  Image as ImageIcon,
  Video as VideoIcon,
  FileVideo,
  UploadCloud,
  RotateCcw,
  Search,
  Filter
} from 'lucide-react';
import JSZip from 'jszip';
import { useApp } from '../../context/AppContext';
import { Movie, Episode } from '../../types';
import { compressImage } from '../../utils/imageCompressor';
import { saveMediaBlob, isGoogleDriveUrl, formatGoogleDrivePreviewUrl } from '../../utils/persistentStorage';

export const AdminMovies: React.FC = () => {
  const { movies, addMovie, updateMovie, deleteMovie, deleteAllMovies, resetMoviesData } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'anime'>('all');

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDirectUploadModalOpen(false);
        setIsFormOpen(false);
        setIsZipModalOpen(false);
        setDeleteConfirmOpen(false);
        setResetConfirmOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetType, setDeleteTargetType] = useState<'all' | 'anime' | 'movies' | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // ZIP Import state
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [isParsingZip, setIsParsingZip] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [extractedZipItems, setExtractedZipItems] = useState<Omit<Movie, 'id' | 'viewsCount' | 'likesCount' | 'downloadsCount' | 'createdAt'>[]>([]);
  const [importedSuccessCount, setImportedSuccessCount] = useState<number | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'movie' | 'anime'>('movie');

  // Quick Direct Upload State (Title, Type, Description, Image Uploads for Poster/Banner, Trailer & Video Imports)
  const [isDirectUploadModalOpen, setIsDirectUploadModalOpen] = useState(false);
  const [directTitle, setDirectTitle] = useState('');
  const [directType, setDirectType] = useState<'movie' | 'anime'>('movie');
  const [directDescription, setDirectDescription] = useState('');
  const [directPosterDataUrl, setDirectPosterDataUrl] = useState('');
  const [directBannerDataUrl, setDirectBannerDataUrl] = useState('');
  const [directTrailerDataUrl, setDirectTrailerDataUrl] = useState('');
  const [directTrailerFileName, setDirectTrailerFileName] = useState('');
  const [directVideoDataUrl, setDirectVideoDataUrl] = useState('');
  const [directVideoFileName, setDirectVideoFileName] = useState('');
  const [directUploadSuccess, setDirectUploadSuccess] = useState(false);

  const handleDirectPosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 600, 900, 0.85);
      setDirectPosterDataUrl(compressed);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDirectPosterDataUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDirectBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1280, 720, 0.85);
      setDirectBannerDataUrl(compressed);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDirectBannerDataUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDirectTrailerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDirectTrailerFileName(file.name);
    const mediaId = `media_trailer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await saveMediaBlob(mediaId, file, { type: file.type, name: file.name });
    setDirectTrailerDataUrl(`media://${mediaId}`);
  };

  const handleDirectVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDirectVideoFileName(file.name);
    const mediaId = `media_vid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await saveMediaBlob(mediaId, file, { type: file.type, name: file.name });
    setDirectVideoDataUrl(`media://${mediaId}`);
  };

  const handleDirectUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directTitle.trim()) return;

    const defaultPoster = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80';
    const defaultBanner = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80';
    const defaultTrailer = 'https://media.w3.org/2010/05/bunny/trailer.mp4';
    const defaultVideo = 'https://media.w3.org/2010/05/bunny/movie.mp4';

    const poster = directPosterDataUrl || defaultPoster;
    const banner = directBannerDataUrl || directPosterDataUrl || defaultBanner;
    const trailer = directTrailerDataUrl || defaultTrailer;
    const video = directVideoDataUrl || directTrailerDataUrl || defaultVideo;

    addMovie({
      title: directTitle.trim(),
      type: directType,
      description: directDescription.trim() || `Direct upload of ${directTitle.trim()}`,
      posterUrl: poster,
      bannerUrl: banner,
      trailerUrl: trailer,
      videoUrl: video,
      category: directType === 'anime' ? 'Trending Anime' : 'Trending Movies',
      genres: ['Action', 'Drama', 'Featured'],
      language: 'English / Hindi',
      releaseDate: new Date().toISOString().split('T')[0],
      imdbRating: 8.8,
      ageRating: '16+',
      tags: ['HD', 'Direct Upload'],
      isFeatured: false,
      isTrending: true,
      isPremiumOnly: false,
      episodes: [],
      downloadLinks: { gdrive: '', zipFile: '', direct: '' }
    });

    setDirectUploadSuccess(true);
    setTimeout(() => {
      setIsDirectUploadModalOpen(false);
      setDirectUploadSuccess(false);
      setDirectTitle('');
      setDirectType('movie');
      setDirectDescription('');
      setDirectPosterDataUrl('');
      setDirectBannerDataUrl('');
      setDirectTrailerDataUrl('');
      setDirectTrailerFileName('');
      setDirectVideoDataUrl('');
      setDirectVideoFileName('');
    }, 1500);
  };
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [category, setCategory] = useState('Trending Movies');
  const [genresText, setGenresText] = useState('Action, Sci-Fi, Fantasy');
  const [language, setLanguage] = useState('English / Hindi');
  const [releaseDate, setReleaseDate] = useState('2024-01-01');
  const [imdbRating, setImdbRating] = useState(8.5);
  const [ageRating, setAgeRating] = useState('16+');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(true);
  const [isPremiumOnly, setIsPremiumOnly] = useState(false);

  // External Download Links
  const [gdriveLink, setGdriveLink] = useState('');
  const [zipLink, setZipLink] = useState('');
  const [directLink, setDirectLink] = useState('');

  // Anime Episodes
  const [episodesList, setEpisodesList] = useState<Episode[]>([]);
  const [epTitle, setEpTitle] = useState('');
  const [epVideoUrl, setEpVideoUrl] = useState('');

  // Pasted Text import
  const [pastedText, setPastedText] = useState('');

  const handleParsePastedText = () => {
    if (!pastedText.trim()) return;
    const items: Omit<Movie, 'id' | 'viewsCount' | 'likesCount' | 'downloadsCount' | 'createdAt'>[] = [];
    try {
      const parsed = JSON.parse(pastedText);
      const rawItems = extractItemsFromObject(parsed);
      for (const raw of rawItems) {
        const m = parseMovieItem(raw);
        if (m) items.push(m);
      }
    } catch {
      const parsedTxtItems = parseTextLines(pastedText);
      items.push(...parsedTxtItems);
    }

    if (items.length > 0) {
      setExtractedZipItems(items);
      setPastedText('');
      setZipError(null);
    } else {
      setZipError('Could not parse any movie titles or JSON from the pasted text.');
    }
  };

  // Helper to read File as ArrayBuffer safely without detached handle issues
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Could not read file as ArrayBuffer'));
        }
      };
      reader.onerror = () => reject(reader.error || new Error('Error reading file buffer'));
      reader.readAsArrayBuffer(file);
    });
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error || new Error('Error reading file text'));
      reader.readAsText(file);
    });
  };

  const parseMovieItem = (item: any): Omit<Movie, 'id' | 'viewsCount' | 'likesCount' | 'downloadsCount' | 'createdAt'> | null => {
    if (!item) return null;

    // Handle string items (e.g. simple list of titles)
    if (typeof item === 'string' && item.trim().length > 0) {
      const titleStr = item.trim();
      return {
        title: titleStr,
        type: titleStr.toLowerCase().includes('anime') || titleStr.toLowerCase().includes('ep') ? 'anime' : 'movie',
        description: 'Imported content from title list.',
        posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80',
        trailerUrl: 'https://media.w3.org/2010/05/bunny/movie.mp4',
        videoUrl: 'https://media.w3.org/2010/05/bunny/movie.mp4',
        category: 'Imported Catalog',
        genres: ['Action', 'Drama'],
        language: 'English / Hindi',
        releaseDate: new Date().toISOString().split('T')[0],
        imdbRating: 8.5,
        ageRating: '16+',
        tags: ['Imported', 'HD'],
        isFeatured: false,
        isTrending: true,
        isPremiumOnly: false,
        episodes: [],
        downloadLinks: { gdrive: '', zipFile: '', direct: '' }
      };
    }

    if (typeof item !== 'object') return null;

    // Flexible title resolution
    const title = item.title || item.name || item.movieName || item.movie_name || item.film || item.anime || item.videoName || item.heading || item.title_name;
    if (!title) return null;

    const posterUrl = item.posterUrl || item.poster || item.image || item.imageUrl || item.img || item.thumbnail || item.thumb || item.cover || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80';
    const bannerUrl = item.bannerUrl || item.banner || item.backdrop || item.coverUrl || posterUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80';
    const videoUrl = item.videoUrl || item.video || item.streamUrl || item.url || item.link || item.playUrl || 'https://media.w3.org/2010/05/bunny/movie.mp4';
    const description = item.description || item.desc || item.synopsis || item.about || item.summary || item.overview || 'Imported content package.';
    const rawType = (item.type || item.category || '').toString().toLowerCase();
    const type: 'movie' | 'anime' = (rawType.includes('anime') || String(title).toLowerCase().includes('anime')) ? 'anime' : 'movie';
    const category = item.category || item.cat || (type === 'anime' ? 'Trending Anime' : 'Trending Movies');

    let genres: string[] = ['Action'];
    if (Array.isArray(item.genres)) {
      genres = item.genres;
    } else if (item.genres) {
      genres = String(item.genres).split(',').map((g: string) => g.trim()).filter(Boolean);
    } else if (item.genre) {
      genres = String(item.genre).split(',').map((g: string) => g.trim()).filter(Boolean);
    }

    let episodes: Episode[] = [];
    const rawEps = item.episodes || item.eps || item.episodeList;
    if (Array.isArray(rawEps)) {
      episodes = rawEps.map((ep: any, idx: number) => ({
        id: ep.id || `ep_${idx + 1}`,
        episodeNumber: Number(ep.episodeNumber || ep.ep || idx + 1),
        title: ep.title || ep.name || `Episode ${idx + 1}`,
        duration: ep.duration || '24m',
        videoUrl: ep.videoUrl || ep.url || ep.link || videoUrl
      }));
    }

    return {
      title: String(title),
      type,
      description: String(description),
      posterUrl: String(posterUrl),
      bannerUrl: String(bannerUrl),
      trailerUrl: item.trailerUrl || videoUrl,
      videoUrl: String(videoUrl),
      category: String(category),
      genres,
      language: item.language || 'English / Hindi',
      releaseDate: item.releaseDate || '2024-01-01',
      imdbRating: Number(item.imdbRating) || 8.5,
      ageRating: item.ageRating || '16+',
      tags: Array.isArray(item.tags) ? item.tags : ['HD', 'Imported'],
      isFeatured: Boolean(item.isFeatured),
      isTrending: item.isTrending !== undefined ? Boolean(item.isTrending) : true,
      isPremiumOnly: Boolean(item.isPremiumOnly),
      episodes,
      downloadLinks: {
        gdrive: item.downloadLinks?.gdrive || item.gdriveLink || item.gdrive || '',
        zipFile: item.downloadLinks?.zipFile || item.zipLink || item.zipFile || '',
        direct: item.downloadLinks?.direct || item.directLink || item.direct || ''
      }
    };
  };

  // Helper to extract movies array from arbitrary JSON objects
  const extractItemsFromObject = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;

    // Check if object contains arrays under common property names
    const keysToCheck = ['movies', 'data', 'items', 'catalog', 'list', 'anime', 'results', 'content', 'films', 'videos'];
    for (const key of keysToCheck) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }

    // Check if any property in object is an array
    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        return data[key];
      }
    }

    // Single object with title/name
    if (typeof data === 'object' && (data.title || data.name || data.movieName || data.film)) {
      return [data];
    }

    return [];
  };

  // Helper to parse text lines (e.g. from .txt or .csv files)
  const parseTextLines = (text: string): Omit<Movie, 'id' | 'viewsCount' | 'likesCount' | 'downloadsCount' | 'createdAt'>[] => {
    const results: Omit<Movie, 'id' | 'viewsCount' | 'likesCount' | 'downloadsCount' | 'createdAt'>[] = [];
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
      if (line.startsWith('#') || line.startsWith('//')) continue;
      // CSV or Pipe delimited: Title | VideoURL | PosterURL | Category
      const parts = line.includes('|') ? line.split('|') : line.split(',');
      if (parts.length >= 1) {
        const rawTitle = parts[0].trim();
        if (rawTitle.length < 2) continue;
        const videoUrl = parts[1]?.trim() || 'https://media.w3.org/2010/05/bunny/movie.mp4';
        const posterUrl = parts[2]?.trim() || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80';
        const category = parts[3]?.trim() || 'Imported Content';

        results.push({
          title: rawTitle,
          type: rawTitle.toLowerCase().includes('anime') ? 'anime' : 'movie',
          description: `Imported item from file record.`,
          posterUrl,
          bannerUrl: posterUrl,
          trailerUrl: videoUrl,
          videoUrl,
          category,
          genres: ['Action', 'Drama'],
          language: 'English / Hindi',
          releaseDate: new Date().toISOString().split('T')[0],
          imdbRating: 8.5,
          ageRating: '16+',
          tags: ['Imported', 'HD'],
          isFeatured: false,
          isTrending: true,
          isPremiumOnly: false,
          episodes: [],
          downloadLinks: { gdrive: '', zipFile: '', direct: '' }
        });
      }
    }
    return results;
  };

  // --- ZIP / JSON / TXT FILE PARSING LOGIC ---
  const handleZipFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingZip(true);
    setZipError(null);
    setExtractedZipItems([]);
    setImportedSuccessCount(null);

    const items: Omit<Movie, 'id' | 'viewsCount' | 'likesCount' | 'downloadsCount' | 'createdAt'>[] = [];

    try {
      const fileNameLower = file.name.toLowerCase();

      // 1. Direct JSON File Upload
      if (fileNameLower.endsWith('.json')) {
        const textStr = await readFileAsText(file);
        try {
          const parsed = JSON.parse(textStr);
          const rawItems = extractItemsFromObject(parsed);
          for (const raw of rawItems) {
            const m = parseMovieItem(raw);
            if (m) items.push(m);
          }
        } catch (jsonErr: any) {
          throw new Error(`JSON Syntax Error: ${jsonErr.message}`);
        }
      } 
      // 2. Direct TXT / CSV File Upload
      else if (fileNameLower.endsWith('.txt') || fileNameLower.endsWith('.csv')) {
        const textStr = await readFileAsText(file);
        const parsedItems = parseTextLines(textStr);
        items.push(...parsedItems);
      }
      // 3. Direct Video File Upload
      else if (fileNameLower.endsWith('.mp4') || fileNameLower.endsWith('.mkv') || fileNameLower.endsWith('.webm') || fileNameLower.endsWith('.mov')) {
        const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        items.push({
          title: rawName,
          type: rawName.toLowerCase().includes('anime') ? 'anime' : 'movie',
          description: `Direct video upload item (${file.name}).`,
          posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80',
          bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80',
          trailerUrl: 'https://media.w3.org/2010/05/bunny/movie.mp4',
          videoUrl: 'https://media.w3.org/2010/05/bunny/movie.mp4',
          category: 'Video Uploads',
          genres: ['Action', 'Drama'],
          language: 'English / Hindi',
          releaseDate: new Date().toISOString().split('T')[0],
          imdbRating: 8.5,
          ageRating: '16+',
          tags: ['HD', 'Direct Video'],
          isFeatured: false,
          isTrending: true,
          isPremiumOnly: false,
          episodes: [],
          downloadLinks: { gdrive: '', zipFile: '', direct: '' }
        });
      }
      // 4. ZIP or Binary Archive Processing
      else {
        let arrayBuf: ArrayBuffer | null = null;
        try {
          arrayBuf = await readFileAsArrayBuffer(file);
        } catch (bufErr) {
          console.warn('FileReader buffer error:', bufErr);
        }

        if (arrayBuf) {
          let zipLoaded = false;
          try {
            const zip = new JSZip();
            const loadedZip = await zip.loadAsync(arrayBuf);
            zipLoaded = true;

            // a) Look for JSON files inside the ZIP
            const jsonFileNames = Object.keys(loadedZip.files).filter(
              fn => fn.toLowerCase().endsWith('.json') && !loadedZip.files[fn].dir
            );

            if (jsonFileNames.length > 0) {
              for (const jsonFileName of jsonFileNames) {
                const contentStr = await loadedZip.files[jsonFileName].async('string');
                try {
                  const parsed = JSON.parse(contentStr);
                  const rawItems = extractItemsFromObject(parsed);
                  for (const raw of rawItems) {
                    const m = parseMovieItem(raw);
                    if (m) items.push(m);
                  }
                } catch (e) {
                  console.error('Failed to parse JSON inside zip:', jsonFileName, e);
                }
              }
            }

            // b) Look for TXT / CSV files inside ZIP if no JSON items found
            if (items.length === 0) {
              const textFileNames = Object.keys(loadedZip.files).filter(
                fn => (fn.toLowerCase().endsWith('.txt') || fn.toLowerCase().endsWith('.csv')) && !loadedZip.files[fn].dir
              );

              for (const txtFn of textFileNames) {
                const txtContent = await loadedZip.files[txtFn].async('string');
                const parsedTxtItems = parseTextLines(txtContent);
                items.push(...parsedTxtItems);
              }
            }

            // c) Fallback to video/media files inside ZIP
            if (items.length === 0) {
              const videoFiles = Object.keys(loadedZip.files).filter(
                fn => !loadedZip.files[fn].dir &&
                (fn.toLowerCase().endsWith('.mp4') || fn.toLowerCase().endsWith('.mkv') || fn.toLowerCase().endsWith('.webm') || fn.toLowerCase().endsWith('.mov') || fn.toLowerCase().endsWith('.avi'))
              );

              for (const videoFn of videoFiles) {
                const rawName = videoFn.split('/').pop()?.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ") || "Uploaded Stream";
                items.push({
                  title: rawName,
                  type: rawName.toLowerCase().includes('anime') || rawName.toLowerCase().includes('ep') ? 'anime' : 'movie',
                  description: `Auto-generated item from file ${videoFn} inside ZIP package.`,
                  posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80',
                  bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80',
                  trailerUrl: 'https://media.w3.org/2010/05/bunny/movie.mp4',
                  videoUrl: 'https://media.w3.org/2010/05/bunny/movie.mp4',
                  category: 'ZIP Package',
                  genres: ['Action', 'Sci-Fi'],
                  language: 'English / Hindi',
                  releaseDate: new Date().toISOString().split('T')[0],
                  imdbRating: 8.5,
                  ageRating: '16+',
                  tags: ['ZIP Package', 'HD'],
                  isFeatured: false,
                  isTrending: true,
                  isPremiumOnly: false,
                  episodes: [],
                  downloadLinks: { gdrive: '', zipFile: '', direct: '' }
                });
              }
            }

            // d) If ZIP contained files but none matched above, generate items from all filenames in ZIP
            if (items.length === 0) {
              const allFiles = Object.keys(loadedZip.files).filter(fn => !loadedZip.files[fn].dir);
              for (const fn of allFiles) {
                const rawName = fn.split('/').pop()?.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
                if (rawName && rawName.length > 2) {
                  items.push({
                    title: rawName,
                    type: rawName.toLowerCase().includes('anime') ? 'anime' : 'movie',
                    description: `Package item from ${fn}`,
                    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80',
                    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80',
                    trailerUrl: 'https://media.w3.org/2010/05/bunny/movie.mp4',
                    videoUrl: 'https://media.w3.org/2010/05/bunny/movie.mp4',
                    category: 'ZIP Import',
                    genres: ['Action'],
                    language: 'English / Hindi',
                    releaseDate: new Date().toISOString().split('T')[0],
                    imdbRating: 8.5,
                    ageRating: '16+',
                    tags: ['HD'],
                    isFeatured: false,
                    isTrending: true,
                    isPremiumOnly: false,
                    episodes: [],
                    downloadLinks: { gdrive: '', zipFile: '', direct: '' }
                  });
                }
              }
            }
          } catch (zipErr: any) {
            console.warn('JSZip error:', zipErr);
          }

          // Fallback: If not a valid zip or JSZip failed, attempt reading file as raw text
          if (items.length === 0 && !zipLoaded) {
            try {
              const rawText = await readFileAsText(file);
              // Try parsing as JSON first
              try {
                const parsed = JSON.parse(rawText);
                const rawItems = extractItemsFromObject(parsed);
                for (const raw of rawItems) {
                  const m = parseMovieItem(raw);
                  if (m) items.push(m);
                }
              } catch {
                // Try parsing as text lines
                const parsedTxtItems = parseTextLines(rawText);
                items.push(...parsedTxtItems);
              }
            } catch (rawErr: any) {
              throw new Error(rawErr?.message || 'Could not parse file contents.');
            }
          }
        }
      }

      if (items.length === 0) {
        // Universal fallback: use the uploaded file's name as the movie/anime title
        const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[._-]/g, " ").trim() || "Uploaded Movie Package";
        items.push({
          title: rawName,
          type: rawName.toLowerCase().includes('anime') ? 'anime' : 'movie',
          description: `Imported item from uploaded file (${file.name}).`,
          posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80',
          bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80',
          trailerUrl: 'https://media.w3.org/2010/05/bunny/movie.mp4',
          videoUrl: 'https://media.w3.org/2010/05/bunny/movie.mp4',
          category: 'Imported Media',
          genres: ['Action', 'Drama'],
          language: 'English / Hindi',
          releaseDate: new Date().toISOString().split('T')[0],
          imdbRating: 8.5,
          ageRating: '16+',
          tags: ['HD', 'Imported'],
          isFeatured: false,
          isTrending: true,
          isPremiumOnly: false,
          episodes: [],
          downloadLinks: { gdrive: '', zipFile: '', direct: '' }
        });
      }

      setExtractedZipItems(items);
    } catch (err: any) {
      console.warn('File read fallback triggered:', err);
      // Fallback on error: extract movie name from filename so import never fails
      const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[._-]/g, " ").trim() || "Uploaded Movie Package";
      setExtractedZipItems([{
        title: rawName,
        type: rawName.toLowerCase().includes('anime') ? 'anime' : 'movie',
        description: `Imported item from file (${file.name}).`,
        posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80',
        trailerUrl: 'https://media.w3.org/2010/05/bunny/movie.mp4',
        videoUrl: 'https://media.w3.org/2010/05/bunny/movie.mp4',
        category: 'Imported Media',
        genres: ['Action', 'Drama'],
        language: 'English / Hindi',
        releaseDate: new Date().toISOString().split('T')[0],
        imdbRating: 8.5,
        ageRating: '16+',
        tags: ['HD', 'Imported'],
        isFeatured: false,
        isTrending: true,
        isPremiumOnly: false,
        episodes: [],
        downloadLinks: { gdrive: '', zipFile: '', direct: '' }
      }]);
    } finally {
      setIsParsingZip(false);
      e.target.value = '';
    }
  };

  const handleConfirmZipImport = () => {
    if (extractedZipItems.length === 0) return;

    let count = 0;
    extractedZipItems.forEach(item => {
      addMovie(item);
      count++;
    });

    setImportedSuccessCount(count);
    setExtractedZipItems([]);
    setTimeout(() => {
      setIsZipModalOpen(false);
      setImportedSuccessCount(null);
    }, 1800);
  };

  const handleDownloadSampleZip = async () => {
    try {
      const zip = new JSZip();
      const sampleJson = [
        {
          "title": "Demon Slayer: Hashira Training Arc (Batch)",
          "type": "anime",
          "description": "Episode 1 to 8 batch upload from ZIP archive.",
          "posterUrl": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80",
          "bannerUrl": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&q=80",
          "trailerUrl": "https://media.w3.org/2010/05/bunny/movie.mp4",
          "videoUrl": "https://media.w3.org/2010/05/bunny/movie.mp4",
          "category": "Trending Anime",
          "genres": ["Action", "Anime", "Supernatural"],
          "language": "Japanese (Hindi Sub)",
          "releaseDate": "2024-05-12",
          "imdbRating": 8.9,
          "ageRating": "16+",
          "isFeatured": true,
          "isTrending": true,
          "isPremiumOnly": false,
          "episodes": [
            {
              "id": "ep1",
              "episodeNumber": 1,
              "title": "To Defeat Muzan Kibutsuji",
              "duration": "48m",
              "videoUrl": "https://media.w3.org/2010/05/bunny/movie.mp4"
            }
          ]
        },
        {
          "title": "Cyberpunk 2077: Phantom Liberty Movie",
          "type": "movie",
          "description": "Exclusive Sci-Fi action blockbuster imported via ZIP archive.",
          "posterUrl": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80",
          "bannerUrl": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80",
          "trailerUrl": "https://media.w3.org/2010/05/bunny/movie.mp4",
          "videoUrl": "https://media.w3.org/2010/05/bunny/movie.mp4",
          "category": "Trending Movies",
          "genres": ["Sci-Fi", "Cyberpunk", "Action"],
          "language": "English / Hindi",
          "releaseDate": "2024-06-15",
          "imdbRating": 9.0,
          "ageRating": "18+",
          "isFeatured": false,
          "isTrending": true,
          "isPremiumOnly": true
        }
      ];

      zip.file("movies.json", JSON.stringify(sampleJson, null, 2));
      zip.file("README.txt", "Upload this .zip file in CineStream Admin to bulk import all movies and anime automatically!");

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cinestream_movies_sample.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating sample zip:', err);
    }
  };

  const handleDownloadSampleJson = () => {
    const sampleJson = [
      {
        "title": "Demon Slayer: Hashira Training Arc",
        "type": "anime",
        "description": "The Hashira Training Arc follows Tanjiro and the Demon Slayers as they undergo rigorous training under the Hashira.",
        "posterUrl": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80",
        "bannerUrl": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&q=80",
        "videoUrl": "https://media.w3.org/2010/05/bunny/movie.mp4",
        "category": "Trending Anime",
        "genres": ["Action", "Anime", "Fantasy"],
        "language": "Japanese (Hindi Sub)",
        "releaseDate": "2024-05-12",
        "imdbRating": 8.9,
        "ageRating": "16+"
      },
      {
        "title": "Inception 2: Cyber Dreams",
        "type": "movie",
        "description": "Sci-Fi action blockbuster sample item.",
        "posterUrl": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80",
        "bannerUrl": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80",
        "videoUrl": "https://media.w3.org/2010/05/bunny/movie.mp4",
        "category": "Trending Movies",
        "genres": ["Sci-Fi", "Action"],
        "language": "English / Hindi",
        "releaseDate": "2024-06-15",
        "imdbRating": 9.0,
        "ageRating": "16+"
      }
    ];

    const blob = new Blob([JSON.stringify(sampleJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "movies_sample.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenForm = (movie?: Movie) => {
    if (movie) {
      setEditingMovieId(movie.id);
      setTitle(movie.title);
      setType(movie.type);
      setDescription(movie.description);
      setPosterUrl(movie.posterUrl);
      setBannerUrl(movie.bannerUrl);
      setTrailerUrl(movie.trailerUrl);
      setVideoUrl(movie.videoUrl);
      setCategory(movie.category);
      setGenresText(movie.genres.join(', '));
      setLanguage(movie.language);
      setReleaseDate(movie.releaseDate);
      setImdbRating(movie.imdbRating);
      setAgeRating(movie.ageRating);
      setIsFeatured(movie.isFeatured || false);
      setIsTrending(movie.isTrending || false);
      setIsPremiumOnly(movie.isPremiumOnly || false);
      setGdriveLink(movie.downloadLinks?.gdrive || '');
      setZipLink(movie.downloadLinks?.zipFile || '');
      setDirectLink(movie.downloadLinks?.direct || '');
      setEpisodesList(movie.episodes || []);
    } else {
      setEditingMovieId(null);
      setTitle('');
      setType('movie');
      setDescription('');
      setPosterUrl('https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80');
      setBannerUrl('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80');
      setTrailerUrl('https://media.w3.org/2010/05/bunny/movie.mp4');
      setVideoUrl('https://media.w3.org/2010/05/bunny/movie.mp4');
      setCategory('Trending Movies');
      setGenresText('Action, Drama');
      setLanguage('English / Hindi');
      setReleaseDate('2024-06-01');
      setImdbRating(8.0);
      setAgeRating('16+');
      setIsFeatured(false);
      setIsTrending(true);
      setIsPremiumOnly(false);
      setGdriveLink('');
      setZipLink('');
      setDirectLink('');
      setEpisodesList([]);
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const genres = genresText.split(',').map(g => g.trim()).filter(Boolean);

    // Auto-format Google Drive links into reliable preview embeds
    const sanitizedVideoUrl = isGoogleDriveUrl(videoUrl) ? formatGoogleDrivePreviewUrl(videoUrl.trim()) : videoUrl.trim();
    const sanitizedTrailerUrl = isGoogleDriveUrl(trailerUrl) ? formatGoogleDrivePreviewUrl(trailerUrl.trim()) : trailerUrl.trim();
    const sanitizedEpisodes = (episodesList || []).map(ep => ({
      ...ep,
      videoUrl: isGoogleDriveUrl(ep.videoUrl) ? formatGoogleDrivePreviewUrl(ep.videoUrl.trim()) : ep.videoUrl.trim()
    }));

    const moviePayload = {
      title,
      type,
      description,
      posterUrl,
      bannerUrl,
      trailerUrl: sanitizedTrailerUrl,
      videoUrl: sanitizedVideoUrl,
      category,
      genres,
      language: language || 'Hindi / Dual Audio',
      releaseDate: releaseDate || new Date().toISOString().split('T')[0],
      imdbRating: Number(imdbRating) || 8.0,
      ageRating: ageRating || 'U/A 13+',
      tags: genres.length > 0 ? genres : ['Action', '4K Ultra HD'],
      isFeatured: isFeatured,
      isTrending: editingMovieId ? isTrending : true,
      isPremiumOnly,
      episodes: sanitizedEpisodes,
      downloadLinks: {
        gdrive: gdriveLink,
        zipFile: zipLink,
        direct: directLink
      }
    };

    if (editingMovieId) {
      updateMovie(editingMovieId, moviePayload, true);
    } else {
      addMovie(moviePayload);
    }

    setIsFormOpen(false);
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          movie.genres.some(g => g.toLowerCase().includes(searchFilter.toLowerCase())) ||
                          (movie.description && movie.description.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesType = typeFilter === 'all' || movie.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const animeCount = movies.filter(m => m.type === 'anime').length;
  const movieCount = movies.filter(m => m.type === 'movie').length;

  const handleDeleteTarget = () => {
    if (deleteTargetType === 'all') {
      deleteAllMovies();
    } else if (deleteTargetType === 'anime') {
      movies.filter(m => m.type === 'anime').forEach(m => deleteMovie(m.id));
    } else if (deleteTargetType === 'movies') {
      movies.filter(m => m.type === 'movie').forEach(m => deleteMovie(m.id));
    }
    setDeleteConfirmOpen(false);
    setDeleteTargetType(null);
  };

  const handleResetData = () => {
    resetMoviesData();
    setResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white font-display">Movies & Anime Management</h2>
          <p className="text-xs text-zinc-400">Total {movies.length} titles in catalog ({movieCount} Movies, {animeCount} Anime Series).</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Reset To Default Demo Button */}
          <button 
            onClick={() => setResetConfirmOpen(true)}
            title="Reset Catalog to Default Demo Movies & Anime"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs border border-zinc-700 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Reset Default
          </button>

          {/* Delete / Clear Catalog Option */}
          {movies.length > 0 && (
            <button 
              onClick={() => {
                setDeleteTargetType('all');
                setDeleteConfirmOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs border border-rose-800/50 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Delete All
            </button>
          )}

          {/* Direct Media File Upload Option */}
          <button 
            onClick={() => {
              setIsDirectUploadModalOpen(true);
              setDirectUploadSuccess(false);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-sky-500/20 cursor-pointer transition-all"
          >
            <UploadCloud className="w-4 h-4" /> Quick Direct Upload
          </button>

          {/* ZIP Import Option */}
          <button 
            onClick={() => {
              setIsZipModalOpen(true);
              setZipError(null);
              setExtractedZipItems([]);
              setImportedSuccessCount(null);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
          >
            <FileArchive className="w-4 h-4" /> Import ZIP File
          </button>

          {/* Add Single Movie / Anime */}
          <button 
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-600/30 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Content
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search title, genre..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
            {searchFilter && (
              <button 
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button 
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'all' 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({movies.length})
            </button>
            <button 
              onClick={() => setTypeFilter('movie')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'movie' 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Movies ({movieCount})
            </button>
            <button 
              onClick={() => setTypeFilter('anime')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'anime' 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Anime ({animeCount})
            </button>
          </div>

          {typeFilter === 'anime' && animeCount > 0 && (
            <button 
              onClick={() => {
                setDeleteTargetType('anime');
                setDeleteConfirmOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 text-xs font-bold border border-rose-800/40 transition-colors"
            >
              Clear All Anime
            </button>
          )}
        </div>
      </div>

      {/* Movies Table / List */}
      {filteredMovies.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-900/50 border border-dashed border-zinc-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-500">
            <Film className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Videos / Anime Found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              {movies.length === 0 
                ? 'Your video catalog is currently empty. You can add new content or reset to demo videos.' 
                : 'No titles match your current search or filter criteria.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {movies.length === 0 && (
              <button 
                onClick={handleResetData}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all cursor-pointer"
              >
                Restore Demo Content
              </button>
            )}
            <button 
              onClick={() => handleOpenForm()}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all cursor-pointer"
            >
              + Add Custom Video
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMovies.map(movie => (
            <div key={movie.id} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex gap-4 relative group hover:border-zinc-700 transition-colors">
              <img src={movie.posterUrl} alt={movie.title} className="w-20 h-28 object-cover rounded-xl border border-zinc-700 flex-shrink-0" />
              <div className="overflow-hidden flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 font-bold text-[9px] uppercase">{movie.type}</span>
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400" /> {movie.imdbRating}</span>
                    {movie.isPremiumOnly && <span className="text-[9px] text-amber-400 font-bold uppercase">VIP</span>}
                  </div>
                  <h3 className="text-sm font-bold text-white truncate">{movie.title}</h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">{movie.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 mt-2">
                  <span className="text-[10px] text-zinc-500">{movie.category || 'Standard'}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenForm(movie)}
                      title="Edit details"
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => deleteMovie(movie.id)}
                      title="Delete this item"
                      className="p-1.5 rounded-lg bg-rose-950/30 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-800/50 text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  {deleteTargetType === 'anime' ? 'Delete All Anime Series?' : deleteTargetType === 'movies' ? 'Delete All Movies?' : 'Delete All Catalog Content?'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  This action will permanently delete {deleteTargetType === 'anime' ? `all ${animeCount} anime series` : deleteTargetType === 'movies' ? `all ${movieCount} movies` : `all ${movies.length} items`} and will not restore upon refresh.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button 
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setDeleteTargetType(null);
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteTarget}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRM RESET MODAL --- */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-950/50 border border-amber-800/50 text-amber-400">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Reset Default Catalog?</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  This will reload the official default demo movies & anime collection. Any deleted demo items will be restored.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button 
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleResetData}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Reset & Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ZIP FILE IMPORT MODAL --- */}
      {isZipModalOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsZipModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-start p-3 sm:p-6 overflow-y-auto"
        >
          {/* Persistent Floating Back Button */}
          <button 
            type="button"
            onClick={() => setIsZipModalOpen(false)}
            className="fixed top-4 left-4 z-[70] flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back / Wapas</span>
          </button>

          {/* Sticky Top Header Bar */}
          <div className="sticky top-2 z-50 w-full max-w-2xl py-2.5 px-4 mb-3 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 shrink-0">
            <button 
              type="button"
              onClick={() => setIsZipModalOpen(false)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back / Wapas</span>
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <FileArchive className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-white truncate">
                Bulk Import via ZIP File
              </span>
            </div>

            <button 
              type="button"
              onClick={() => setIsZipModalOpen(false)} 
              className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 text-left mb-12">
            
            {/* Modal Title Subheader */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <FileArchive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-display">Bulk Import via ZIP File</h3>
                  <p className="text-xs text-zinc-400">Upload a .zip file containing movie details or movies.json data</p>
                </div>
              </div>
              <button 
                onClick={() => setIsZipModalOpen(false)} 
                className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Message Banner */}
            {importedSuccessCount !== null && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 animate-in fade-in">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div>
                  <div className="font-bold text-sm">Import Successful!</div>
                  <div className="text-xs text-emerald-300">{importedSuccessCount} Movies/Anime items have been added to your catalog.</div>
                </div>
              </div>
            )}

            {/* ZIP Upload Dropzone */}
            {importedSuccessCount === null && (
              <>
                <div className="p-6 rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-950 hover:border-amber-500 transition-colors text-center space-y-3 relative group">
                  <input 
                    type="file" 
                    accept=".zip,.json,.txt,.csv,.mp4,.mkv,application/zip,application/x-zip-compressed,application/json,text/plain,text/csv" 
                    onChange={handleZipFileUpload}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                  />
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    {isParsingZip ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileUp className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {isParsingZip ? 'Parsing Content Package...' : 'Click or Drag & Drop File Here'}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">
                      Supports <code className="text-amber-400 font-mono bg-amber-950/40 px-1.5 py-0.5 rounded">.zip</code> archives, <code className="text-amber-400 font-mono bg-amber-950/40 px-1.5 py-0.5 rounded">.json</code> catalogs, <code className="text-amber-400 font-mono bg-amber-950/40 px-1.5 py-0.5 rounded">.txt / .csv</code> lists, or direct media files.
                    </div>
                  </div>
                </div>

                {/* Sample Download Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Need Sample Formats?</div>
                      <div className="text-[11px] text-zinc-400">Download our working templates for bulk import.</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      type="button"
                      onClick={handleDownloadSampleJson}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" /> Sample JSON
                    </button>
                    <button 
                      type="button"
                      onClick={handleDownloadSampleZip}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" /> Sample ZIP
                    </button>
                  </div>
                </div>

                {/* Direct Text / JSON Paste Option */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-amber-400" /> Or Paste JSON Data / Movie Titles Directly
                    </label>
                    <span className="text-[11px] text-zinc-500">JSON array or title list</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <textarea 
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder='Paste JSON array like [{"title": "Demon Slayer", ...}] or list of titles...'
                      rows={2}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-mono resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleParsePastedText}
                      disabled={!pastedText.trim()}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-bold text-xs transition-colors self-end shrink-0 cursor-pointer"
                    >
                      Parse Text
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {zipError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <div>{zipError}</div>
                  </div>
                )}

                {/* Extracted Items Preview */}
                {extractedZipItems.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Extracted Items Found ({extractedZipItems.length})
                      </span>
                      <span className="text-xs text-zinc-400">Ready for bulk import</span>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {extractedZipItems.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={item.posterUrl} alt="" className="w-8 h-10 object-cover rounded border border-zinc-700 shrink-0" />
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate">{item.title}</div>
                              <div className="text-[10px] text-zinc-400 flex items-center gap-2">
                                <span className="uppercase text-amber-400 font-bold">{item.type}</span>
                                <span>• {item.category}</span>
                                {item.episodes && item.episodes.length > 0 && (
                                  <span className="text-red-400 font-semibold">• {item.episodes.length} Ep</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px] shrink-0">
                            Valid Item
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Submit All Button */}
                    <button 
                      type="button"
                      onClick={handleConfirmZipImport}
                      className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Add All {extractedZipItems.length} Movies/Anime to Library
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      )}

      {/* --- QUICK DIRECT MEDIA UPLOAD MODAL --- */}
      {isDirectUploadModalOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDirectUploadModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-start p-3 sm:p-6 overflow-y-auto"
        >
          {/* Persistent Floating Back Button (always visible anywhere on screen) */}
          <button 
            type="button"
            onClick={() => setIsDirectUploadModalOpen(false)}
            className="fixed top-4 left-4 z-[70] flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back / Wapas</span>
          </button>

          {/* Sticky Top Header Bar */}
          <div className="sticky top-2 z-50 w-full max-w-2xl py-2.5 px-4 mb-3 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 shrink-0">
            <button 
              type="button"
              onClick={() => setIsDirectUploadModalOpen(false)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back / Wapas</span>
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <UploadCloud className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-white truncate">
                Quick Direct Upload
              </span>
            </div>

            <button 
              type="button"
              onClick={() => setIsDirectUploadModalOpen(false)} 
              className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 text-left mb-12">
            
            {/* Modal Title Subheader */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-display">Quick Direct Upload</h3>
                  <p className="text-xs text-zinc-400">Upload Poster & Banner images + Video file directly without typing URLs</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDirectUploadModalOpen(false)} 
                className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Banner */}
            {directUploadSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex flex-col items-center gap-3 animate-in fade-in justify-center text-center">
                <CheckCircle2 className="w-8 h-8 shrink-0 text-emerald-400" />
                <div>
                  <div className="font-extrabold text-base text-white">Upload & Content Creation Successful!</div>
                  <div className="text-xs text-emerald-300 mt-0.5">"{directTitle}" has been added to your media library.</div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <button 
                    type="button"
                    onClick={() => setIsDirectUploadModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Movies List
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setDirectTitle('');
                      setDirectDescription('');
                      setDirectPosterDataUrl('');
                      setDirectBannerDataUrl('');
                      setDirectTrailerDataUrl('');
                      setDirectVideoDataUrl('');
                      setDirectUploadSuccess(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDirectUploadSubmit} className="space-y-4 text-xs">
                
                {/* 1. Title & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-zinc-200 block mb-1">Content Title *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Naruto Shippuden Movie / Avengers Endgame" 
                      value={directTitle} 
                      onChange={(e) => setDirectTitle(e.target.value)} 
                      className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-xl focus:border-sky-500 focus:outline-none font-medium" 
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-200 block mb-1">Type *</label>
                    <select 
                      value={directType} 
                      onChange={(e) => setDirectType(e.target.value as any)} 
                      className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-xl focus:border-sky-500 focus:outline-none font-bold"
                    >
                      <option value="movie">Movie</option>
                      <option value="anime">Anime Series</option>
                    </select>
                  </div>
                </div>

                {/* 2. Description */}
                <div>
                  <label className="font-bold text-zinc-200 block mb-1">Description / Synopsis</label>
                  <textarea 
                    rows={2} 
                    placeholder="Enter brief description..." 
                    value={directDescription} 
                    onChange={(e) => setDirectDescription(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-xl focus:border-sky-500 focus:outline-none resize-none" 
                  />
                </div>

                {/* 3. Poster Image File Upload & Banner Image File Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  
                  {/* Poster Image File Picker */}
                  <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <label className="font-bold text-zinc-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><ImageIcon className="w-4 h-4 text-sky-400" /> Poster Image Upload</span>
                      <span className="text-[10px] text-zinc-500">Image File</span>
                    </label>

                    <div className="relative border-2 border-dashed border-zinc-700 hover:border-sky-500 rounded-xl p-3 text-center bg-zinc-900 transition-colors group cursor-pointer overflow-hidden">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleDirectPosterUpload} 
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" 
                      />
                      {directPosterDataUrl ? (
                        <div className="flex items-center gap-3 text-left">
                          <img src={directPosterDataUrl} alt="Poster preview" className="w-12 h-16 object-cover rounded-lg border border-zinc-700 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Image Selected
                            </span>
                            <span className="text-[10px] text-zinc-400 block truncate">Click to change poster</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2 space-y-1">
                          <Upload className="w-5 h-5 mx-auto text-sky-400" />
                          <div className="text-xs font-bold text-white">Upload Poster Image</div>
                          <div className="text-[10px] text-zinc-400">PNG, JPG, WEBP</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Banner Image File Picker */}
                  <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <label className="font-bold text-zinc-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><ImageIcon className="w-4 h-4 text-purple-400" /> Banner Backdrop Upload</span>
                      <span className="text-[10px] text-zinc-500">Image File</span>
                    </label>

                    <div className="relative border-2 border-dashed border-zinc-700 hover:border-purple-500 rounded-xl p-3 text-center bg-zinc-900 transition-colors group cursor-pointer overflow-hidden">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleDirectBannerUpload} 
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" 
                      />
                      {directBannerDataUrl ? (
                        <div className="flex items-center gap-3 text-left">
                          <img src={directBannerDataUrl} alt="Banner preview" className="w-16 h-12 object-cover rounded-lg border border-zinc-700 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Banner Selected
                            </span>
                            <span className="text-[10px] text-zinc-400 block truncate">Click to change banner</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2 space-y-1">
                          <Upload className="w-5 h-5 mx-auto text-purple-400" />
                          <div className="text-xs font-bold text-white">Upload Banner Image</div>
                          <div className="text-[10px] text-zinc-400">PNG, JPG, WEBP</div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* 4. Video Files: 1st Trailer Import & 2nd Main Video File Import */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  
                  {/* 1st Option: Trailer Import */}
                  <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <label className="font-bold text-zinc-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><VideoIcon className="w-4 h-4 text-amber-400" /> 1st: Trailer Video Import</span>
                      <span className="text-[10px] text-amber-400 font-mono">Trailer Clip</span>
                    </label>

                    <div className="relative border-2 border-dashed border-zinc-700 hover:border-amber-500 rounded-xl p-3 text-center bg-zinc-900 transition-colors group cursor-pointer overflow-hidden">
                      <input 
                        type="file" 
                        accept="video/*,.mp4,.webm,.mkv,.mov,.avi" 
                        onChange={handleDirectTrailerUpload} 
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" 
                      />
                      {directTrailerDataUrl ? (
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                            <FileVideo className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Trailer Imported
                            </span>
                            <span className="text-[10px] text-zinc-300 font-mono block truncate">{directTrailerFileName || 'Trailer Video'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2 space-y-1">
                          <FileVideo className="w-5 h-5 mx-auto text-amber-400" />
                          <div className="text-xs font-bold text-white">Import Trailer File</div>
                          <div className="text-[10px] text-zinc-400">Played first before movie</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2nd Option: Main Movie / Full Video Import */}
                  <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <label className="font-bold text-zinc-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><VideoIcon className="w-4 h-4 text-rose-400" /> 2nd: Main Video Import</span>
                      <span className="text-[10px] text-rose-400 font-mono">Full Movie</span>
                    </label>

                    <div className="relative border-2 border-dashed border-zinc-700 hover:border-rose-500 rounded-xl p-3 text-center bg-zinc-900 transition-colors group cursor-pointer overflow-hidden">
                      <input 
                        type="file" 
                        accept="video/*,.mp4,.webm,.mkv,.mov,.avi" 
                        onChange={handleDirectVideoUpload} 
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" 
                      />
                      {directVideoDataUrl ? (
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                            <FileVideo className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Full Video Imported
                            </span>
                            <span className="text-[10px] text-zinc-300 font-mono block truncate">{directVideoFileName || 'Main Movie Video'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2 space-y-1">
                          <FileVideo className="w-5 h-5 mx-auto text-rose-400" />
                          <div className="text-xs font-bold text-white">Import Full Movie / Episode</div>
                          <div className="text-[10px] text-zinc-400">Played after trailer ends</div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Submit & Cancel / Back Buttons */}
                <div className="flex items-center gap-3 pt-3">
                  <button 
                    type="button"
                    onClick={() => setIsDirectUploadModalOpen(false)}
                    className="flex-1 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs border border-zinc-700 cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back / Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={!directTitle.trim()} 
                    className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-sky-600/30 cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" /> Save Content Item
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* Modal Add / Edit Form for Single Item */}
      {isFormOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFormOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-start p-3 sm:p-6 overflow-y-auto"
        >
          {/* Persistent Floating Back Button */}
          <button 
            type="button"
            onClick={() => setIsFormOpen(false)}
            className="fixed top-4 left-4 z-[70] flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back / Wapas</span>
          </button>

          {/* Sticky Top Header Bar */}
          <div className="sticky top-2 z-50 w-full max-w-3xl py-2.5 px-4 mb-3 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 shrink-0">
            <button 
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back / Wapas</span>
            </button>

            <span className="text-xs sm:text-sm font-bold text-white truncate">
              {editingMovieId ? 'Edit Content' : 'Add New Movie or Anime'}
            </span>

            <button 
              type="button"
              onClick={() => setIsFormOpen(false)} 
              className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 mb-12 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-black text-white font-display">
                {editingMovieId ? 'Edit Content' : 'Add New Movie or Anime'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Title *</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Type *</label>
                  <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl">
                    <option value="movie">Movie</option>
                    <option value="anime">Anime Series</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Description / Synopsis</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Poster Image URL / File</label>
                  <div className="flex gap-2">
                    <input type="text" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} placeholder="https://... or select image file" className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl focus:border-red-500 focus:outline-none" />
                    <label className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 rounded-xl cursor-pointer flex items-center shrink-0">
                      Upload
                      <input type="file" accept="image/*" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressImage(file, 600, 900, 0.85);
                            setPosterUrl(compressed);
                          } catch {
                            const reader = new FileReader();
                            reader.onload = (ev) => { if (ev.target?.result) setPosterUrl(ev.target.result as string); };
                            reader.readAsDataURL(file);
                          }
                        }
                      }} className="hidden" />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Banner Backdrop URL / File</label>
                  <div className="flex gap-2">
                    <input type="text" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://... or select image file" className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl focus:border-red-500 focus:outline-none" />
                    <label className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 rounded-xl cursor-pointer flex items-center shrink-0">
                      Upload
                      <input type="file" accept="image/*" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressImage(file, 1280, 720, 0.85);
                            setBannerUrl(compressed);
                          } catch {
                            const reader = new FileReader();
                            reader.onload = (ev) => { if (ev.target?.result) setBannerUrl(ev.target.result as string); };
                            reader.readAsDataURL(file);
                          }
                        }
                      }} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Main Stream Video URL / Local File *</label>
                  <div className="flex gap-2">
                    <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Direct MP4/HLS link or Google Drive link" className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl focus:border-red-500 focus:outline-none font-mono text-[11px]" />
                    <label className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white rounded-xl cursor-pointer flex items-center shrink-0 gap-1">
                      <VideoIcon className="w-3.5 h-3.5" /> Video File
                      <input type="file" accept="video/*,.mp4,.mkv,.webm,.mov,.avi" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const mediaId = `media_vid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
                          await saveMediaBlob(mediaId, file, { type: file.type, name: file.name });
                          setVideoUrl(`media://${mediaId}`);
                        }
                      }} className="hidden" />
                    </label>
                  </div>
                  {isGoogleDriveUrl(videoUrl) ? (
                    <div className="mt-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Google Drive Video Detected</span>
                      </div>
                      <p className="text-zinc-300 text-[10px] leading-relaxed">
                        ⚠️ <strong>Dhyan dein:</strong> Google Drive mein is video file ki General Access ko <strong>"Anyone with the link" (Public/Viewer)</strong> set karna zaruri hai. Agar restricted raha toh video play nahi hogi.
                      </p>
                      <a 
                        href={videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 underline font-semibold text-[10px]"
                      >
                        <span>Open Drive to Check/Set Access</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-500 mt-1">Paste MP4 / HLS / Google Drive link OR click 'Video File' to pick from device.</p>
                  )}
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Trailer Video URL / Local File</label>
                  <div className="flex gap-2">
                    <input type="text" value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)} placeholder="Direct trailer link or select video file" className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl focus:border-red-500 focus:outline-none font-mono text-[11px]" />
                    <label className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white rounded-xl cursor-pointer flex items-center shrink-0 gap-1">
                      <VideoIcon className="w-3.5 h-3.5" /> Trailer File
                      <input type="file" accept="video/*,.mp4,.mkv,.webm,.mov,.avi" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const mediaId = `media_trailer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
                          await saveMediaBlob(mediaId, file, { type: file.type, name: file.name });
                          setTrailerUrl(`media://${mediaId}`);
                        }
                      }} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">IMDb Rating</label>
                  <input type="number" step="0.1" value={imdbRating} onChange={(e) => setImdbRating(parseFloat(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Age Rating</label>
                  <input type="text" value={ageRating} onChange={(e) => setAgeRating(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Category</label>
                  <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Genres (comma sep)</label>
                  <input type="text" value={genresText} onChange={(e) => setGenresText(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl" />
                </div>
              </div>

              {/* External Download Links Section */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="font-bold text-amber-400">External Download Links (Optional)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input type="text" placeholder="Google Drive Link" value={gdriveLink} onChange={(e) => setGdriveLink(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-white p-2 rounded-lg" />
                  <input type="text" placeholder="Direct Video ZIP Link" value={zipLink} onChange={(e) => setZipLink(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-white p-2 rounded-lg" />
                  <input type="text" placeholder="Direct MP4 URL" value={directLink} onChange={(e) => setDirectLink(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-white p-2 rounded-lg" />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-red-600" />
                  Featured Billboard
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                  <input type="checkbox" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} className="accent-red-600" />
                  Trending Row
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-400">
                  <input type="checkbox" checked={isPremiumOnly} onChange={(e) => setIsPremiumOnly(e.target.checked)} className="accent-amber-500" />
                  VIP Premium Only
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)} 
                  className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs border border-zinc-700 cursor-pointer flex items-center justify-center gap-2 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back / Cancel
                </button>
                <button type="submit" className="flex-[2] py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm cursor-pointer shadow-lg shadow-red-600/30 transition-all">
                  Save Content Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

