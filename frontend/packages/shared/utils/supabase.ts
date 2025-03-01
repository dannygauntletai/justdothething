// Add Vite env type declaration
/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dtfkgsiakdplugrvwepk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Zmtnc2lha2RwbHVncnZ3ZXBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjkxMjIsImV4cCI6MjA1NjM0NTEyMn0.90j85vT-j460BaBlqTTZkwpw7WirU_L-reXQVpdvA6M';
const isProduction = import.meta.env.VITE_NODE_ENV === 'production';
const frontendUrl = isProduction 
  ? import.meta.env.VITE_FRONTEND_URL_PROD 
  : import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

// Create Supabase client with proper redirect options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // Use PKCE flow for better security
  }
});

// Initialize by parsing hash fragment
// This helps ensure the hash fragment is processed immediately on page load
if (typeof window !== 'undefined') {
  // Set up hash change event listener for better auth flow handling
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      // The Supabase client will handle this automatically with detectSessionInUrl: true
      console.log('Auth hash detected, will be processed by Supabase');
    }
  });
}

// Auth helpers
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${frontendUrl}/auth/callback`,
      queryParams: {
        // Add any additional query parameters if needed for Google OAuth
        // For example, prompt: 'select_account' can force account selection
        prompt: 'select_account'
      }
    }
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}; 