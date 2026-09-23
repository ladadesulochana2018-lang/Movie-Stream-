import { UserProfile, Movie, CharacterItem } from '../types';

const DB_NAME = 'CineStreamPersistentDB';
const DB_VERSION = 4;
const STORE_NAME = 'user_profiles';
const MEDIA_STORE_NAME = 'persistent_media';
const MOVIES_STORE_NAME = 'persistent_movies';
const CUSTOM_MOVIES_STORE_NAME = 'persistent_custom_movies';
const CHARACTERS_STORE_NAME = 'persistent_characters';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'email' });
      }
      if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
        db.createObjectStore(MEDIA_STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(MOVIES_STORE_NAME)) {
        db.createObjectStore(MOVIES_STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CUSTOM_MOVIES_STORE_NAME)) {
        db.createObjectStore(CUSTOM_MOVIES_STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CHARACTERS_STORE_NAME)) {
        db.createObjectStore(CHARACTERS_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

// Save a single movie directly to IndexedDB
export async function saveSingleMovieToIndexedDB(movie: Movie): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction([MOVIES_STORE_NAME, CUSTOM_MOVIES_STORE_NAME], 'readwrite');
    tx.objectStore(MOVIES_STORE_NAME).put(movie);
    tx.objectStore(CUSTOM_MOVIES_STORE_NAME).put(movie);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB saveSingleMovie warning:', err);
  }
}

export async function deleteSingleMovieFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction([MOVIES_STORE_NAME, CUSTOM_MOVIES_STORE_NAME], 'readwrite');
    tx.objectStore(MOVIES_STORE_NAME).delete(id);
    tx.objectStore(CUSTOM_MOVIES_STORE_NAME).delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB deleteSingleMovie warning:', err);
  }
}

// Save all movies to IndexedDB without destructive clear()
export async function saveMoviesToIndexedDB(movies: Movie[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(MOVIES_STORE_NAME, 'readwrite');
    const store = tx.objectStore(MOVIES_STORE_NAME);
    for (const m of movies) {
      store.put(m);
    }
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB saveMovies warning:', err);
  }
}

export async function getCustomMoviesFromIndexedDB(): Promise<Movie[]> {
  try {
    const db = await openDB();
    if (!db.objectStoreNames.contains(CUSTOM_MOVIES_STORE_NAME)) return [];
    const tx = db.transaction(CUSTOM_MOVIES_STORE_NAME, 'readonly');
    const store = tx.objectStore(CUSTOM_MOVIES_STORE_NAME);
    const req = store.getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => {
        const res = req.result;
        resolve(Array.isArray(res) ? res : []);
      };
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    console.warn('IndexedDB getCustomMovies warning:', err);
    return [];
  }
}

export async function clearMoviesFromIndexedDB(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(MOVIES_STORE_NAME, 'readwrite');
    const store = tx.objectStore(MOVIES_STORE_NAME);
    store.clear();
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB clearMovies warning:', err);
  }
}

export async function getMoviesFromIndexedDB(): Promise<Movie[] | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(MOVIES_STORE_NAME, 'readonly');
    const store = tx.objectStore(MOVIES_STORE_NAME);
    const req = store.getAll();
    return new Promise((resolve, reject) => {
      req.onsuccess = () => {
        const res = req.result;
        if (Array.isArray(res) && res.length > 0) {
          resolve(res);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB getMovies warning:', err);
    return null;
  }
}

export async function saveSingleCharacterToIndexedDB(char: CharacterItem): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(CHARACTERS_STORE_NAME, 'readwrite');
    const store = tx.objectStore(CHARACTERS_STORE_NAME);
    store.put(char);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB saveSingleCharacter warning:', err);
  }
}

export async function deleteSingleCharacterFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(CHARACTERS_STORE_NAME, 'readwrite');
    const store = tx.objectStore(CHARACTERS_STORE_NAME);
    store.delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB deleteSingleCharacter warning:', err);
  }
}

export async function saveCharactersToIndexedDB(chars: CharacterItem[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(CHARACTERS_STORE_NAME, 'readwrite');
    const store = tx.objectStore(CHARACTERS_STORE_NAME);
    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });
    for (const c of chars) {
      store.put(c);
    }
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB saveCharacters warning:', err);
  }
}

export async function getCharactersFromIndexedDB(): Promise<CharacterItem[] | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(CHARACTERS_STORE_NAME, 'readonly');
    const store = tx.objectStore(CHARACTERS_STORE_NAME);
    const req = store.getAll();
    return new Promise((resolve, reject) => {
      req.onsuccess = () => {
        const res = req.result;
        if (Array.isArray(res) && res.length > 0) {
          resolve(res);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB getCharacters warning:', err);
    return null;
  }
}

export async function saveProfileToIndexedDB(profile: UserProfile): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const key = profile.email.toLowerCase();
    store.put({ ...profile, email: key });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB save warning:', err);
  }
}

