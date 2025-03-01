import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/utils/AuthContext';
import { api } from '../../../shared/utils/api';
import YellMode from '../components/YellMode/YellMode';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

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
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700">
          {verifyingBackend ? 'Syncing with database...' : 'Loading...'}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-600">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <h1 className="font-bold text-lg">AI Focus Buddy</h1>
        </div>
        
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            <a href="#" className="flex items-center p-2 rounded-md bg-blue-50 text-blue-700 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </a>
            
            <a href="#" className="flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule
            </a>
            
            <a href="#" className="flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Focus History
            </a>
            
            <a href="#" className="flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </a>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'John'}!</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="py-1 px-2 text-xs bg-gray-800 text-white rounded-full">
                7 day streak
              </span>
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm">Sign out</Button>
          </div>
        </header>

        <main className="p-6 max-w-6xl mx-auto">
          {/* AI Insight Section */}
          <Card className="bg-black text-white mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <CardTitle>AI Insight</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>Your focus score has improved by 15% this week. Keep up the great work!</p>
            </CardContent>
          </Card>

          {/* Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Flow Mode */}
            <Card className="flex flex-col items-center">
              <CardHeader className="text-center">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle>Flow Mode</CardTitle>
                <CardDescription>
                  AI-optimized deep work sessions
                </CardDescription>
              </CardHeader>
              <CardFooter className="w-full mt-auto">
                <Button variant="dark" className="w-full">
                  Start Flow
                </Button>
              </CardFooter>
            </Card>

            {/* Yap Mode */}
            <Card className="flex flex-col items-center">
              <CardHeader className="text-center">
                <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <CardTitle>Yap Mode</CardTitle>
                <CardDescription>
                  AI-powered brainstorming assistant
                </CardDescription>
              </CardHeader>
              <CardFooter className="w-full mt-auto">
                <Button variant="dark" className="w-full">
                  Start Yapping
                </Button>
              </CardFooter>
            </Card>

            {/* Yell Mode */}
            <YellMode />
          </div>

          {/* Stats and Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* AI-Enhanced Focus Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>AI-Enhanced Focus Stats</CardTitle>
                <CardDescription>Personalized productivity insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Daily Goal (AI-adjusted)</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <Progress value={68} className="h-2.5" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                      <span>Peak Focus Time</span>
                    </div>
                    <span className="font-medium">10 AM - 1 PM</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-gray-500 mr-2"></span>
                      <span>Focus Score</span>
                    </div>
                    <span className="font-medium">8.7 / 10</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Task Prioritizer */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>AI Task Prioritizer</CardTitle>
                <CardDescription>Intelligent task management</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="flex-1">Finish project proposal</span>
                    <span className="px-2 py-1 text-xs bg-gray-800 text-white rounded">Critical</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span className="flex-1">Review team updates</span>
                    <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">Important</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="flex-1">Brainstorm new features</span>
                    <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">Can Wait</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-0 flex justify-end">
                <Button variant="link" className="text-sm text-gray-600 p-0">
                  View AI-Optimized Schedule
                </Button>
              </CardFooter>
            </Card>

            {/* AI Focus Challenges */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>AI Focus Challenges</CardTitle>
                <CardDescription>Gamified productivity boosters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-2">🌟</span>
                    <div>
                      <h4 className="font-medium text-sm">Deep Work Master</h4>
                      <p className="text-xs text-gray-600">Complete 5 days of 3+ hour deep work sessions</p>
                    </div>
                    <div className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded">2/5 Days</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="dark" className="w-full">
                  Join Weekly AI Challenge
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Personalized AI Insights */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personalized AI Insights</CardTitle>
              <CardDescription>Tailored productivity recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-gray-100 p-2 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Productivity Pattern Detected</h3>
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
                  <h3 className="font-medium">Optimal Break Suggestion</h3>
                  <p className="text-sm text-gray-600">A 15-minute walk at 2 PM could boost your afternoon productivity.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-gray-100 p-2 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Learning Opportunity</h3>
                  <p className="text-sm text-gray-600">Based on your work patterns, learning keyboard shortcuts could save you 30 minutes daily.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default Dashboard; 