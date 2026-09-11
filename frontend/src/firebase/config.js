import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBT4VGOqZRzHKFqngFbmmQYSa2UlbCMcuk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ruralmed-6cf34.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ruralmed-6cf34",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ruralmed-6cf34.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1015295738723",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1015295738723:web:8a3aa287157cf6f327c956",
  measurementId: "G-CH8S3HXNH7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
