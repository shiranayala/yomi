import { initializeApp } from 'firebase/app';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  collection, doc,
  getDocs, getDocsFromCache, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, type Firestore,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const apiKey    = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

let db:   Firestore | null = null;
let auth: ReturnType<typeof getAuth> | null = null;

if (apiKey && projectId) {
  const app = initializeApp({
    apiKey,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  });
  // Keep a copy of the data on the device so the app opens instantly
  db   = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
  auth = getAuth(app);
}

export { db, auth, collection, doc, getDocs, getDocsFromCache, setDoc, updateDoc, deleteDoc, onSnapshot, query };

export type { User } from 'firebase/auth';
export {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  verifyBeforeUpdateEmail,
  updateProfile,
  signOut as authSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
