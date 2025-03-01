import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/utils/supabase';

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      // First check if we have a hash in the URL (old auth flow)
      const hash = window.location.hash;
      console.log('Processing auth callback, hash present:', !!hash);
      
      try {
        // Get the current session
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error during auth callback:', sessionError);
          setError('Authentication failed. Please try again.');
          // After a delay, redirect to login
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        
        if (data?.session) {
          console.log('Session found, redirecting to dashboard');
          // Clear the hash if present
          if (hash) {
            // Remove the hash without reloading the page
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
          
          // Redirect to the dashboard after a short delay to ensure session is stored
          setTimeout(() => navigate('/dashboard'), 500);
        } else {
          console.error('No session found after authentication');
          setError('No session found. Please try logging in again.');
          // After a delay, redirect to login
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        setError('An unexpected error occurred. Please try again.');
        // After a delay, redirect to login
        setTimeout(() => navigate('/login'), 2000);
      }
    };
    
    handleAuthCallback();
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg text-center">
        {error ? (
          <>
            <h1 className="text-xl font-semibold text-red-600">Authentication Error</h1>
            <p className="mt-2 text-gray-600">{error}</p>
            <p className="mt-4 text-sm text-gray-500">Redirecting you to login...</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Signing you in...</h1>
            <div className="flex justify-center mt-4">
              <div className="w-8 h-8 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-sm text-gray-500">You'll be redirected to your dashboard momentarily.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthCallback; 