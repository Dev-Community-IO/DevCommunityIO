/**
 * Safrochain wallet auth (Cosmos SDK — Keplr / Leap-compatible)
 */

export type SafrochainWalletProvider = 'keplr' | 'leap';

export interface SafrochainConnection {
  address: string;
  chainId: string;
  provider: SafrochainWalletProvider;
}

export interface SafrochainSignature {
  signature: string;
  pubKey: string;
}

interface KeplrChainInfo {
  chainId: string;
  chainName: string;
  rpc: string;
  rest: string;
  bip44: { coinType: number };
  bech32Config: {
    bech32PrefixAccAddr: string;
    bech32PrefixAccPub: string;
    bech32PrefixValAddr: string;
    bech32PrefixValPub: string;
    bech32PrefixConsAddr: string;
    bech32PrefixConsPub: string;
  };
  currencies: Array<{ coinDenom: string; coinMinimalDenom: string; coinDecimals: number }>;
  feeCurrencies: Array<{
    coinDenom: string;
    coinMinimalDenom: string;
    coinDecimals: number;
    gasPriceStep?: { low: number; average: number; high: number };
  }>;
  stakeCurrency: { coinDenom: string; coinMinimalDenom: string; coinDecimals: number };
  features?: string[];
}

interface KeplrLike {
  experimentalSuggestChain(chainInfo: KeplrChainInfo): Promise<void>;
  enable(chainId: string): Promise<void>;
  getKey(chainId: string): Promise<{ bech32Address: string }>;
  signArbitrary(
    chainId: string,
    signer: string,
    data: string
  ): Promise<{
    pub_key: { type: string; value: string };
    signature: string;
  }>;
}

const SAFRO_CURRENCY = {
  coinDenom: 'SAF',
  coinMinimalDenom: 'usaf',
  coinDecimals: 6,
};

export function getSafrochainChainInfo(): KeplrChainInfo {
  const chainId = import.meta.env.VITE_SAFROCHAIN_CHAIN_ID || 'safro-testnet-1';
  const isTestnet = chainId.includes('testnet');

  return {
    chainId,
    chainName: isTestnet ? 'Safrochain Testnet' : 'Safrochain',
    rpc: import.meta.env.VITE_SAFROCHAIN_RPC || 'https://rpc.testnet.safrochain.com',
    rest: import.meta.env.VITE_SAFROCHAIN_REST || 'https://rest.testnet.safrochain.com',
    bip44: { coinType: 118 },
    bech32Config: {
      bech32PrefixAccAddr: 'addr_safro',
      bech32PrefixAccPub: 'addr_safropub',
      bech32PrefixValAddr: 'addr_safrovaloper',
      bech32PrefixValPub: 'addr_safrovaloperpub',
      bech32PrefixConsAddr: 'addr_safrovalcons',
      bech32PrefixConsPub: 'addr_safrovalconspub',
    },
    currencies: [SAFRO_CURRENCY],
    feeCurrencies: [
      {
        ...SAFRO_CURRENCY,
        gasPriceStep: { low: 0.01, average: 0.025, high: 0.04 },
      },
    ],
    stakeCurrency: SAFRO_CURRENCY,
    features: ['ibc-transfer'],
  };
}

function getProviderApi(provider: SafrochainWalletProvider): KeplrLike | undefined {
  if (typeof window === 'undefined') return undefined;

  if (provider === 'keplr') {
    return window.keplr;
  }

  return window.leap?.keplr || window.leap;
}

export function isKeplrInstalled(): boolean {
  return typeof window !== 'undefined' && !!window.keplr;
}

export function isLeapInstalled(): boolean {
  return typeof window !== 'undefined' && !!(window.leap?.keplr || window.leap);
}

function getProviderLabel(provider: SafrochainWalletProvider): string {
  return provider === 'keplr' ? 'Keplr' : 'Leap';
}

function getInstallUrl(provider: SafrochainWalletProvider): string {
  return provider === 'keplr'
    ? 'https://www.keplr.app/download'
    : 'https://www.leapwallet.io/';
}

export function formatSafrochainWalletError(error: unknown, provider: SafrochainWalletProvider): string {
  const label = getProviderLabel(provider);
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  if (
    normalized.includes('reject') ||
    normalized.includes('declined') ||
    normalized.includes('cancel')
  ) {
    return `You declined the signature in ${label}. Approve the sign-in request to continue.`;
  }

  if (normalized.includes('not installed') || normalized.includes('not found')) {
    return `${label} is not installed. Install it from ${getInstallUrl(provider)}`;
  }

  return message || `Failed to connect with ${label}`;
}

export async function connectSafrochainWallet(provider: SafrochainWalletProvider): Promise<SafrochainConnection> {
  const wallet = getProviderApi(provider);

  if (!wallet) {
    throw new Error(
      `${getProviderLabel(provider)} is not installed. Install it from ${getInstallUrl(provider)}`
    );
  }

  const chainInfo = getSafrochainChainInfo();

  try {
    await wallet.experimentalSuggestChain(chainInfo);
  } catch (error) {
    console.warn('Safrochain chain suggestion skipped:', error);
  }

  await wallet.enable(chainInfo.chainId);

  const key = await wallet.getKey(chainInfo.chainId);

  if (!key.bech32Address?.startsWith('addr_safro')) {
    throw new Error('Connected wallet is not on Safrochain. Please switch to Safrochain in your wallet.');
  }

  return {
    address: key.bech32Address,
    chainId: chainInfo.chainId,
    provider,
  };
}

export async function signSafrochainMessage(
  provider: SafrochainWalletProvider,
  address: string,
  message: string,
  chainId?: string
): Promise<SafrochainSignature> {
  const wallet = getProviderApi(provider);

  if (!wallet) {
    throw new Error('Wallet extension not found');
  }

  const activeChainId = chainId || getSafrochainChainInfo().chainId;

  await wallet.enable(activeChainId);

  try {
    const signed = await wallet.signArbitrary(activeChainId, address, message);

    return {
      signature: signed.signature,
      pubKey: signed.pub_key.value,
    };
  } catch (error: unknown) {
    throw new Error(formatSafrochainWalletError(error, provider));
  }
}

declare global {
  interface Window {
    keplr?: KeplrLike;
    leap?: KeplrLike & { keplr?: KeplrLike };
  }
}
