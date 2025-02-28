# Implementation Plan for JustDoTheThing.ai

## Project Setup

- [ ] **Step 1**: Create the project root directory: `justdothething`.
- [ ] **Step 2**: Navigate into the root directory.
- [ ] **Step 3**: Initialize a Node.js project with default settings.
- [ ] **Step 4**: Install Yarn globally if not already installed.
- [ ] **Step 5**: Set up Yarn Workspaces in the root `package.json` for frontend and backend.
- [ ] **Step 6**: Create a `frontend/` directory in the root.
- [ ] **Step 7**: Inside `frontend/`, create subdirectories: `packages/chrome-extension`, `packages/website`, `packages/shared`.
- [ ] **Step 8**: Create a `backend/` directory in the root.
- [ ] **Step 9**: Initialize a Git repository in the root.
- [ ] **Step 10**: Create a `.gitignore` file in the root with common exclusions (e.g., `node_modules/`, `.env`).
- [ ] **Step 11**: Commit the initial project structure to Git.

---

## Backend Setup

- [ ] **Step 12**: Navigate to the `backend/` directory.
- [ ] **Step 13**: Initialize a Node.js project in `backend/`.
- [ ] **Step 14**: Install Express.js as the backend framework.
- [ ] **Step 15**: Create a `src/` directory in `backend/`.
- [ ] **Step 16**: Create an `app.js` file in `backend/src/` for the Express app.
- [ ] **Step 17**: Install `dotenv` for environment variable management.
- [ ] **Step 18**: Create a `.env` file in `backend/` with placeholders (e.g., `SUPABASE_URL`, `OPENAI_API_KEY`).
- [ ] **Step 19**: Configure `app.js` to load environment variables using `dotenv`.
- [ ] **Step 20**: Install the Supabase JavaScript client in `backend/`.
- [ ] **Step 21**: Create a `config/` directory in `backend/src/`.
- [ ] **Step 22**: Create `supabase.js` in `config/` to initialize the Supabase client.
- [ ] **Step 23**: Open the Supabase dashboard and locate your project's `SUPABASE_URL` and `SUPABASE_KEY`.
- [ ] **Step 24**: Add `SUPABASE_URL` and `SUPABASE_KEY` to `backend/.env`.
- [ ] **Step 25**: Test the Supabase connection by running a simple query from `app.js`.

---

## Database Configuration

- [ ] **Step 26**: In Supabase, create a `users` table with columns: `id (UUID)`, `settings (JSON)`.
- [ ] **Step 27**: Create a `screenshots` table with columns: `id (Integer)`, `user_id (UUID)`, `timestamp (Datetime)`, `hash (Varchar)`, `classification (Varchar)`, `confidence (Float)`.
- [ ] **Step 28**: Enable Row-Level Security (RLS) for the `users` table.
- [ ] **Step 29**: Enable RLS for the `screenshots` table.
- [ ] **Step 30**: Create an RLS policy for `users` to allow authenticated users to access their own data.
- [ ] **Step 31**: Create an RLS policy for `screenshots` to restrict access to the user's own screenshots.
- [ ] **Step 32**: Test RLS by inserting a sample user and querying as an authenticated user.

---

## Authentication

- [ ] **Step 33**: Create a `middleware/` directory in `backend/src/`.
- [ ] **Step 34**: Create `authMiddleware.js` in `middleware/` to validate Supabase JWT tokens.
- [ ] **Step 35**: Install `jsonwebtoken` in `backend/` for token verification.
- [ ] **Step 36**: Update `authMiddleware.js` to decode and verify tokens.
- [ ] **Step 37**: Add a `/api/auth/test` endpoint in `app.js` to test authentication.
- [ ] **Step 38**: Manually test the test endpoint with a valid Supabase JWT.

---

## Yell Mode Backend (MVP)

- [ ] **Step 39**: Install `image-hash` in `backend/` for screenshot hashing.
- [ ] **Step 40**: Create a `services/` directory in `backend/src/`.
- [ ] **Step 41**: Create `screenshotService.js` in `services/` with a function to hash screenshots.
- [ ] **Step 42**: Install TensorFlow.js and MobileNet in `backend/`.
- [ ] **Step 43**: Create `imageClassificationService.js` in `services/` to classify screenshots.
- [ ] **Step 44**: Install `axios` in `backend/` for external API calls (e.g., ElevenLabs).
- [ ] **Step 45**: Create `ttsService.js` in `services/` to generate yells via ElevenLabs.
- [ ] **Step 46**: Create a `routes/` directory in `backend/src/`.
- [ ] **Step 47**: Create `yellRoutes.js` in `routes/` with a `/trigger` endpoint.
- [ ] **Step 48**: Mount `yellRoutes.js` in `app.js` under `/api/yell`.
- [ ] **Step 49**: Implement screenshot hashing in the `/trigger` endpoint.
- [ ] **Step 50**: Add screenshot classification to the `/trigger` endpoint.
- [ ] **Step 51**: Integrate text-to-speech in `/trigger` to yell when screenshots aren't work-related.
- [ ] **Step 52**: Test the `/trigger` endpoint with a sample screenshot manually.

---

## Chrome Extension (MVP)

