import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  // Explicitly configure public directory
  publicDir: path.resolve(__dirname, 'public'),
  // Configure static asset serving
  server: {
    watch: {
      usePolling: true
    },
    // Log more details for debugging
    hmr: {
      overlay: true
    },
    // Improve static file serving
    fs: {
      strict: false, // Allow serving files from outside of root directory
      allow: ['..'] // Allow serving files from one level up
    }
  },
  // Improve logging for debugging
  clearScreen: false,
  logLevel: 'info',
  // Ensure all assets in public directory are properly served
  assetsInclude: ['**/*.json', '**/*.bin']
});
