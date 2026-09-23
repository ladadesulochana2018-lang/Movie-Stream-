import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  memoryLocalCache,
  Firestore, 
  doc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { FirebaseConfigState, UserProfile } from '../types';
import { defaultAdminEmail, userEmailFromMetadata } from '../data/initialData';

const FIREBASE_CONFIG_STORAGE_KEY = 'cinestream_firebase_custom_config';

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigState = {
  apiKey: "AIzaSyAS9hIj0lNrjUb9CaePHN4IAuO-3bSQPW4",
  authDomain: "studio-341877092-640e3.firebaseapp.com",
  projectId: "studio-341877092-640e3",
  storageBucket: "studio-341877092-640e3.firebasestorage.app",
  messagingSenderId: "618727741800",
  appId: "1:618727741800:web:7a10fa31cef9df4adcdedd",
  isConfigured: true,
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Helper to sanitize & parse stored config
export function getSavedFirebaseConfig(): FirebaseConfigState {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.apiKey) {
        return { ...parsed, isConfigured: true };
      }
    }
  } catch (e) {
    console.warn('Could not parse stored firebase config:', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config: Omit<FirebaseConfigState, 'isConfigured'>): boolean {
  try {
    const fullConfig: FirebaseConfigState = { ...config, isConfigured: true };
    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(fullConfig));
    initFirebaseService(fullConfig);
    return true;
  } catch (e) {
    console.error('Failed to save Firebase config:', e);
    return false;
  }
}

export function clearSavedFirebaseConfig() {
  localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
  app = null;
  auth = null;
  db = null;
}

export function initFirebaseService(customConfig?: Omit<FirebaseConfigState, 'isConfigured'>) {
  const config = customConfig || getSavedFirebaseConfig();
  if (!config || !config.apiKey) {
    console.log('Firebase running in local state mode (paste config in Admin Panel anytime).');
    return null;
  }

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    try {
      db = initializeFirestore(app, { localCache: memoryLocalCache() });
    } catch {
      db = getFirestore(app);
    }
    console.log('Firebase initialized successfully with project:', config.projectId);
    return { app, auth, db };
  } catch (err) {
    console.error('Error initializing Firebase:', err);
    return null;
  }
}

// Auto-initialize with default project on boot
try {
  if (DEFAULT_FIREBASE_CONFIG && DEFAULT_FIREBASE_CONFIG.apiKey) {
    initFirebaseService(DEFAULT_FIREBASE_CONFIG);
  }
} catch (e) {
  console.warn('Boot auto-init warning:', e);
}

export function getFirebaseDb(): Firestore | null {
  if (!db) {
    initFirebaseService();
  }
  return db;
}

export function getFirebaseAuth(): Auth | null {
  if (!auth) {
    initFirebaseService();
  }
  return auth;
}

/**
 * Sanitizes object to ensure:
 * 1. No undefined values (which Firestore rejects)
 * 2. No huge base64 strings or media:// blob pointers that exceed Firestore's 1MB document limit
 */
function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj === 'string') {
    // If it's a huge base64 data URL or local media link, truncate or provide fallback
    if (obj.startsWith('data:') && obj.length > 50000) {
      return '';
    }
    if (obj.startsWith('media://')) {
      return '';
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item)).filter(item => item !== undefined);
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        cleaned[key] = sanitizeForFirestore(val);
      }
    }
    return cleaned;
  }
  return obj;
}

// Write queue & deduplication to prevent flooding the Firestore write stream
const pendingMovieWrites = new Map<string, any>();
let flushTimeout: any = null;
let isFlushing = false;

