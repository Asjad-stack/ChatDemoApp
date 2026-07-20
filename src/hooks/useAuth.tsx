import { useEffect, useId, useState } from 'react';
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

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      try {
        setAuthError(null);
        if (firebaseUser) {
          console.log('Current User UID:', firebaseUser.uid);
          await setDoc(
            doc(db, 'users', firebaseUser.uid),
            {
              uid: firebaseUser.uid,
              isAnonymous: firebaseUser.isAnonymous,
            },
            { merge: true },
          );
          setUser(firebaseUser);
          return;
        }
        const result = await signInAnonymously(auth);
        console.log('Anonymous UID:', result.user.uid);
        await setDoc(
          doc(db, 'users', result.user.uid),
          {
            uid: result.user.uid,
            isAnonymous: result.user.isAnonymous,
          },
          { merge: true },
        );
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
