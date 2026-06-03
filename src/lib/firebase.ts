import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, doc,
  getDocs, setDoc, updateDoc, deleteDoc,
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
  db   = getFirestore(app);
  auth = getAuth(app);
}

export { db, auth, collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query };

export type { User } from 'firebase/auth';
export {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut as authSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
