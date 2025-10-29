import { useState, useEffect } from 'react';
import { X, Loader, Wallet, Chrome, Github, Shield, Zap, Lock, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/api/auth.service';
import { connectCardanoWallet, getAvailableWallets, signCardanoMessage, stringToHex } from '../utils/cardanoWallet';
import { GlassCard } from './GlassCard';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LoginStep = 'select' | 'connecting' | 'signing';

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [step, setStep] = useState<LoginStep>('select');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCardanoWallets, setShowCardanoWallets] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep('select');
      setError('');
      setIsLoading(false);
      setShowCardanoWallets(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCardanoLogin = async (walletName: string) => {
    setError('');
    setIsLoading(true);
    setStep('connecting');

    try {
      // Connect to Cardano wallet
      const { address, stakeAddress } = await connectCardanoWallet(walletName);

      setStep('signing');

      // Get nonce from backend
      const { nonce, message } = await authService.getCardanoNonce(address, stakeAddress);

      // Sign message
      const signedData = await signCardanoMessage(walletName, address, stringToHex(message));

      // Verify signature with backend
      const response = await authService.verifyCardano(
        address,
        signedData.signature,
        nonce,
        message,
        stakeAddress
      );

      // Save auth state
      login(response.user, response.token);

      // Close modal
      onClose();
    } catch (err: any) {
      console.error('Cardano login error:', err);
      setError(err.message || `Failed to connect with ${walletName}`);
      setStep('select');
      setShowCardanoWallets(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const authUrl = authService.getGoogleAuthUrl();
    window.location.href = authUrl;
  };

  const handleGithubLogin = () => {
    const authUrl = authService.getGithubAuthUrl();
    window.location.href = authUrl;
  };

  const cardanoWallets = getAvailableWallets();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-md" 
        onClick={() => {
          if (!isLoading) {
            onClose();
          }
        }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg animate-slide-up">
        <GlassCard className="p-8 shadow-2xl border-2 border-white/10 dark:border-white/5">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Lock size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    Welcome!
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Join the community
                  </p>
                </div>
              </div>
              {!isLoading && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 hover:scale-110"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connect your Web3 wallet or sign in with your social account to start engaging with the community.
            </p>

            {/* Security Features */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Shield size={14} className="text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Secure</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <Zap size={14} className="text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-700 dark:text-green-300">Fast</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <Lock size={14} className="text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Private</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-3 animate-shake">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Connection Failed</p>
                <p className="text-xs opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="relative inline-block">
                <Loader className="animate-spin text-blue-500" size={48} strokeWidth={2.5} />
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-6 font-medium">
                {step === 'connecting' && 'Connecting to your wallet...'}
                {step === 'signing' && 'Please sign the message in your wallet...'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {step === 'connecting' && 'This will only take a moment'}
                {step === 'signing' && 'Check your wallet extension for a signature request'}
              </p>
            </div>
          )}

          {/* Login Options */}
          {!isLoading && (
            <div className="space-y-6">
              {/* Cardano Wallets Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Wallet size={16} className="text-white" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Cardano Wallets
                  </p>
                </div>

                {/* Cardano Wallets */}
                {!showCardanoWallets ? (
                  <button
                    onClick={() => setShowCardanoWallets(true)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-cyan-500/5 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow">
                      <img 
                        src="/Cardano-RGB_Logo-Icon-Blue.png" 
                        alt="Cardano" 
                        className="w-7 h-7"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<span class="text-white font-bold text-xl">₳</span>';
                        }}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-gray-900 dark:text-white">Cardano Wallet</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {cardanoWallets.length > 0 
                          ? `${cardanoWallets.length} wallet(s) available` 
                          : 'Connect with Cardano'}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <div className="space-y-2 pl-2 animate-slide-in">
                    {cardanoWallets.length > 0 ? (
                      cardanoWallets.map((wallet) => (
                        <button
                          key={wallet.name}
                          onClick={() => handleCardanoLogin(wallet.name)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                            {wallet.icon ? (
                              <img src={wallet.icon} alt={wallet.name} className="w-6 h-6" />
                            ) : (
                              <span className="text-blue-500 font-bold text-lg">₳</span>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-sm">{wallet.name}</p>
                          </div>
                          <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <p className="font-medium mb-1">No Cardano wallet detected</p>
                        <p className="text-xs">Please install Nami, Eternl, or another Cardano wallet</p>
                      </div>
                    )}
                    <button
                      onClick={() => setShowCardanoWallets(false)}
                      className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-2 font-medium transition-colors"
                    >
                      ← Back to wallets
                    </button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
                    OR CONTINUE WITH
                  </span>
                </div>
              </div>

              {/* Social Login Section */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Google */}
                  <button
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 hover:bg-gradient-to-r hover:from-red-500/5 hover:to-pink-500/5 transition-all duration-300 group hover:shadow-lg hover:shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Chrome size={20} className="text-red-500" />
                    <span className="font-semibold">Google</span>
                  </button>

                  {/* GitHub */}
                  <button
                    onClick={handleGithubLogin}
                    className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-800 dark:hover:border-gray-400 hover:bg-gradient-to-r hover:from-gray-800/5 hover:to-gray-600/5 dark:hover:from-gray-400/5 dark:hover:to-gray-500/5 transition-all duration-300 group hover:shadow-lg hover:shadow-gray-500/20 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Github size={20} />
                    <span className="font-semibold">GitHub</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              By connecting, you agree to our{' '}
              <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Terms of Service
              </button>{' '}
              and{' '}
              <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Privacy Policy
              </button>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

