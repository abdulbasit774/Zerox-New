import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  role: 'user' | 'admin' | 'moderator';
  profile?: {
    name: string;
    fullName?: string;
    membershipTier: 'Challenger' | 'Elite' | 'Apex Founder';
    creatorRank: number;
    challengerPoints: number;
    identityVerified: boolean;
    createdAt: string;
    provider?: string;
    status?: 'active' | 'inactive' | 'suspended';
    lastLogin?: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loggedIn: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  canAccessAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loggedIn: false,
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch user profile from Firestore
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          const authUser: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            role: 'user', // default role
          };

          if (docSnap.exists()) {
            const userData = docSnap.data();
            authUser.profile = userData as AuthUser['profile'];
            authUser.role = userData.role || 'user';
          }

          setUser(authUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('zerox_kyc_verified');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    loggedIn: !!user,
    isAdmin: user?.role === 'admin' || false,
    isModerator: user?.role === 'moderator' || false,
    canAccessAdmin: (user?.role === 'admin' || user?.role === 'moderator') || false,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
