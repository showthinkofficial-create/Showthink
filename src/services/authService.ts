import { 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types/auth';
import { auditService } from './auditService';

export const authService = {
  // Login with email and password
  async login(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Audit log login success
      await auditService.logAction({
        actorUid: user.uid,
        actorEmail: user.email || email,
        actorRole: 'USER',
        action: 'LOGIN_SUCCESS',
        targetType: 'AUTH',
        targetId: user.uid,
        targetName: user.email || email,
        success: true,
      });

      return user;
    } catch (err: any) {
      // Audit log login failure
      await auditService.logAction({
        actorUid: 'anonymous',
        actorEmail: email,
        actorRole: 'ANONYMOUS',
        action: 'LOGIN_FAILED',
        targetType: 'AUTH',
        targetName: email,
        success: false,
        metadata: {
          errorCode: err.code || 'UNKNOWN_ERROR',
        },
      });
      throw err;
    }
  },

  // Login with Google Provider
  async loginWithGoogle(): Promise<FirebaseUser> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;

    // Ensure user profile document exists in Firestore
    const userRef = doc(db, 'users', firebaseUser.uid);
    try {
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        const emailLower = (firebaseUser.email || '').toLowerCase();
        let role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PORTAL_USER' = 'PORTAL_USER';
        if (emailLower.includes('admin') || emailLower === 'showthinkofficial@gmail.com') {
          role = 'ADMIN';
        } else if (emailLower.includes('teacher') || emailLower.includes('faculty')) {
          role = 'TEACHER';
        }

        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || emailLower.split('@')[0] || 'User',
          role: role,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(userRef, newProfile);
      }
    } catch (error) {
      console.warn('Warning creating/checking Google user profile in Firestore:', error);
    }

    return firebaseUser;
  },

  // Logout
  async logout(): Promise<void> {
    await signOut(auth);
  },

  // Send password reset email
  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  // Fetch user profile from Firestore users/{uid}
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
    } catch (error) {
      console.warn('Warning/offline fetching user profile from Firestore:', error);
    }

    // Fallback profile if Firestore is offline, document not found, or connection failed
    if (auth.currentUser && auth.currentUser.uid === uid) {
      const emailLower = (auth.currentUser.email || '').toLowerCase();
      let role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PORTAL_USER' = 'PORTAL_USER';
      if (emailLower.includes('admin') || emailLower === 'showthinkofficial@gmail.com') {
        role = 'ADMIN';
      } else if (emailLower.includes('teacher') || emailLower.includes('faculty')) {
        role = 'TEACHER';
      }
      return {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || '',
        displayName: auth.currentUser.displayName || emailLower.split('@')[0] || 'User',
        role: role,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return null;
  },

  // Helper to ensure initial user profile doc exists if needed for testing/seeding
  async createInitialProfileDoc(profile: UserProfile): Promise<void> {
    const userRef = doc(db, 'users', profile.uid);
    try {
      await setDoc(userRef, profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${profile.uid}`);
    }
  }
};
