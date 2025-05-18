
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  GoogleAuthProvider 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthContext } from "@/contexts/AuthProvider";
import { api } from "@/lib/authFetch";


export interface UserData {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useAuth() {
  const { firebaseUser, isInitializing } = useAuthContext();
  const queryClient = useQueryClient();
  
  // Fetch user data from API when authenticated
  const { 
    data: user, 
    isLoading: isUserLoading,
    error: userError
  } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        if (!firebaseUser) return null;
        return await api.get<UserData>('/api/auth/user');
      } catch (error) {
        if ((error as any)?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!firebaseUser,
    retry: 1,
  });
  

  const { 
    mutate: signIn,
    isPending: isSigningIn 
  } = useMutation({
    mutationFn: async () => {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      return await signInWithPopup(auth, provider);
    },
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    }
  });
  

  const { 
    mutate: signOut,
    isPending: isSigningOut 
  } = useMutation({
    mutationFn: async () => {
      await firebaseSignOut(auth);
    },
    onSuccess: () => {

      queryClient.setQueryData(['/api/auth/user'], null);
    }
  });
  
  return {
    user,
    isLoading: isInitializing || isUserLoading || isSigningIn || isSigningOut,
    isAuthenticated: !!user,
    signIn,
    signOut,
    error: userError
  };
}