import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLoginButton } from '../../../shared/ui-components/GoogleLoginButton';
import { useAuth } from '../../../shared/utils/AuthContext';

function Login() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [loginInProgress, setLoginInProgress] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogin = async () => {
    try {
      setLoginInProgress(true);
      await login();
      // No need to navigate here, the useEffect will handle it
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoginInProgress(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            JustDoTheThing.ai
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to start boosting your productivity
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex flex-col gap-3">
            <GoogleLoginButton 
              buttonText="Continue with Google"
              onClick={handleLogin}
              disabled={loginInProgress || isLoading}
              onError={(error) => console.error('Login failed:', error)}
            />
            {loginInProgress && (
              <div className="flex justify-center mt-2">
                <div className="animate-pulse text-blue-600">Signing in...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 