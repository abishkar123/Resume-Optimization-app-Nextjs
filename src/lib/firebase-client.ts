import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app =
  typeof window !== 'undefined'
    ? getApps().length === 0
      ? initializeApp(firebaseConfig)
      : getApp()
    : null;

export const firebaseAuth = app ? getAuth(app) : null;

export async function loginWithGoogle() {
  if (!firebaseAuth) throw new Error('Firebase not initialized');
  const provider = new GoogleAuthProvider();
  // Force the account chooser every time, even when a Google session is already active.
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(firebaseAuth, provider);
  const token = await result.user.getIdToken();
  return { user: result.user, token };
}

export async function logoutUser() {
  if (!firebaseAuth) throw new Error('Firebase not initialized');
  await signOut(firebaseAuth);
}
