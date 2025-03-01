import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">JustDoTheThing.ai</h1>
            <div className="flex gap-4">
              <Link to="/login">
                <Button variant="outline" size="sm">Log in</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-12 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Do The Thing.</span>
                  <span className="block text-blue-600">With AI Assistance.</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg md:text-xl max-w-xl mx-auto lg:mx-0">
                  A productivity app designed to help you maintain focus and manage tasks effectively with 
                  AI-powered interventions, real-time monitoring, and personalized insights.
                </p>
                <div className="mt-8 flex justify-center lg:justify-start">
                  <Link to="/login">
                    <Button size="lg" className="px-8">Start Your Productivity Journey</Button>
                  </Link>
                </div>
              </div>
              <div className="mt-12 lg:mt-0">
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 lg:p-8 shadow-lg">
                  <img 
                    src="https://placehold.co/600x400?text=JustDoTheThing.ai" 
                    alt="Productivity Illustration" 
                    className="w-full h-auto rounded-md max-w-full mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Key Features</h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                Our AI-powered tools help you stay focused and accomplish more.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
              {/* Yell Mode */}
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <CardTitle>Yell Mode</CardTitle>
                  <CardDescription>
                    AI-powered vocal nudges to keep you focused
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Screenshot monitoring to detect non-work behavior
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Customizable voice styles and tones
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Inactivity detection to prevent procrastination
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Yap Mode */}
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <CardTitle>Yap Mode</CardTitle>
                    <Badge variant="outline" className="text-xs border-gray-400 text-gray-500">Coming Soon</Badge>
                  </div>
                  <CardDescription>
                    Speech-to-text functionality that organizes spoken thoughts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Turn spoken thoughts into organized tasks
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Generate summaries from your spoken ideas
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Get relevant tool recommendations
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Flow Mode */}
              <Card className="opacity-70">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <CardTitle>Flow Mode</CardTitle>
                    <Badge variant="outline" className="text-xs border-gray-400 text-gray-500">Coming Soon</Badge>
                  </div>
                  <CardDescription>
                    Data collection and analysis for productivity insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Identify your chronotype and peak productivity times
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Track focus levels and distraction patterns
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Visualize productivity trends over time
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">How It Works</h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                Get started in minutes and boost your productivity with AI assistance.
              </p>
            </div>

            <div className="mt-8 sm:mt-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-blue-100 text-blue-900 text-lg sm:text-xl font-bold">1</div>
                  <h3 className="mt-3 sm:mt-4 text-lg font-medium text-gray-900">Sign Up</h3>
                  <p className="mt-2 text-sm sm:text-base text-gray-500">
                    Create your account in seconds and set up your preferences.
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-blue-100 text-blue-900 text-lg sm:text-xl font-bold">2</div>
                  <h3 className="mt-3 sm:mt-4 text-lg font-medium text-gray-900">Choose Your Mode</h3>
                  <p className="mt-2 text-sm sm:text-base text-gray-500">
                    Select from Yell, Yap, or Flow (upcoming) modes based on your current needs.
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-blue-100 text-blue-900 text-lg sm:text-xl font-bold">3</div>
                  <h3 className="mt-3 sm:mt-4 text-lg font-medium text-gray-900">Boost Productivity</h3>
                  <p className="mt-2 text-sm sm:text-base text-gray-500">
                    Let our AI help you stay focused and accomplish more every day.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            © 2025 JustDoTheThing.ai
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 