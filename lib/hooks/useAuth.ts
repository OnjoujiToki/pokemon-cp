import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (requireAuth && !user) {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [requireAuth, router]);

  return { user, loading };
} 