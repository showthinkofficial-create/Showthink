import { initializeApp, deleteApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signOut as authSignOut,
  sendPasswordResetEmail 
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  PortalUser, 
  PortalStudentLink, 
  PortalUserWithStudents, 
  CreatePortalUserFormData 
} from '../types/portalUser';
import { Student } from '../types/student';
import { auditService } from './auditService';

const USERS_COLLECTION = 'users';
const LINKS_COLLECTION = 'portalStudentLinks';
const STUDENTS_COLLECTION = 'students';

export const portalUserService = {
  /**
   * Fetch all Portal Users with their linked students
   */
  async getPortalUsers(): Promise<PortalUserWithStudents[]> {
    try {
      // 1. Fetch users with role PORTAL_USER (or legacy STUDENT/PARENT if any)
      const qUsers = query(collection(db, USERS_COLLECTION));
      const usersSnap = await getDocs(qUsers);
      
      const portalUsersList: PortalUser[] = [];
      usersSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const role = data.role;
        if (role === 'PORTAL_USER' || role === 'STUDENT' || role === 'PARENT') {
          portalUsersList.push({
            uid: data.uid || docSnap.id,
            email: data.email || '',
            displayName: data.displayName || 'Portal User',
            role: data.role || 'PORTAL_USER',
            status: data.status || 'ACTIVE',
            loginEnabled: data.loginEnabled !== undefined ? Boolean(data.loginEnabled) : (data.status !== 'DISABLED'),
            linkedStudents: data.linkedStudents || [],
            linkedStudentIds: data.linkedStudentIds || [],
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        }
      });

      // 2. Fetch all portalStudentLinks
      const linksSnap = await getDocs(collection(db, LINKS_COLLECTION));
      const linksMap = new Map<string, PortalStudentLink[]>();
      linksSnap.forEach((docSnap) => {
        const link = docSnap.data() as PortalStudentLink;
        if (link.status !== 'DISABLED') {
          const userLinks = linksMap.get(link.portalUserUid) || [];
          userLinks.push(link);
          linksMap.set(link.portalUserUid, userLinks);
        }
      });

      // 3. Fetch all students for mapping
      const studentsSnap = await getDocs(collection(db, STUDENTS_COLLECTION));
      const studentsById = new Map<string, Student>();
      const studentsByUid = new Map<string, Student>();
      const studentsByAuthUid = new Map<string, Student[]>();

      studentsSnap.forEach((docSnap) => {
        const std = docSnap.data() as Student;
        studentsById.set(std.studentId, std);
        studentsByUid.set(std.uid, std);
        if (std.authUid) {
          const authList = studentsByAuthUid.get(std.authUid) || [];
          authList.push(std);
          studentsByAuthUid.set(std.authUid, authList);
        }
      });

      // 4. Combine users with their students
      const result: PortalUserWithStudents[] = portalUsersList.map((user) => {
        const studentSet = new Map<string, Student>();

        // From portalStudentLinks
        const userLinks = linksMap.get(user.uid) || [];
        userLinks.forEach((link) => {
          if (link.studentUid && studentsByUid.has(link.studentUid)) {
            const std = studentsByUid.get(link.studentUid)!;
            studentSet.set(std.uid, std);
          } else if (link.studentId && studentsById.has(link.studentId)) {
            const std = studentsById.get(link.studentId)!;
            studentSet.set(std.uid, std);
          }
        });

        // From student.authUid
        const authLinked = studentsByAuthUid.get(user.uid) || [];
        authLinked.forEach((std) => {
          studentSet.set(std.uid, std);
        });

        // From user.linkedStudents or user.linkedStudentIds
        if (user.linkedStudents && Array.isArray(user.linkedStudents)) {
          user.linkedStudents.forEach((stdUid) => {
            if (studentsByUid.has(stdUid)) {
              studentSet.set(stdUid, studentsByUid.get(stdUid)!);
            }
          });
        }
        if (user.linkedStudentIds && Array.isArray(user.linkedStudentIds)) {
          user.linkedStudentIds.forEach((stdId) => {
            if (studentsById.has(stdId)) {
              const std = studentsById.get(stdId)!;
              studentSet.set(std.uid, std);
            }
          });
        }

        const students = Array.from(studentSet.values());
        return {
          ...user,
          students,
          primaryStudent: students.length > 0 ? students[0] : null,
        };
      });

      // Sort by creation date descending
      return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.warn('Warning/offline fetching portal users:', error);
      return [];
    }
  },

  /**
   * Fetch a single Portal User details with linked students
   */
  async getPortalUserById(uid: string): Promise<PortalUserWithStudents | null> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        return null;
      }

      const data = userSnap.data();
      const portalUser: PortalUser = {
        uid: data.uid || userSnap.id,
        email: data.email || '',
        displayName: data.displayName || 'Portal User',
        role: data.role || 'PORTAL_USER',
        status: data.status || 'ACTIVE',
        loginEnabled: data.loginEnabled !== undefined ? Boolean(data.loginEnabled) : (data.status !== 'DISABLED'),
        linkedStudents: data.linkedStudents || [],
        linkedStudentIds: data.linkedStudentIds || [],
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };

      // Fetch links for this user
      const qLinks = query(
        collection(db, LINKS_COLLECTION),
        where('portalUserUid', '==', uid)
      );
      const linksSnap = await getDocs(qLinks);
      
      const studentKeysToFetch = new Set<string>();
      const studentIdsToFetch = new Set<string>();

      linksSnap.forEach((docSnap) => {
        const linkData = docSnap.data() as PortalStudentLink;
        if (linkData.status !== 'DISABLED') {
          if (linkData.studentUid) studentKeysToFetch.add(linkData.studentUid);
          if (linkData.studentId) studentIdsToFetch.add(linkData.studentId);
        }
      });

      if (portalUser.linkedStudents) {
        portalUser.linkedStudents.forEach((k) => studentKeysToFetch.add(k));
      }
      if (portalUser.linkedStudentIds) {
        portalUser.linkedStudentIds.forEach((k) => studentIdsToFetch.add(k));
      }

      // Query students with authUid == uid
      const qAuth = query(
        collection(db, STUDENTS_COLLECTION),
        where('authUid', '==', uid)
      );
      const authSnap = await getDocs(qAuth);
      const studentsMap = new Map<string, Student>();

      authSnap.forEach((docSnap) => {
        const std = docSnap.data() as Student;
        studentsMap.set(std.uid, std);
      });

      // Fetch individual student docs by UID
      for (const stdUid of Array.from(studentKeysToFetch)) {
        if (!studentsMap.has(stdUid)) {
          try {
            const snap = await getDoc(doc(db, STUDENTS_COLLECTION, stdUid));
            if (snap.exists()) {
              const std = snap.data() as Student;
              studentsMap.set(std.uid, std);
            }
          } catch (e) {
            console.warn(`Could not read student document ${stdUid}:`, e);
          }
        }
      }

      // Fetch individual student docs by studentId
      for (const stdId of Array.from(studentIdsToFetch)) {
        try {
          const qId = query(collection(db, STUDENTS_COLLECTION), where('studentId', '==', stdId));
          const idSnap = await getDocs(qId);
          idSnap.forEach((s) => {
            const std = s.data() as Student;
            studentsMap.set(std.uid, std);
          });
        } catch (e) {
          console.warn(`Could not query studentId ${stdId}:`, e);
        }
      }

      const students = Array.from(studentsMap.values());
      return {
        ...portalUser,
        students,
        primaryStudent: students.length > 0 ? students[0] : null,
      };
    } catch (error) {
      console.warn('Warning/offline fetching portal user detail:', error);
      return null;
    }
  },

  /**
   * Create a new Portal User account and link to an existing student.
   * Uses secondary Firebase app instance to ensure current admin session is NOT signed out.
   */
  async createPortalUser(
    formData: CreatePortalUserFormData,
    creatorUid: string
  ): Promise<{ uid: string; email: string }> {
    const trimmedEmail = formData.email.trim().toLowerCase();
    const { studentUid, password, confirmPassword } = formData;

    // 1. Password verification
    if (!password || password.length < 6) {
      throw new Error('Initial password must be at least 6 characters.');
    }
    if (password !== confirmPassword) {
      throw new Error('Initial password and confirmation password do not match.');
    }

    // 2. Fetch selected student record
    const studentRef = doc(db, STUDENTS_COLLECTION, studentUid);
    const studentSnap = await getDoc(studentRef);
    if (!studentSnap.exists()) {
      throw new Error('Selected student record was not found in the institutional database.');
    }

    const studentData = studentSnap.data() as Student;

    // 3. Inactive student check
    if (studentData.status === 'DISABLED') {
      throw new Error('This student is currently inactive and cannot receive a new portal account.');
    }

    // 4. Existing account check on student
    if (studentData.authUid && studentData.authUid.trim() !== '') {
      throw new Error('This student already has a portal account.');
    }

    // Also check portalStudentLinks collection for active link
    const qCheckLink = query(
      collection(db, LINKS_COLLECTION),
      where('studentId', '==', studentData.studentId),
      where('status', '==', 'ACTIVE')
    );
    const existingLinkSnap = await getDocs(qCheckLink);
    if (!existingLinkSnap.empty) {
      throw new Error('This student already has a portal account.');
    }

    // 5. Create Firebase Auth account via secondary app
    let newUid: string;
    const secondaryAppName = `PortalUserCreator_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let secondaryAppInstance: any = null;

    try {
      secondaryAppInstance = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryAppInstance);

      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        trimmedEmail,
        password
      );
      newUid = userCredential.user.uid;

      // Sign out and cleanup secondary app
      await authSignOut(secondaryAuth);
      await deleteApp(secondaryAppInstance);
    } catch (authError: any) {
      if (secondaryAppInstance) {
        try {
          await deleteApp(secondaryAppInstance);
        } catch {
          // ignore cleanup error
        }
      }

      if (authError.code === 'auth/email-already-in-use') {
        throw new Error('This email address is already registered with another user account in Firebase.');
      } else if (authError.code === 'auth/invalid-email') {
        throw new Error('Please provide a valid institutional or guardian email address.');
      } else if (authError.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters.');
      }
      throw new Error(authError.message || 'Failed to create Firebase Authentication account.');
    }

    const now = new Date().toISOString();

    // 6. Create users/{uid} document
    const userDocRef = doc(db, USERS_COLLECTION, newUid);
    const userPayload: PortalUser = {
      uid: newUid,
      email: trimmedEmail,
      displayName: studentData.parentName || studentData.name || 'Portal User',
      role: 'PORTAL_USER',
      status: 'ACTIVE',
      loginEnabled: true,
      linkedStudents: [studentData.uid],
      linkedStudentIds: [studentData.studentId],
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(userDocRef, userPayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${USERS_COLLECTION}/${newUid}`);
      throw err;
    }

    // 7. Create portalStudentLinks/{linkId}
    const linkId = `link_${newUid}_${studentData.studentId}`;
    const linkDocRef = doc(db, LINKS_COLLECTION, linkId);
    const linkPayload: PortalStudentLink = {
      id: linkId,
      portalUserUid: newUid,
      studentId: studentData.studentId,
      studentUid: studentData.uid,
      studentName: studentData.name,
      className: studentData.className,
      section: studentData.section,
      status: 'ACTIVE',
      createdBy: creatorUid,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(linkDocRef, linkPayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${LINKS_COLLECTION}/${linkId}`);
      throw err;
    }

    // 8. Update student doc with authUid
    try {
      await updateDoc(studentRef, {
        authUid: newUid,
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${STUDENTS_COLLECTION}/${studentUid}`);
      throw err;
    }

    // Audit log
    await auditService.logAction({
      actorUid: creatorUid,
      actorRole: 'ADMIN',
      action: 'PORTAL_USER_CREATED',
      targetType: 'PORTAL_USER',
      targetId: newUid,
      targetName: trimmedEmail,
      success: true,
      metadata: {
        linkedStudentId: studentData.studentId,
        linkedStudentName: studentData.name,
      },
    });

    return {
      uid: newUid,
      email: trimmedEmail,
    };
  },

  /**
   * Link an additional student to an existing Portal User account
   */
  async linkStudent(
    portalUserUid: string,
    studentUid: string,
    adminUid: string
  ): Promise<void> {
    const studentRef = doc(db, STUDENTS_COLLECTION, studentUid);
    const studentSnap = await getDoc(studentRef);
    if (!studentSnap.exists()) {
      throw new Error('Student record not found in database.');
    }

    const student = studentSnap.data() as Student;

    if (student.status === 'DISABLED') {
      throw new Error('This student is currently inactive and cannot be linked.');
    }

    // Check if student is already linked to another portal account
    if (student.authUid && student.authUid !== portalUserUid) {
      throw new Error(`This student is already linked to another portal account (UID: ${student.authUid}).`);
    }

    const qCheckLink = query(
      collection(db, LINKS_COLLECTION),
      where('studentId', '==', student.studentId),
      where('status', '==', 'ACTIVE')
    );
    const linkSnap = await getDocs(qCheckLink);
    if (!linkSnap.empty) {
      const existingLink = linkSnap.docs[0].data() as PortalStudentLink;
      if (existingLink.portalUserUid !== portalUserUid) {
        throw new Error('This student is already linked to another portal account.');
      }
    }

    const now = new Date().toISOString();

    // 1. Create or update portalStudentLinks/{linkId}
    const linkId = `link_${portalUserUid}_${student.studentId}`;
    const linkRef = doc(db, LINKS_COLLECTION, linkId);
    const linkData: PortalStudentLink = {
      id: linkId,
      portalUserUid,
      studentId: student.studentId,
      studentUid: student.uid,
      studentName: student.name,
      className: student.className,
      section: student.section,
      status: 'ACTIVE',
      createdBy: adminUid,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(linkRef, linkData);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${LINKS_COLLECTION}/${linkId}`);
      throw err;
    }

    // 2. Update Student document with authUid
    try {
      await updateDoc(studentRef, {
        authUid: portalUserUid,
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${STUDENTS_COLLECTION}/${studentUid}`);
      throw err;
    }

    // 3. Update User document linked arrays
    const userRef = doc(db, USERS_COLLECTION, portalUserUid);
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const uData = userSnap.data();
        const currentUids: string[] = Array.isArray(uData.linkedStudents) ? [...uData.linkedStudents] : [];
        const currentIds: string[] = Array.isArray(uData.linkedStudentIds) ? [...uData.linkedStudentIds] : [];

        if (!currentUids.includes(student.uid)) currentUids.push(student.uid);
        if (!currentIds.includes(student.studentId)) currentIds.push(student.studentId);

        await updateDoc(userRef, {
          linkedStudents: currentUids,
          linkedStudentIds: currentIds,
          updatedAt: now,
        });
      }
    } catch (err) {
      console.warn('Could not update user document linked arrays:', err);
    }

    // Audit log
    await auditService.logAction({
      actorUid: adminUid,
      actorRole: 'ADMIN',
      action: 'PORTAL_STUDENT_LINKED',
      targetType: 'PORTAL_LINK',
      targetId: linkId,
      targetName: `${student.name} (${student.studentId})`,
      success: true,
      metadata: {
        portalUserUid,
        studentUid: student.uid,
        studentId: student.studentId,
      },
    });
  },

  /**
   * Unlink a student from a Portal User account.
   * Does NOT delete the student, attendance, results, fees, or timetable.
   */
  async unlinkStudent(
    portalUserUid: string,
    studentUid: string,
    studentId: string,
    adminUid?: string
  ): Promise<void> {
    const now = new Date().toISOString();

    // 1. Delete or disable link doc
    const linkId = `link_${portalUserUid}_${studentId}`;
    const linkRef = doc(db, LINKS_COLLECTION, linkId);
    try {
      await deleteDoc(linkRef);
    } catch {
      // If direct delete fails, try querying by fields
      try {
        const qLink = query(
          collection(db, LINKS_COLLECTION),
          where('portalUserUid', '==', portalUserUid),
          where('studentId', '==', studentId)
        );
        const snap = await getDocs(qLink);
        for (const d of snap.docs) {
          await deleteDoc(d.ref);
        }
      } catch (e) {
        console.warn('Could not delete link doc:', e);
      }
    }

    // 2. Clear authUid on Student document
    if (studentUid) {
      const studentRef = doc(db, STUDENTS_COLLECTION, studentUid);
      try {
        await updateDoc(studentRef, {
          authUid: '',
          updatedAt: now,
        });
      } catch (err) {
        console.warn('Could not clear authUid on student:', err);
      }
    }

    // 3. Remove student from User document arrays
    const userRef = doc(db, USERS_COLLECTION, portalUserUid);
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const uData = userSnap.data();
        const currentUids: string[] = Array.isArray(uData.linkedStudents) ? [...uData.linkedStudents] : [];
        const currentIds: string[] = Array.isArray(uData.linkedStudentIds) ? [...uData.linkedStudentIds] : [];

        const nextUids = currentUids.filter((id) => id !== studentUid && id !== studentId);
        const nextIds = currentIds.filter((id) => id !== studentId && id !== studentUid);

        await updateDoc(userRef, {
          linkedStudents: nextUids,
          linkedStudentIds: nextIds,
          updatedAt: now,
        });
      }
    } catch (err) {
      console.warn('Could not update user linked students array:', err);
    }

    // Audit log
    if (adminUid) {
      await auditService.logAction({
        actorUid: adminUid,
        actorRole: 'ADMIN',
        action: 'PORTAL_STUDENT_UNLINKED',
        targetType: 'PORTAL_LINK',
        targetId: linkId,
        success: true,
        metadata: {
          portalUserUid,
          studentUid,
          studentId,
        },
      });
    }
  },

  /**
   * Enable or disable portal login access for a user
   */
  async setLoginEnabled(uid: string, enabled: boolean, adminUid?: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const now = new Date().toISOString();

    try {
      await updateDoc(userRef, {
        loginEnabled: enabled,
        status: enabled ? 'ACTIVE' : 'DISABLED',
        updatedAt: now,
      });

      if (adminUid) {
        await auditService.logAction({
          actorUid: adminUid,
          actorRole: 'ADMIN',
          action: enabled ? 'PORTAL_USER_ENABLED' : 'PORTAL_USER_DISABLED',
          targetType: 'PORTAL_USER',
          targetId: uid,
          success: true,
          metadata: {
            loginEnabled: enabled,
          },
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${USERS_COLLECTION}/${uid}`);
      throw err;
    }
  },

  /**
   * Trigger secure Firebase password reset email
   */
  async sendPasswordReset(email: string): Promise<void> {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      throw new Error('Please specify a valid email address.');
    }
    await sendPasswordResetEmail(auth, trimmed);
  },

  /**
   * Get active students available for linking (without active portal accounts)
   */
  async getAvailableStudentsForLinking(): Promise<Student[]> {
    try {
      const q = query(
        collection(db, STUDENTS_COLLECTION),
        where('status', '==', 'ACTIVE')
      );
      const snap = await getDocs(q);
      const students: Student[] = [];

      snap.forEach((d) => {
        const std = d.data() as Student;
        // Include only if not already linked (authUid is empty)
        if (!std.authUid || std.authUid.trim() === '') {
          students.push(std);
        }
      });

      return students.sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      console.warn('Warning fetching available students:', err);
      return [];
    }
  },
};
