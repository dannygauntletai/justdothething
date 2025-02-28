justdothething/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── supabase.js
│   │   │   └── apiKeys.js
│   │   ├── controllers/
│   │   │   ├── yellController.js
│   │   │   ├── yapController.js
│   │   │   ├── flowController.js
│   │   │   └── activityController.js
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── imageClassificationService.js
│   │   │   │   ├── visionService.js
│   │   │   │   ├── nlpService.js
│   │   │   │   ├── recommendationService.js
│   │   │   │   ├── timeSeriesService.js
│   │   │   │   └── modelUtils.js
│   │   │   ├── screenshotService.js
│   │   │   ├── unionFindService.js
│   │   │   ├── ttsService.js
│   │   │   └── sttService.js
│   │   ├── repositories/
│   │   │   ├── userRepository.js
│   │   │   ├── activityRepository.js
│   │   │   └── taskRepository.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── routes/
│   │   │   ├── yellRoutes.js
│   │   │   ├── yapRoutes.js
│   │   │   ├── flowRoutes.js
│   │   │   └── activityRoutes.js
│   │   ├── utils/
│   │   │   ├── imageUtils.js
│   │   │   └── helpers.js
│   │   └── app.js
│   ├── tests/
│   │   ├── services/
│   │   └── controllers/
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── packages/
│   │   ├── chrome-extension/
│   │   │   ├── src/
│   │   │   │   ├── background/
│   │   │   │   │   └── index.js
│   │   │   │   ├── content/
│   │   │   │   │   └── index.js
│   │   │   │   ├── popup/
│   │   │   │   │   ├── index.js
│   │   │   │   │   └── App.js
│   │   │   ├── public/
│   │   │   │   ├── manifest.json
│   │   │   │   └── icons/
│   │   │   ├── package.json
│   │   │   └── webpack.config.js
│   │   ├── website/
│   │   │   ├── src/
│   │   │   │   ├── components/
│   │   │   │   ├── pages/
│   │   │   ├── public/
│   │   │   ├── package.json
│   │   │   └── vite.config.js
│   │   └── shared/
│   │       ├── ui-components/
│   │       ├── utils/
│   │       └── package.json
│   ├── package.json
│   └── yarn.lock
│
├── package.json
├── yarn.lock
└── .gitignore