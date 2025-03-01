import { supabase } from './supabase';

// Determine if we're in production based on environment variable
const isProduction = import.meta.env.VITE_NODE_ENV === 'production';

// Use the appropriate API URL based on environment
const API_URL = isProduction 
  ? import.meta.env.VITE_API_URL_PROD 
  : import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log(`Using API URL: ${API_URL} in ${isProduction ? 'production' : 'development'} mode`);

// Session cache
let cachedSession = null;
let sessionExpiry = 0;
const SESSION_CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds

// Helper to get session with caching
const getAuthSession = async () => {
  const now = Date.now();
  
  // Return cached session if it's still valid
  if (cachedSession && now < sessionExpiry) {
    return { data: { session: cachedSession } };
  }
  
  // Otherwise get a fresh session
  const sessionResponse = await supabase.auth.getSession();
  
  // Cache the new session
  if (sessionResponse.data.session) {
    cachedSession = sessionResponse.data.session;
    sessionExpiry = now + SESSION_CACHE_DURATION;
  }
  
  return sessionResponse;
};

// Create an API service with authentication
export const api = {
  /**
   * Make an authenticated GET request to the backend
   */
  async get(endpoint: string) {
    // Get the current session
    const { data: { session } } = await getAuthSession();
    
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    
    // Make the authenticated request
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
    });
    
    // Check for errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Make an authenticated POST request to the backend
   */
  async post(endpoint: string, data: any) {
    // Get the current session
    const { data: { session } } = await getAuthSession();
    
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    
    // Make the authenticated request
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(data)
    });
    
    // Check for errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Check if a user is authenticated with our backend (which creates the user record)
   */
  async checkAuth() {
    try {
      const result = await this.get('/auth/me');
      return { authenticated: true, user: result.user };
    } catch (error) {
      return { authenticated: false, user: null };
    }
  }
}; 