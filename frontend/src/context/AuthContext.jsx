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

// Map Firebase error codes to clean, friendly messages
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
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

const getLocalUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('ecotrail_users') || '{}');
  } catch (e) {
    return {};
  }
};

const saveLocalUser = (email, userObj) => {
  try {
    const users = getLocalUsers();
    users[email.toLowerCase()] = userObj;
    localStorage.setItem('ecotrail_users', JSON.stringify(users));
  } catch (e) {}
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Synchronize Firebase Auth state
  useEffect(() => {
    const savedSession = localStorage.getItem('ecotrail_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setUser(parsed.user);
        setProfile(parsed.profile);
      } catch (e) {
        localStorage.removeItem('ecotrail_session');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const idToken = await firebaseUser.getIdToken();
          const userProfile = await syncFirebaseAuth(idToken);
          setProfile(userProfile);
        } catch (err) {
          console.warn('Backend sync note:', err.message);
          setProfile({
            firebase_uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || '',
          });
        }
      } else if (!localStorage.getItem('ecotrail_session')) {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign Up: Create a new account. If email already exists, throw explicit error!
  const signup = async (name, email, password) => {
    if (!email || !email.trim()) {
      throw new Error('Please enter your email address.');
    }
    if (!password) {
      throw new Error('Please enter a password.');
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const newUser = userCredential.user;

      if (name && name.trim()) {
        try {
          await updateProfile(newUser, { displayName: name.trim() });
        } catch (e) {}
      }

      let userProfile = null;
      try {
        const idToken = await newUser.getIdToken(true);
        userProfile = await syncFirebaseAuth(idToken);
      } catch (backendError) {
        console.warn('Django sync notice:', backendError);
        userProfile = {
          firebase_uid: newUser.uid,
          email: newUser.email,
          name: name.trim() || cleanEmail.split('@')[0],
        };
      }

      setUser(newUser);
      setProfile(userProfile);
      localStorage.removeItem('ecotrail_session');
      return { user: newUser, profile: userProfile };
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        const customErr = new Error('An account with this email already exists. Please log in.');
        customErr.code = 'auth/email-already-in-use';
        throw customErr;
      }

      if (err.code === 'auth/configuration-not-found') {
        const existingUsers = getLocalUsers();
        if (existingUsers[cleanEmail]) {
          const customErr = new Error('An account with this email already exists. Please log in.');
          customErr.code = 'auth/email-already-in-use';
          throw customErr;
        }

        const mockUid = 'uid_' + Math.abs(cleanEmail.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
        const fallbackUser = {
          uid: mockUid,
          email: cleanEmail,
          displayName: name.trim() || cleanEmail.split('@')[0],
          getIdToken: async () => 'mock_token_' + mockUid,
        };
        const fallbackProfile = {
          id: 1,
          firebase_uid: mockUid,
          name: fallbackUser.displayName,
          email: cleanEmail,
        };

        saveLocalUser(cleanEmail, { password, user: fallbackUser, profile: fallbackProfile });
        setUser(fallbackUser);
        setProfile(fallbackProfile);
        localStorage.setItem('ecotrail_session', JSON.stringify({ user: fallbackUser, profile: fallbackProfile }));
        return { user: fallbackUser, profile: fallbackProfile };
      }

      throw err;
    }
  };

  // Log In: Authenticate existing account
  const login = async (email, password) => {
    if (!email || !email.trim()) {
      throw new Error('Please enter your email address.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const loggedInUser = userCredential.user;

      let userProfile = null;
      try {
        const idToken = await loggedInUser.getIdToken();
        userProfile = await syncFirebaseAuth(idToken);
      } catch (backendError) {
        console.warn('Django sync notice:', backendError);
        userProfile = {
          firebase_uid: loggedInUser.uid,
          email: loggedInUser.email,
          name: loggedInUser.displayName || cleanEmail.split('@')[0],
        };
      }

      setUser(loggedInUser);
      setProfile(userProfile);
      localStorage.removeItem('ecotrail_session');
      return { user: loggedInUser, profile: userProfile };
    } catch (err) {
      if (err.code === 'auth/configuration-not-found') {
        const existingUsers = getLocalUsers();
        const record = existingUsers[cleanEmail];
        if (!record) {
          const customErr = new Error('No account found with this email. Please create an account.');
          customErr.code = 'auth/user-not-found';
          throw customErr;
        }
        if (record.password !== password) {
          const customErr = new Error('Incorrect password. Please try again.');
          customErr.code = 'auth/wrong-password';
          throw customErr;
        }

        setUser(record.user);
        setProfile(record.profile);
        localStorage.setItem('ecotrail_session', JSON.stringify({ user: record.user, profile: record.profile }));
        return { user: record.user, profile: record.profile };
      }

      throw err;
    }
  };

  // Google Sign-in
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      let googleProfile = null;
      try {
        const idToken = await googleUser.getIdToken();
        googleProfile = await syncFirebaseAuth(idToken);
      } catch (e) {
        googleProfile = {
          firebase_uid: googleUser.uid,
          email: googleUser.email,
          name: googleUser.displayName || '',
        };
      }
      setUser(googleUser);
      setProfile(googleProfile);
      return { user: googleUser, profile: googleProfile };
    } catch (err) {
      console.error('Google sign-in error:', err);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    localStorage.removeItem('ecotrail_session');
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
