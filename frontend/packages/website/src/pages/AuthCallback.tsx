import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/utils/supabase';

function AuthCallback() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error during auth callback:', error);
        navigate('/login');
        return;
      }
      
      if (data?.session) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    };
    
    handleAuthCallback();
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg">
        <h1 className="text-xl font-semibold text-center">Signing you in...</h1>
        <div className="flex justify-center mt-4">
          <div className="w-8 h-8 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}

export default AuthCallback; 