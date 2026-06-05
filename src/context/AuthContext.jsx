import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/firebaseConfig';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  const fetchUserData = async (uid) => {
    if (!isFirebaseConfigured) return null;
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({ id: userDoc.id, ...data });
        return data;
      } else {
        setUserData(null);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
      return null;
    }
  };

  // Register new user (Email + Password)
  const register = async (name, email, password) => {
    if (!isFirebaseConfigured) {
      return { success: false, error: 'Firebase is not configured. See docs/FIREBASE_SETUP.md' };
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore using uid as document ID
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        name,
        email,
        photoURL: null,
        role: 'user',
        provider: 'email',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });

      await fetchUserData(user.uid);
      return { success: true };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error.code) };
    }
  };

  // Login existing user (Email + Password)
  const login = async (email, password) => {
    if (!isFirebaseConfigured) {
      return { success: false, error: 'Firebase is not configured. See docs/FIREBASE_SETUP.md' };
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update lastLoginAt timestamp in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        lastLoginAt: serverTimestamp(),
      }, { merge: true });

      await fetchUserData(user.uid);
      return { success: true };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error.code) };
    }
  };

  // Login / Register with Google
  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      return { success: false, error: 'Firebase is not configured. See docs/FIREBASE_SETUP.md' };
    }
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // First-time Google user - create user profile document
        await setDoc(userDocRef, {
          uid: user.uid,
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          photoURL: user.photoURL || null,
          role: 'user',
          provider: 'google',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
      } else {
        // Existing user - update lastLoginAt
        await setDoc(userDocRef, {
          lastLoginAt: serverTimestamp(),
        }, { merge: true });
      }

      await fetchUserData(user.uid);
      return { success: true };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error.code) };
    }
  };

  // Logout
  const logout = async () => {
    if (!isFirebaseConfigured) {
      return { success: false, error: 'Firebase is not configured.' };
    }
    try {
      await signOut(auth);
      setUserData(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to log out. Please try again.' };
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    isAdmin: userData?.role === 'admin',
    isAuthenticated: !!currentUser,
    isFirebaseConfigured,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Maps Firebase auth error codes to user-friendly messages.
 */
const getAuthErrorMessage = (code) => {
  const messages = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/popup-closed-by-user': 'Google Sign-in was cancelled.',
    'auth/popup-blocked': 'Google Sign-in popup was blocked by your browser.',
  };
  return messages[code] || 'An unexpected error occurred. Please try again.';
};

export default AuthContext;
