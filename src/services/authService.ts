import { 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types/auth';
import { auditService } from './auditService';

export const authService = {
  // Synchronize or create user profile in Firestore
  async ensureUserProfile(user: FirebaseUser): Promise<UserProfile> {
    const emailLower = (user.email || '').toLowerCase().trim();
    const isSuperAdmin = emailLower === 'showthinkofficial@gmail.com';

    // Strict Security Rule: Never auto-grant elevated roles based on email substrings.
    // Only the verified institutional master email is granted SUPER_ADMIN.
    // All other newly encountered users strictly default to PORTAL_USER.
    const defaultRole: UserRole = isSuperAdmin ? 'SUPER_ADMIN' : 'PORTAL_USER';

    const userRef = doc(db, 'users', user.uid);
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        // If super admin account, guarantee role is SUPER_ADMIN and status is ACTIVE
        if (isSuperAdmin && (data.role !== 'SUPER_ADMIN' || data.status !== 'ACTIVE' || data.loginEnabled === false)) {
          const updated: UserProfile = {
            ...data,
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
            loginEnabled: true,
            updatedAt: new Date().toISOString(),
          };
          await setDoc(userRef, updated, { merge: true });
          return updated;
        }
        return data;
      } else {
        // Document doesn't exist yet in Firestore
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || (isSuperAdmin ? 'Super Administrator' : emailLower.split('@')[0] || 'User'),
          role: defaultRole,
          status: 'ACTIVE',
          loginEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProfile);
        return newProfile;
      }
    } catch (err) {
      console.warn('Could not read/write Firestore users doc; returning profile:', err);
      return {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || (isSuperAdmin ? 'Super Administrator' : emailLower.split('@')[0] || 'User'),
        role: defaultRole,
        status: 'ACTIVE',
        loginEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  // Login with email and password
  async login(email: string, password: string): Promise<FirebaseUser> {
    const cleanEmail = email.trim();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      // Ensure user profile in Firestore
      await this.ensureUserProfile(user);

      // Audit log login success
      const isSuper = (user.email || '').toLowerCase() === 'showthinkofficial@gmail.com';
      await auditService.logAction({
        actorUid: user.uid,
        actorEmail: user.email || cleanEmail,
        actorRole: isSuper ? 'SUPER_ADMIN' : 'USER',
        action: 'LOGIN_SUCCESS',
        targetType: 'AUTH',
        targetId: user.uid,
        targetName: user.email || cleanEmail,
        success: true,
      });

      return user;
    } catch (err: any) {
      // Audit log login failure
      await auditService.logAction({
        actorUid: 'anonymous',
        actorEmail: cleanEmail,
        actorRole: 'ANONYMOUS',
        action: 'LOGIN_FAILED',
        targetType: 'AUTH',
        targetName: cleanEmail,
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
    await this.ensureUserProfile(firebaseUser);

    return firebaseUser;
  },

  // Logout
  async logout(): Promise<void> {
    await signOut(auth);
  },

  // Send official password reset email
  async sendPasswordReset(email: string, returnPath = '/portal/login'): Promise<void> {
    const cleanEmail = email.trim();
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}${returnPath}`,
        handleCodeInApp: false,
      };
      await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);
    } catch (error: any) {
      // If customized continue url is not whitelisted, gracefully send default reset email
      if (
        error?.code === 'auth/unauthorized-continue-uri' ||
        error?.code === 'auth/invalid-continue-uri'
      ) {
        await sendPasswordResetEmail(auth, cleanEmail);
      } else {
        throw error;
      }
    }
  },

  // Verify Firebase password reset action code (official flow)
  async verifyPasswordResetCode(code: string): Promise<string> {
    return await verifyPasswordResetCode(auth, code);
  },

  // Confirm and set new password in Firebase Authentication (official flow)
  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    await confirmPasswordReset(auth, code, newPassword);
  },

  // Fetch user profile from Firestore users/{uid}
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        if ((profile.email || '').toLowerCase() === 'showthinkofficial@gmail.com') {
          profile.role = 'SUPER_ADMIN';
          profile.status = 'ACTIVE';
          profile.loginEnabled = true;
        }
        return profile;
      }
    } catch (error) {
      console.warn('Warning/offline fetching user profile from Firestore:', error);
    }

    // Fallback profile if Firestore is offline or document not created yet
    if (auth.currentUser && auth.currentUser.uid === uid) {
      return await this.ensureUserProfile(auth.currentUser);
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
