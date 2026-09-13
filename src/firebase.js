import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import appletConfig from '../firebase-applet-config.json';

const cleanEnv = (val) => (typeof val === 'string' ? val.replace(/^["']|["']$/g, '').trim() : val);

const firebaseConfig = {
  apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY) || appletConfig.apiKey,
  authDomain: cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || appletConfig.authDomain,
  projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID) || appletConfig.projectId,
  storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || appletConfig.storageBucket,
  messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || appletConfig.messagingSenderId,
  appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID) || appletConfig.appId,
  measurementId: cleanEnv(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) || appletConfig.measurementId || ''
};

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || 
  (firebaseConfig.projectId === appletConfig.projectId ? appletConfig.firestoreDatabaseId : undefined);

// Initialize modular Firebase instance (guarding against duplicate initializations)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth service
export const auth = getAuth(app);

// Firestore database (using custom databaseId provisioned by AI Studio)
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

// Firebase Analytics (supported in browser environments, only when measurementId is configured)
export let analytics = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  isSupported()
    .then((supported) => {
      if (supported) {
        try {
          analytics = getAnalytics(app);
        } catch (err) {
          console.warn('Could not initialize Firebase Analytics:', err);
        }
      }
    })
    .catch((err) => {
      console.warn('Firebase Analytics not supported in this environment:', err);
    });
}

export default app;

