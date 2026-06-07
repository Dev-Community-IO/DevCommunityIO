import { keplrExtensionInfo } from '@cosmos-kit/keplr-extension';
import { leapExtensionInfo } from '@cosmos-kit/leap-extension';
import type { Wallet } from '@cosmos-kit/core';
import {
  isKeplrInstalled,
  isLeapInstalled,
  type SafrochainWalletProvider,
} from '../utils/safrochainWallet';

export interface SafrochainWalletOption {
  id: SafrochainWalletProvider;
  prettyName: string;
  logo?: string;
  downloadLink?: string;
  installed: boolean;
}

function getWalletLogo(logo: Wallet['logo']): string | undefined {
  if (!logo) return undefined;
  if (typeof logo === 'string') return logo;
  return logo.major;
}

function getDownloadLink(wallet: Wallet): string | undefined {
  return wallet.downloads?.[wallet.downloads.length - 1]?.link ?? wallet.downloads?.[0]?.link;
}

const walletCatalog: Array<{ id: SafrochainWalletProvider; info: Wallet; isInstalled: () => boolean }> = [
  { id: 'keplr', info: keplrExtensionInfo, isInstalled: isKeplrInstalled },
  { id: 'leap', info: leapExtensionInfo, isInstalled: isLeapInstalled },
];

export function getSafrochainWalletOptions(): SafrochainWalletOption[] {
  return walletCatalog
    .filter(({ id, isInstalled }) => id === 'keplr' || isInstalled())
    .map(({ id, info, isInstalled }) => ({
    id,
    prettyName: info.prettyName,
    logo: getWalletLogo(info.logo),
    downloadLink: getDownloadLink(info),
    installed: isInstalled(),
  }));
}

export function getInstalledSafrochainWalletOptions(): SafrochainWalletOption[] {
  return getSafrochainWalletOptions().filter((wallet) => wallet.installed);
}
