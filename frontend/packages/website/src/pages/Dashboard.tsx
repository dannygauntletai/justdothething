import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/utils/AuthContext';
import { api } from '../../../shared/utils/api';
import YellMode from '../components/YellMode/YellMode';

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
                Your productivity assistant that helps you stay on track with your tasks.
              </p>
            </div>
            
            {/* AI Insight Section */}
            <div className="mt-6 bg-black text-white rounded-lg p-6">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h2 className="text-lg font-medium">AI Insight</h2>
              </div>
              <p className="mt-2">
                Based on your past performance, now is an optimal time for a deep work session.
              </p>
            </div>
            
            {/* Productivity Modes Section */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Flow Mode */}
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-center">AI-optimized deep work sessions</h3>
                <button className="mt-4 w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  Start Flow
                </button>
              </div>
              
              {/* Yap Mode */}
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-center">AI-powered brainstorming assistant</h3>
                <button className="mt-4 w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  Start Yapping
                </button>
              </div>
              
              {/* Yell Mode */}
              <YellMode />
            </div>
            
            {/* Additional feature sections would go here */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Focus Stats */}
              <div className="bg-white rounded-lg shadow p-6 col-span-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI-Enhanced Focus Stats</h3>
                <p className="text-sm text-gray-600 mb-4">Personalized productivity insights</p>
                <div className="text-right text-gray-500 text-sm">68%</div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '68%' }}></div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                      <span className="text-sm">Peak Focus Time</span>
                    </div>
                    <span className="text-sm font-medium">10 AM - 1 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-gray-500 mr-2"></span>
                      <span className="text-sm">Focus Score</span>
                    </div>
                    <span className="text-sm font-medium">8.7 / 10</span>
                  </div>
                </div>
              </div>
              
              {/* Task Prioritizer */}
              <div className="bg-white rounded-lg shadow p-6 col-span-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI Task Prioritizer</h3>
                <p className="text-sm text-gray-600 mb-4">Intelligent task management</p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    <span className="flex-1">Finish project proposal</span>
                    <span className="px-2 py-1 text-xs bg-gray-800 text-white rounded">Critical</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    <span className="flex-1">Review team updates</span>
                    <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">Important</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="flex-1">Brainstorm new features</span>
                    <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">Can Wait</span>
                  </li>
                </ul>
                <div className="mt-4 text-right">
                  <button className="text-sm text-gray-600 hover:text-gray-900">View AI-Optimized Schedule</button>
                </div>
              </div>
              
              {/* Focus Challenges */}
              <div className="bg-white rounded-lg shadow p-6 col-span-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI Focus Challenges</h3>
                <p className="text-sm text-gray-600 mb-4">Gamified productivity boosters</p>
                <div className="bg-gray-100 p-3 rounded-lg mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-2">🌟</span>
                    <div>
                      <h4 className="font-medium">Deep Work Master</h4>
                      <p className="text-xs text-gray-600">Complete 5 days of 3+ hour deep work sessions</p>
                    </div>
                    <div className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded">2/5 Days</div>
                  </div>
                </div>
                <button className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  Join Weekly AI Challenge
                </button>
              </div>
            </div>
            
            {/* Insights Section */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personalized AI Insights</h3>
              <p className="text-sm text-gray-600 mb-4">Tailored productivity recommendations</p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-gray-100 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Productivity Pattern Detected</h4>
                    <p className="text-sm text-gray-600">Your focus peaks after short breaks. Try the Pomodoro technique.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-gray-100 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Optimal Break Suggestion</h4>
                    <p className="text-sm text-gray-600">A 15-minute walk at 2 PM could boost your afternoon productivity.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-gray-100 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Learning Opportunity</h4>
                    <p className="text-sm text-gray-600">Based on your work patterns, learning keyboard shortcuts could save you 30 minutes daily.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  View Detailed AI Analysis
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard; 