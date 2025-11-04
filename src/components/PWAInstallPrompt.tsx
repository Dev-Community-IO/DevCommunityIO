import { useState, useEffect } from 'react';
import { X, Download, Share2, Smartphone, CheckCircle2 } from 'lucide-react';
import { pwaService } from '../services/pwaService';

interface PWAInstallPromptProps {
  onDismiss?: () => void;
}

export function PWAInstallPrompt({ onDismiss }: PWAInstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Only show on mobile devices
    if (!pwaService.isMobileDevice) {
      return;
    }

    // Don't show if already installed
    if (pwaService.isInstalled) {
      return;
    }

    // Check if user has dismissed before (localStorage)
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const now = Date.now();
      // Show again after 7 days
      if (now - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Show prompt after a delay
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3000); // Show after 3 seconds

    // Listen for install events
    const unsubscribeInstallable = pwaService.on('installable', () => {
      setShowPrompt(true);
    });

    const unsubscribeInstalled = pwaService.on('installed', () => {
      setShowPrompt(false);
    });

    return () => {
      clearTimeout(timer);
      unsubscribeInstallable();
      unsubscribeInstalled();
    };
  }, []);

  const handleInstall = async () => {
    if (pwaService.isIOSDevice) {
      // Show iOS instructions
      setShowIOSInstructions(true);
    } else if (pwaService.canInstall) {
      // Android install prompt
      setIsInstalling(true);
      const installed = await pwaService.promptInstall();
      setIsInstalling(false);
      if (installed) {
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    onDismiss?.();
  };

  if (!showPrompt || !pwaService.isMobileDevice || pwaService.isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:hidden z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-4 text-white relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>

        {showIOSInstructions ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Share2 size={20} className="text-white" />
              <h3 className="font-bold text-lg">Install DevCommunity</h3>
            </div>
            <ol className="space-y-2 text-sm list-decimal list-inside ml-2">
              {pwaService.getIOSInstallInstructions().map((step, index) => (
                <li key={index} className="text-white/90">
                  {step}
                </li>
              ))}
            </ol>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full mt-3 bg-white/20 hover:bg-white/30 rounded-lg py-2 px-4 text-sm font-medium transition-colors"
            >
              Got it
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl p-2">
                <Smartphone size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Install DevCommunity</h3>
                <p className="text-sm text-white/90">
                  {pwaService.isIOSDevice
                    ? 'Add to your home screen for quick access'
                    : 'Install our app for a better experience'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 bg-white text-purple-600 hover:bg-white/90 rounded-lg py-2.5 px-4 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isInstalling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Install Now
                  </>
                )}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

