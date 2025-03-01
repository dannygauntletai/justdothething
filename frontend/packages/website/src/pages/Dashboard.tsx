import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/utils/AuthContext';
import { api } from '../../../shared/utils/api';
import YellMode from '../components/YellMode/YellMode';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

// Define session type
interface SessionSummary {
  id: number;
  title: string;
  date: string;
  duration: string;
  summary: string;
}

function Dashboard() {
  const { user, session, dbUser, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [verifyingBackend, setVerifyingBackend] = useState(false);
  const hasCheckedAuth = useRef(false);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionSummary | null>(null);

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

  const handleOpenSessionSummary = (session: SessionSummary) => {
    setSelectedSession(session);
    setShowSessionSummary(true);
  };

  const handleCloseSessionSummary = () => {
    setShowSessionSummary(false);
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

  // Placeholder session data
  const placeholderSessions: SessionSummary[] = [
    {
      id: 1,
      title: "Project Brainstorm",
      date: "Today, 2:30 PM",
      duration: "15 min",
      summary: "Discussion about the new landing page design. Key points included improving the hero section, adding more social proof, and streamlining the signup process. Action items: create mockups for hero section variations, research competitor landing pages, schedule follow-up meeting for next week."
    },
    {
      id: 2,
      title: "Weekly Planning",
      date: "Yesterday, 10:15 AM",
      duration: "22 min",
      summary: "Weekly planning session covering upcoming deadlines and project priorities. Identified three critical tasks for the week: complete dashboard redesign, fix user authentication bugs, and prepare for client presentation on Thursday. Allocated time blocks for deep work and scheduled necessary meetings."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold">JustDoTheThing.ai</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={handleSignOut} variant="outline" size="sm">Sign out</Button>
          </div>
        </header>

        <main className="p-4 sm:p-6 max-w-6xl mx-auto">
          {/* Mode Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {/* Flow Mode - Grayed out */}
            <Card className="flex flex-col items-center opacity-50 cursor-not-allowed">
              <CardHeader className="text-center">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <CardTitle>Flow Mode</CardTitle>
                </div>
                <CardDescription>
                  Data collection and analysis for productivity insights
                </CardDescription>
              </CardHeader>
              <CardFooter className="w-full mt-auto">
                <Button variant="dark" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardFooter>
            </Card>
            
            {/* Yap Mode - Grayed out */}
            <Card className="flex flex-col items-center opacity-50 cursor-not-allowed">
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
                <Button variant="dark" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardFooter>
            </Card>

            {/* Yell Mode */}
            <YellMode />
          </div>

          {/* Stats and Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {/* AI-Insights - Grayed out */}
            <Card className="opacity-60 cursor-not-allowed">
              <CardHeader className="pb-2">
                <CardTitle>AI-Insights</CardTitle>
                <CardDescription>Chronotype and behavioral patterns</CardDescription>
                <div className="mt-2 inline-block px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">Coming Soon</div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                      <span>Chronotype</span>
                    </div>
                    <span className="font-medium">Morning Lark</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                      <span>Focus Score</span>
                    </div>
                    <span className="font-medium">8.7 / 10</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                      <span>Deep Work Capacity</span>
                    </div>
                    <span className="font-medium">2.5 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Task Prioritizer - Grayed out */}
            <Card className="opacity-60 cursor-not-allowed">
              <CardHeader className="pb-2">
                <CardTitle>AI Task Prioritizer</CardTitle>
                <CardDescription>Intelligent task management</CardDescription>
                <div className="mt-2 inline-block px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">Coming Soon</div>
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
            </Card>

            {/* Session Summaries - Grayed out */}
            <Card className="opacity-60 cursor-not-allowed">
              <CardHeader className="pb-2">
                <CardTitle>Session Summaries</CardTitle>
                <CardDescription>Yap session transcriptions and insights</CardDescription>
                <div className="mt-2 inline-block px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">Coming Soon</div>
              </CardHeader>
              <CardContent className="space-y-4">
                {placeholderSessions.map((session) => (
                  <div 
                    key={session.id} 
                    className="bg-gray-100 p-3 rounded-lg pointer-events-none"
                  >
                    <div className="flex items-center">
                      <span className="text-purple-500 mr-2">🎙️</span>
                      <div>
                        <h4 className="font-medium text-sm">{session.title}</h4>
                        <p className="text-xs text-gray-600">{session.date} • {session.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Session summary modal */}
      {showSessionSummary && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{selectedSession.title}</h3>
                <button 
                  onClick={handleCloseSessionSummary}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">{selectedSession.date} • {selectedSession.duration}</div>
                <p className="text-gray-700 leading-relaxed">{selectedSession.summary}</p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium mb-2">Key Takeaways</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Improve hero section design</li>
                  <li>Add more customer testimonials</li>
                  <li>Simplify sign-up process</li>
                  <li>Schedule follow-up meeting next week</li>
                </ul>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end rounded-b-lg">
              <Button onClick={handleCloseSessionSummary} variant="outline" className="mr-2">Close</Button>
              <Button>Download Summary</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 