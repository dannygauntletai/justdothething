import { useState, useEffect } from 'react';
import { signInWithGoogle, signOut } from '../../../shared/utils/supabase';
import { User } from '@supabase/supabase-js';

interface ExtensionUser extends User {
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
  };
  email?: string;
}

export function useExtensionAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<ExtensionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get auth status from background script
  const checkAuthStatus = () => {
    chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' }, (response) => {
      setIsAuthenticated(response.isAuthenticated);
      setUser(response.session?.user || null);
      setIsLoading(false);
    });
  };

  // Sign in with Google
  const login = async () => {
    try {
      await signInWithGoogle();
      // We don't need to update state here as the auth state change will trigger in the background
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut();
      // We don't need to update state here as the auth state change will trigger in the background
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
    
    // Listen for auth state changes from background script
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.isAuthenticated) {
        setIsAuthenticated(changes.isAuthenticated.newValue);
      }
      if (changes.session && changes.session.newValue) {
        const sessionData = JSON.parse(changes.session.newValue);
        setUser(sessionData?.user || null);
      }
    });
  }, []);

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout
  };
} 