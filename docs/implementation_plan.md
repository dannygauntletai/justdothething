Implementation Plan for JustDoTheThing.ai

Project Setup
1. Create the project root directory: justdothething.
2. Navigate into the root directory.
3. Initialize a Node.js project with default settings.
4. Install Yarn globally if not already installed.
5. Set up Yarn Workspaces in the root package.json for frontend and backend.
6. Create a frontend/ directory in the root.
7. Inside frontend/, create subdirectories: packages/website, packages/shared.
8. Create a backend/ directory in the root.
9. Initialize a Git repository in the root.
10. Create a .gitignore file in the root with common exclusions (e.g., node_modules/, .env).
11. Commit the initial project structure to Git.

Backend Setup
12. Navigate to the backend/ directory.
13. Initialize a Node.js project in backend/.
14. Install Express.js as the backend framework.
15. Create a src/ directory in backend/.
16. Create an app.js file in backend/src/ for the Express app.
17. Install dotenv for environment variable management.
18. Create a .env file in backend/ with placeholders (e.g., SUPABASE_URL, OPENAI_API_KEY).
19. Configure app.js to load environment variables using dotenv.
20. Install the Supabase JavaScript client in backend/.
21. Create a config/ directory in backend/src/.
22. Create supabase.js in config/ to initialize the Supabase client.
23. Open the Supabase dashboard and locate your project's SUPABASE_URL and SUPABASE_KEY.
24. Add SUPABASE_URL and SUPABASE_KEY to backend/.env.
25. Test the Supabase connection by running a simple query from app.js.

Database Configuration
26. In Supabase, create a users table with columns: id (UUID), settings (JSON).
27. Create a screenshots table with columns: id (Integer), user_id (UUID), timestamp (Datetime), hash (Varchar), classification (Varchar), confidence (Float).
28. Enable Row-Level Security (RLS) for the users table.
29. Enable RLS for the screenshots table.
30. Create an RLS policy for users to allow authenticated users to access their own data.
31. Create an RLS policy for screenshots to restrict access to the user's own screenshots.
32. Test RLS by inserting a sample user and querying as an authenticated user.

Authentication
33. Create a middleware/ directory in backend/src/.
34. Create authMiddleware.js in middleware/ to validate Supabase JWT tokens.
35. Install jsonwebtoken in backend/ for token verification.
36. Update authMiddleware.js to decode and verify tokens.
37. Add a /api/auth/test endpoint in app.js to test authentication.
38. Manually test the test endpoint with a valid Supabase JWT.

Yell Mode (Local TensorFlow.js)
39. Install TensorFlow.js in frontend/packages/website/.
40. Create a services/ directory in frontend/packages/website/src/.
41. Create screenshotService.js in services/ to handle screenshot capture logic.
42. Create workClassificationService.ts in services/ai/ to classify screenshots using TensorFlow.js locally.
43. Install html2canvas in frontend/packages/website/ for screenshot capture.
44. Implement screenshot capture and classification logic in the website frontend.
45. Use browser-based text-to-speech (e.g., Web Speech API) for yell generation.
46. Create yellRoutes.js in backend/src/routes/ with a /trigger endpoint to save classification results.
47. Mount yellRoutes.js in app.js under /api/yell.

Testing the MVP
48. Install Jest in frontend/packages/website/ for unit testing.
49. Create a __tests__/ directory in frontend/packages/website/src/services/.
50. Write a unit test for workClassificationService.ts.
51. Run Jest tests in frontend/packages/website/.
52. Test the website by simulating screenshot capture and classification.
53. Verify the yell audio plays for non-work screenshots.

Yap Mode (Local Processing)
54. Create sttService.js in frontend/packages/website/src/services/ for speech-to-text using Web Speech API.
55. Create nlpService.js in frontend/packages/website/src/services/ai/ for local NLP processing with TensorFlow.js.
56. Integrate speech recognition and task extraction in the website frontend.
57. Create yapRoutes.js in backend/src/routes/ with a /transcribe endpoint to save tasks.
58. Mount yapRoutes.js in app.js under /api/yap.
59. Test speech-to-text and task extraction manually in the website.

Website Development
60. Navigate to frontend/packages/website/.
61. Initialize a Node.js project in the website directory.
62. Install Vite, React, and Vite's React plugin in website/.
63. Create a src/ directory in website/.
64. Create main.js in src/ as the website's entry point.
65. Create App.js in src/ with a basic dashboard layout.
66. Create index.html in website/public/ with a root div.
67. Install React Router in website/.
68. Create a pages/ directory in website/src/.
69. Create Dashboard.js in pages/ for the main view.
70. Create Settings.js in pages/ for user settings.
71. Configure routing in App.js with React Router.
72. Build the website using Vite and test locally.

Shared Components
73. Navigate to frontend/packages/shared/.
74. Initialize a Node.js project in the shared directory.
75. Create a ui-components/ directory in shared/.
76. Create TaskCard.js in ui-components/ for reusable task UI.
77. Create ModeToggle.js in ui-components/ for mode controls.
78. Link the shared package to website/ via Yarn Workspaces.

Performance and Security
79. Implement caching for screenshot hashes in frontend/packages/website/src/services/screenshotService.js.
80. Add input validation for user inputs in the frontend services.
81. Ensure authMiddleware.js is used for all protected routes in the backend.

Authentication Integration
82. Create centralized API service for authenticated requests in frontend/packages/website/src/services/.
83. Update AuthContext to handle both Supabase and backend authentication in website/.
84. Implement database user synchronization in Dashboard.js.
85. Add proper environment variable type definitions for Vite in website/vite.config.js.
86. Update login flow to properly authenticate with backend in website/.

Testing and QA
87. Install Cypress in frontend/packages/website/ for end-to-end testing.
88. Configure Cypress with a base URL in cypress.config.js.
89. Write an E2E test for Yell Mode in cypress/e2e/.
90. Run Cypress tests and verify Yell Mode works.
91. Install Artillery in backend/ for load testing.
92. Create a load test script for /trigger in backend/.
93. Run the load test and analyze results.

Production Readiness
94. Create a landing/ directory in the root for a landing page.
95. Initialize a Vite project in landing/.
96. Build a simple landing page in landing/.
97. Deploy the landing page to Vercel.
98. Install Stripe in backend/.
99. Create subscriptionService.js in backend/src/services/ for payments.
100. Create subscriptionRoutes.js with a /create endpoint.
101. Mount subscriptionRoutes.js in app.js under /api/subscription.
102. Update the users table in Supabase with a subscription_id column.
103. Deploy the backend to a hosting provider (e.g., Render).
104. Deploy the website to Vercel.