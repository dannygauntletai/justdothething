import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, getCurrentUser, signInWithGoogle, signOut } from './supabase';
import { api } from './api';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  dbUser: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  dbUser: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Optimized backend auth verification with debounce
  const verifyBackendAuth = async () => {
    if (user) {
      try {
        // Only make the backend call if we don't already have a dbUser
        if (!dbUser) {
          const result = await api.checkAuth();
          if (result.authenticated) {
            setDbUser(result.user);
          }
        }
      } catch (error) {
        console.error('Error verifying backend auth:', error);
      }
    } else {
      setDbUser(null);
    }
  };

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session) {
        await verifyBackendAuth();
      }
      
      setIsLoading(false);
      
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          const previousUser = user;
          setSession(session);
          setUser(session?.user ?? null);
          
          // Only verify with backend if user has changed or we don't have a dbUser
          if (session && (session.user.id !== previousUser?.id || !dbUser)) {
            await verifyBackendAuth();
          } else if (!session) {
            setDbUser(null);
          }
        }
      );
      
      // Cleanup subscription
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initializeAuth();
  }, []);
  
  const login = async () => {
    await signInWithGoogle();
  };
  
  const logout = async () => {
    await signOut();
    setUser(null);
    setSession(null);
    setDbUser(null);
  };
  
  const value = {
    user,
    session,
    dbUser,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 