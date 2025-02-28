# Backend Structure Document for Productivity App

## Introduction

The backend of the Productivity App serves as the foundational system powering its AI-driven features, data management, and integration with the frontend. It supports three distinct operational modes—Yell Mode, Yap Mode, and Flow Mode—while emphasizing an offline-first approach, user privacy, and scalability. This document provides a comprehensive overview of the backend’s architecture, components, and design decisions for developers and stakeholders.

## Backend Architecture

The backend is developed using **Node.js** with **Express.js**, providing a lightweight yet robust framework for building RESTful APIs. It adopts a modular, layered architecture to separate concerns effectively:
- **Controllers**: Manage incoming API requests and responses.
- **Services**: Contain business logic, including AI processing and external API integrations.
- **Repositories**: Handle all database interactions.

This separation enhances maintainability, reusability, and scalability. The backend incorporates local AI models (e.g., **TensorFlow.js** for image classification) and connects to external services like **OpenAI’s Whisper** (speech-to-text), **ElevenLabs** (text-to-speech), and the **Twitter API** (tool suggestions) via dedicated service modules. Designed for offline-first functionality, it ensures core features work without internet access, activating online enhancements only when connectivity is available. Robust error handling gracefully manages failures—like unavailable models or network issues—by falling back to defaults, ensuring a seamless user experience.

## Database Management

The app utilizes **Supabase**, a PostgreSQL-based platform, for its database needs. Supabase offers scalability, real-time capabilities, and built-in authentication through **Supabase Auth**, streamlining user management. The database schema is designed for efficiency and privacy:
- **Users**: Stores user profiles and preferences.
- **Screenshots**: Retains metadata (e.g., hashes, classifications) rather than raw images.
- **Tasks**: Manages tasks generated in Yap Mode.
- **Insights**: Stores AI-derived insights in flexible JSON fields.

This schema uses foreign keys for relational integrity and JSON fields for adaptability, minimizing the need for frequent migrations as features evolve.

## API Design and Endpoints

The RESTful APIs are structured by functionality:
- **Yell Mode**: `/api/yell/trigger` handles screenshot processing and alerts.
- **Yap Mode**: `/api/yap/transcribe` converts speech into actionable tasks.
- **Flow Mode**: `/api/flow/insights` delivers productivity insights.
- **Shared**: `/api/activity/log` records activities across all modes.

Each endpoint is linked to a controller that delegates tasks to specialized services (e.g., `aiService.js`, `ttsService.js`), keeping the API layer focused on routing and response management for clear and predictable communication with the frontend.

## Hosting Solutions

During development, the backend runs locally with Node.js alongside the frontend. For production, it can be deployed to managed platforms like **DigitalOcean App Platform** or **Heroku** for scalability, or bundled with the frontend (e.g., using **Electron**) for offline deployment. This flexibility aligns with the offline-first philosophy, requiring internet only for optional features.

## Infrastructure Components

Key components include:
- **Express.js Server**: Manages API requests and responses.
- **Supabase Database**: Provides data storage and real-time updates.
- **Local AI Models**: TensorFlow.js powers on-device analytics.
- **External APIs**: Whisper, GPT-4, ElevenLabs, and Twitter API enhance functionality.

The modular design allows seamless upgrades to individual components with minimal impact.

## Security Measures

Security is prioritized with:
- **JWT Authentication**: Secures APIs using Supabase Auth tokens.
- **Data Encryption**: Safeguards sensitive data in transit and at rest.
- **Input Validation**: Mitigates injection attacks.

These measures ensure a secure foundation, even in offline scenarios.

## Monitoring and Maintenance

- **Logging**: Implemented with **Winston** or **Morgan** to track usage and errors.
- **Error Handling**: Ensures continuity with fallback mechanisms.

The modular structure simplifies updates to dependencies and AI models.

## Conclusion

Built on Node.js, Express.js, and Supabase, the backend provides a scalable, privacy-focused solution. Its offline-first design and modular architecture reliably support the app’s features while offering flexibility for future expansion.