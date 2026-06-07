import { useCallback } from 'react';
import { ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/api/auth.service';
import { getSafrochainWalletOptions } from '../config/safrochainWallets';
import {
  connectSafrochainWallet,
  formatSafrochainWalletError,
  signSafrochainMessage,
  type SafrochainWalletProvider,
} from '../utils/safrochainWallet';

const walletTileClass =
  'flex w-full items-center gap-2.5 rounded-lg border border-zinc-200/80 bg-white px-2.5 py-2 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50/90 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/15 dark:hover:bg-white/[0.05]';

export type SafrochainLoginStep = 'connecting' | 'signing';

interface SafrochainWalletPickerProps {
  onStepChange: (step: SafrochainLoginStep | null) => void;
  onComplete: () => void;
  onError: (message: string) => void;
}

export function SafrochainWalletPicker({
  onStepChange,
  onComplete,
  onError,
}: SafrochainWalletPickerProps) {
  const { login } = useAuth();
  const walletOptions = getSafrochainWalletOptions();

  const handleWalletLogin = useCallback(
    async (provider: SafrochainWalletProvider) => {
      onStepChange('connecting');

      try {
        const { address, chainId, provider: connectedProvider } = await connectSafrochainWallet(provider);

        onStepChange('signing');

        const { nonce, message } = await authService.getSafrochainNonce(address, chainId);
        const signed = await signSafrochainMessage(connectedProvider, address, message, chainId);

        const response = await authService.verifySafrochain(
          address,
          signed.signature,
          nonce,
          message,
          chainId,
          signed.pubKey
        );

        await login(response.user, response.token ?? response.user?.id);
        onStepChange(null);
        onComplete();
      } catch (err: unknown) {
        console.error('Safrochain login error:', err);
        onError(formatSafrochainWalletError(err, provider));
        onStepChange(null);
      }
    },
    [login, onComplete, onError, onStepChange]
  );

  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2">
      {walletOptions.map((wallet) => (
        <button
          key={wallet.id}
          type="button"
          onClick={() => {
            if (wallet.installed) {
              void handleWalletLogin(wallet.id);
              return;
            }

            if (wallet.downloadLink) {
              window.open(wallet.downloadLink, '_blank', 'noopener,noreferrer');
            }
          }}
          className={`${walletTileClass} ${wallet.installed ? '' : 'opacity-80'}`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200/70 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.04]">
            {wallet.logo ? (
              <img src={wallet.logo} alt="" className="h-5 w-5 object-contain" />
            ) : (
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200">
                {wallet.prettyName.slice(0, 1)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium leading-tight text-zinc-900 dark:text-zinc-100">
              {wallet.prettyName}
            </p>
            <p className="inline-flex items-center gap-0.5 truncate text-[10px] leading-tight text-zinc-500 dark:text-zinc-400">
              {wallet.installed ? (
                'Detected'
              ) : (
                <>
                  Get extension
                  <ExternalLink size={9} aria-hidden />
                </>
              )}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
