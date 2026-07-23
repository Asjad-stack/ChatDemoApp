import { useEffect, useState } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  User,
} from '@react-native-firebase/auth';

import { doc, getFirestore, setDoc } from '@react-native-firebase/firestore';

const useAuth = () => {
  const db = getFirestore();

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const saveUserToFirestore = async (firebaseUser: User) => {
    await setDoc(
      doc(db, 'users', firebaseUser.uid),
      {
        uid: firebaseUser.uid,
        isAnonymous: firebaseUser.isAnonymous,
      },
      { merge: true },
    );
  };

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      try {
        setAuthError(null);

        // User already authenticated
        if (firebaseUser) {
          console.log('Current User UID:', firebaseUser.uid);

          await saveUserToFirestore(firebaseUser);

          setUser(firebaseUser);
          return;
        }

        // No user, create anonymous account
        const result = await signInAnonymously(auth);

        console.log('Anonymous UID:', result.user.uid);

        await saveUserToFirestore(result.user);

        setUser(result.user);
      } catch (error) {
        console.log('Anonymous authentication error:', error);

        setAuthError(
          error instanceof Error
            ? error.message
            : 'Unable to authenticate user.',
        );
      } finally {
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return {
    user,
    authLoading,
    authError,
  };
};

export default useAuth;
