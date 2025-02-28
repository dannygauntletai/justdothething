import { supabase } from '../../../shared/utils/supabase';

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Store session in chrome local storage
    chrome.storage.local.set({ 
      session: JSON.stringify(session),
      isAuthenticated: true 
    });
  } else if (event === 'SIGNED_OUT') {
    // Clear session from chrome local storage
    chrome.storage.local.set({ 
      session: null,
      isAuthenticated: false 
    });
  }
});

// Handle messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_AUTH_STATUS') {
    // Check if user is authenticated
    chrome.storage.local.get(['isAuthenticated', 'session'], (result) => {
      sendResponse({ 
        isAuthenticated: result.isAuthenticated || false,
        session: result.session ? JSON.parse(result.session) : null
      });
    });
    return true; // Required for async sendResponse
  }
});
