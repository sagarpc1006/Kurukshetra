import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { syncFirebaseAuth } from '../api/client';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Map Firebase error codes to user-friendly messages
export const getFriendlyErrorMessage = (error) => {
  if (!error) return '';
  const code = error.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please log in.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password. Please try again.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Another sign-in window is already open. Please complete or close it.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Console (Authentication > Settings > Authorized domains).';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a few moments and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
      return 'Invalid Firebase API key. Please check your configuration.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Synchronize Firebase Auth state as the single source of truth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const idToken = await firebaseUser.getIdToken();
          const userProfile = await syncFirebaseAuth(idToken);
          setProfile(userProfile);
        } catch (err) {
          console.warn('Backend profile sync note:', err.message);
          setProfile({
            firebase_uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || '',
          });
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign Up: Create a new account using real Firebase Auth
  const signup = async (name, email, password) => {
    if (!email || !email.trim()) {
      throw new Error('Please enter your email address.');
    }
    if (!password) {
      throw new Error('Please enter a password.');
    }
    if (password.length < 6) {
      const err = new Error('Password should be at least 6 characters long.');
      err.code = 'auth/weak-password';
      throw err;
    }

    const cleanEmail = email.trim().toLowerCase();
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const newUser = userCredential.user;

    if (name && name.trim()) {
      try {
        await updateProfile(newUser, { displayName: name.trim() });
      } catch (profileErr) {
        console.warn('Could not update display name:', profileErr);
      }
    }

    let userProfile = null;
    try {
      const idToken = await newUser.getIdToken(true);
      userProfile = await syncFirebaseAuth(idToken);
    } catch (backendError) {
      console.warn('Django sync note:', backendError);
      userProfile = {
        firebase_uid: newUser.uid,
        email: newUser.email,
        name: name.trim() || cleanEmail.split('@')[0],
      };
    }

    setUser(newUser);
    setProfile(userProfile);
    return { user: newUser, profile: userProfile };
  };

  // Log In: Authenticate existing account using real Firebase Auth
  const login = async (email, password) => {
    if (!email || !email.trim()) {
      throw new Error('Please enter your email address.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const loggedInUser = userCredential.user;

    let userProfile = null;
    try {
      const idToken = await loggedInUser.getIdToken();
      userProfile = await syncFirebaseAuth(idToken);
    } catch (backendError) {
      console.warn('Django sync note:', backendError);
      userProfile = {
        firebase_uid: loggedInUser.uid,
        email: loggedInUser.email,
        name: loggedInUser.displayName || cleanEmail.split('@')[0],
      };
    }

    setUser(loggedInUser);
    setProfile(userProfile);
    return { user: loggedInUser, profile: userProfile };
  };

  // Google Sign-in using real Firebase Auth Popup
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const googleUser = result.user;

    let googleProfile = null;
    try {
      const idToken = await googleUser.getIdToken();
      googleProfile = await syncFirebaseAuth(idToken);
    } catch (err) {
      console.warn('Django Google sync note:', err);
      googleProfile = {
        firebase_uid: googleUser.uid,
        email: googleUser.email,
        name: googleUser.displayName || '',
      };
    }

    setUser(googleUser);
    setProfile(googleProfile);
    return { user: googleUser, profile: googleProfile };
  };

  // Logout using real Firebase signOut
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
