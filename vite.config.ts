import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_PORT || '5173'),
      host: env.VITE_HOST || 'localhost',
      strictPort: false, // Will try alternative ports if specified port is busy
      open: false, // Set to true to auto-open browser
    },
    preview: {
      port: parseInt(env.VITE_PREVIEW_PORT || '4173'),
      host: env.VITE_HOST || 'localhost',
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
