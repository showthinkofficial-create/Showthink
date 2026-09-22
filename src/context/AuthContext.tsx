import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { authService } from '../services/authService';
import { UserProfile } from '../types/auth';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string, returnPath?: string) => Promise<void>;
  verifyResetCode: (code: string) => Promise<string>;
  confirmPasswordReset: (code: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (firebaseUser: FirebaseUser): Promise<UserProfile | null> => {
    try {
      const profile = await authService.getUserProfile(firebaseUser.uid);
      if (!profile) {
        // If user document does not exist in Firestore yet (e.g., initial test user),
        // fallback user profile for graceful handling
        setUserProfile(null);
        setError('User record not found in system database. Please contact school administration.');
        return null;
      }

      if (profile.status === 'DISABLED' || profile.loginEnabled === false) {
        await authService.logout();
        setUser(null);
        setUserProfile(null);
        setError('Your GP Academy portal account is currently inactive. Please contact the school administration.');
        return null;
      }

      setUserProfile(profile);
      setError(null);
      return profile;
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setUserProfile(null);
      setError('Failed to verify user account permissions.');
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setError(null);
    setLoading(true);
    try {
      const firebaseUser = await authService.login(email, password);
      const profile = await fetchProfile(firebaseUser);
      if (!profile) {
        throw new Error(error || 'User profile authorization failed.');
      }
      return profile;
    } catch (err: any) {
      let msg = err.message || 'Authentication failed.';
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        msg = 'Invalid email or password. Please verify your credentials.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please try again later.';
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    setError(null);
    setLoading(true);
    try {
      const firebaseUser = await authService.loginWithGoogle();
      const profile = await fetchProfile(firebaseUser);
      if (!profile) {
        throw new Error(error || 'User profile authorization failed.');
      }
      return profile;
    } catch (err: any) {
      let msg = err.message || 'Google sign-in failed.';
      if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Google sign-in popup was closed before completion.';
      } else if (err.code === 'auth/popup-blocked') {
        msg = 'Sign-in popup was blocked by browser. Please enable popups for this page.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        msg = 'Previous Google sign-in attempt was cancelled.';
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setUserProfile(null);
      setError(null);
    } catch (err: any) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string, returnPath?: string) => {
    setError(null);
    try {
      await authService.sendPasswordReset(email, returnPath);
    } catch (err: any) {
      let msg = err.message || 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No registered account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many requests. Please wait a few moments before trying again.';
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const verifyResetCode = async (code: string): Promise<string> => {
    setError(null);
    try {
      return await authService.verifyPasswordResetCode(code);
    } catch (err: any) {
      let msg = 'The password reset link is invalid or has expired.';
      if (err.code === 'auth/expired-action-code') {
        msg = 'This password reset link has expired. Please request a new one.';
      } else if (err.code === 'auth/invalid-action-code') {
        msg = 'This password reset link is invalid or has already been used.';
      } else if (err.code === 'auth/user-disabled') {
        msg = 'This user account has been disabled.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No account found corresponding to this security token.';
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const confirmPasswordReset = async (code: string, newPassword: string): Promise<void> => {
    setError(null);
    try {
      await authService.confirmPasswordReset(code, newPassword);
    } catch (err: any) {
      let msg = 'Failed to update password.';
      if (err.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please choose a password with at least 6 characters.';
      } else if (err.code === 'auth/expired-action-code' || err.code === 'auth/invalid-action-code') {
        msg = 'This password reset link has expired or is invalid. Please request a new reset link.';
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const clearError = () => setError(null);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        error,
        login,
        loginWithGoogle,
        logout,
        sendPasswordReset,
        verifyResetCode,
        confirmPasswordReset,
        clearError,
        refreshProfile,
      }}
    >
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
