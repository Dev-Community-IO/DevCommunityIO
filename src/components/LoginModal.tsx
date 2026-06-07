import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  XCircle,
  Loader2,
  Wallet,
  Chrome,
  Github,
  Lock,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/api/auth.service';
import { connectCardanoWallet, getAvailableWallets, signCardanoMessage, stringToHex } from '../utils/cardanoWallet';
import { SafrochainWalletPicker, type SafrochainLoginStep } from './SafrochainWalletPicker';
import { executeRecaptcha } from '../utils/recaptcha';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LoginStep = 'select' | SafrochainLoginStep;

const modalShellClass =
  'rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-white/[0.08] dark:bg-zinc-900';

const optionBtnClass =
  'flex w-full items-center gap-3 rounded-xl border border-zinc-200/80 bg-white p-3 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50/90 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/15 dark:hover:bg-white/[0.05] active:bg-zinc-100 dark:active:bg-white/[0.08]';

const socialBtnClass =
  'flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200/80 bg-white px-3 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.02] dark:text-zinc-200 dark:hover:bg-white/[0.06]';

const walletTileClass =
  'flex flex-col items-center gap-2 rounded-xl border border-zinc-200/80 bg-white p-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50/90 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/15 dark:hover:bg-white/[0.05]';

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [step, setStep] = useState<LoginStep>('select');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCardanoWallets, setShowCardanoWallets] = useState(false);
  const [showSafrochainWallets, setShowSafrochainWallets] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep('select');
      setError('');
      setIsLoading(false);
      setShowCardanoWallets(false);
      setShowSafrochainWallets(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCardanoLogin = async (walletName: string) => {
    setError('');
    setIsLoading(true);
    setStep('connecting');

    try {
      const { address, stakeAddress, networkId } = await connectCardanoWallet(walletName);

      if (networkId !== 1) {
        throw new Error('Please switch to Cardano Mainnet. Testnet wallets are not supported.');
      }

      setStep('signing');

      const { nonce, message } = await authService.getCardanoNonce(address, stakeAddress);
      const signedData = await signCardanoMessage(walletName, address, stringToHex(message));

      const response = await authService.verifyCardano(
        address,
        signedData.signature,
        nonce,
        message,
        stakeAddress
      );

      await login(response.user, response.token ?? response.user?.id);
      onClose();
    } catch (err: unknown) {
      console.error('Cardano login error:', err);
      const message = err instanceof Error ? err.message : `Failed to connect with ${walletName}`;
      setError(message);
      setStep('select');
      setShowCardanoWallets(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      const recaptchaToken = await executeRecaptcha('google_login');
      const authUrl = authService.getGoogleAuthUrl(recaptchaToken || undefined);
      window.location.href = authUrl;
    } catch (err: unknown) {
      console.error('Google login reCAPTCHA error:', err);
      setError('Security verification failed. Please refresh and try again.');
      setIsLoading(false);
    }
  };

  const handleGithubLogin = () => {
    window.location.href = authService.getGithubAuthUrl();
  };

  const cardanoWallets = getAvailableWallets();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className={modalShellClass}>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
                <Lock size={16} strokeWidth={2} aria-hidden />
              </span>
              <div className="min-w-0">
                <h2
                  id="login-modal-title"
                  className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
                >
                  Sign in
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Join the community</p>
              </div>
            </div>
            {!isLoading && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100"
                aria-label="Close"
              >
                <XCircle size={18} strokeWidth={2} aria-hidden />
              </button>
            )}
          </div>

          <p className="mb-4 text-sm leading-snug text-zinc-600 dark:text-zinc-400">
            Connect a Safrochain or Cardano wallet, or continue with Google or GitHub.
          </p>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" strokeWidth={2} />
              <p className="text-xs leading-relaxed">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="py-10 text-center">
              <Loader2 size={32} className="mx-auto animate-spin text-zinc-500" strokeWidth={2} />
              <p className="mt-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {step === 'connecting' && 'Connecting to your wallet…'}
                {step === 'signing' && 'Sign the message in your wallet'}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                {step === 'signing' && 'Check your wallet extension for the request'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                {!showSafrochainWallets ? (
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Safrochain
                  </p>
                ) : (
                  <div className="mb-2 flex items-center gap-1.5">
                    <img
                      src="/safrochain-favicon.svg"
                      alt=""
                      className="h-4 w-4 shrink-0 object-contain"
                    />
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Safrochain</span>
                  </div>
                )}

                {!showSafrochainWallets ? (
                  <button type="button" onClick={() => setShowSafrochainWallets(true)} className={optionBtnClass}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.04]">
                      <img
                        src="/safrochain-favicon.svg"
                        alt=""
                        className="h-6 w-6 object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Safrochain wallet</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Browse available wallets</p>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-zinc-400" strokeWidth={2} />
                  </button>
                ) : (
                  <div className="space-y-2">
                    <SafrochainWalletPicker
                      onStepChange={(nextStep) => {
                        if (nextStep) {
                          setError('');
                          setIsLoading(true);
                          setStep(nextStep);
                          return;
                        }

                        setIsLoading(false);
                        setStep('select');
                      }}
                      onComplete={onClose}
                      onError={setError}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSafrochainWallets(false)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      <ArrowLeft size={14} strokeWidth={2} />
                      Back
                    </button>
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Cardano wallet
                </p>

                {!showCardanoWallets ? (
                  <button type="button" onClick={() => setShowCardanoWallets(true)} className={optionBtnClass}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.04]">
                      <img
                        src="/Cardano-RGB_Logo-Icon-Blue.png"
                        alt=""
                        className="h-6 w-6 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) (fallback as HTMLElement).style.display = 'block';
                        }}
                      />
                      <Wallet
                        size={18}
                        strokeWidth={2}
                        className="hidden text-zinc-500"
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Cardano wallet</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {cardanoWallets.length > 0
                          ? `${cardanoWallets.length} detected`
                          : 'Browse available wallets'}
                      </p>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-zinc-400" strokeWidth={2} />
                  </button>
                ) : (
                  <div className="space-y-3">
                    {cardanoWallets.length > 0 ? (
                      <>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {cardanoWallets.map((wallet) => (
                            <button
                              key={wallet.name}
                              type="button"
                              onClick={() => handleCardanoLogin(wallet.name)}
                              className={walletTileClass}
                            >
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-200/70 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.04]">
                                {wallet.icon ? (
                                  <img
                                    src={wallet.icon}
                                    alt=""
                                    className="h-8 w-8 object-contain"
                                  />
                                ) : (
                                  <span className="text-lg font-semibold text-zinc-600 dark:text-zinc-400">
                                    ₳
                                  </span>
                                )}
                              </div>
                              <p className="line-clamp-1 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                {wallet.name}
                              </p>
                            </button>
                          ))}
                        </div>
                        <p className="rounded-lg border border-zinc-200/70 bg-zinc-50/90 px-2.5 py-2 text-center text-[11px] text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
                          Mainnet only — testnet wallets are not supported.
                        </p>
                      </>
                    ) : (
                      <div className="rounded-lg border border-dashed border-zinc-200 px-3 py-4 text-center text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                        <p className="font-medium text-zinc-700 dark:text-zinc-300">No wallet detected</p>
                        <p className="mt-0.5">Install Nami, Eternl, or another Cardano wallet</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowCardanoWallets(false)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      <ArrowLeft size={14} strokeWidth={2} />
                      Back
                    </button>
                  </div>
                )}
              </div>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200 dark:border-white/[0.08]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">
                    Or
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={handleGoogleLogin} className={socialBtnClass}>
                  <Chrome size={16} className="text-zinc-600 dark:text-zinc-400" strokeWidth={2} />
                  Google
                </button>
                <button type="button" onClick={handleGithubLogin} className={socialBtnClass}>
                  <Github size={16} className="text-zinc-700 dark:text-zinc-300" strokeWidth={2} />
                  GitHub
                </button>
              </div>
            </div>
          )}

          <p className="mt-5 border-t border-zinc-100 pt-4 text-center text-[11px] leading-relaxed text-zinc-500 dark:border-white/[0.06] dark:text-zinc-500">
            By signing in, you agree to our{' '}
            <Link
              to="/terms-of-use"
              onClick={onClose}
              className="font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-300"
            >
              Terms
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy-policy"
              onClick={onClose}
              className="font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-300"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
