import { db } from './config';
import { doc, getDoc, setDoc, updateDoc, increment, FieldValue } from 'firebase/firestore';
import { GoldDisplay } from '@/components/ui/gold-display';

export interface UserProfile {
  displayName: string;
  codeforcesHandle: string;
  motto: string;
  birthday: string;
  interests: string;
  email: string;
  gold: number;
  createdAt?: Date;
  updatedAt: Date;
}

interface ProfileUpdate {
  gold?: number | FieldValue;
  email?: string;
  displayName?: string;
  codeforcesHandle?: string;
  motto?: string;
  birthday?: string;
  interests?: string;
}

export const createUserProfile = async (userId: string, profileData: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...profileData,
      gold: 0, // Initialize gold to 0
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { profile: userSnap.data() as UserProfile, error: null };
    }
    return { profile: null, error: 'Profile not found' };
  } catch (error: any) {
    return { profile: null, error: error.message };
  }
};

export const updateUserProfile = async (userId: string, update: ProfileUpdate) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...update,
      updatedAt: new Date(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const addGold = async (userId: string, amount: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      gold: increment(amount),
      updatedAt: new Date(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};