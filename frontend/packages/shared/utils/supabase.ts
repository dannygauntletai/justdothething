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

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${frontendUrl}/auth/callback`
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