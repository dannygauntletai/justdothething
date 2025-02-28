import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/utils/AuthContext';
import { api } from '../../../shared/utils/api';

function Dashboard() {
  const { user, session, dbUser, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [verifyingBackend, setVerifyingBackend] = useState(false);
  const hasCheckedAuth = useRef(false);

  // When the component loads, perform a backend auth check
  useEffect(() => {
    const checkBackendAuth = async () => {
      // Only run if we have a user, no dbUser yet, we haven't checked before, and we have a session token
      if (user && !dbUser && session?.access_token && !hasCheckedAuth.current) {
        hasCheckedAuth.current = true;
        setVerifyingBackend(true);
        
        try {
          // Use the API service instead of direct fetch
          await api.get('/auth/test');
          console.log('Successfully authenticated with backend');
        } catch (error) {
          console.error('Error authenticating with backend:', error);
          // Reset the check flag if we encounter an error
          hasCheckedAuth.current = false;
        } finally {
          setVerifyingBackend(false);
        }
      }
    };

    checkBackendAuth();
  }, [user, dbUser, session]);

  // Reset the auth check flag if user changes
  useEffect(() => {
    if (!user) {
      hasCheckedAuth.current = false;
    }
  }, [user]);

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading || verifyingBackend) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-gray-700">
        {verifyingBackend ? 'Syncing with database...' : 'Loading...'}
      </span>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">JustDoTheThing.ai</h1>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-100">
                  {user?.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt={user.user_metadata.full_name || 'User'} 
                    />
                  ) : (
                    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </span>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-700">
                  {user?.user_metadata?.full_name || user?.email}
                </div>
                {dbUser && (
                  <div className="text-xs text-green-600">
                    ✓ Database synchronized
                  </div>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="ml-4 bg-red-600 py-1 px-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mt-5 bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">Welcome to JustDoTheThing.ai</h2>
              <p className="mt-2 text-gray-600">
                This is your dashboard. Here you'll be able to manage your productivity tools.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard; 