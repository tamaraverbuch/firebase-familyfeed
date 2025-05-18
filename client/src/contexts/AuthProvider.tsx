
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useQueryClient } from '@tanstack/react-query';

// context type
interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  isInitializing: boolean;
}

// create context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      
      if (user) {
        // user signed in, invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      } else {
        // User signed out, clear user data
        queryClient.setQueryData(['/api/auth/user'], null);
      }
      
      // auth initialization complete
      setIsInitializing(false);
    });
    
    // cleanup subscription
    return () => unsubscribe();
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ firebaseUser, isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
}

// hook for using auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}