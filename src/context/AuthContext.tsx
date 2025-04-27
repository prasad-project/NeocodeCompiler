import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, onAuthStateChanged } from '../services/firebase';
import { User } from 'firebase/auth';
import { ExtendedUser } from '../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface AuthContextType {
  currentUser: ExtendedUser | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Extend the user object with custom properties
        try {
          // Fetch the user's username from Firestore
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Create extended user with username
            const extendedUser = user as ExtendedUser;
            extendedUser.username = userData.username || null;
            setCurrentUser(extendedUser);
          } else {
            // If no Firestore document exists yet, just use the base user
            setCurrentUser(user as ExtendedUser);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentUser(user as ExtendedUser);
        }
      } else {
        setCurrentUser(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}