- [ ] **Step 53**: Navigate to `frontend/packages/chrome-extension/`.
- [ ] **Step 54**: Initialize a Node.js project in the extension directory.
- [ ] **Step 55**: Create a `public/` directory in `chrome-extension/`.
- [ ] **Step 56**: Create `manifest.json` in `public/` with basic extension metadata.
- [ ] **Step 57**: Install React, Vite, and Vite's React plugin in `chrome-extension/`.
- [ ] **Step 58**: Create a `popup/` directory in `chrome-extension/`.
- [ ] **Step 59**: Create `popup/index.html` as the extension's UI entry point.
- [ ] **Step 60**: Create `popup/App.js` with a React component for mode toggles.
- [ ] **Step 61**: Create a `background/` directory in `chrome-extension/`.
- [ ] **Step 62**: Create `background/index.js` to handle screenshot capture.
- [ ] **Step 63**: Configure Vite to build the extension (create `vite.config.js`).
- [ ] **Step 64**: Build the extension using Vite.
- [ ] **Step 65**: Load the extension in Chrome manually to verify it works.

---

## Testing the MVP

- [ ] **Step 66**: Install Jest in `backend/` for unit testing.
- [ ] **Step 67**: Create a `__tests__/` directory in `backend/src/services/`.
- [ ] **Step 68**: Write a unit test for `imageClassificationService.js`.
- [ ] **Step 69**: Run Jest tests in `backend/`.
- [ ] **Step 70**: Test the Chrome extension by capturing a screenshot and sending it to `/trigger`.
- [ ] **Step 71**: Verify the yell audio plays for non-work screenshots.

---

## Yap Mode Backend

- [ ] **Step 72**: Create `yapRoutes.js` in `backend/src/routes/` with a `/transcribe` endpoint.
- [ ] **Step 73**: Mount `yapRoutes.js` in `app.js` under `/api/yap`.
- [ ] **Step 74**: Install the OpenAI SDK in `backend/`.
- [ ] **Step 75**: Create `sttService.js` in `services/` for speech-to-text with Whisper.
- [ ] **Step 76**: Implement speech-to-text in the `/transcribe` endpoint.
- [ ] **Step 77**: Create `nlpService.js` in `services/` to extract tasks from transcriptions using GPT-4.
- [ ] **Step 78**: Install the Twitter API client in `backend/`.
- [ ] **Step 79**: Create `recommendationService.js` in `services/` for tool suggestions via Twitter.
- [ ] **Step 80**: Integrate task extraction and recommendations into `/transcribe`.
- [ ] **Step 81**: Test `/transcribe` with a sample audio file manually.

---

## Website Development

- [ ] **Step 82**: Navigate to `frontend/packages/website/`.
- [ ] **Step 83**: Initialize a Node.js project in the website directory.
- [ ] **Step 84**: Install Vite, React, and Vite's React plugin in `website/`.
- [ ] **Step 85**: Create a `src/` directory in `website/`.
- [ ] **Step 86**: Create `main.js` in `src/` as the website's entry point.
- [ ] **Step 87**: Create `App.js` in `src/` with a basic dashboard layout.
- [ ] **Step 88**: Create `index.html` in `website/` with a root div.
- [ ] **Step 89**: Install React Router in `website/`.
- [ ] **Step 90**: Create a `pages/` directory in `website/src/`.
- [ ] **Step 91**: Create `Dashboard.js` in `pages/` for the main view.
- [ ] **Step 92**: Create `Settings.js` in `pages/` for user settings.
- [ ] **Step 93**: Configure routing in `App.js` with React Router.
- [ ] **Step 94**: Build the website using Vite and test locally.

---

## Shared Components

- [ ] **Step 95**: Navigate to `frontend/packages/shared/`.
- [ ] **Step 96**: Initialize a Node.js project in the shared directory.
- [ ] **Step 97**: Create a `ui-components/` directory in `shared/`.
- [ ] **Step 98**: Create `TaskCard.js` in `ui-components/` for reusable task UI.
- [ ] **Step 99**: Create `ModeToggle.js` in `ui-components/` for mode controls.
- [ ] **Step 100**: Link the shared package to `website/` and `chrome-extension/` via Yarn Workspaces.

---

## Performance and Security

- [ ] **Step 101**: Install `node-cache` in `backend/` for caching.
- [ ] **Step 102**: Add caching to `screenshotService.js` for hashed screenshots.
- [ ] **Step 103**: Install `express-validator` in `backend/`.
- [ ] **Step 104**: Add input validation to `/trigger` in `yellRoutes.js`.
- [ ] **Step 105**: Strengthen `authMiddleware.js` with JWT validation for all protected routes.

---

## Testing and QA

- [ ] **Step 106**: Install Cypress in `backend/` for end-to-end testing.
- [ ] **Step 107**: Configure Cypress with a base URL in `cypress.config.js`.
- [ ] **Step 108**: Write an E2E test for Yell Mode in `cypress/e2e/`.
- [ ] **Step 109**: Run Cypress tests and verify Yell Mode works.
- [ ] **Step 110**: Install Artillery in `backend/` for load testing.
- [ ] **Step 111**: Create a load test script for `/trigger` in `backend/`.
- [ ] **Step 112**: Run the load test and analyze results.

---

## Production Readiness

- [ ] **Step 113**: Create a `landing/` directory in the root for a landing page.
- [ ] **Step 114**: Initialize a Vite project in `landing/`.
- [ ] **Step 115**: Build a simple landing page in `landing/`.
- [ ] **Step 116**: Deploy the landing page to Vercel.
- [ ] **Step 117**: Install Stripe in `backend/`.
- [ ] **Step 118**: Create `subscriptionService.js` in `backend/src/services/` for payments.
- [ ] **Step 119**: Create `subscriptionRoutes.js` with a `/create` endpoint.
- [ ] **Step 120**: Mount `subscriptionRoutes.js` in `app.js` under `/api/subscription`.
- [ ] **Step 121**: Update the `users` table in Supabase with a `subscription_id` column.
- [ ] **Step 122**: Deploy the backend to a hosting provider (e.g., Render).
- [ ] **Step 123**: Deploy the website to Vercel.

---