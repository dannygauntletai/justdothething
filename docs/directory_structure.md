# Directory Structure for JustDoTheThing.ai

```
dannygauntletai-justdothething/
│
├── .github/                             # GitHub workflows and CI/CD configuration
│   └── workflows/
│       ├── ci.yml                       # Continuous Integration workflow
│       └── deploy.yml                   # Deployment workflow
│
├── backend/                             # Backend Node.js application
│   ├── firebase.json                    # Firebase configuration
│   ├── firestore.rules                  # Firestore security rules
│   ├── firestore.indexes.json           # Firestore index configuration
│   ├── package.json                     # Backend dependencies
│   │
│   ├── functions/                       # Firebase Cloud Functions
│   │   ├── package.json                 # Functions dependencies
│   │   ├── index.js                     # Functions entry point
│   │   ├── summaryGenerator.js          # Summary generation function for Yap Mode
│   │   └── utils/                       # Utility functions for Cloud Functions
│   │
│   └── src/                             # Backend source code
│       ├── app.js                       # Express application setup
│       ├── server.js                    # Server entry point
│       │
│       ├── config/                      # Configuration files
│       │   └── firebase.js              # Firebase Admin SDK configuration
│       │
│       ├── middleware/                  # Middleware components
│       │   ├── authMiddleware.js        # Firebase Auth middleware
│       │   ├── errorHandler.js          # Global error handler
│       │   └── requestLogger.js         # Request logging middleware
│       │
│       ├── routes/                      # API routes
│       │   ├── authRoutes.js            # Authentication endpoints
│       │   ├── yellRoutes.js            # Yell Mode endpoints
│       │   ├── yapRoutes.js             # Yap Mode endpoints
│       │   └── flowRoutes.js            # Flow Mode endpoints
│       │
│       └── services/                    # Business logic services
│           ├── summaryService.js        # Service for generating summaries from transcriptions
│           ├── insightService.js        # Service for generating insights
│           └── userService.js           # User management service
│
├── frontend/                            # Frontend applications
│   ├── package.json                     # Root frontend dependencies
│   │
│   ├── packages/                        # Monorepo packages
│   │   │
│   │   ├── shared/                      # Shared code for frontend packages
│   │   │   ├── package.json             # Shared package dependencies
│   │   │   ├── tsconfig.json            # TypeScript configuration
│   │   │   │
│   │   │   ├── ui-components/           # Reusable UI components
│   │   │   │   ├── TaskCard.tsx         # Task card component
│   │   │   │   ├── ModeToggle.tsx       # Mode toggle component
│   │   │   │   └── index.ts             # Barrel file for UI components
│   │   │   │
│   │   │   └── utils/                   # Shared utilities
│   │   │       ├── firebase/            # Firebase utilities
│   │   │       │   ├── firebaseClient.ts # Firebase client configuration
│   │   │       │   ├── firestoreHelpers.ts # Helpers for Firestore operations
│   │   │       │   ├── useFirebaseAuth.ts # Firebase Auth hook
│   │   │       │   └── index.ts          # Barrel file for Firebase utilities
│   │   │       │
│   │   │       ├── hooks/               # Shared hooks
│   │   │       └── types/               # Shared TypeScript types
│   │   │
│   │   └── website/                     # Main website application
│   │       ├── package.json             # Website dependencies
│   │       ├── vite.config.js           # Vite configuration
│   │       ├── tsconfig.json            # TypeScript configuration
│   │       │
│   │       ├── public/                  # Static assets
│   │       │   ├── index.html           # HTML entry point
│   │       │   ├── favicon.ico          # Website favicon
│   │       │   └── assets/              # Other static assets
│   │       │
│   │       └── src/                     # Website source code
│   │           ├── main.tsx             # Application entry point
│   │           ├── App.tsx              # Root component
│   │           ├── firebase-config.ts   # Firebase client config
│   │           │
│   │           ├── components/          # React components
│   │           │   ├── Layout/          # Layout components
│   │           │   ├── YellMode/        # Yell Mode components
│   │           │   ├── YapMode/         # Yap Mode components
│   │           │   └── FlowMode/        # Flow Mode components
│   │           │
│   │           ├── pages/               # Page components
│   │           │   ├── Dashboard.tsx    # Dashboard page
│   │           │   ├── Settings.tsx     # Settings page
│   │           │   └── Auth.tsx         # Authentication page
│   │           │
│   │           ├── services/            # Frontend services
│   │           │   ├── ai/              # AI-related services
│   │           │   │   ├── workClassificationService.ts # Work classification using TensorFlow.js
│   │           │   │   └── speechRecognitionService.ts # Speech recognition service
│   │           │   │
│   │           │   ├── screenshotService.ts # Screenshot service for Yell Mode
│   │           │   ├── yapService.ts    # Yap Mode service
│   │           │   ├── flowService.ts   # Flow Mode service
│   │           │   └── ttsService.ts    # Text-to-speech service for Yell Mode
│   │           │
│   │           ├── context/             # React context providers
│   │           │   ├── AuthContext.tsx  # Authentication context
│   │           │   └── AppContext.tsx   # Application context
│   │           │
│   │           ├── hooks/               # Custom React hooks
│   │           │   ├── useYellMode.ts   # Hook for Yell Mode
│   │           │   ├── useYapMode.ts    # Hook for Yap Mode
│   │           │   └── useFlowMode.ts   # Hook for Flow Mode
│   │           │
│   │           └── utils/               # Utility functions
│   │               ├── storage.ts       # Local storage utilities
│   │               └── formatters.ts    # Formatting utilities
│
├── docs/                                # Documentation
│   ├── README.md                        # Project overview
│   ├── architecture.md                  # Architecture documentation
│   ├── api.md                           # API documentation
│   ├── firebase_integration.md          # Firebase integration guidance
│   └── CONTRIBUTING.md                  # Contribution guidelines
│
├── tools/                               # Development and build tools
│   ├── scripts/                         # Utility scripts
│   └── templates/                       # Code templates
│
├── .eslintrc.js                         # ESLint configuration
├── .prettierrc                          # Prettier configuration
├── .gitignore                           # Git ignore file
├── package.json                         # Root package.json for workspaces
├── tsconfig.json                        # Root TypeScript configuration
└── README.md                            # Repository README