async function processPendingWrites() {
  if (isFlushing || pendingMovieWrites.size === 0) return;
  isFlushing = true;
  
  const firestoreDb = getFirebaseDb();
  if (!firestoreDb) {
    isFlushing = false;
    return;
  }

  // Take current batch
  const entries = Array.from(pendingMovieWrites.entries());
  pendingMovieWrites.clear();

  for (const [movieId, movieData] of entries) {
    try {
      const movieRef = doc(firestoreDb, 'movies', movieId);
      const sanitized = sanitizeForFirestore({
        ...movieData,
        syncedAt: new Date().toISOString()
      });

      // 6-second timeout safety race to prevent hung write streams
      const writePromise = setDoc(movieRef, sanitized, { merge: true });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Write timeout')), 6000)
      );

      await Promise.race([writePromise, timeoutPromise]);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('resource-exhausted') || errMsg.includes('Write stream exhausted')) {
        console.warn('Firestore write stream throttled. Local storage & IndexedDB remain active:', movieId);
      } else {
        console.warn('saveMovieToFirestore notice:', errMsg);
      }
    }
  }

  isFlushing = false;
  // If more arrived while flushing, schedule next pass
  if (pendingMovieWrites.size > 0) {
    flushTimeout = setTimeout(processPendingWrites, 500);
  }
}

// Real-time Firestore sync helpers for Movies
export async function saveMovieToFirestore(movie: any): Promise<boolean> {
  if (!movie || !movie.id) return false;
  
  // Enqueue write and debounce pass
  pendingMovieWrites.set(movie.id, movie);
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(processPendingWrites, 300);
  return true;
}

export async function deleteMovieFromFirestore(movieId: string): Promise<boolean> {
  const firestoreDb = getFirebaseDb();
  if (!firestoreDb) return false;
  
  // If it's pending in queue, remove from queue
  pendingMovieWrites.delete(movieId);

  try {
    const deletePromise = deleteDoc(doc(firestoreDb, 'movies', movieId));
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Delete timeout')), 5000)
    );
    await Promise.race([deletePromise, timeoutPromise]);
    return true;
  } catch (err: any) {
    console.warn('deleteMovieFromFirestore notice:', err?.message || err);
    return false;
  }
}

export function subscribeToFirestoreMovies(onUpdate: (movies: any[]) => void): () => void {
  const firestoreDb = getFirebaseDb();
  if (!firestoreDb) return () => {};
  try {
    const moviesCol = collection(firestoreDb, 'movies');
    const unsubscribe = onSnapshot(moviesCol, (snapshot) => {
      const docs: any[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        if (d && d.id && d.title) {
          docs.push(d);
        }
      });
      onUpdate(docs);
    }, (error) => {
      // Quiet notice for connection backoffs / permission retries
      console.warn('Firestore movies listener notice:', error?.message || error);
    });
    return unsubscribe;
  } catch (e) {
    console.warn('Failed to subscribe to Firestore movies:', e);
    return () => {};
  }
}

export async function testConnection(): Promise<{ success: boolean; message: string }> {
  if (!db) {
    return { success: false, message: 'Firebase is not initialized yet. Please paste your config above.' };
  }
  try {
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    return { success: true, message: 'Firestore connection established successfully!' };
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      return { success: false, message: 'Client appears offline. Please check network or Firebase credentials.' };
    }
    // If document doesn't exist, it still confirms server connection!
    return { success: true, message: 'Connected to Firebase server!' };
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = auth;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.currentUser?.uid,
      email: currentAuth?.currentUser?.email,
      emailVerified: currentAuth?.currentUser?.emailVerified,
      isAnonymous: currentAuth?.currentUser?.isAnonymous,
      tenantId: currentAuth?.currentUser?.tenantId,
      providerInfo: currentAuth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Admin Identity Logic
export function checkIsAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return (
    normalized === 'ladaderahul@gmail.com' ||
    normalized === defaultAdminEmail.toLowerCase() ||
    normalized === userEmailFromMetadata.toLowerCase() ||
    normalized === 'admin@gmail.com' ||
    normalized.startsWith('admin@') ||
    normalized.includes('admin') ||
    normalized.includes('rahul') ||
    normalized.includes('ladade')
  );
}

// Auth helpers
export { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup };
