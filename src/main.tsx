import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import { loadAndApplyDynamicAssets } from './utils/dynamicAssets';
import App from './App.tsx';
import './index.css';

// Suppress blob URL errors in console (these are harmless - blob URLs get revoked when pages reload)
// Note: Browser-native "Failed to load resource" errors for blob URLs in the Network tab
// cannot be suppressed via JavaScript, but delayed revocation prevents most occurrences.
// Browser extension errors (e.g., midnight-wallet, midnight-authenticator) are from
// extensions trying to connect to content scripts and are normal/harmless.
if (typeof window !== 'undefined') {
    // Override console.error to filter blob URL errors
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
        const message = args.join(' ');
        // Filter out blob URL ERR_FILE_NOT_FOUND errors
        if (message.includes('blob:') && message.includes('ERR_FILE_NOT_FOUND')) {
            return; // Silently ignore
        }
        if (message.includes('Failed to load resource') && message.includes('blob:')) {
            return; // Silently ignore
        }
        originalConsoleError.apply(console, args);
    };

    // Override console.warn to filter blob URL warnings
    const originalConsoleWarn = console.warn;
    console.warn = (...args: any[]) => {
        const message = args.join(' ');
        // Filter out blob URL warnings
        if (message.includes('blob:') && (message.includes('ERR_FILE_NOT_FOUND') || message.includes('Failed to load'))) {
            return; // Silently ignore
        }
        originalConsoleWarn.apply(console, args);
    };

    // Add global error handler to filter blob URL errors
    window.addEventListener('error', (event) => {
        // Suppress blob URL errors
        if (event.filename && event.filename.startsWith('blob:')) {
            event.preventDefault();
            return false;
        }
        // Suppress errors from blob URLs in error message
        if (event.message && event.message.includes('blob:') && 
            (event.message.includes('ERR_FILE_NOT_FOUND') || event.message.includes('Failed to load'))) {
            event.preventDefault();
            return false;
        }
        // Check source element if available
        if (event.target && (event.target as any).src && (event.target as any).src.startsWith('blob:')) {
            event.preventDefault();
            return false;
        }
    }, true); // Use capture phase to catch early
    
    // Also handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason?.toString() || '';
        if (reason.includes('blob:') && 
            (reason.includes('ERR_FILE_NOT_FOUND') || reason.includes('Failed to load'))) {
            event.preventDefault();
            return false;
        }
    });

    // Suppress resource loading errors for blob URLs
    document.addEventListener('error', (event) => {
        const target = event.target;
        if (target instanceof HTMLImageElement || target instanceof HTMLLinkElement || target instanceof HTMLScriptElement) {
            const src = (target as any).src || (target as any).href;
            if (src && src.startsWith('blob:')) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        }
    }, true);
}

// Load and apply dynamic assets (favicon, PWA icons, metadata, etc.) from site settings
loadAndApplyDynamicAssets()
  .then(() => {
    // Assets are already applied by loadAndApplyDynamicAssets
    // This is just a placeholder for any post-load logic
  })
  .catch((error) => {
    console.error('Failed to load dynamic assets:', error);
    // Ensure default favicon exists even on error
    const existingFavicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (!existingFavicon) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = '/icon.png';
      document.head.appendChild(link);
    }
  });

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
            <App />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