export async function getProfileFromIndexedDB(email: string): Promise<UserProfile | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const key = email.toLowerCase();
    const req = store.get(key);
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB get warning:', err);
    return null;
  }
}

// Media Blob Storage for Mobile Video & Photos (bypasses 5MB localStorage limit)
export async function saveMediaBlob(id: string, blobOrFile: Blob | File, meta?: { type: string; name?: string }): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(MEDIA_STORE_NAME, 'readwrite');
    const store = tx.objectStore(MEDIA_STORE_NAME);
    store.put({
      id,
      blob: blobOrFile,
      type: meta?.type || blobOrFile.type,
      name: meta?.name || (blobOrFile instanceof File ? blobOrFile.name : 'media'),
      updatedAt: Date.now()
    });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB saveMediaBlob warning:', err);
  }
}

export async function getMediaBlobUrl(id: string): Promise<string | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(MEDIA_STORE_NAME, 'readonly');
    const store = tx.objectStore(MEDIA_STORE_NAME);
    const req = store.get(id);
    return new Promise((resolve, reject) => {
      req.onsuccess = () => {
        const result = req.result;
        if (result && result.blob) {
          const blobUrl = URL.createObjectURL(result.blob);
          resolve(blobUrl);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB getMediaBlobUrl warning:', err);
    return null;
  }
}

export async function deleteMediaBlob(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(MEDIA_STORE_NAME, 'readwrite');
    const store = tx.objectStore(MEDIA_STORE_NAME);
    store.delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB deleteMediaBlob warning:', err);
  }
}

/**
 * Detects if a URL is a Google Drive link
 */
export function isGoogleDriveUrl(url: string): boolean {
  if (!url) return false;
  return /drive\.google\.com|docs\.google\.com/i.test(url);
}

/**
 * Extracts Google Drive File ID from any Google Drive link format
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url) return null;
  const dMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i) || url.match(/\/d\/([a-zA-Z0-9_-]+)/i);
  if (dMatch && dMatch[1]) return dMatch[1];
  
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idMatch && idMatch[1]) return idMatch[1];

  return null;
}

/**
 * Returns the reliable iframe embed preview URL for any Google Drive file
 */
export function formatGoogleDrivePreviewUrl(url: string): string {
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return url;
}

/**
 * Returns the direct stream/download URL for Google Drive file (HTML5 video playback)
 */
export function formatGoogleDriveDirectStreamUrl(url: string): string {
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return url;
}

/**
 * Returns the direct web view URL for Google Drive file (opens in new tab)
 */
export function formatGoogleDriveViewUrl(url: string): string {
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  }
  return url;
}

/**
 * Automatically repairs known broken or 403-forbidden sample video URLs
 */
export function sanitizeVideoUrl(url: string): string {
  if (!url) return '';
  if (url.includes('commondatastorage.googleapis.com')) {
    if (url.includes('Bunny') || url.includes('bunny')) {
      return 'https://media.w3.org/2010/05/bunny/movie.mp4';
    }
    if (url.includes('Sintel') || url.includes('sintel') || url.includes('TearsOfSteel')) {
      return 'https://media.w3.org/2010/05/sintel/trailer.mp4';
    }
    if (url.includes('Elephants') || url.includes('300')) {
      return 'https://media.w3.org/2010/05/video/movie_300.mp4';
    }
    return 'https://media.w3.org/2010/05/bunny/trailer.mp4';
  }
  return url;
}

/**
 * Resolves any playable video URL:
 * - If it's a media:// URL, retrieves the stored File/Blob from IndexedDB and returns a fresh live Object URL.
 * - If it's a Google Drive link, returns the embeddable /preview URL.
 * - If it's a standard HTTP/HTTPS/data: URL, returns it directly (sanitizing any dead sample URLs).
 */
export async function resolvePlayableUrl(urlOrMediaUri: string): Promise<string> {
  if (!urlOrMediaUri) return '';
  if (urlOrMediaUri.startsWith('media://')) {
    const mediaId = urlOrMediaUri.replace('media://', '');
    const blobUrl = await getMediaBlobUrl(mediaId);
    if (blobUrl) return blobUrl;
  }
  if (urlOrMediaUri.startsWith('indexeddb://')) {
    const mediaId = urlOrMediaUri.replace('indexeddb://', '');
    const blobUrl = await getMediaBlobUrl(mediaId);
    if (blobUrl) return blobUrl;
  }
  if (isGoogleDriveUrl(urlOrMediaUri)) {
    return formatGoogleDrivePreviewUrl(urlOrMediaUri);
  }
  return sanitizeVideoUrl(urlOrMediaUri);
}


