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
      host: env.VITE_HOST || '0.0.0.0', // 👈 Allow access from LAN (not just localhost)
      strictPort: false, // Will try alternative ports if specified port is busy
      open: false, // Set to true to auto-open browser
      cors: true, // 👈 Allow cross-origin access during dev
      allowedHosts: [
        // 👇 Optional: Add any custom domains you use locally (for preview or nginx proxy)
        'localhost',
        '127.0.0.1',
        'devcommunity.io',
      ],
    },
    preview: {
      port: parseInt(env.VITE_PREVIEW_PORT || '4173'),
      host: env.VITE_HOST || '0.0.0.0', // 👈 Also allow external preview access
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        'devcommunity.io',
      ],
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
