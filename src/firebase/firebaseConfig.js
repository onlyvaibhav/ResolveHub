import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase is configured
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

let app = null;
let auth = null;
let db = null;
let storage = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  // Storage is optional — requires Blaze plan on Firebase
  // Will be initialized in Phase 2 when image uploads are implemented
  try {
    const { getStorage } = await import('firebase/storage');
    storage = getStorage(app);
  } catch (error) {
    console.warn('[ResolveHub] Firebase Storage not available. Image uploads will be disabled.');
  }
} else {
  console.warn(
    '[ResolveHub] Firebase is not configured. Create a .env file from .env.example and add your Firebase credentials. See docs/FIREBASE_SETUP.md'
  );
}

export { auth, db, storage };
export default app;
