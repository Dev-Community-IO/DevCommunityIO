import { useState, useEffect } from 'react';
import { Smartphone, Download, CheckCircle2, X, Share2, Info, Trash2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { pwaService } from '../services/pwaService';

export function PWASettings() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | null>(null);

  useEffect(() => {
    // Check installation status
    setIsInstalled(pwaService.isInstalled);
    setCanInstall(pwaService.canInstall);

    // Determine platform
    if (pwaService.isIOSDevice) {
      setPlatform('ios');
    } else if (pwaService.isAndroidDevice) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Listen for changes
    const unsubscribeInstallable = pwaService.on('installable', () => {
      setCanInstall(true);
    });

    const unsubscribeInstalled = pwaService.on('installed', () => {
      setIsInstalled(true);
      setCanInstall(false);
    });

    return () => {
      unsubscribeInstallable();
      unsubscribeInstalled();
    };
  }, []);

  const handleInstall = async () => {
    if (pwaService.isIOSDevice) {
      setShowIOSInstructions(true);
    } else if (pwaService.canInstall) {
      setIsInstalling(true);
      const installed = await pwaService.promptInstall();
      setIsInstalling(false);
      if (installed) {
        setIsInstalled(true);
        setCanInstall(false);
      }
    }
  };

  const handleClearCache = async () => {
    if ('serviceWorker' in navigator && 'caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        
        // Unregister service worker
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );

        alert('Cache cleared successfully! The page will reload.');
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear cache:', error);
        alert('Failed to clear cache. Please try again.');
      }
    }
  };

  // Don't show on desktop
  if (!pwaService.isMobileDevice) {
    return (
      <GlassCard className="p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Smartphone size={20} className="sm:w-[22px] sm:h-[22px] text-purple-500 flex-shrink-0" />
          <h3 className="text-lg sm:text-xl font-bold">PWA Settings</h3>
        </div>
        <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Info size={16} className="sm:w-[18px] sm:h-[18px] text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
              PWA features are only available on mobile devices (iOS and Android).
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4 sm:p-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Smartphone size={20} className="sm:w-[22px] sm:h-[22px] text-purple-500 flex-shrink-0" />
        <h3 className="text-lg sm:text-xl font-bold">PWA Settings</h3>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Installation Status */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">Installation Status</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {platform === 'ios' ? 'iOS' : platform === 'android' ? 'Android' : 'Desktop'} Device
              </p>
            </div>
            {isInstalled ? (
              <div className="flex items-center gap-1.5 sm:gap-2 text-green-600 dark:text-green-400 flex-shrink-0">
                <CheckCircle2 size={18} className="sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">Installed</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500 flex-shrink-0">
                <X size={18} className="sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">Not Installed</span>
              </div>
            )}
          </div>
        </div>

        {/* Install Section */}
        {!isInstalled && (
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">Install App</h4>
            
            {showIOSInstructions ? (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 sm:p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Share2 size={16} className="sm:w-[18px] sm:h-[18px] text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <h5 className="font-semibold text-sm sm:text-base text-purple-900 dark:text-purple-100">iOS Installation Steps</h5>
                </div>
                <ol className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside ml-1 sm:ml-2">
                  {pwaService.getIOSInstallInstructions().map((step, index) => (
                    <li key={index} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="mt-3 w-full min-h-[44px] bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-lg py-2.5 sm:py-3 px-4 text-sm sm:text-base font-medium transition-colors touch-manipulation"
                >
                  Got it
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {platform === 'ios'
                    ? 'Install DevCommunity on your iOS device for quick access and a better experience.'
                    : 'Install DevCommunity on your Android device for quick access and offline support.'}
                </p>
                <button
                  onClick={handleInstall}
                  disabled={isInstalling || !canInstall}
                  className="w-full min-h-[44px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 text-white rounded-lg py-3 sm:py-3.5 px-4 text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
                >
                  {isInstalling ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Installing...</span>
                    </>
                  ) : (
                    <>
                      <Download size={18} className="sm:w-5 sm:h-5" />
                      <span>Install App</span>
                    </>
                  )}
                </button>
                {!canInstall && platform === 'android' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Install prompt will appear when available
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Installed Info */}
        {isInstalled && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="sm:w-[18px] sm:h-[18px] text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-green-800 dark:text-green-200 font-medium">
                  DevCommunity is installed on your device
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1 leading-relaxed">
                  You can access it from your home screen and enjoy offline support.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cache Management */}
        <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">Cache Management</h4>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Clear cached data and service worker to get the latest version of the app.
          </p>
          <button
            onClick={handleClearCache}
            className="w-full min-h-[44px] bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-lg py-2.5 sm:py-3 px-4 text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation"
          >
            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span>Clear Cache & Reload</span>
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-2">
            <Info size={16} className="sm:w-[18px] sm:h-[18px] text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0 text-xs sm:text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">About PWA</p>
              <p className="leading-relaxed">
                Progressive Web Apps provide a native app-like experience with offline support,
                push notifications, and faster loading times.
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

