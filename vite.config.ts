import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

// Get git version info at build time
function getGitVersion(): string {
  try {
    return execSync('git describe --tags --always', { encoding: 'utf-8' }).trim();
  } catch {
    return 'dev';
  }
}

function getGitCommitHash(): string {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

function getGitTag(): string | null {
  try {
    // Try to get the latest tag from git describe
    const describe = execSync('git describe --tags --always', { encoding: 'utf-8' }).trim();
    // Extract tag if it's in format "tag-commits-commithash" or just "tag"
    const match = describe.match(/^([^-]+?)(?:-\d+-g[0-9a-f]+)?$/);
    if (match && match[1] && !match[1].match(/^[0-9a-f]{7,40}$/)) {
      // It's a tag, not just a commit hash
      return match[1];
    }
    return null;
  } catch {
    return null;
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  // Get git version info
  const gitVersion = getGitVersion();
  const gitCommitHash = getGitCommitHash();
  const gitTag = getGitTag();

  // Production domains
  const productionDomains = [
    'devcommunity.io',
    'www.devcommunity.io',
    'api.devcommunity.io',
    'www.devcommunity.com',
  ];

  // Development domains
  const developmentDomains = [
    'localhost',
    '127.0.0.1',
    ...productionDomains, // Include production domains for staging/testing
  ];

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(gitVersion),
      'import.meta.env.VITE_APP_COMMIT_HASH': JSON.stringify(gitCommitHash),
      'import.meta.env.VITE_APP_GIT_TAG': JSON.stringify(gitTag),
    },
    server: {
      port: parseInt(env.VITE_PORT || '5173'),
      host: env.VITE_HOST || '0.0.0.0',
      strictPort: false,
      open: false,
      cors: true,
      allowedHosts: isProduction ? productionDomains : developmentDomains,
    },
    preview: {
      port: parseInt(env.VITE_PORT || '4173'),
      host: env.VITE_HOST || '0.0.0.0',
      allowedHosts: isProduction ? productionDomains : developmentDomains,
      cors: true,
    },
    build: {
      // Production optimizations
      minify: 'esbuild',
      sourcemap: !isProduction, // Only generate sourcemaps in development
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['lucide-react'],
          },
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // Optimize assets
      assetsInlineLimit: 4096,
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  };
});
