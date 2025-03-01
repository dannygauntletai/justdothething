import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLoginButton } from '../../../shared/ui-components/GoogleLoginButton';
import { useAuth } from '../../../shared/utils/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-lg border-gray-200">
          <CardHeader className="space-y-1 text-center pb-0">
            <h1 className="text-2xl font-bold">JustDoTheThing.ai</h1>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <GoogleLoginButton 
                buttonText="Continue with Google"
                onClick={handleLogin}
                disabled={loginInProgress || isLoading}
                onError={(error) => console.error('Login failed:', error)}
              />
              {loginInProgress && (
                <div className="flex justify-center mt-2">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                    <span className="text-blue-600">Signing in...</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <Separator className="my-2" />
          <CardFooter className="flex flex-col justify-center text-center px-6 py-4">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-blue-600 hover:underline font-medium">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default Login; 