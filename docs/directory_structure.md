Directory structure:
└── dannygauntletai-justdothething/
    ├── README.md
    ├── package.json
    ├── .editorconfig
    ├── .yarnrc.yml
    ├── backend/
    │   ├── README.md
    │   ├── package.json
    │   ├── .gitignore
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   └── migrations/
    │   │       ├── migration_lock.toml
    │   │       ├── 20250228232222_init_schema/
    │   │       │   └── migration.sql
    │   │       └── 20250228232416_update_table_names_to_plural/
    │   │           └── migration.sql
    │   └── src/
    │       ├── app.js
    │       ├── config/
    │       │   ├── prisma.js
    │       │   └── supabase.js
    │       ├── middleware/
    │       │   └── authMiddleware.js
    │       └── routes/
    │           └── authRoutes.js
    ├── docs/
    │   ├── backend_structure.md
    │   ├── database_schema.md
    │   ├── directory_structure.md
    │   ├── frontend_guidelines.md
    │   ├── implementation_plan.md
    │   ├── prd.md
    │   └── yap.md
    └── frontend/
        └── packages/
            ├── chrome-extension/
            │   ├── README.md
            │   ├── index.html
            │   ├── package.json
            │   ├── vite.config.js
            │   ├── public/
            │   │   └── manifest.json
            │   └── src/
            │       ├── background/
            │       │   └── index.js
            │       └── popup/
            │           ├── App.tsx
            │           ├── index.html
            │           ├── index.tsx
            │           └── useExtensionAuth.tsx
            ├── shared/
            │   ├── README.md
            │   ├── package.json
            │   ├── types/
            │   │   └── vite-env.d.ts
            │   ├── ui-components/
            │   │   ├── Button.tsx
            │   │   └── GoogleLoginButton.tsx
            │   └── utils/
            │       ├── AuthContext.tsx
            │       ├── api.ts
            │       └── supabase.ts
            └── website/
                ├── README.md
                ├── index.html
                ├── package.json
                ├── postcss.config.js
                ├── tailwind.config.js
                ├── vite.config.js
                ├── public/
                │   └── models/
                │       ├── face_landmark_68/
                │       │   ├── face_landmark_68_model-shard1
                │       │   └── face_landmark_68_model-weights_manifest.json
                │       └── tiny_face_detector/
                │           ├── tiny_face_detector_model-shard1
                │           └── tiny_face_detector_model-weights_manifest.json
                └── src/
                    ├── App.tsx
                    ├── index.css
                    ├── main.tsx
                    ├── components/
                    │   ├── ProtectedRoute.tsx
                    │   ├── YellMode/
                    │   │   ├── ScreenView.tsx
                    │   │   ├── WebcamView.tsx
                    │   │   ├── YellMode.tsx
                    │   │   ├── YellModeControls.tsx
                    │   │   └── YellSettingsCard.tsx
                    │   └── ui/
                    │       ├── avatar.tsx
                    │       ├── badge.tsx
                    │       ├── button.tsx
                    │       ├── card.tsx
                    │       ├── progress.tsx
                    │       ├── separator.tsx
                    │       └── tabs.tsx
                    ├── lib/
                    │   └── utils.ts
                    ├── pages/
                    │   ├── AuthCallback.tsx
                    │   ├── Dashboard.tsx
                    │   ├── Landing.tsx
                    │   ├── Login.tsx
                    │   ├── Privacy.tsx
                    │   └── Terms.tsx
                    └── services/
                        ├── ttsService.ts
                        ├── yellModeStore.ts
                        └── ai/
                            ├── focusDetectionService.ts
                            ├── screenshotService.ts
                            └── workClassificationService.ts