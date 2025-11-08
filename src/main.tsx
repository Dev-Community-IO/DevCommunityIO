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
    // Suppress MediaSession errors from browser extensions (e.g., autoPip.js)
    // These are harmless errors from extensions trying to use unsupported MediaSession actions
    const originalSetActionHandler = navigator.mediaSession?.setActionHandler;
    if (originalSetActionHandler && navigator.mediaSession) {
        try {
            navigator.mediaSession.setActionHandler = function(action: any, handler: any) {
                try {
                    // Only call original if action is valid
                    if (action && typeof action === 'string') {
                        const validActions = ['play', 'pause', 'seekbackward', 'seekforward', 'previoustrack', 'nexttrack', 'skipad', 'stop', 'seekto'];
                        if (validActions.includes(action.toLowerCase())) {
                            return originalSetActionHandler.call(navigator.mediaSession, action, handler);
                        }
                    }
                } catch (error: any) {
                    // Silently ignore MediaSession errors (likely from browser extensions)
                    if (!error.message?.includes('MediaSession') && !error.message?.includes('setActionHandler')) {
                        console.error('MediaSession error:', error);
                    }
                }
            };
        } catch (error) {
            // Ignore if MediaSession is not available
        }
    }

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
        // Filter out MediaSession errors from browser extensions
        if (message.includes('MediaSession') || message.includes('setActionHandler') || message.includes('enterpictureinpicture')) {
            return; // Silently ignore
        }
        // Filter out ERR_BLOCKED_BY_CLIENT errors (ad blockers blocking resources)
        if (message.includes('ERR_BLOCKED_BY_CLIENT') || message.includes('net::ERR_BLOCKED_BY_CLIENT')) {
            return; // Silently ignore - these are from browser extensions blocking resources
        }
        // Filter out blocked lucide-react icon errors (often blocked by ad blockers due to "fingerprint" name)
        if (message.includes('lucide-react') && (message.includes('fingerprint') || message.includes('ERR_BLOCKED_BY_CLIENT'))) {
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
        // Filter out ERR_BLOCKED_BY_CLIENT warnings (ad blockers blocking resources)
        if (message.includes('ERR_BLOCKED_BY_CLIENT') || message.includes('net::ERR_BLOCKED_BY_CLIENT')) {
            return; // Silently ignore
        }
        // Filter out blocked lucide-react icon warnings
        if (message.includes('lucide-react') && (message.includes('fingerprint') || message.includes('ERR_BLOCKED_BY_CLIENT'))) {
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
        // Suppress ERR_BLOCKED_BY_CLIENT errors (ad blockers blocking resources)
        if (event.message && (event.message.includes('ERR_BLOCKED_BY_CLIENT') || event.message.includes('net::ERR_BLOCKED_BY_CLIENT'))) {
            event.preventDefault();
            return false;
        }
        // Suppress blocked lucide-react icon errors
        if (event.filename && event.filename.includes('lucide-react') && event.filename.includes('fingerprint')) {
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
        // Suppress ERR_BLOCKED_BY_CLIENT errors in promise rejections
        if (reason.includes('ERR_BLOCKED_BY_CLIENT') || reason.includes('net::ERR_BLOCKED_BY_CLIENT')) {
            event.preventDefault();
            return false;
        }
        // Suppress blocked lucide-react icon errors
        if (reason.includes('lucide-react') && reason.includes('fingerprint')) {
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
            // Suppress ERR_BLOCKED_BY_CLIENT errors (ad blockers blocking resources)
            if (src && (src.includes('fingerprint') || src.includes('lucide-react'))) {
                // Check if this is a blocked resource error
                const errorEvent = event as any;
                if (errorEvent.error && errorEvent.error.message && errorEvent.error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
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
