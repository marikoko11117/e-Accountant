import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured, db } from '../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_STORAGE_KEY = 'e_accountant_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(false);

  useEffect(() => {
    // Check if previously logged in as demo user
    const savedDemo = localStorage.getItem(DEMO_STORAGE_KEY);
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        setUser(parsed);
        setIsDemo(true);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem(DEMO_STORAGE_KEY);
      }
    }

    // Check Firebase Auth if configured
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            isDemo: false,
          });
          setIsDemo(false);
        } else {
          setUser(null);
          setIsDemo(false);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Firebase not configured yet
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase credentials are not configured in .env.local. You can use Quick Demo Sign In to test immediately.');
    }
    const cred = await signInWithEmailAndPassword(auth, email, password);
    setUser({
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'User',
      isDemo: false,
    });
    setIsDemo(false);
  };

  const signUp = async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase credentials are not configured in .env.local. You can use Quick Demo Sign In to test immediately.');
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Initialize the user profile in Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || email.split('@')[0],
          baseCurrency: 'USD',
          preferredLanguage: 'en',
          theme: 'light',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.error('Failed to create initial user document in Firestore:', err);
      }
    }

    setUser({
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'User',
      isDemo: false,
    });
    setIsDemo(false);
  };

  const signOut = async () => {
    if (isDemo) {
      localStorage.removeItem(DEMO_STORAGE_KEY);
      setUser(null);
      setIsDemo(false);
      return;
    }

    if (auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    setIsDemo(false);
  };

  const signInAsDemo = () => {
    const demoUser: AuthUser = {
      uid: 'demo-practitioner-01',
      email: 'demo@e-accountant.local',
      displayName: 'Alex Morgan, CPA',
      isDemo: true,
    };
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    setIsDemo(true);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemo, signIn, signUp, signOut, signInAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
