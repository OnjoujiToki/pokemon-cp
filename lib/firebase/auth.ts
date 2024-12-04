import { auth } from './config';
import { db } from './config';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { createUserProfile } from './profile';


export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const registerUser = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create initial profile
      await createUserProfile(userCredential.user.uid, {
        email,
        displayName: '',
        codeforcesHandle: '',
        motto: '',
        birthday: '',
        interests: '',
        gold: 0
      });
      return { user: userCredential.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  };

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const signInWithGoogle = async () => {
  const googleProvider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user profile exists
    const profileRef = doc(db, 'users', user.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      // Only create new profile if it doesn't exist
      await setDoc(profileRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        codeforcesHandle: "",
        gold: 1000,
        createdAt: serverTimestamp(),
      });
    } else {
      // Get existing data
      const existingData = profileSnap.data();
      
      // Update while preserving existing fields
      await updateDoc(profileRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp(),
        // Preserve these fields by using existing values
        codeforcesHandle: existingData.codeforcesHandle || "",
        gold: existingData.gold || 1000,
      });
    }

    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};