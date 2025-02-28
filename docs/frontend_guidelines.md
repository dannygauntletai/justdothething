# Frontend Guidelines for the Productivity App

## Introduction

The frontend of the Productivity App delivers an intuitive and efficient user interface across two platforms: a Chrome extension for quick access and a website for comprehensive functionality. Prioritizing privacy, simplicity, and offline capability, it allows users to switch modes, manage tasks, and review insights effortlessly. This document outlines the frontend’s architecture, design principles, and component structure.

## Frontend Architecture

The frontend is structured as a monorepo managed with **Yarn Workspaces**, comprising three packages:
- **Chrome Extension**: A lightweight **React** app bundled with **Webpack**, featuring mode toggles and concise insights.
- **Website**: A robust **React** app built with **Vite**, offering a dashboard for tasks, settings, and detailed reports.
- **Shared**: Reusable UI components and utilities ensuring consistency across both platforms.

This monorepo approach optimizes dependency management, encourages code sharing, and supports independent development within a cohesive codebase.

## Design Principles

The frontend is guided by three core principles:
- **Simplicity**: Streamlined interfaces focus on essential features.
- **Privacy**: Avoids storing or transmitting sensitive data (e.g., screenshots).
- **Responsiveness**: Adapts seamlessly to different screen sizes and devices.

Future plans include accessibility enhancements like keyboard navigation and high-contrast themes.

## Styling and Theming

Styling is handled with **Tailwind CSS**, a utility-first framework that ensures design consistency and flexibility. A centralized theme file simplifies customization, maintaining a unified look without relying on traditional CSS methodologies.

## Component Structure

The frontend employs a component-based design:
- **Chrome Extension**:
  - **Popup UI**: A compact interface for mode controls and insights.
  - **Background Scripts**: Manage screenshot capture and inactivity detection.
  - **Content Scripts**: Inject logic into web pages when required.
- **Website**:
  - **Dashboard**: Presents tasks, mode toggles, and insights via card-based layouts.
  - **Pages**: Distinct routes for in-depth views (e.g., settings).
- **Shared**:
  - **UI Components**: Buttons, modals, task lists, and more.
  - **Utilities**: API helpers, formatters, and shared logic.

This modular setup ensures components are reusable, testable, and self-contained.

## State Management

State is managed using **Zustand** for global data (e.g., mode status, user settings) and React hooks (`useState`, `useEffect`) for local state. This lightweight strategy maintains scalability and predictability.

## Routing and Navigation

- **Website**: Employs **React Router** for client-side navigation across dashboard views.
- **Chrome Extension**: Features a single-page popup UI without routing; background and content scripts handle their own logic.

Navigation is tailored to each platform’s purpose, keeping interactions intuitive.

## Performance Optimization

Performance is improved through:
- **Lazy Loading**: Loads components on demand using `lazy` and `Suspense`.
- **Code Splitting**: Minimizes bundle size with Vite and Webpack.
- **Efficient API Calls**: Implements debouncing and throttling techniques.

These optimizations ensure a fast and responsive user experience.

## Testing and Quality Assurance

- **Jest**: Tests components and utility functions.
- **Cypress**: Validates end-to-end user workflows.

**GitHub Actions** automates testing to maintain code quality.

## Conclusion

Powered by React, Vite, and Webpack within a monorepo, the frontend offers a simple, high-performance interface. Tailwind CSS ensures design consistency, while Zustand and modular components enhance maintainability. With a focus on privacy and offline functionality, it provides a solid user experience with room for future growth.